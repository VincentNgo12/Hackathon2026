# Supervisor dashboard UI specification

## Goal

Provide a glanceable live view of one worker's system connectivity, posture,
environment, fall state, heart rate, EEG summary, and overall risk. The browser
receives all information from FastAPI and must also work with simulated or replay
telemetry.

## High-level regions

- A compact header identifies T'Work It, the telemetry source, WebSocket state,
  and current overall risk.
- The central hero region will eventually contain a real-time 3D spine/body
  visualization. The scaffold renders four connected spheres only, proving the
  React Three Fiber pipeline and quaternion flow.
- Supporting metric cards summarize posture, heart rate/fall state, and the
  environmental readings.
- A small EEG region will eventually include a real-time waveform, cognitive
  alertness, and signal quality. The scaffold shows numeric placeholders only.

## Behavior

- Connection state must be unmistakable: connecting, connected, or disconnected.
- Simulated and replay sources must be labelled so they cannot be confused with
  live hardware.
- Missing telemetry should show neutral unavailable states rather than invented
  values.
- The latest snapshot may drive the demo UI; history, chart buffers, and storage
  are out of scope for this scaffold.
- The layout should remain usable on common laptop widths and collapse simply on
  narrow screens.

## Design boundary

This specification intentionally avoids detailed colors, typography, final body
geometry, animation language, chart design, alarm workflows, and multi-worker
navigation. Those decisions should follow user testing and reliable hardware
integration rather than being embedded in the scaffold.
