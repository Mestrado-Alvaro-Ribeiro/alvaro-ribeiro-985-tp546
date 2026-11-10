"""Opt-in acceptance test of the running simulator, broker and alert publications."""

import json
import os
import queue
import threading
import time

import paho.mqtt.client as mqtt
import pytest

from common.models import Telemetry

pytestmark = [
    pytest.mark.deployment,
    pytest.mark.skipif(
        os.getenv("RUN_STACK_TESTS") != "1",
        reason="Set RUN_STACK_TESTS=1 with the default Compose stack running",
    ),
]


def test_deployed_simulator_raises_and_clears_co2_alert():
    messages = queue.Queue()
    subscribed = threading.Event()
    prefix = "iot/environment/room01"
    observer = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    def on_connect(client, userdata, flags, reason_code, properties):
        client.subscribe(f"{prefix}/#", qos=1)

    observer.on_connect = on_connect
    observer.on_subscribe = lambda *args: subscribed.set()
    observer.on_message = lambda client, userdata, message: messages.put(message)
    observer.connect(os.getenv("MQTT_HOST", "localhost"), int(os.getenv("MQTT_PORT", "1883")))
    observer.loop_start()

    def await_condition(scenario, alert_expected, timeout):
        deadline = time.monotonic() + timeout
        samples = {}
        while time.monotonic() < deadline:
            try:
                message = messages.get(timeout=max(0.01, deadline - time.monotonic()))
            except queue.Empty:
                break
            if message.retain:
                continue
            payload = json.loads(message.payload)
            if message.topic.endswith("/telemetry"):
                sample = Telemetry.model_validate(payload)
                if sample.scenario == scenario:
                    samples[payload["timestamp"]] = sample
            elif message.topic.endswith("/alerts") and payload["timestamp"] in samples:
                active = {item["code"] for item in payload["active"]}
                if ("co2_high" in active) == alert_expected:
                    sample = samples[payload["timestamp"]]
                    assert sample.source == "simulator"
                    assert sample.co2 > 1500 if alert_expected else sample.co2 <= 1400
                    return
        pytest.fail(f"No matching telemetry and alert snapshot for {scenario}")

    try:
        assert subscribed.wait(5)
        observer.publish(
            f"{prefix}/commands", '{"scenario":"poor_ventilation"}', qos=1
        ).wait_for_publish(3)
        await_condition("poor_ventilation", True, 150)
        observer.publish(f"{prefix}/commands", '{"scenario":"empty"}', qos=1).wait_for_publish(3)
        await_condition("empty", False, 150)
    finally:
        observer.publish(f"{prefix}/commands", '{"scenario":"normal"}', qos=1).wait_for_publish(3)
        observer.disconnect()
        observer.loop_stop()
