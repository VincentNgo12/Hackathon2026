import { useState } from 'react'
import { mockTelemetry, SCENARIOS } from '../../telemetry/mockTelemetry'
import { useTelemetryStore } from '../../telemetry/telemetryStore'
import type { Availability, Scenario } from '../../telemetry/types'

export function DemoControls() {
  const [open, setOpen] = useState(false)
  const active = useTelemetryStore(() => mockTelemetry.getScenario())
  return <div className="demo-controls">
    <button className={'demo-toggle ' + (open ? 'active' : '')} aria-expanded={open} aria-controls="demo-panel" onClick={() => setOpen(!open)}><span>⌘</span> Demo controls <span>{open ? '−' : '+'}</span></button>
    {open && <section id="demo-panel" className="demo-panel" aria-label="Mock scenario controls">
      <div className="demo-heading"><div><h2>Scenario studio</h2><p>One synthetic source. Every instrument responds.</p></div><button aria-label="Close demo controls" onClick={() => setOpen(false)}>×</button></div>
      <div className="scenario-grid">{(Object.keys(SCENARIOS) as Scenario[]).map((key) => <button key={key} aria-pressed={active === key} className={active === key ? 'active' : ''} onClick={() => mockTelemetry.select(key)}>{SCENARIOS[key].label}</button>)}</div>
      <div className="demo-secondary"><span className="group-label">SOURCE STATE</span><div>{(['ready', 'loading', 'stale', 'disconnected'] as Availability[]).map((state) => <button key={state} onClick={() => mockTelemetry.setAvailability(state)}>{state}</button>)}</div></div>
      <div className="demo-bottom"><button onClick={() => mockTelemetry.toggleHeart()}>Toggle heart rate availability</button><button onClick={() => mockTelemetry.reset()}>Reset demo ↺</button></div>
      <p className="demo-note">Mock controls only. No hardware commands or network connection.</p>
    </section>}
  </div>
}
