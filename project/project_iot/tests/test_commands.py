import paho.mqtt.client as mqtt
import pytest

from common.config import Settings
from common.models import Scenario
from simulator.mqtt.client import MQTTClient


@pytest.mark.parametrize(
    "payload", [b"not-json", b'{"scenario":"missing"}', b'{"scenario":"night","x":1}', b"\xff"]
)
def test_invalid_command_does_not_change_scenario(payload):
    client = MQTTClient(Settings())
    message = mqtt.MQTTMessage(topic=b"iot/environment/room01/commands")
    message.payload = payload
    client.handle_message(message)
    assert client.take_scenario() is None


def test_latest_command_wins_without_unbounded_queue():
    client = MQTTClient(Settings())
    for scenario in ("night", "empty", "crowded"):
        message = mqtt.MQTTMessage(topic=b"iot/environment/room01/commands")
        message.payload = ('{"scenario":"' + scenario + '"}').encode()
        client.handle_message(message)
    assert client.take_scenario() == Scenario.CROWDED
    assert client.take_scenario() is None


def test_disconnected_publication_returns_false():
    assert MQTTClient(Settings()).publish("telemetry", "{}") is False
