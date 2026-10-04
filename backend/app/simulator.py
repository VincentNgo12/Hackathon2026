import asyncio
import json
import math
from collections.abc import AsyncIterator
from datetime import UTC, datetime

from .models import (
    ConnectionStatus,
    DeviceStatus,
    EegTelemetry,
    EnvironmentTelemetry,
    FallState,
    ImuRegion,
    ImuTelemetry,
    PostureTelemetry,
    Quaternion,
    RiskLevel,
    SystemStatus,
    TelemetrySource,
    WorkerTelemetry,
)

REGIONS = (
    ImuRegion.PELVIS,
    ImuRegion.LUMBAR,
    ImuRegion.THORACIC,
    ImuRegion.UPPER_THORACIC,
)


def _x_rotation(angle_radians: float) -> Quaternion:
    """Return a normalized quaternion for a simple demo rotation."""
    half_angle = angle_radians / 2
    return Quaternion(w=math.cos(half_angle), x=math.sin(half_angle), y=0, z=0)


def make_telemetry(sequence: int, sample_rate_hz: float = 20.0) -> WorkerTelemetry:
    """Build one deterministic synthetic snapshot suitable for UI development."""
    elapsed = sequence / sample_rate_hz
    bend = math.sin(elapsed * 0.7)
    lumbar_flexion = 10 + bend * 7
    thoracic_flexion = 14 + math.sin(elapsed * 0.55 + 0.4) * 9
    risk = RiskLevel.MODERATE if lumbar_flexion > 15 or thoracic_flexion > 21 else RiskLevel.LOW

    imus = [
        ImuTelemetry(
            region=region,
            orientation=_x_rotation(math.radians(bend * index * 3.5)),
        )
        for index, region in enumerate(REGIONS)
    ]

    return WorkerTelemetry(
        timestamp=datetime.now(UTC),
        sequence=sequence,
        system_status=SystemStatus.NOMINAL,
        connection=ConnectionStatus(
            source=TelemetrySource.SIMULATED,
            esp32=DeviceStatus.SIMULATED,
            openbci=DeviceStatus.SIMULATED,
        ),
        imus=imus,
        posture=PostureTelemetry(
            lumbar_flexion_deg=round(lumbar_flexion, 2),
            thoracic_flexion_deg=round(thoracic_flexion, 2),
        ),
        fall_state=FallState.NORMAL,
        heart_rate_bpm=round(76 + math.sin(elapsed * 0.8) * 5),
        environment=EnvironmentTelemetry(
            temperature_c=round(22.5 + math.sin(elapsed * 0.05) * 0.6, 2),
            humidity_percent=round(42 + math.sin(elapsed * 0.04) * 3, 2),
            air_quality_index=round(50 + math.sin(elapsed * 0.1) * 7),
            eco2_ppm=round(510 + math.sin(elapsed * 0.08) * 35),
            tvoc_ppb=round(38 + math.sin(elapsed * 0.12) * 8),
            noise_relative_db=round(61 + math.sin(elapsed * 1.3) * 5, 2),
            light_lux=round(320 + math.sin(elapsed * 0.2) * 45, 2),
        ),
        eeg=EegTelemetry(
            alertness=round(0.72 + math.sin(elapsed * 0.2) * 0.08, 3),
            signal_quality=round(0.9 + math.sin(elapsed * 0.15) * 0.05, 3),
        ),
        overall_risk=risk,
    )


async def telemetry_stream(sample_rate_hz: float = 20.0) -> AsyncIterator[WorkerTelemetry]:
    """Yield synthetic snapshots at approximately the requested sample rate."""
    sequence = 0
    interval = 1 / sample_rate_hz
    while True:
        yield make_telemetry(sequence, sample_rate_hz)
        sequence += 1
        await asyncio.sleep(interval)


async def _print_stream() -> None:
    async for sample in telemetry_stream():
        print(json.dumps(sample.model_dump(mode="json")), flush=True)


if __name__ == "__main__":
    try:
        asyncio.run(_print_stream())
    except KeyboardInterrupt:
        pass
