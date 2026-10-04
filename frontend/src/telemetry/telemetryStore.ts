import { create } from 'zustand'
import type { ConnectionState, WorkerTelemetry } from '../telemetry'
import type { DashboardEvent, PresentationState, TelemetryFrame } from './types'

interface TelemetryState {
  telemetry: WorkerTelemetry | null
  presentation: PresentationState | null
  connectionState: ConnectionState
  events: DashboardEvent[]
  publish: (frame: TelemetryFrame) => void
  setTelemetry: (telemetry: WorkerTelemetry) => void
  setConnectionState: (state: ConnectionState) => void
  addEvent: (event: DashboardEvent) => void
  clearEvents: () => void
}
export const useTelemetryStore = create<TelemetryState>((set) => ({
  telemetry: null, presentation: null, connectionState: 'connecting', events: [],
  publish: ({ telemetry, presentation }) => set({
    telemetry, presentation,
    connectionState: presentation.availability === 'disconnected' ? 'disconnected' : 'connected',
  }),
  // Existing wire schema adapter: never retain mock-only details.
  setTelemetry: (telemetry) => set({
    telemetry,
    presentation: {
      severity: 'normal', message: 'Application telemetry', region: null, category: 'posture',
      lateralDeg: null, sustainedSeconds: null, risk: telemetry.overall_risk,
      artifact: 'unavailable', traces: [], calibration: 'uncalibrated',
      reference: [], heartAvailable: true, aqiLabel: 'Index', availability: 'ready',
    },
  }),
  setConnectionState: (connectionState) => set({ connectionState }),
  addEvent: (event) => set((state) => ({ events: [event, ...state.events].slice(0, 30) })),
  clearEvents: () => set({ events: [] }),
}))
