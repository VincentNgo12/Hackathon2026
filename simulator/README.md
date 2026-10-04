# Simulator

The current simulator lives in `backend/app/simulator.py` so the FastAPI service
and command-line inspection mode share exactly the same typed telemetry model.

From `backend/`, activate the Python environment and run:

```bash
python -m app.simulator
```

It writes `WorkerTelemetry` as newline-delimited JSON at approximately 20 Hz.
Stop it with Ctrl+C. Recorded-data replay is reserved for a later milestone.
