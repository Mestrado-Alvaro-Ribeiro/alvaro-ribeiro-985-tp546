"""Stateful alert evaluation with hysteresis and explicit recovery."""

from common.config import Settings
from common.models import Alert, AlertSnapshot, Telemetry


class AlertService:
    """Evaluate configured thresholds without oscillating near their boundaries."""

    def __init__(self, settings: Settings):
        """Initialize the rules with no active alerts.

        Args:
            settings: Threshold and hysteresis configuration.
        """
        self.settings = settings
        self.active: set[str] = set()

    def evaluate(self, sample: Telemetry) -> AlertSnapshot:
        """Return the complete active alert set for the current reading.

        Args:
            sample: Environmental telemetry to evaluate.

        Returns:
            A snapshot whose empty active list explicitly clears previous alerts.
        """
        s = self.settings
        rules = [
            (
                "co2_high",
                sample.co2,
                s.co2_threshold,
                s.co2_hysteresis,
                True,
                "ppm",
                "CO₂ elevado. Considere melhorar a ventilação.",
            ),
            (
                "temperature_high",
                sample.temperature,
                s.temperature_threshold,
                s.temperature_hysteresis,
                True,
                "°C",
                "Temperatura acima do limite configurado.",
            ),
            (
                "humidity_low",
                sample.humidity,
                s.humidity_low,
                s.humidity_hysteresis,
                False,
                "%",
                "Umidade abaixo do limite configurado.",
            ),
            (
                "humidity_high",
                sample.humidity,
                s.humidity_high,
                s.humidity_hysteresis,
                True,
                "%",
                "Umidade acima do limite configurado.",
            ),
            (
                "light_low",
                sample.light,
                s.light_threshold,
                s.light_hysteresis,
                False,
                "lux",
                "Baixa luminosidade com presença detectada.",
            ),
        ]
        alerts = []
        for code, value, threshold, margin, upper, unit, message in rules:
            boundary = threshold
            if code in self.active:
                boundary += -margin if upper else margin
            triggered = value > boundary if upper else value < boundary
            if code == "light_low" and not sample.presence:
                triggered = False
            if triggered:
                self.active.add(code)
                alerts.append(
                    Alert(code=code, value=value, threshold=threshold, unit=unit, message=message)
                )
            else:
                self.active.discard(code)
        return AlertSnapshot(
            device_id=sample.device_id,
            timestamp=sample.timestamp,
            source=sample.source,
            active=alerts,
        )
