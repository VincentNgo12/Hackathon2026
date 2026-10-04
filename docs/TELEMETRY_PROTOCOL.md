# Telemetry protocol

## Transport

The backend sends JSON text messages over `WS /ws/telemetry` at approximately
20 Hz. Each message is a complete `WorkerTelemetry` snapshot. Field names use
`snake_case`; timestamps use UTC ISO 8601 strings. The protocol is currently
unversioned while the scaffold is changing.

All quaternions use `(w, x, y, z)` component order and must be normalized. The
region field, rather than array position, identifies an IMU.

## Message shape

```json
{
  "timestamp": "2026-10-04T03:12:45.123456Z",
  "sequence": 42,
  "system_status": "nominal",
  "connection": { "source": "simulated", "esp32": "simulated", "openbci": "simulated" },
  "imus": [
    { "region": "pelvis", "orientation": { "w": 1.0, "x": 0.0, "y": 0.0, "z": 0.0 } },
    { "region": "lumbar", "orientation": { "w": 0.999, "x": 0.03, "y": 0.0, "z": 0.0 } },
    { "region": "thoracic", "orientation": { "w": 0.998, "x": 0.05, "y": 0.0, "z": 0.0 } },
    { "region": "upper_thoracic", "orientation": { "w": 0.997, "x": 0.07, "y": 0.0, "z": 0.0 } }
  ],
  "posture": { "lumbar_flexion_deg": 8.2, "thoracic_flexion_deg": 11.4 },
  "fall_state": "normal",
  "heart_rate_bpm": 76,
  "environment": {
    "temperature_c": 22.4, "humidity_percent": 41.0,
    "air_quality_index": 52, "eco2_ppm": 510, "tvoc_ppb": 38,
    "noise_relative_db": 61.2, "light_lux": 320.0
  },
  "eeg": { "alertness": 0.74, "signal_quality": 0.91 },
  "overall_risk": "low"
}
```

## Enumerations and units

| Field | Values or unit |
| --- | --- |
| `connection.source` | `simulated`, `replay`, `hardware` |
| `system_status` | `nominal`, `degraded`, `offline` |
| device connection fields | `disconnected`, `connecting`, `connected`, `simulated` |
| `imus[].region` | `pelvis`, `lumbar`, `thoracic`, `upper_thoracic` |
| posture angles | degrees; interpretation is not yet defined |
| `fall_state` | `normal`, `suspected` |
| `heart_rate_bpm` | beats per minute |
| temperature / humidity | degrees Celsius / percent relative humidity |
| `air_quality_index` | placeholder scalar pending ENS160 mapping |
| `eco2_ppm` / `tvoc_ppb` | parts per million / parts per billion |
| `noise_relative_db` | relative demo value, not calibrated exposure measurement |
| `light_lux` | lux |
| EEG alertness and quality | normalized `0.0`–`1.0` placeholders |
| `overall_risk` | `low`, `moderate`, `high` |

## Compatibility guidance

Consumers should ignore unknown fields. Breaking changes should later introduce
an explicit protocol version. Values in the current simulator are plausible UI
fixtures only; they are not measurements and must not support medical or safety
claims.
