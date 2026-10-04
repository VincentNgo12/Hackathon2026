import { Euler, Quaternion } from 'three'
import { useTelemetryStore } from './telemetryStore'
import type { Availability, ImuTelemetry, PresentationState, Scenario, Severity, WorkerTelemetry } from './types'

interface ScenarioDefinition {
  label: string; flex: number; lateral: number; severity: Severity; message: string
  risk: PresentationState['risk']; region: PresentationState['region']
}
export const SCENARIOS: Record<Scenario, ScenarioDefinition> = {
  neutral: { label: 'Neutral', flex: 0, lateral: 0, severity: 'normal', message: 'Within neutral reference', risk: 'low', region: null },
  forward: { label: 'Forward bend', flex: 24, lateral: 0, severity: 'advisory', message: 'Forward flexion observed', risk: 'moderate', region: 'lumbar' },
  extension: { label: 'Backward extension', flex: -17, lateral: 0, severity: 'advisory', message: 'Backward extension observed', risk: 'moderate', region: 'thoracic' },
  left: { label: 'Side bend left', flex: 2, lateral: 24, severity: 'advisory', message: 'Left lateral bend', risk: 'moderate', region: 'lumbar' },
  right: { label: 'Side bend right', flex: 2, lateral: -24, severity: 'advisory', message: 'Right lateral bend', risk: 'moderate', region: 'lumbar' },
  poor: { label: 'Poor posture', flex: 18.4, lateral: 5.2, severity: 'advisory', message: 'Sustained lumbar flexion', risk: 'moderate', region: 'lumbar' },
  elevated: { label: 'Elevated posture risk', flex: 40, lateral: 12, severity: 'warning', message: 'Significant sustained flexion', risk: 'elevated', region: 'lumbar' },
  fatigue: { label: 'Cognitive fatigue', flex: 18.4, lateral: 3, severity: 'warning', message: 'Fatigue estimate + posture context', risk: 'elevated', region: null },
  co2: { label: 'High eCO₂', flex: 4, lateral: 0, severity: 'warning', message: 'Elevated eCO₂ estimate', risk: 'elevated', region: null },
  noise: { label: 'Noise event', flex: 4, lateral: 0, severity: 'advisory', message: 'High relative noise', risk: 'moderate', region: null },
  impact: { label: 'Impact', flex: 32, lateral: -16, severity: 'critical', message: 'Strong impact · simulated event', risk: 'high', region: 'thoracic' },
  fall: { label: 'Fall', flex: 75, lateral: 25, severity: 'critical', message: 'Suspected fall · simulated event', risk: 'high', region: 'pelvis' },
}
export const REGIONS = ['pelvis', 'lumbar', 'thoracic', 'upper_thoracic'] as const
export const REGION_LABELS = ['Pelvis / root', 'Lumbar', 'Thoracic', 'Upper thoracic']
const BASE_TIME = Date.parse('2026-10-04T14:34:16Z')
const q = new Quaternion()
const euler = new Euler()
const radians = Math.PI / 180

export function orientations(flex: number, lateral: number): ImuTelemetry[] {
  return REGIONS.map((region, index) => {
    // Mock rendering frame ONLY: +Y up, +Z posterior, flexion about X.
    // Physical mounting/world conventions remain a backend integration TODO.
    q.setFromEuler(euler.set(-flex * radians * index / 2.3, 0, lateral * radians * index / 2.3))
    return { region, orientation: { w: q.w, x: q.x, y: q.y, z: q.z } }
  })
}

class MockTelemetrySource {
  private timer: ReturnType<typeof setInterval> | undefined
  private sequence = 0
  private eventId = 0
  private scenario: Scenario = 'poor'
  private elapsed = 0
  private scenarioElapsed = 0
  private flex = 18.4
  private lateral = 5.2
  private reference = orientations(0, 0)
  private availability: Availability = 'ready'
  private heartAvailable = true
  private calibration: PresentationState['calibration'] = 'previewed'
  private traces: number[][] = [[], []]

  start() {
    if (this.timer) return () => this.stop()
    if (!useTelemetryStore.getState().events.length) {
      this.event('normal', 'Four posture anchors available')
      this.event('normal', 'Neutral reference loaded · mock fixture')
      this.event('advisory', SCENARIOS.poor.message)
    }
    this.tick()
    this.timer = setInterval(() => { if (!document.hidden) this.tick() }, 50)
    return () => this.stop()
  }
  stop() { if (this.timer) clearInterval(this.timer); this.timer = undefined }
  getScenario() { return this.scenario }
  select(scenario: Scenario) {
    this.scenario = scenario
    this.scenarioElapsed = 0
    this.availability = 'ready'
    this.event(SCENARIOS[scenario].severity, SCENARIOS[scenario].message)
    this.tick()
  }
  setAvailability(availability: Availability) {
    this.availability = availability
    this.event('normal', 'Source preview: ' + availability)
    this.publish()
  }
  toggleHeart() { this.heartAvailable = !this.heartAvailable; this.publish() }
  captureReference() {
    this.reference = orientations(this.flex, this.lateral)
    this.calibration = 'previewed'
    this.event('normal', 'Neutral posture captured · mock only')
    this.publish()
  }
  reset() {
    this.reference = orientations(0, 0)
    this.calibration = 'previewed'
    this.heartAvailable = true
    this.traces = [[], []]
    useTelemetryStore.getState().clearEvents()
    this.select('neutral')
  }
  private event(severity: Severity, message: string) {
    useTelemetryStore.getState().addEvent({
      id: ++this.eventId, severity, message, source: 'simulated',
      time: new Date(BASE_TIME + this.elapsed * 1000).toISOString().slice(11, 19),
    })
  }
  private tick() {
    if (this.availability !== 'ready') return
    this.elapsed += .05
    this.scenarioElapsed += .05
    this.sequence++
    const scenario = SCENARIOS[this.scenario]
    this.flex += (scenario.flex - this.flex) * .12
    this.lateral += (scenario.lateral - this.lateral) * .12
    // 160 samples/s, six-second bounded buffer; waveform generation lives here.
    this.traces = this.traces.map((trace, channel) => {
      const next = trace.slice()
      for (let i = 0; i < 8; i++) {
        const t = this.elapsed + i / 160
        const artifact = this.scenario === 'fatigue' && Math.sin(t * .8) > .7
        next.push(
          Math.sin(t * 2 * Math.PI * (channel ? 9.2 : 10.4)) * .36 +
          Math.sin(t * 2 * Math.PI * 18.3 + channel) * .16 +
          Math.sin(t * 2 * Math.PI * 3.1) * .2 +
          (artifact ? Math.sin(t * 2.4) * .6 : 0),
        )
      }
      return next.slice(-960)
    })
    this.publish()
  }
  private publish() {
    const scene = SCENARIOS[this.scenario]
    const fatigue = this.scenario === 'fatigue'
    const time = this.elapsed
    const telemetry: WorkerTelemetry = {
      timestamp: new Date(BASE_TIME + time * 1000).toISOString(), sequence: this.sequence,
      system_status: this.availability === 'disconnected' ? 'offline' : this.availability === 'stale' ? 'degraded' : 'nominal',
      connection: { source: 'simulated', esp32: 'simulated', openbci: 'simulated' },
      imus: orientations(this.flex, this.lateral),
      posture: { lumbar_flexion_deg: this.flex, thoracic_flexion_deg: this.flex * .69 },
      fall_state: this.scenario === 'fall' || this.scenario === 'impact' ? 'suspected' : 'normal',
      heart_rate_bpm: Math.round(76 + Math.sin(time * .15) * 2),
      environment: {
        temperature_c: 22.4 + Math.sin(time * .04) * .2, humidity_percent: 42,
        // Scaffold AQI placeholder scale is preserved; no ENS160 category inferred.
        air_quality_index: this.scenario === 'co2' ? 110 : 52,
        eco2_ppm: this.scenario === 'co2' ? 1840 : 510 + Math.round(Math.sin(time * .1) * 12),
        tvoc_ppb: this.scenario === 'co2' ? 210 : 38,
        noise_relative_db: (this.scenario === 'noise' ? 86 : 61) + Math.sin(time * .4) * .4,
        light_lux: Math.round(320 + Math.sin(time * .07) * 8),
      },
      eeg: { alertness: fatigue ? .34 : .74, signal_quality: fatigue ? .58 : .91 },
      overall_risk: scene.risk,
    }
    useTelemetryStore.getState().publish({
      telemetry,
      presentation: {
        severity: scene.severity, message: scene.message, region: scene.region,
        category: this.scenario === 'co2' || this.scenario === 'noise' ? 'environment' : fatigue ? 'eeg' : this.scenario === 'impact' || this.scenario === 'fall' ? 'movement' : 'posture',
        lateralDeg: this.lateral,
        sustainedSeconds: ['poor', 'elevated', 'fatigue'].includes(this.scenario) ? 42 + Math.floor(this.scenarioElapsed) : 0,
        risk: scene.risk, artifact: fatigue ? 'detected' : 'clear',
        traces: this.traces, calibration: this.calibration, reference: this.reference,
        heartAvailable: this.heartAvailable, aqiLabel: 'Placeholder index',
        availability: this.availability,
      },
    })
  }
}
export const mockTelemetry = new MockTelemetrySource()
