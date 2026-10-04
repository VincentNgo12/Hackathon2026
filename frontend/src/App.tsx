import { useEffect, useRef, useState } from 'react'
import './App.css'
import { mockTelemetry } from './telemetry/mockTelemetry'
import { useDashboard } from './telemetry/viewModel'
import type { ImuRegion } from './telemetry/types'
import { PostureScene } from './components/spine/PostureScene'
import type { View } from './components/spine/PostureScene'
import { InstrumentRail } from './components/dashboard/InstrumentRail'
import { EventLedger } from './components/dashboard/EventLedger'
import { DemoControls } from './components/dashboard/DemoControls'
import { useTelemetryStore } from './telemetry/telemetryStore'

function Header() {
  const d = useDashboard()
  return <header className="app-header">
    <a className="brand" href="#" aria-label="T'Work It supervisor console"><svg viewBox="0 0 32 36" aria-hidden="true"><path d="M5 4h22v6H19v22h-6V10H5z" /><path d="M0 16h8v5H0zm24 0h8v5h-8z" /></svg><div><strong>T'WORK IT<span>®</span></strong><small>NATHACKS 2026 / SUPERVISOR CONSOLE</small></div></a>
    <nav className="worker-selector" aria-label="Worker selector"><button className="active" aria-current="page"><span className="status-dot" />T'Worker 1</button><button disabled title="Multi-worker monitoring planned" aria-label="T'Worker 2, planned, unavailable">T'Worker 2 <small>FUTURE</small></button><button disabled title="Multi-worker monitoring planned" aria-label="T'Worker 3, planned, unavailable">T'Worker 3 <small>FUTURE</small></button></nav>
    <div className="source-summary"><span className="source-tag">◇ {d.source}</span><small>{d.availability === 'ready' ? 'SYSTEM NOMINAL' : d.availability.toUpperCase()}</small></div>
    <div className={'overall-risk risk-' + d.risk}><span className="group-label">OVERALL RISK</span><strong><i />{d.risk}<span>↗</span></strong></div>
  </header>
}

function ObservationBay({ selected, select }: { selected: ImuRegion | null; select: (r: ImuRegion) => void }) {
  const d = useDashboard()
  const [view, setView] = useState<View>('default')
  const [resetKey, setResetKey] = useState(0)
  const [overlays, setOverlays] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const calibrateButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (countdown === null || countdown === 0) return
    const timer = window.setTimeout(() => {
      if (countdown === 1) mockTelemetry.captureReference()
      setCountdown(countdown - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [countdown])
  const calibrate = () => {
    mockTelemetry.select('neutral')
    setCountdown(3)
    dialog.current?.showModal()
  }
  const close = () => {
    setCountdown(null)
    dialog.current?.close()
    calibrateButton.current?.focus()
  }
  return <section className="observation-bay" aria-label="Posture observation">
    <div className="observation-heading">
      <div><div className="eyebrow"><span className="crosshair">+</span> POSTURE OBSERVATION <span className="version">/ 01</span></div><h1>The human element.</h1><p>T'Worker 1 <span>—</span> Four measured anchors. One continuous perspective.</p></div>
      <span className="scene-source">SIMULATED<br /><small>20 HZ / 4 IMUs</small></span>
    </div>
    <div className={'scene-stage ' + (d.availability !== 'ready' ? 'scene-paused' : '')}>
      <div className="scene-grid" aria-hidden="true" />
      <div className="scene-axis axis-left" aria-hidden="true"><span>UPPER</span><i /><span>ROOT</span></div>
      <div className="scene-axis axis-right" aria-hidden="true"><span>MONOGRAPH</span><i /><span>BODY / 01</span></div>
      <PostureScene view={view} resetKey={resetKey} overlays={overlays} selected={selected} select={select} />
      <div className="scene-caption"><span className="caption-index">01—04</span><span>Orientation anchors<br /><small>Posture approximation</small></span></div>
      <div className="scene-legend"><span><i className="legend-current" />Current posture</span><span><i className="legend-reference" />Neutral reference</span></div>
      {d.availability !== 'ready' && <div className="source-overlay"><strong>{d.availability === 'loading' ? 'Waiting for telemetry' : d.availability === 'stale' ? 'Telemetry paused · stale' : 'Source disconnected'}</strong><span>Last pose retained for context. Values are not current.</span></div>}
    </div>
    <div className="observation-bottom">
      <div className="view-toolbar" aria-label="Camera controls">
        {(['front', 'side', 'orbit'] as View[]).map((mode) => <button key={mode} aria-pressed={view === mode} className={view === mode ? 'active' : ''} onClick={() => setView(mode)}>{mode}</button>)}
        <button onClick={() => { setView('default'); setResetKey(resetKey + 1) }}>↺ Reset view</button>
        <span className="toolbar-divider" /><button aria-pressed={overlays} className={overlays ? 'active' : ''} onClick={() => setOverlays(!overlays)}>⊕ Overlays</button>
      </div>
      <div className="calibration-row"><div><span className="status-dot" /><span>Neutral reference <b>{d.calibration === 'previewed' ? 'previewed' : 'unavailable'}</b><small>Mock reference · no hardware command</small></span></div><div className="calibration-actions"><button className="text-button" onClick={calibrate} disabled={!d.available}>Re-center</button><button ref={calibrateButton} className="primary-button" onClick={calibrate} disabled={!d.available}><span>⊙</span> Calibrate posture</button></div></div>
    </div>
    <dialog className="calibration-dialog" aria-labelledby="calibration-title" ref={dialog} onCancel={(event) => { event.preventDefault(); close() }}>
      <div className="eyebrow">CALIBRATION / MOCK PREVIEW</div>
      <h2 id="calibration-title">{countdown === 0 ? 'Neutral posture captured' : 'Stand naturally upright'}</h2>
      <p>{countdown === 0 ? 'Your simulated neutral reference is ready.' : 'Relax your shoulders. Keep all four anchors still.'}</p>
      <div className={'countdown ' + (countdown === 0 ? 'complete' : '')} aria-live="polite">{countdown === 0 ? '✓' : countdown}</div>
      <p className="calibration-disclaimer">Frontend simulation only. No hardware command was sent.</p>
      <button className="primary-button" onClick={close}>{countdown === 0 ? 'Return to observation' : 'Cancel preview'}</button>
    </dialog>
    <p className="sr-only">Posture approximation: lumbar flexion {d.lumbar} degrees; lateral bend {d.lateral} degrees; fall state {d.fall}. {d.imuCount} orientation anchors available. All data simulated.</p>
  </section>
}

function IncidentStrip() {
  const severity = useTelemetryStore((s) => s.presentation?.severity)
  const message = useTelemetryStore((s) => s.presentation?.message)
  return <div className={'incident-strip ' + (severity === 'critical' ? 'visible' : '')} role={severity === 'critical' ? 'alert' : undefined}>{severity === 'critical' ? '△ CRITICAL / ' + message + ' — review event context below' : ''}</div>
}

function App() {
  const [selected, setSelected] = useState<ImuRegion | null>(null)
  useEffect(() => mockTelemetry.start(), [])
  return <main className="app-shell">
    <Header />
    <div className="workspace-title"><div><span className="eyebrow">WORKER INTELLIGENCE</span><span className="page-context">Observation / T'Worker 1</span></div><DemoControls /></div>
    <IncidentStrip />
    <div className="workspace">
      <ObservationBay selected={selected} select={setSelected} />
      <InstrumentRail selected={selected} select={setSelected} />
      <EventLedger />
    </div>
    <footer className="app-footer"><span><i className="status-dot" /> PROTOTYPE TELEMETRY <span className="footer-separator">/</span> Simulated data. Posture is an approximation.</span><span>T'WORK IT <b>MONOGRAPH / 2026</b></span></footer>
  </main>
}
export default App
