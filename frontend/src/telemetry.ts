export type ConnectionState = 'connecting' | 'connected' | 'disconnected'
export type TelemetrySource = 'simulated' | 'replay' | 'hardware'
export type DeviceStatus = ConnectionState | 'simulated'
export type ImuRegion = 'pelvis' | 'lumbar' | 'thoracic' | 'upper_thoracic'
export type RiskLevel = 'low' | 'moderate' | 'high'

export interface QuaternionTelemetry {
  w: number
  x: number
  y: number
  z: number
}

export interface ImuTelemetry {
  region: ImuRegion
  orientation: QuaternionTelemetry
}

export interface WorkerTelemetry {
  timestamp: string
  sequence: number
  system_status: 'nominal' | 'degraded' | 'offline'
  connection: {
    source: TelemetrySource
    esp32: DeviceStatus
    openbci: DeviceStatus
  }
  imus: ImuTelemetry[]
  posture: {
    lumbar_flexion_deg: number
    thoracic_flexion_deg: number
  }
  fall_state: 'normal' | 'suspected'
  heart_rate_bpm: number
  environment: {
    temperature_c: number
    humidity_percent: number
    air_quality_index: number
    eco2_ppm: number
    tvoc_ppb: number
    noise_relative_db: number
    light_lux: number
  }
  eeg: {
    alertness: number
    signal_quality: number
  }
  overall_risk: RiskLevel
}

export function isWorkerTelemetry(value: unknown): value is WorkerTelemetry {
  if (!value || typeof value !== 'object') return false
  const sample = value as Partial<WorkerTelemetry>
  return (
    typeof sample.timestamp === 'string' &&
    typeof sample.sequence === 'number' &&
    typeof sample.system_status === 'string' &&
    Array.isArray(sample.imus) &&
    sample.imus.length === 4 &&
    typeof sample.posture?.lumbar_flexion_deg === 'number' &&
    typeof sample.environment?.temperature_c === 'number' &&
    typeof sample.eeg?.alertness === 'number'
  )
}
