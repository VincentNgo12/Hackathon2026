# T'Work It

T'Work It is a NatHacks 2026 multimodal worker-safety prototype.

## Repository structure

- `firmware/` — Adafruit ESP32-S3 Feather firmware using PlatformIO,
  Arduino framework, and FreeRTOS where appropriate.
- `backend/` — Python/FastAPI hardware gateway, signal processing,
  telemetry aggregation, EEG integration, and risk logic.
- `frontend/` — Vite + React + TypeScript supervisor dashboard.
- `simulator/` — synthetic telemetry and recorded-data replay tools.
- `docs/` — architecture and interface specifications.

## Architectural rules

- The browser never communicates directly with the ESP32 or OpenBCI.
- Hardware data enters through the Python backend.
- Backend-to-frontend realtime communication uses WebSockets.
- The frontend must work entirely from simulated telemetry.
- ESP32 orientation estimation will eventually produce quaternions from
  four MPU-6050 sensors.
- Heavy posture interpretation and visualization remain on the laptop.
- OpenBCI Cyton communicates independently with the laptop.
- Do not make medical or clinically validated claims.
- Optimize for hackathon demo reliability over production complexity.

## Development principles

- Keep modules small and independently testable.
- Do not put the entire firmware into `main.cpp`.
- Preserve clear hardware/backend/frontend boundaries.
- Do not add dependencies without a concrete need.
- Do not implement advanced ML unless explicitly requested.
- Do not substantially redesign the UI unless explicitly requested.

Consult:
- `docs/ARCHITECTURE.md` for service boundaries.
- `docs/TELEMETRY_PROTOCOL.md` when changing telemetry.
- `docs/UI_SPEC.md` for dashboard work.