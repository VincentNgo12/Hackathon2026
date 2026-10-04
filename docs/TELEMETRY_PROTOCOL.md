# Telemetry protocols and application contract

## Scope: two different interfaces

T'Work It has two deliberately separate telemetry interfaces:

**A. ESP32-to-backend device transport.** This low-level wireless protocol is
not finalized. Wi-Fi versus BLE, packet encoding, framing, acknowledgement,
clock synchronization, calibration commands, and optional raw IMU/debug fields
remain TODOs. The browser must never consume this protocol.

**B. Backend-to-frontend application telemetry.** FastAPI sends normalized
`WorkerTelemetry` JSON snapshots over `WS /ws/telemetry`. This is the stable,
hardware-agnostic frontend boundary documented below.

Do not force the eventual ESP32 packet to mirror `WorkerTelemetry`; the two
interfaces serve different purposes.

## Current implemented scaffold contract

The repository currently sends a complete JSON snapshot at approximately 20 Hz.
Field names use `snake_case`, and timestamps are UTC ISO 8601 strings. The
implemented model has no explicit schema-version field yet.

```json
{
  "timestamp": "2026-10-04T03:12:45.123456Z",
  "sequence": 42,
  "system_status": "nominal",
  "connection": {
    "source": "simulated",
    "esp32": "simulated",
    "openbci": "simulated"
  },
  "imus": [
    { "region": "pelvis", "orientation": { "w": 1.0, "x": 0.0, "y": 0.0, "z": 0.0 } },
    { "region": "lumbar", "orientation": { "w": 0.999, "x": 0.03, "y": 0.0, "z": 0.0 } },
    { "region": "thoracic", "orientation": { "w": 0.998, "x": 0.05, "y": 0.0, "z": 0.0 } },
    { "region": "upper_thoracic", "orientation": { "w": 0.997, "x": 0.07, "y": 0.0, "z": 0.0 } }
  ],
  "posture": {
    "lumbar_flexion_deg": 8.2,
    "thoracic_flexion_deg": 11.4
  },
  "fall_state": "normal",
  "heart_rate_bpm": 76,
  "environment": {
    "temperature_c": 22.4,
    "humidity_percent": 41.0,
    "air_quality_index": 52,
    "eco2_ppm": 510,
    "tvoc_ppb": 38,
    "noise_relative_db": 61.2,
    "light_lux": 320.0
  },
  "eeg": { "alertness": 0.74, "signal_quality": 0.91 },
  "overall_risk": "low"
}
```

This scaffold contract supports frontend development but is not the complete
target contract. In particular, it does not yet carry schema version, worker ID,
per-subsystem freshness, lateral/extension posture, sustained duration, impact
context, EEG waveform/artifact state, alerts, event timeline entries, calibration
state, or fallback provenance at subsystem granularity.

## Locked application semantics

### Envelope and timing

| Field | Semantics |
| --- | --- |
| `schema_version` | Required before the contract is declared stable; use semantic major/minor evolution. Currently absent. |
| `timestamp` | UTC ISO 8601 timestamp for the aggregated application snapshot. |
| `sequence` | Monotonically increasing integer within one stream/session. It may reset after reconnect or backend restart. |
| worker identity | Future stable identifier; only `T'Worker 1` is functional in the MVP. Exact machine value is TODO. |
| update rate | Target application snapshots approximately 20 Hz; slow sensors may repeat their last value with freshness metadata. |

The backend may receive sensors at different rates. It is responsible for
aggregation and freshness; the frontend must not assume every field was sampled
at the snapshot timestamp.

### Connection and system status

The current scaffold uses:

- `connection.source`: `simulated`, `replay`, or `hardware`;
- `connection.esp32` and `connection.openbci`: `disconnected`, `connecting`,
  `connected`, or `simulated`; and
- `system_status`: `nominal`, `degraded`, or `offline`.

The target contract also needs per-subsystem freshness and provenance so mixed
operation—such as live ESP32 plus replayed EEG—is honest. Exact field names and
stale-time thresholds remain TODOs.

### Orientation and posture

- Exactly four active regions are identified by name, never by array position:
  `pelvis`, `lumbar`, `thoracic`, and `upper_thoracic`.
- Quaternion component order is globally locked as `[w, x, y, z]`.
- Quaternions must be finite and normalized before application delivery.
- Posture angles use degrees and are relative to the captured neutral pose.
- Forward flexion, backward extension, and lateral bending are required posture
  concepts. The current scaffold exposes only lumbar and thoracic flexion.
- Sustained poor posture requires duration/context from the backend; exact target
  fields and thresholds remain TODOs.
- Accurate absolute yaw/twist is not required.

Coordinate handedness, world axes, quaternion direction, sensor mounting frames,
and positive angle directions are **unresolved**. They must be specified before
real IMU data is integrated. `[w, x, y, z]` defines component order only; it does
not resolve those frame conventions.

### Movement, fall, and impact

The current `fall_state` values are `normal` and `suspected`. Fall/impact context
will primarily come from the four IMUs. The target contract must distinguish an
acute event from ordinary motion and carry enough context for a timeline and
localized critical alert. The exact impact metrics, confirmation states, and
field names are TODOs; no medically or legally meaningful fall claim is implied.

### Environment

| Field | Source | Unit / meaning |
| --- | --- | --- |
| `temperature_c` | AHT21 | degrees Celsius |
| `humidity_percent` | AHT21 | percent relative humidity, `0–100` |
| `air_quality_index` | ENS160 | ENS160 AQI estimate; mapping/version must be retained when real data is added |
| `eco2_ppm` | ENS160 | estimated CO2 equivalent, parts per million |
| `tvoc_ppb` | ENS160 | estimated total VOC, parts per billion |
| `noise_relative_db` | INMP441-derived | relative demo trend; not calibrated/certified SPL |
| `light_lux` | VEML7700 | lux |

Raw speech/audio does not need to be stored or transported to the frontend.

### Physiology

`heart_rate_bpm` is beats per minute from the MAX30102 when reliable. Heart rate
is a supporting/stretch signal and must be nullable or explicitly unavailable
when absent; the current scaffold incorrectly requires it. SpO2 remains optional
and should not enter the contract or UI prominently until its reliability is
demonstrated.

### EEG

The current scaffold provides normalized `alertness` and `signal_quality` values
in the range `0.0–1.0`. The target application state also needs artifact awareness
and enough downsampled data for one to three small waveform traces. A compact PSD
or frequency-band summary is optional. Exact waveform batching, channel choice,
artifact representation, and rate are unresolved.

Cyton samples arrive independently through the official dongle and BrainFlow in
the backend. Raw EEG never routes through the ESP32. Any alertness/fatigue output
is experimental and must include signal-quality/artifact context.

### Overall risk and alerts

The target overall-risk vocabulary is locked to `low`, `moderate`, `elevated`,
and `high`. It is an understandable classification, not a scientifically precise
probability. An internal normalized score may exist but need not be displayed.
The current code implements only `low`, `moderate`, and `high`.

Alert severity is locked conceptually to:

- `normal` — ordinary operation;
- `advisory` — mild sustained posture or moderately elevated conditions;
- `warning` — significant/contextual risk; and
- `critical` — acute fall/strong-impact event.

The target `WorkerTelemetry` needs an alerts collection carrying, at minimum,
severity, category, human-readable summary, active/cleared state, and time. Exact
identifiers and JSON shape remain TODOs. Individual sensor thresholds should
produce contextual/localized alerts rather than automatically turning the whole
application critical.

## Missing and optional data

- Unavailable or unsupported optional values must be `null` or omitted according
  to one consistent policy selected with schema versioning; zero must never mean
  unknown.
- Each slow or failure-prone subsystem needs quality/freshness information.
- The frontend must show unavailable/stale states and must not retain old values
  as if current.
- A mixed live/replay/simulated session must identify provenance per subsystem.
- Consumers should ignore unknown additive fields within a compatible schema
  version.

The exact null-versus-omission policy is unresolved. The current Pydantic model
requires all fields and therefore does not yet meet this target behavior.

## Versioning strategy

Before real hardware integration, add `schema_version` to every application
snapshot. Additive optional fields may increment a minor version. Renames,
semantic changes, removed fields, unit changes, or enumeration changes require a
major version and coordinated backend/frontend support. Low-level ESP32 protocol
versioning will be designed separately once that transport is selected.

## Claims and data interpretation

Simulator values are UI fixtures, not measurements. Visual curves between IMU
anchors are interpolation, not measured spinal anatomy. Noise is relative, EEG
is experimental, and no telemetry field constitutes a medical diagnosis or
certified safety determination.
