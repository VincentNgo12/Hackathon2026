export type { WorkerTelemetry, ImuRegion, ImuTelemetry, QuaternionTelemetry, ConnectionState } from '../telemetry'
import type { WorkerTelemetry, ImuRegion, ImuTelemetry } from '../telemetry'

export type Severity = 'normal' | 'advisory' | 'warning' | 'critical'
export type Scenario = 'neutral' | 'forward' | 'extension' | 'left' | 'right' | 'poor' | 'elevated' | 'fatigue' | 'co2' | 'noise' | 'impact' | 'fall'
export type Availability = 'ready' | 'loading' | 'stale' | 'disconnected'
export interface DashboardEvent {
  id: number
  time: string
  severity: Severity
  message: string
  source: string
}
/** Presentation envelope, NOT a new backend wire protocol. Future adapters
 * supply these details only when an agreed application contract exists. */
export interface PresentationState {
  severity: Severity
  message: string
  region: ImuRegion | null
  category: 'posture' | 'environment' | 'eeg' | 'movement'
  lateralDeg: number | null
  sustainedSeconds: number | null
  risk: 'low' | 'moderate' | 'elevated' | 'high'
  artifact: 'clear' | 'detected' | 'unavailable'
  traces: number[][]
  calibration: 'previewed' | 'uncalibrated'
  reference: ImuTelemetry[]
  heartAvailable: boolean
  aqiLabel: string
  availability: Availability
}
export interface TelemetryFrame {
  telemetry: WorkerTelemetry
  presentation: PresentationState
}
