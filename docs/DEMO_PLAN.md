# Five-minute demo plan

## Demo objective

Show a technically credible, responsive multimodal worker-safety prototype whose
3D posture approximation reacts immediately, whose supporting signals have clear
provenance, and whose failure modes do not derail the presentation. Do not imply
medical validity, certified safety, accurate anatomical spinal reconstruction,
or functional multi-worker monitoring.

## What may be live or fallback

| Subsystem | Preferred | Approved fallback |
| --- | --- | --- |
| Four posture IMUs | Live ESP32 quaternions | Recorded or synthetic posture sequence |
| Environment | Live ESP32 sensor values | Recorded/synthetic values labelled as such |
| MAX30102 | Live only if stable | Show unavailable; do not make it demo-critical |
| EEG | Live Cyton through dongle/BrainFlow | Prerecorded EEG with visible replay label |
| Fall/impact | Safe IMU-driven event | Predefined/manual demo event, clearly labelled |
| Dashboard | Live FastAPI WebSocket | Local synthetic source through the same backend contract |

Fallback data is a first-class reliability mechanism, not something to disguise.
Mixed operation must identify each subsystem's source.

## Before judges arrive

- Charge the ESP32, laptop, Cyton/dongle, and any wearable power supply.
- Mount and label the four active MPU-6050 positions: pelvis, lumbar, thoracic,
  and upper thoracic/shoulder; keep the fifth sensor as a spare.
- Confirm the PCA9548/TCA9548A path and inspect sensor freshness.
- Start FastAPI and verify `GET /health` and `WS /ws/telemetry`.
- Start the Vite dashboard and verify automatic reconnection.
- Confirm whether each subsystem is live, replayed, simulated, or unavailable.
- Prepare a tested synthetic/recorded posture sequence and prerecorded EEG.
- Prepare a safe, repeatable impact trigger and its manual fallback.
- Confirm the current browser view, camera preset, and calibration/recenter flow.
- Disable distracting notifications and unnecessary network dependencies.
- Run the frontend build/lint, backend import check, and firmware build when the
  relevant tooling is available.
- Keep the dashboard and fallback sources already running; do not install or
  compile dependencies while judges wait.

## Approximately five-minute sequence

### 0:00–0:35 — Problem and product

Introduce fragmented worker-safety signals and the T'Work It proposition: one
supervisor view combining posture, movement, environment, optional physiology,
and experimental EEG. Point out the prototype/non-certified status once, without
allowing the disclaimer to consume the opening.

### 0:35–1:05 — Instrumented worker and architecture

Show the four active IMU locations and wearable controller. Explain that the
ESP32 will produce four `[w, x, y, z]` quaternions, while the laptop performs
relative posture interpretation. Briefly identify the separate Cyton-to-dongle-
to-BrainFlow path; raw EEG does not pass through the ESP32.

### 1:05–1:35 — Neutral calibration

With the worker standing naturally upright, invoke `CALIBRATE POSTURE`. Show the
`3–2–1` countdown, capture confirmation, and neutral/reference ghost state. If
calibration fails, use `RECENTER` once; if it still fails, switch explicitly to
the prepared calibrated recording rather than troubleshooting on stage.

### 1:35–2:25 — Responsive 3D posture

Have the worker bend forward and sideways, then briefly extend. The four measured
anchors and interpolated posture approximation should respond immediately. State
that the anchors are measured and the connecting spine/torso form is a visual
approximation, not anatomical reconstruction. Do not emphasize yaw.

### 2:25–2:55 — Sustained posture and alert

Hold a deliberately poor but comfortable posture until an advisory or warning
appears. Show localized posture context and the event timeline. Explain why the
whole UI does not turn critical for one moderate condition.

### 2:55–3:30 — Environment and physiology

Show grouped AHT21 temperature/humidity, ENS160 estimates, VEML7700 light, and
INMP441 relative noise trend. Describe noise as relative and non-certified. Show
MAX30102 heart rate only if stable; otherwise explicitly show it unavailable.

### 3:30–4:05 — Experimental EEG

Show one to three compact waveforms, signal quality/artifact context, and the
experimental alertness/fatigue indicator. If using prerecorded EEG, point to the
replay label. Do not make diagnostic or fitness-for-duty claims.

### 4:05–4:35 — Safe acute event and combined risk

Trigger a safe impact/fall-context event without having a person perform a real
fall. Use a rehearsed padded sensor/wearable movement or another team-approved
low-risk method. Show the localized critical event, timeline entry, and combined
risk change. If live detection is unreliable, use the clearly labelled manual
demo trigger.

### 4:35–5:00 — Scalability and close

Point to `T'Worker 1` as the only active worker. Muted `T'Worker 2` and
`T'Worker 3` selectors communicate planned fleet monitoring and must not be
clicked as fake active workers. Close on the resilient architecture and final
disclaimer.

## Calibration runbook

1. Verify four fresh IMU anchors before beginning.
2. Ask the wearer to stand naturally upright and still.
3. Start calibration and show the countdown.
4. Wait for backend confirmation; do not claim success from a frontend timer.
5. Confirm the neutral ghost/reference and return to live posture.
6. Use recenter for a quick retry.
7. If confirmation is unavailable, switch to a prepared calibrated replay and
   label it.

The exact frontend/backend/ESP32 calibration command transport remains unresolved.

## Failure recovery

- **ESP32 disconnect:** keep the dashboard open, show stale/disconnected state,
  and switch to the prepared posture replay through the backend.
- **One IMU missing:** do not present a complete live 3D posture. Retry once, then
  use replay; identify the degraded condition.
- **Cyton/BrainFlow failure:** use prerecorded EEG or mark EEG unavailable while
  continuing the posture demo.
- **MAX30102 unreliable:** hide or mark heart rate unavailable and continue.
- **WebSocket loss:** allow automatic reconnect; if it does not recover quickly,
  restart the known-good local backend and use synthetic data.
- **Calibration failure:** recenter once, then use the prepared calibrated replay.
- **Fall trigger misses:** use the labelled manual event trigger; never repeat a
  risky physical action.
- **3D rendering failure:** retain numeric posture/status and switch to a known
  supported browser or prerecorded screen capture only as a final contingency.

Avoid debugging device drivers, dependency installation, or network discovery in
front of judges. One presenter should continue the narrative while the operator
changes sources.

## Suggested presentation responsibilities

- **Presenter:** narrative, claims, worker instructions, and judge interaction
- **Wearer:** calibrated movements and safe posture holds
- **Operator:** dashboard/camera, calibration, source/fallback switching, and
  timing
- **Safety spotter:** verifies that the impact demonstration remains low-risk

Small teams may combine roles, but the impact action and fallback switch should
be rehearsed by someone other than an unbriefed judge.

## Final disclaimer language

> T'Work It is a hackathon prototype. Its posture, fatigue, fall, physiology,
> environmental, and combined-risk indicators are experimental and may include
> simulated or replayed data. It is not a medical device, diagnostic tool,
> certified sound-level meter, or certified safety system.

## Current implementation limitation

Today the repository demonstrates a synthetic FastAPI stream, basic metrics, and
four connected 3D spheres. Real sensor acquisition, calibration commands,
BrainFlow, waveform/artifact data, alerts, timeline, manual event triggers, and
mixed-source provenance are not yet implemented. This plan describes the demo
target and its fallbacks, not the current scaffold's completed behavior.
