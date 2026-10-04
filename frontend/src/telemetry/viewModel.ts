import { useShallow } from 'zustand/react/shallow'
import { useTelemetryStore } from './telemetryStore'

// Formatting and missing-value handling live outside visual components.
export function useDashboard() {
  return useTelemetryStore(useShallow(({ telemetry: t, presentation: p }) => {
    const available = !!t && p?.availability !== 'loading' && p?.availability !== 'disconnected'
    const format = (v: number | undefined | null, digits = 0) => available && v != null ? v.toFixed(digits) : '—'
    const seconds = p?.sustainedSeconds
    return {
      available, availability: p?.availability ?? 'loading',
      source: t?.connection.source ?? 'simulated',
      severity: p?.severity ?? 'normal', message: p?.message ?? 'Waiting for telemetry',
      category: p?.category ?? 'posture',
      region: p?.region ?? null, risk: available ? p?.risk ?? t?.overall_risk ?? 'low' : 'unavailable',
      lumbar: format(t?.posture.lumbar_flexion_deg, 1),
      thoracic: format(t?.posture.thoracic_flexion_deg, 1),
      lateral: format(p?.lateralDeg == null ? null : Math.abs(p.lateralDeg), 1),
      lateralDirection: p?.lateralDeg == null ? '' : p.lateralDeg >= 0 ? 'L' : 'R',
      sustained: available && seconds != null ? String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0') : '—',
      fall: available ? t?.fall_state ?? 'normal' : 'unavailable',
      heart: p?.heartAvailable ? format(t?.heart_rate_bpm) : '—',
      temperature: format(t?.environment.temperature_c, 1),
      humidity: format(t?.environment.humidity_percent),
      aqi: format(t?.environment.air_quality_index), aqiLabel: p?.aqiLabel ?? 'Index',
      co2: format(t?.environment.eco2_ppm), tvoc: format(t?.environment.tvoc_ppb),
      noise: format(t?.environment.noise_relative_db), light: format(t?.environment.light_lux),
      alertness: format(t ? t.eeg.alertness * 100 : null),
      quality: format(t ? t.eeg.signal_quality * 100 : null),
      artifact: available ? p?.artifact ?? 'unavailable' : 'unavailable',
      esp32: available ? t?.connection.esp32 ?? 'disconnected' : 'disconnected',
      openbci: available ? t?.connection.openbci ?? 'disconnected' : 'disconnected',
      imuCount: available ? t?.imus.length ?? 0 : 0,
      calibration: p?.calibration ?? 'uncalibrated',
      time: t?.timestamp.slice(11, 19) ?? '--:--:--',
    }
  }))
}
