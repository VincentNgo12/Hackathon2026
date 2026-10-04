import { useEffect } from 'react'
import { isWorkerTelemetry } from './telemetry'
import { useTelemetryStore } from './telemetryStore'

const websocketUrl =
  import.meta.env.VITE_TELEMETRY_WS_URL ?? 'ws://localhost:8000/ws/telemetry'

export function useTelemetrySocket() {
  const setConnectionState = useTelemetryStore((state) => state.setConnectionState)
  const setTelemetry = useTelemetryStore((state) => state.setTelemetry)

  useEffect(() => {
    let socket: WebSocket | undefined
    let retryTimer: number | undefined
    let stopped = false

    const connect = () => {
      setConnectionState('connecting')
      socket = new WebSocket(websocketUrl)

      socket.onopen = () => setConnectionState('connected')
      socket.onmessage = (event) => {
        try {
          const payload: unknown = JSON.parse(event.data)
          if (isWorkerTelemetry(payload)) setTelemetry(payload)
        } catch {
          // Ignore malformed frames; connection state still reflects the socket.
        }
      }
      socket.onerror = () => socket?.close()
      socket.onclose = () => {
        setConnectionState('disconnected')
        if (!stopped) retryTimer = window.setTimeout(connect, 2000)
      }
    }

    connect()
    return () => {
      stopped = true
      if (retryTimer !== undefined) window.clearTimeout(retryTimer)
      socket?.close()
    }
  }, [setConnectionState, setTelemetry])
}
