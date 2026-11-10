"""Deterministic scenario evolution independent of MQTT."""

import math
import random
from datetime import UTC, datetime

from common.models import Scenario, Telemetry
from simulator.sensors import (
    CO2Sensor,
    HumiditySensor,
    LightSensor,
    PresenceSensor,
    TemperatureSensor,
)

# Temperature, humidity, CO2 and illuminance targets. These are synthetic examples.
TARGETS = {
    Scenario.NORMAL: (24.0, 50.0, 700.0, 450.0),
    Scenario.CROWDED: (28.0, 65.0, 1800.0, 550.0),
    Scenario.EMPTY: (22.0, 45.0, 450.0, 350.0),
    Scenario.POOR_VENTILATION: (28.0, 68.0, 2400.0, 350.0),
    Scenario.HIGH_TEMPERATURE: (31.5, 35.0, 850.0, 900.0),
    Scenario.NIGHT: (20.0, 55.0, 450.0, 5.0),
}


class EnvironmentSimulator:
    """A room whose sensors relax toward the selected scenario conditions."""

    def __init__(self, device_id: str, scenario: Scenario, seed: int = 42):
        """Create sensor state without performing network I/O.

        Args:
            device_id: Identifier used in outgoing telemetry.
            scenario: Initial environmental scenario.
            seed: Seed that makes numeric sensor evolution repeatable.
        """
        self.device_id = device_id
        self.scenario = Scenario(scenario)
        self.elapsed = 0.0
        rng = random.Random(seed)
        self.sensors = (
            TemperatureSensor(rng),
            HumiditySensor(rng),
            CO2Sensor(rng),
            LightSensor(rng),
        )
        self.presence = PresenceSensor()

    def set_scenario(self, scenario: Scenario) -> None:
        """Change environmental targets while preserving current sensor readings.

        Args:
            scenario: Next valid scenario.
        """
        self.scenario = Scenario(scenario)
        self.elapsed = 0.0

    def read(self, seconds: float) -> Telemetry:
        """Advance all sensors and create a timestamped sample.

        Args:
            seconds: Positive elapsed simulation time in seconds.

        Returns:
            Validated telemetry using the shared MQTT contract.

        Raises:
            ValueError: If elapsed time is not finite and positive.
        """
        if not math.isfinite(seconds) or seconds <= 0:
            raise ValueError("Simulation time must be finite and positive")
        occupied = self.scenario not in (Scenario.EMPTY, Scenario.NIGHT)
        if self.scenario == Scenario.NORMAL:
            occupied = int(self.elapsed // 60) % 2 == 0
        self.presence.value = occupied
        targets = TARGETS[self.scenario]
        if self.scenario == Scenario.NORMAL and not occupied:
            targets = (23.5, 48.0, 500.0, 450.0)
        for sensor, target in zip(self.sensors, targets, strict=True):
            sensor.advance(target, seconds)
        self.elapsed += seconds
        temperature, humidity, co2, light = (sensor.read() for sensor in self.sensors)
        return Telemetry(
            device_id=self.device_id,
            timestamp=datetime.now(UTC),
            scenario=self.scenario,
            temperature=temperature,
            humidity=humidity,
            co2=co2,
            light=light,
            presence=self.presence.read(),
        )
