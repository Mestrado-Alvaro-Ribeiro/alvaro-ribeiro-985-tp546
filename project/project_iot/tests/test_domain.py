import json
import math

import pytest
from pydantic import ValidationError

from common.config import Settings
from common.models import Scenario, Telemetry
from simulator.services.alerts import AlertService
from simulator.services.environment import EnvironmentSimulator


@pytest.mark.parametrize("scenario", list(Scenario))
def test_scenarios_stay_in_sensor_ranges(scenario):
    simulator = EnvironmentSimulator("room01", scenario, seed=4)
    previous = None
    for _ in range(200):
        sample = simulator.read(5)
        assert 18 <= sample.temperature <= 32
        assert 20 <= sample.humidity <= 85
        assert 400 <= sample.co2 <= 5000
        assert 0 <= sample.light <= 1500
        assert type(sample.presence) is bool
        assert sample.timestamp.utcoffset().total_seconds() == 0
        if previous:
            assert abs(sample.temperature - previous.temperature) <= 0.5
        previous = sample


def test_poor_ventilation_rises_then_empty_room_recovers():
    simulator = EnvironmentSimulator("room01", Scenario.POOR_VENTILATION, seed=2)
    samples = [simulator.read(5) for _ in range(40)]
    assert samples[-1].co2 > 1500
    assert samples[-1].co2 > samples[0].co2 + 700
    simulator.set_scenario(Scenario.EMPTY)
    recovered = [simulator.read(5) for _ in range(60)][-1]
    assert recovered.co2 < 800
    assert recovered.presence is False


def test_seed_reproduces_sensor_values():
    first = EnvironmentSimulator("room01", Scenario.NORMAL, seed=9)
    second = EnvironmentSimulator("room01", Scenario.NORMAL, seed=9)
    for _ in range(30):
        assert first.read(5).model_dump(exclude={"timestamp"}) == second.read(5).model_dump(
            exclude={"timestamp"}
        )


def test_presence_does_not_flicker_each_sample():
    simulator = EnvironmentSimulator("room01", Scenario.NORMAL, seed=9)
    values = [simulator.read(5).presence for _ in range(24)]
    assert sum(a != b for a, b in zip(values, values[1:], strict=False)) <= 2


def test_payload_round_trips_and_rejects_invalid_data():
    sample = EnvironmentSimulator("room01", Scenario.NORMAL).read(5)
    payload = json.loads(sample.model_dump_json())
    assert payload["schema_version"] == "1.0"
    assert payload["source"] == "simulator"
    assert Telemetry.model_validate(payload) == sample
    for value in [math.nan, math.inf, -1]:
        with pytest.raises(ValidationError):
            Telemetry.model_validate(payload | {"co2": value})
    with pytest.raises(ValidationError):
        Telemetry.model_validate(payload | {"timestamp": "2026-11-09T12:00:00"})
    with pytest.raises(ValidationError):
        Telemetry.model_validate(payload | {"presence": "false"})


@pytest.mark.parametrize(
    "values",
    [
        {"publish_interval": 0},
        {"publish_interval": math.nan},
        {"mqtt_port": 70000},
        {"scenario": "typo"},
        {"device_id": "room/+/bad"},
        {"topic_prefix": "iot/#"},
        {"co2_hysteresis": 2000},
        {"humidity_low": 80, "humidity_high": 70},
    ],
)
def test_invalid_configuration_fails_early(values):
    with pytest.raises(ValidationError):
        Settings(**values)


def test_settings_load_environment_and_topics(monkeypatch):
    monkeypatch.setenv("DEVICE_ID", "lab02")
    monkeypatch.setenv("SCENARIO", "night")
    monkeypatch.setenv("MQTT_PORT", "1884")
    settings = Settings.from_env()
    assert settings.scenario == Scenario.NIGHT
    assert settings.mqtt_port == 1884
    assert settings.topic("telemetry") == "iot/environment/lab02/telemetry"


def test_alert_hysteresis_and_resolution():
    service = AlertService(Settings())
    sample = EnvironmentSimulator("room01", Scenario.NORMAL).read(5)
    high = sample.model_copy(update={"co2": 1600})
    assert "co2_high" in {alert.code for alert in service.evaluate(high).active}
    near = sample.model_copy(update={"co2": 1450})
    assert "co2_high" in {alert.code for alert in service.evaluate(near).active}
    clear = sample.model_copy(update={"co2": 1390})
    assert "co2_high" not in {alert.code for alert in service.evaluate(clear).active}


def test_low_light_alert_requires_presence():
    service = AlertService(Settings())
    sample = EnvironmentSimulator("room01", Scenario.NIGHT).read(5)
    sample = sample.model_copy(update={"light": 10, "presence": False})
    assert "light_low" not in {alert.code for alert in service.evaluate(sample).active}
    occupied = sample.model_copy(update={"presence": True})
    assert "light_low" in {alert.code for alert in service.evaluate(occupied).active}
