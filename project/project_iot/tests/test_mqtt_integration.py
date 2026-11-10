"""Integration tests against a real broker, enabled with RUN_MQTT_TESTS=1."""

import json
import os
import queue
import socket
import threading
import time
import uuid

import paho.mqtt.client as mqtt
import pytest

from common.config import Settings
from common.models import Scenario, Telemetry
from simulator.mqtt.client import MQTTClient
from simulator.services.environment import EnvironmentSimulator

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(
        os.getenv("RUN_MQTT_TESTS") != "1", reason="Set RUN_MQTT_TESTS=1 with Mosquitto running"
    ),
]


@pytest.fixture
def mqtt_pair():
    settings = Settings(
        mqtt_host=os.getenv("MQTT_HOST", "localhost"),
        mqtt_port=int(os.getenv("MQTT_PORT", "1883")),
        device_id=f"test_{uuid.uuid4().hex[:12]}",
        topic_prefix="iot/tests",
    )
    messages = queue.Queue()
    subscribed = threading.Event()
    observer = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    def on_connect(client, userdata, flags, reason_code, properties):
        client.subscribe(settings.topic("#"), qos=1)

    observer.on_connect = on_connect
    observer.on_subscribe = lambda *args: subscribed.set()
    observer.on_message = lambda client, userdata, message: messages.put(message)
    observer.connect(settings.mqtt_host, settings.mqtt_port, 10)
    observer.loop_start()
    client = MQTTClient(settings)
    try:
        assert subscribed.wait(5), "Observer did not subscribe"
        client.start()
        assert client.connected.wait(5), "Simulator did not connect"
        yield settings, client, observer, messages
    finally:
        client.stop()
        for kind in ("telemetry", "alerts", "status", "commands"):
            observer.publish(settings.topic(kind), b"", qos=1, retain=True).wait_for_publish(3)
        observer.disconnect()
        observer.loop_stop()


def receive(messages, topic, timeout=5):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        message = messages.get(timeout=max(0.01, deadline - time.monotonic()))
        if message.topic == topic:
            return message
    raise AssertionError(f"No message received on {topic}")


def test_simulator_publish_broker_subscriber(mqtt_pair):
    settings, client, observer, messages = mqtt_pair
    sample = EnvironmentSimulator(settings.device_id, Scenario.NORMAL).read(5)
    assert client.publish("telemetry", sample.model_dump_json())
    message = receive(messages, settings.topic("telemetry"))
    assert Telemetry.model_validate_json(message.payload) == sample
    assert message.qos == 1


def test_valid_scenario_command_is_received(mqtt_pair):
    settings, client, observer, messages = mqtt_pair
    observer.publish(
        settings.topic("commands"), '{"scenario":"poor_ventilation"}', qos=1
    ).wait_for_publish(3)
    deadline = time.monotonic() + 5
    command = None
    while command is None and time.monotonic() < deadline:
        command = client.take_scenario()
        time.sleep(0.02)
    assert command == Scenario.POOR_VENTILATION


def test_status_is_online_and_then_offline(mqtt_pair):
    settings, client, observer, messages = mqtt_pair
    assert json.loads(receive(messages, settings.topic("status")).payload)["state"] == "online"
    client.stop()
    assert json.loads(receive(messages, settings.topic("status")).payload)["state"] == "offline"


def test_retained_command_is_ignored_on_reconnect(mqtt_pair):
    settings, client, observer, messages = mqtt_pair
    client.stop()
    observer.publish(
        settings.topic("commands"), '{"scenario":"night"}', qos=1, retain=True
    ).wait_for_publish(3)
    replacement = MQTTClient(settings)
    try:
        replacement.start()
        assert replacement.connected.wait(5)
        time.sleep(0.3)
        assert replacement.take_scenario() is None
    finally:
        replacement.stop()


def test_same_client_recovers_after_tcp_failure_and_broker_sends_will(mqtt_pair):
    settings, client, observer, messages = mqtt_pair
    assert json.loads(receive(messages, settings.topic("status")).payload)["state"] == "online"
    connection = client._client.socket()
    assert connection is not None
    connection.shutdown(socket.SHUT_RDWR)
    assert json.loads(receive(messages, settings.topic("status")).payload)["state"] == "offline"
    assert (
        json.loads(receive(messages, settings.topic("status"), timeout=10).payload)["state"]
        == "online"
    )
    assert client.connected.wait(5)
    sample = EnvironmentSimulator(settings.device_id, Scenario.EMPTY).read(5)
    assert client.publish("telemetry", sample.model_dump_json())
    assert (
        Telemetry.model_validate_json(receive(messages, settings.topic("telemetry")).payload)
        == sample
    )
    observer.publish(settings.topic("commands"), '{"scenario":"night"}', qos=1).wait_for_publish(3)
    deadline = time.monotonic() + 5
    scenario = None
    while scenario is None and time.monotonic() < deadline:
        scenario = client.take_scenario()
        time.sleep(0.02)
    assert scenario == Scenario.NIGHT
