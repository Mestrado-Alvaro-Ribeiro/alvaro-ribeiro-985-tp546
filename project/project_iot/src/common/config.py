"""Validated environment configuration."""

import os

from pydantic import BaseModel, ConfigDict, Field, SecretStr, model_validator

from common.models import Scenario


class Settings(BaseModel):
    """Application settings loaded from uppercase environment variable names."""

    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)
    mqtt_host: str = Field(default="localhost", min_length=1)
    mqtt_port: int = Field(default=1883, ge=1, le=65535)
    mqtt_username: str | None = None
    mqtt_password: SecretStr | None = None
    mqtt_tls: bool = False
    mqtt_ca_file: str | None = None
    mqtt_keepalive: int = Field(default=30, ge=5, le=300)
    device_id: str = Field(default="room01", pattern=r"^[A-Za-z0-9_-]{1,64}$")
    topic_prefix: str = Field(
        default="iot/environment", pattern=r"^[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*$"
    )
    publish_interval: float = Field(default=5, gt=0, le=3600)
    scenario: Scenario = Scenario.NORMAL
    random_seed: int = 42
    co2_threshold: float = Field(default=1500, gt=400, le=5000)
    co2_hysteresis: float = Field(default=100, ge=0)
    temperature_threshold: float = Field(default=30, ge=18, le=32)
    temperature_hysteresis: float = Field(default=1, ge=0, le=5)
    humidity_low: float = Field(default=30, ge=0, le=100)
    humidity_high: float = Field(default=70, ge=0, le=100)
    humidity_hysteresis: float = Field(default=3, ge=0)
    light_threshold: float = Field(default=200, ge=0, le=1500)
    light_hysteresis: float = Field(default=20, ge=0, le=500)

    @model_validator(mode="after")
    def validate_relationships(self) -> "Settings":
        """Reject inconsistent thresholds and incomplete MQTT credentials.

        Returns:
            The validated settings instance.

        Raises:
            ValueError: If hysteresis or authentication settings are inconsistent.
        """
        if self.co2_hysteresis >= self.co2_threshold - 400:
            raise ValueError("CO2_HYSTERESIS must permit recovery above 400 ppm")
        if self.humidity_low + 2 * self.humidity_hysteresis >= self.humidity_high:
            raise ValueError("Humidity thresholds and hysteresis overlap")
        if self.mqtt_password and not self.mqtt_username:
            raise ValueError("MQTT_PASSWORD requires MQTT_USERNAME")
        if self.mqtt_ca_file and not self.mqtt_tls:
            raise ValueError("MQTT_CA_FILE requires MQTT_TLS=true")
        return self

    @classmethod
    def from_env(cls) -> "Settings":
        """Read declared settings from uppercase environment variables.

        Returns:
            Validated application settings.

        Raises:
            ValueError: If an environment value fails validation.
        """
        return cls(
            **{
                key: os.environ[key.upper()]
                for key in cls.model_fields
                if key.upper() in os.environ
            }
        )

    def topic(self, kind: str) -> str:
        """Build a topic scoped to this device.

        Args:
            kind: Message category, such as telemetry or alerts.

        Returns:
            The complete MQTT topic.
        """
        return f"{self.topic_prefix}/{self.device_id}/{kind}"
