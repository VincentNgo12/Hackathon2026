# T'Work It — MONOGRAPH frontend

Mock-only supervisor dashboard. No backend, credentials, physical sensors, or
network telemetry connection is needed. Run commands from `frontend/`:

```sh
npm install
npm run dev
npm run build       # TypeScript validation + production bundle
npm run lint
node scripts/check-mock.mjs
npm run preview
```

## Demonstration

Open **Demo controls** for twelve deterministic scenarios: neutral, forward
bend, backward extension, both lateral bends, poor posture, elevated posture
risk, cognitive fatigue, high eCO2, noise, impact, and fall. Reset clears history
and returns to neutral. Loading, stale, disconnected, and missing-heart-rate
states are also available. Close the studio for the judge-facing view.
Workers 2 and 3 are explicitly disabled.

**Calibrate posture** previews a three-second upright capture and stores a
mock reference for the ghost spine. No hardware command is sent. **Re-center**
resets the camera, not the reference. Front, side, orbit, and overlay controls
are available in the observation bay.

## Data boundary

`telemetry/mockTelemetry.ts` is the sole synthetic source. It publishes at
20 Hz into `telemetry/telemetryStore.ts`. Every instrument consumes that store;
visual components do not generate fake measurements. EEG samples are generated
centrally at 160 samples/second with a bounded six-second buffer. Event history
is capped at 30. The source pauses when the document is hidden.

`src/telemetry.ts` retains the canonical WorkerTelemetry contract. Quaternion
serialization remains w, x, y, z. A separate presentation envelope in
`telemetry/types.ts` carries mock waveforms, artifact state, lateral bend,
reference, availability, and localized alerts absent from the current wire
schema. These are not additions to the backend protocol. AQI is explicitly a
fixture, not a claimed ENS160 scale.

The existing WebSocket hook is retained but **not mounted**. A future source
can feed the same store through `setTelemetry`; unsupported presentation fields
become unavailable rather than retaining mock values. Agree on waveform,
artifact, reference, and event contracts before connecting acquisition.

## Visualization and next pass

`components/spine/PostureScene.tsx` owns the procedural cutaway torso, four
anchors, smoothed segment chain, current/reference paths, camera, and localized
risk sleeve. Animation reads the store directly in `useFrame`, using quaternion
interpolation and reused geometry. Pixel ratio is capped. The mock scene uses
+Y up and +Z posterior, not a finalized hardware mounting frame.

Next: refine torso proportions, segment/path fidelity, marker occlusion, and
sensor-to-render transforms; profile frame time on the demo laptop. There is
no anatomical asset, medical model, physics engine, or real posture algorithm.
Reduced-motion preferences and a WebGL failure fallback are supported.
The Three.js bundle remains large; code splitting and upstream deprecation
cleanup are follow-up optimization work.
