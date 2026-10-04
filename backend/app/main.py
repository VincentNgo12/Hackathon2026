from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from .simulator import telemetry_stream

app = FastAPI(
    title="T'Work It API",
    description="Minimal telemetry gateway scaffold for the NatHacks prototype.",
    version="0.1.0",
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "telemetry_source": "simulated"}


@app.websocket("/ws/telemetry")
async def telemetry_websocket(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        async for telemetry in telemetry_stream():
            await websocket.send_json(telemetry.model_dump(mode="json"))
    except (WebSocketDisconnect, RuntimeError):
        # RuntimeError covers a peer disappearing between generated samples.
        return
