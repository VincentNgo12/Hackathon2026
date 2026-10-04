import assert from 'node:assert/strict'
import { createServer } from 'vite'

// Run the actual TS modules through Vite, without adding a test dependency.
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
try {
  const { mockTelemetry, SCENARIOS } = await server.ssrLoadModule('/src/telemetry/mockTelemetry.ts')
  const { useTelemetryStore } = await server.ssrLoadModule('/src/telemetry/telemetryStore.ts')
  const { isWorkerTelemetry } = await server.ssrLoadModule('/src/telemetry.ts')
  for (const scenario of Object.keys(SCENARIOS)) {
    mockTelemetry.select(scenario)
    const { telemetry, presentation } = useTelemetryStore.getState()
    assert.ok(isWorkerTelemetry(telemetry), scenario + ': valid wire shape')
    assert.equal(telemetry.connection.source, 'simulated')
    assert.equal(telemetry.overall_risk, presentation.risk)
    assert.equal(presentation.severity, SCENARIOS[scenario].severity)
    assert.equal(new Set(telemetry.imus.map((i) => i.region)).size, 4)
    for (const { orientation: q } of telemetry.imus) {
      assert.ok(Math.abs(Math.hypot(q.w, q.x, q.y, q.z) - 1) < 1e-9, 'normalized w,x,y,z quaternion')
    }
  }
  mockTelemetry.select('fatigue')
  assert.equal(useTelemetryStore.getState().presentation.artifact, 'detected')
  assert.equal(useTelemetryStore.getState().presentation.category, 'eeg')
  mockTelemetry.select('co2')
  assert.equal(useTelemetryStore.getState().telemetry.environment.eco2_ppm, 1840)
  assert.equal(useTelemetryStore.getState().presentation.category, 'environment')
  mockTelemetry.select('fall')
  assert.equal(useTelemetryStore.getState().telemetry.fall_state, 'suspected')
  const before = useTelemetryStore.getState().telemetry.sequence
  mockTelemetry.setAvailability('stale')
  assert.equal(useTelemetryStore.getState().telemetry.sequence, before)
  assert.equal(useTelemetryStore.getState().presentation.availability, 'stale')
  mockTelemetry.setAvailability('disconnected')
  assert.equal(useTelemetryStore.getState().connectionState, 'disconnected')
  mockTelemetry.select('forward')
  mockTelemetry.captureReference()
  assert.deepEqual(useTelemetryStore.getState().presentation.reference, useTelemetryStore.getState().telemetry.imus)
  mockTelemetry.toggleHeart()
  assert.equal(useTelemetryStore.getState().presentation.heartAvailable, false)
  for (let i = 0; i < 160; i++) mockTelemetry.select(i % 2 ? 'left' : 'right')
  assert.equal(useTelemetryStore.getState().events.length, 30)
  assert.equal(useTelemetryStore.getState().presentation.traces[0].length, 960)
  const wire = useTelemetryStore.getState().telemetry
  useTelemetryStore.getState().setTelemetry(wire)
  assert.deepEqual(useTelemetryStore.getState().presentation.traces, [])
  assert.equal(useTelemetryStore.getState().presentation.artifact, 'unavailable')
  mockTelemetry.reset()
  assert.equal(useTelemetryStore.getState().presentation.risk, 'low')
  assert.equal(useTelemetryStore.getState().events.length, 1)
  console.log('PASS: 12 scenarios, canonical shape, risk consistency, normalized quaternions, source states, calibration references, optional heart rate, bounded events/waveforms and wire adapter.')
} finally {
  await server.close()
}
