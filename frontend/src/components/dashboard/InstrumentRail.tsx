import { useEffect, useRef } from 'react'
import type { ImuRegion } from '../../telemetry/types'
import { useDashboard } from '../../telemetry/viewModel'
import { useTelemetryStore } from '../../telemetry/telemetryStore'
import { useMotionPreference } from '../../hooks/useMotionPreference'

function EegTrace() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const reduced = useMotionPreference()
  useEffect(() => {
    let drawnSequence = -1
    const draw = () => {
      const element = canvas.current, state = useTelemetryStore.getState()
      if (!element || !state.presentation) return
      if (state.presentation.availability !== 'ready' && drawnSequence !== -1) return
      if (reduced && drawnSequence !== -1) return
      const ctx = element.getContext('2d')
      if (!ctx) return
      const width = element.clientWidth, height = element.clientHeight
      const ratio = Math.min(devicePixelRatio, 2)
      element.width = width * ratio; element.height = height * ratio
      ctx.scale(ratio, ratio)
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = '#24332f'; ctx.lineWidth = .5
      for (let x = 0; x < width; x += 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke() }
      const traces = state.presentation.traces
      traces.forEach((trace, channel) => {
        const baseline = height * (channel ? .72 : .28)
        ctx.strokeStyle = channel ? '#658d85' : '#95c6ba'
        ctx.lineWidth = 1
        ctx.beginPath()
        trace.forEach((sample, i) => {
          const x = i / 959 * width, y = baseline + sample * height * .21
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        })
        ctx.stroke()
      })
      drawnSequence = state.telemetry?.sequence ?? -1
    }
    draw()
    const unsubscribe = useTelemetryStore.subscribe(draw)
    const observer = new ResizeObserver(() => { drawnSequence = -1; draw() })
    if (canvas.current) observer.observe(canvas.current)
    return () => { unsubscribe(); observer.disconnect() }
  }, [reduced])
  return <canvas className="eeg-trace" ref={canvas} aria-label="Two synthetic EEG traces; experimental, not diagnostic" role="img" />
}

export function InstrumentRail({ selected, select }: { selected: ImuRegion | null; select: (r: ImuRegion) => void }) {
  const d = useDashboard()
  return <aside className={'instrument-rail ' + (d.availability !== 'ready' ? 'is-unavailable' : '')} aria-label="Worker instruments">
    <section className="instrument posture-instrument">
      <div className="section-heading"><h2><span className="section-number">01</span> Posture</h2><span className="tiny-label">4 ANCHORS</span></div>
      <div className={'posture-state tone-' + (d.category === 'posture' || d.category === 'movement' ? d.severity : 'normal')}><span className="state-dot" />{!d.available ? 'Waiting for telemetry' : d.category === 'posture' || d.category === 'movement' ? d.message : 'Posture monitored'}</div>
      <div className="angle-pair">
        <button className={'angle-readout ' + (selected === 'lumbar' ? 'selected' : '')} onClick={() => select('lumbar')} aria-pressed={selected === 'lumbar'}>
          <span className="label">Lumbar flexion</span><strong>{d.lumbar}<small>°</small></strong><span className="readout-rule"><i style={{ width: d.available ? Math.min(Math.abs(Number(d.lumbar)) / 50 * 100, 100) + '%' : '0' }} /></span>
        </button>
        <button className={'angle-readout ' + (selected === 'thoracic' ? 'selected' : '')} onClick={() => select('thoracic')} aria-pressed={selected === 'thoracic'}>
          <span className="label">Thoracic flexion</span><strong>{d.thoracic}<small>°</small></strong><span className="readout-rule"><i style={{ width: d.available ? Math.min(Math.abs(Number(d.thoracic)) / 50 * 100, 100) + '%' : '0' }} /></span>
        </button>
      </div>
      <div className="posture-detail"><span>Lateral bend <b>{d.lateral}° {d.available ? d.lateralDirection : ''}</b></span><span>Sustained <b>{d.sustained}</b></span></div>
      <div className={'fall-row ' + (d.fall === 'suspected' ? 'tone-critical' : '')}><span>Impact / fall</span><span><i className="small-diamond" /> {d.fall}</span></div>
    </section>
    <section className="instrument">
      <div className="section-heading"><h2><span className="section-number">02</span> Environment</h2><span className="tiny-label">{d.source}</span></div>
      {d.category === 'environment' && <div className={'context-alert tone-' + d.severity}>△ {d.message}</div>}
      <div className="environment-line"><span className="group-label">CLIMATE</span><span className="env-value">{d.temperature}<small>°C</small></span><span className="env-value">{d.humidity}<small>% RH</small></span></div>
      <div className="air-block">
        <div className="air-title"><span className="group-label">AIR QUALITY</span><span className="aqi-value">{d.aqi}<small>AQI · fixture</small></span></div>
        <div className="air-detail"><span>eCO₂ <b>{d.co2}<small>ppm</small></b></span><span>TVOC <b>{d.tvoc}<small>ppb</small></b></span></div>
      </div>
      <div className="workplace-line"><span><span className="label">Relative noise</span><b>{d.noise}<small>dB rel.</small></b></span><span><span className="label">Ambient light</span><b>{d.light}<small>lux</small></b></span></div>
    </section>
    <section className="instrument physiology-system">
      <div className="heart-block"><span className="group-label">HEART RATE</span><strong>{d.heart}<small>bpm</small></strong><span className="tiny-label">{d.heart === '—' ? 'UNAVAILABLE' : 'PPG · SIMULATED'}</span></div>
      <div className="system-list">
        <div><span>ESP32</span><b><i className={d.available ? 'status-dot' : 'status-dot offline'} />{d.esp32}</b></div>
        <div><span>OpenBCI</span><b><i className={d.available ? 'status-dot' : 'status-dot offline'} />{d.openbci}</b></div>
        <div><span>IMUs</span><b>{d.imuCount} / 4</b></div>
        <div><span>Neutral</span><b>{d.calibration}</b></div>
        <div><span>Battery</span><b title="Battery is not available in the application schema">—</b></div>
      </div>
    </section>
    <section className="instrument eeg-instrument">
      <div className="section-heading"><h2><span className="section-number">03</span> Cognitive signal</h2><span className="tiny-label">EXPERIMENTAL</span></div>
      {d.category === 'eeg' && <div className={'context-alert tone-' + d.severity}>△ Experimental fatigue estimate elevated</div>}
      <div className="eeg-caption"><span>EEG / 2 TRACES</span><span>{d.availability === 'ready' ? d.source : d.availability}</span></div>
      <EegTrace />
      <div className="eeg-readouts"><span><span className="label">Alertness estimate</span><strong>{d.alertness}<small>%</small></strong></span><span><span className="label">Signal quality</span><strong>{d.quality}<small>%</small></strong></span></div>
      <div className="artifact-row"><span>Artifacts</span><span className={d.artifact === 'detected' ? 'tone-warning' : ''}>{d.artifact === 'clear' ? '○ None detected' : d.artifact === 'detected' ? '△ Artifact detected' : 'Unavailable'}</span></div>
    </section>
  </aside>
}
