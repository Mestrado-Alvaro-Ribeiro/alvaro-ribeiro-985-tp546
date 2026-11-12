"""Independent sensors with bounded, temporally correlated readings."""

import math
import random
from abc import ABC, abstractmethod


class Sensor(ABC):
    """Common reading interface for simulated sensors."""

    @abstractmethod
    def read(self) -> float | bool:
        """Return the current sensor reading.

        Returns:
            The current numeric value or presence state.
        """


class NumericSensor(Sensor):
    """A first-order response with bounded noise and a limited rate of change."""

    bounds = (0.0, 100.0)
    initial = 0.0
    time_constant = 60.0
    noise = 0.1
    max_rate = 1.0

    def __init__(self, rng: random.Random):
        """Initialize a sensor with its own state and a shared seeded generator.

        Args:
            rng: Random number generator used for repeatable noise.
        """
        self.rng = rng
        self.value = self.initial

    def advance(self, target: float, seconds: float) -> None:
        """Advance the sensor toward a scenario target.

        Args:
            target: Desired environmental value in the sensor's unit.
            seconds: Positive simulated elapsed time.

        Raises:
            ValueError: If time or target is non-finite or time is not positive.
        """
        if not math.isfinite(seconds) or seconds <= 0 or not math.isfinite(target):
            raise ValueError("Sensor time and target must be finite, with time > 0")
        change = (target - self.value) * (1 - math.exp(-seconds / self.time_constant))
        change += self.rng.uniform(-self.noise, self.noise) * math.sqrt(seconds / 5)
        limit = self.max_rate * seconds
        self.value = min(
            self.bounds[1], max(self.bounds[0], self.value + max(-limit, min(limit, change)))
        )

    def read(self) -> float:
        """Return the current reading rounded to two decimals.

        Returns:
            The current reading in the sensor's native unit.
        """
        return round(self.value, 2)


class TemperatureSensor(NumericSensor):
    """Simulated indoor temperature in degrees Celsius."""

    bounds = (18.0, 32.0)
    initial = 24.0
    time_constant = 120.0
    noise = 0.04
    max_rate = 0.1


class HumiditySensor(NumericSensor):
    """Simulated relative humidity in percent."""

    bounds = (20.0, 85.0)
    initial = 50.0
    time_constant = 100.0
    noise = 0.15
    max_rate = 0.4


class CO2Sensor(NumericSensor):
    """Simulated carbon dioxide concentration in ppm."""

    bounds = (400.0, 5000.0)
    initial = 650.0
    time_constant = 90.0
    noise = 3.0
    max_rate = 18.0


class LightSensor(NumericSensor):
    """Simulated illuminance in lux."""

    bounds = (0.0, 1500.0)
    initial = 450.0
    time_constant = 20.0
    noise = 2.0
    max_rate = 30.0


class PresenceSensor(Sensor):
    """Presence state held until the environment changes occupancy."""

    def __init__(self):
        """Initialize an unoccupied reading."""
        self.value = False

    def read(self) -> bool:
        """Return the current simulated presence state.

        Returns:
            Whether occupancy is currently simulated.
        """
        return self.value
