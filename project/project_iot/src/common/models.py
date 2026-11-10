"""Versioned MQTT messages and simulation scenario names."""

from enum import StrEnum
from typing import Literal

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, StrictBool


class Scenario(StrEnum):
    """Supported environmental conditions."""

    NORMAL = "normal"
    CROWDED = "crowded"
    EMPTY = "empty"
    POOR_VENTILATION = "poor_ventilation"
    HIGH_TEMPERATURE = "high_temperature"
    NIGHT = "night"


class Telemetry(BaseModel):
    """A complete environmental reading with explicit units in the schema."""

    model_config = ConfigDict(extra="forbid", allow_inf_nan=False, frozen=True)
    schema_version: Literal["1.0"] = "1.0"
    device_id: str = Field(pattern=r"^[A-Za-z0-9_-]{1,64}$")
    timestamp: AwareDatetime
    source: Literal["simulator", "esp32", "raspberry"] = "simulator"
    scenario: Scenario | None = None
    temperature: float = Field(ge=-40, le=85, description="Temperature in degrees Celsius")
    humidity: float = Field(ge=0, le=100, description="Relative humidity in percent")
    co2: float = Field(ge=0, le=40000, description="Carbon dioxide concentration in ppm")
    light: float = Field(ge=0, le=100000, description="Illuminance in lux")
    presence: StrictBool


class ScenarioCommand(BaseModel):
    """A validated request to change the simulated room conditions."""

    model_config = ConfigDict(extra="forbid")
    scenario: Scenario


class Alert(BaseModel):
    """An active condition, its observed value and its configured threshold."""

    code: str
    message: str
    value: float
    threshold: float
    unit: str


class AlertSnapshot(BaseModel):
    """Complete active alert set for a device at a sampling instant."""

    schema_version: Literal["1.0"] = "1.0"
    device_id: str
    timestamp: AwareDatetime
    source: Literal["simulator", "esp32", "raspberry"]
    active: list[Alert]
