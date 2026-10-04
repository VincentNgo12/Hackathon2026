# Demo plan

## Objective

Demonstrate the intended end-to-end boundary with no physical hardware: a typed
synthetic source feeds FastAPI, FastAPI broadcasts snapshots through a WebSocket,
and the React dashboard updates metrics and a simple 3D sensor view.

## Setup

1. Start the backend from `backend/` with
   `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
2. Confirm `GET http://localhost:8000/health` returns `status: ok` and identifies
   the synthetic source.
3. Start the frontend from `frontend/` with `npm run dev`.
4. Open the Vite URL and confirm the header changes to connected.

## Walkthrough

1. Point out that the source is explicitly labelled simulated.
2. Show four moving, connected spheres corresponding to pelvis, lumbar,
   thoracic, and upper thoracic IMUs.
3. Show changing posture, heart-rate, environment, EEG, and risk values.
4. Stop the backend and show the disconnected state; restart it and demonstrate
   automatic reconnection.
5. Explain that future ESP32 and OpenBCI adapters terminate in the backend, so
   the browser-facing contract remains the same.

## Pre-demo checks

- Run `npm run build` in `frontend/`.
- Run `python -m compileall app` and import `app.main` in `backend/`.
- Run `pio run` in `firmware/` when PlatformIO is available.
- Keep the simulator as the fallback even if physical hardware is later present.

## Honest limitations

All current measurements and risk changes are synthetic. The 3D scene is not a
spine model. No sensor acquisition, calibration, posture/fall interpretation,
BrainFlow integration, medically meaningful EEG analysis, calibrated noise
exposure, persistence, or alert workflow is implemented.
