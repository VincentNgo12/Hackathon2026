import { create } from 'zustand'
import type { ConnectionState, WorkerTelemetry } from './telemetry'

interface TelemetryState {
  connectionState: ConnectionState
  telemetry: WorkerTelemetry | null
  setConnectionState: (state: ConnectionState) => void
  setTelemetry: (telemetry: WorkerTelemetry) => void
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  connectionState: 'connecting',
  telemetry: null,
  setConnectionState: (connectionState) => set({ connectionState }),
  setTelemetry: (telemetry) => set({ telemetry }),
}))
