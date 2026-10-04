import './App.css'
import { ImuViewport } from './ImuViewport'
import { useTelemetryStore } from './telemetryStore'
import { useTelemetrySocket } from './useTelemetrySocket'

function value(metric: number | undefined, suffix = '', digits = 0) {
  return metric === undefined ? '—' : `${metric.toFixed(digits)}${suffix}`
}

function App() {
  useTelemetrySocket()
  const connectionState = useTelemetryStore((state) => state.connectionState)
  const telemetry = useTelemetryStore((state) => state.telemetry)

  return (
    <main>
      <header>
        <div>
          <p className="eyebrow">NatHacks 2026</p>
          <h1>T'Work It</h1>
        </div>
        <div className="status-row">
          <span className={`status ${connectionState}`}>{connectionState}</span>
          <span>System: {telemetry?.system_status ?? 'waiting'}</span>
          <span>Source: {telemetry?.connection.source ?? 'waiting'}</span>
          <span className={`risk ${telemetry?.overall_risk ?? 'unknown'}`}>
            Risk: {telemetry?.overall_risk ?? '—'}
          </span>
        </div>
      </header>

      <section className="dashboard">
        <article className="panel hero-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">3D proof of life</p>
              <h2>Back IMU positions</h2>
            </div>
            <span>Drag to orbit</span>
          </div>
          <ImuViewport imus={telemetry?.imus} />
        </article>

        <div className="metrics">
          <article className="panel metric-card">
            <h2>Posture</h2>
            <dl>
              <div><dt>Lumbar flexion</dt><dd>{value(telemetry?.posture.lumbar_flexion_deg, '°', 1)}</dd></div>
              <div><dt>Thoracic flexion</dt><dd>{value(telemetry?.posture.thoracic_flexion_deg, '°', 1)}</dd></div>
            </dl>
          </article>

          <article className="panel metric-card">
            <h2>Worker state</h2>
            <dl>
              <div><dt>Heart rate</dt><dd>{value(telemetry?.heart_rate_bpm, ' bpm')}</dd></div>
              <div><dt>Fall state</dt><dd>{telemetry?.fall_state ?? '—'}</dd></div>
            </dl>
          </article>

          <article className="panel metric-card">
            <h2>Environment</h2>
            <dl className="compact">
              <div><dt>Temperature</dt><dd>{value(telemetry?.environment.temperature_c, ' °C', 1)}</dd></div>
              <div><dt>Humidity</dt><dd>{value(telemetry?.environment.humidity_percent, '%')}</dd></div>
              <div><dt>Air quality</dt><dd>{value(telemetry?.environment.air_quality_index)}</dd></div>
              <div><dt>Noise</dt><dd>{value(telemetry?.environment.noise_relative_db, ' dB', 1)}</dd></div>
              <div><dt>Light</dt><dd>{value(telemetry?.environment.light_lux, ' lux')}</dd></div>
            </dl>
          </article>

          <article className="panel metric-card">
            <h2>EEG placeholders</h2>
            <dl>
              <div><dt>Alertness</dt><dd>{value(telemetry ? telemetry.eeg.alertness * 100 : undefined, '%')}</dd></div>
              <div><dt>Signal quality</dt><dd>{value(telemetry ? telemetry.eeg.signal_quality * 100 : undefined, '%')}</dd></div>
            </dl>
          </article>
        </div>
      </section>

      <footer>Synthetic scaffold data only — not a medical or safety-certified system.</footer>
    </main>
  )
}

export default App
