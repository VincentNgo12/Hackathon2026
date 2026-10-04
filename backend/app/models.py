from datetime import datetime
from enum import Enum
import math

from pydantic import BaseModel, Field, field_validator


class TelemetrySource(str, Enum):
    SIMULATED = "simulated"
    REPLAY = "replay"
    HARDWARE = "hardware"


class DeviceStatus(str, Enum):
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    SIMULATED = "simulated"


class ImuRegion(str, Enum):
    PELVIS = "pelvis"
    LUMBAR = "lumbar"
    THORACIC = "thoracic"
    UPPER_THORACIC = "upper_thoracic"


class FallState(str, Enum):
    NORMAL = "normal"
    SUSPECTED = "suspected"


class RiskLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


class SystemStatus(str, Enum):
    NOMINAL = "nominal"
    DEGRADED = "degraded"
    OFFLINE = "offline"


class Quaternion(BaseModel):
    w: float
    x: float
    y: float
    z: float

    @field_validator("w", "x", "y", "z")
    @classmethod
    def finite_component(cls, value: float) -> float:
        if not math.isfinite(value):
            raise ValueError("quaternion components must be finite")
        return value


class ImuTelemetry(BaseModel):
    region: ImuRegion
    orientation: Quaternion


class ConnectionStatus(BaseModel):
    source: TelemetrySource
    esp32: DeviceStatus
    openbci: DeviceStatus


class PostureTelemetry(BaseModel):
    lumbar_flexion_deg: float
    thoracic_flexion_deg: float


class EnvironmentTelemetry(BaseModel):
    temperature_c: float
    humidity_percent: float = Field(ge=0, le=100)
    air_quality_index: int = Field(ge=0)
    eco2_ppm: int = Field(ge=0)
    tvoc_ppb: int = Field(ge=0)
    noise_relative_db: float = Field(ge=0)
    light_lux: float = Field(ge=0)


class EegTelemetry(BaseModel):
    alertness: float = Field(ge=0, le=1)
    signal_quality: float = Field(ge=0, le=1)


class WorkerTelemetry(BaseModel):
    timestamp: datetime
    sequence: int = Field(ge=0)
    system_status: SystemStatus
    connection: ConnectionStatus
    imus: list[ImuTelemetry] = Field(min_length=4, max_length=4)
    posture: PostureTelemetry
    fall_state: FallState
    heart_rate_bpm: int = Field(ge=0)
    environment: EnvironmentTelemetry
    eeg: EegTelemetry
    overall_risk: RiskLevel
