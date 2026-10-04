# Supervisor dashboard product and design brief

## Purpose and audience

The hackathon MVP is a supervisor-facing dashboard for one instrumented worker.
Its job is to make posture, movement, environment, optional physiology,
experimental EEG, connectivity, and risk understandable during a five-minute
live demonstration.

There is no worker-facing application in the MVP. The dashboard consumes only
application-level state from FastAPI and must look and behave consistently for
live, synthetic, and replayed telemetry.

## Experience hierarchy

The screen should read in this order:

1. current worker, connectivity/source, and combined risk;
2. dominant 3D posture approximation;
3. active contextual alert and recent event context;
4. grouped posture, environment, physiology, and EEG details; and
5. calibration and clearly labelled demo/fallback controls.

The 3D visualization should command roughly 50–65% of visual attention, without
locking an exact pixel size or grid before visual exploration.

## Screen structure

### Global header and worker selector

The header identifies T'Work It, active worker, overall risk, data source, and
connection health. It may include compact worker tabs:

- `T'Worker 1` — active and functional;
- `T'Worker 2` — disabled/muted and labelled future/demo; and
- `T'Worker 3` — disabled/muted and labelled future/demo.

An optional tooltip may say `Multi-worker fleet monitoring — planned`. Do not
implement fake worker switching, fabricate active workers, or imply that workers
2 and 3 are monitored.

### 3D posture hero

The hero communicates four measured orientation anchors: pelvis, lumbar,
thoracic, and upper thoracic/shoulder. It may explore:

- a stylized or semi-transparent torso;
- four visible IMU anchor markers;
- a smooth interpolated current-spine path;
- a neutral/reference ghost spine;
- localized posture-risk emphasis and subtle angle annotations;
- optional engineering/debug overlays;
- front and side camera presets, orbit controls, and reset camera; and
- restrained idle camera motion when it improves polish without distraction.

The posture must be deterministic and sensor-driven. A physics engine must not
determine posture. Quaternion SLERP may smooth rendering between samples or
anchors. Accurate yaw/twist is not a primary visual requirement.

The view must be described as a **3D posture approximation**. Four anchors are
measured; the connecting form is visual interpolation, not measured medical
spinal curvature or additional anatomical data.

The current scaffold's four connected spheres are only a proof that React Three
Fiber works; they are not the final visual direction.

### Posture and movement

Supporting posture information should prioritize forward flexion, backward
extension, lateral bending, sustained poor-posture duration, and fall/impact
context when supplied by the backend. Group related segment values rather than
creating a wall of identical cards. The frontend presents backend
interpretations; it does not calculate safety thresholds from raw IMU values.

### EEG corner panel

EEG occupies a small but visually interesting corner or lower region and must not
compete with the 3D hero. The intended panel contains:

- one to three scrolling, downsampled waveform traces;
- an experimental cognitive alertness/fatigue indicator;
- signal quality;
- artifact state or probability; and
- optionally, a compact frequency-band/PSD view if space and reliability allow.

If live Cyton acquisition fails, prerecorded EEG may be used only when its source
is visible. EEG wording must remain experimental and non-diagnostic.

### Environment and physiology

Environment is one intelligently grouped region rather than an equal card for
every sensor:

- AHT21 temperature and humidity;
- ENS160 AQI/eCO2/TVOC estimates;
- VEML7700 ambient light; and
- INMP441-derived relative noise exposure/trend.

Relative noise must not look like a certified measurement. Heart rate from the
MAX30102 belongs in a smaller physiology area and may show unavailable when the
stretch sensor is unreliable. SpO2 should not be prominent unless reliability is
demonstrated.

### Alerts and overall risk

Alerts use four conceptual severities: `NORMAL`, `ADVISORY`, `WARNING`, and
`CRITICAL`. They should be contextual, localized, and visually proportional.
Mild posture should not turn the entire interface red; a critical fall/impact may
warrant dominant acute-event treatment.

The combined risk classification uses `LOW`, `MODERATE`, `ELEVATED`, or `HIGH`.
Avoid fake precision such as unexplained decimal risk scores. Always preserve
enough context for a viewer to understand why risk changed.

### Event timeline

A compact timeline should show important state changes such as calibration,
sustained posture warnings, environmental advisories, signal loss, and acute
impact/fall events. It should not log every 20 Hz sample. Live, replayed, and
manually triggered demo events must be distinguishable. Timeline persistence is
not required for the hackathon unless separately implemented.

### Calibration interaction

Provide a prominent `CALIBRATE POSTURE` action with an eventual flow such as:

1. `Stand naturally upright`;
2. a clear `3–2–1` countdown;
3. capture of all four fresh neutral orientations;
4. `Neutral posture captured`; and
5. update of the neutral/reference ghost visualization.

Retain a smaller `RECENTER` action. The frontend requests calibration but does
not invent success or perform calibration math. Exact backend/ESP32 command
transport is unresolved; the success state must eventually come from backend
acknowledgement.

### Demo and fallback controls

Controls may select a clearly labelled synthetic/replay source or trigger a
predefined demo event when the backend supports it. These controls should be
visually secondary, access-controlled as appropriate for the demo, and never
misrepresent fallback data as live. Visual components must not care which source
is active beyond displaying provenance and quality.

## System, loading, and failure states

- `connecting`: preserve layout and show an active connection attempt;
- `connected/live`: show subsystem freshness and live provenance;
- `simulated` or `replay`: label persistently, not only in a transient toast;
- `degraded`: keep available subsystems usable while identifying stale/missing
  ESP32, EEG, or auxiliary input;
- `disconnected`: freeze no old value as current; dim or mark data stale and show
  recovery state; and
- no first sample: show stable skeleton/empty geometry, not fabricated metrics.

Automatic WebSocket reconnection is appropriate. Connection recovery must not
erase an acute event before it can be understood.

## Responsive behavior

The primary demo target is a common laptop display. At narrower widths, preserve
the header/status, 3D hero, active alert, and critical controls before secondary
detail. Supporting groups may stack below the hero. On very small screens, a
useful status view is sufficient; a complete worker-facing mobile experience is
not in scope.

## Visual principles

Aim for a **premium industrial biomechanics / aerospace telemetry command
center**:

- dark neutral foundations and restrained, meaningful accent colors;
- high-quality technical typography and excellent spacing;
- subtle depth rather than decorative glass everywhere;
- precise overlays and smooth, purposeful motion;
- risk color reserved for meaningful hierarchy; and
- a clear focal point dominated by the 3D body/posture view.

Avoid generic SaaS dashboard composition, hospital-software aesthetics, gamer
RGB, excessive cyberpunk neon, excessive glassmorphism, walls of equal-sized
cards, and gratuitous effects that reduce readability.

## Freedom for Astra's visual exploration

Astra may explore composition, typography, restrained palette, materials,
lighting, torso/spine abstraction, transitions, camera behavior, chart treatment,
and micro-interactions as long as the hierarchy and truthfulness constraints in
this brief remain intact. Exact pixel dimensions, final colors, exact component
library, and final 3D art direction are intentionally open.

Exploration must not change system responsibilities, invent sensor precision,
hide provenance, implement fake workers, imply accurate anatomical
reconstruction, or allow the EEG panel to compete with the 3D hero.

## Current scaffold gap

The current frontend already uses Vite, React, TypeScript, Three.js, React Three
Fiber, Drei, and Zustand. It shows connection/source/risk, basic metrics, and four
connected spheres. It does not yet implement the final 3D design, calibration,
worker tabs, event timeline, alerts, waveform traces, artifact awareness,
subsystem freshness, mock controls, or the target risk vocabulary. Tailwind CSS,
shadcn/ui, Framer Motion, uPlot, and Recharts are planned options, not current
dependencies.
