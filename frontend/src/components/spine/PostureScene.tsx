import { Component, memo, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, DoubleSide, Group, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useTelemetryStore } from '../../telemetry/telemetryStore'
import type { ImuRegion } from '../../telemetry/types'
import { useMotionPreference } from '../../hooks/useMotionPreference'

const REGIONS: ImuRegion[] = ['pelvis', 'lumbar', 'thoracic', 'upper_thoracic']
const LABELS = ['Pelvis / root', 'Lumbar', 'Thoracic', 'Upper thoracic']
const HEIGHTS = [0, 1.02, 2.08, 3.16]
const RINGS = 48, SIDES = 48
export type View = 'default' | 'front' | 'side' | 'orbit'
interface Props { view: View; resetKey: number; overlays: boolean; selected: ImuRegion | null; select: (region: ImuRegion) => void }

function shellGeometry() {
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array((RINGS + 1) * (SIDES + 1) * 3), 3))
  const indices: number[] = []
  for (let row = 0; row < RINGS; row++) for (let col = 0; col < SIDES; col++) {
    const a = row * (SIDES + 1) + col, b = a + SIDES + 1
    indices.push(a, b, a + 1, b, b + 1, a + 1)
  }
  geometry.setIndex(indices)
  return geometry
}

function Torso({ overlays, selected, select }: Omit<Props, 'view' | 'resetKey'>) {
  const geometry = useMemo(() => shellGeometry(), [])
  const rings = useRef<Group>(null)
  const anchors = useRef<(Group | null)[]>([])
  const spineSegments = useRef<(Mesh | null)[]>([])
  const neutralSegments = useRef<(Mesh | null)[]>([])
  const risk = useRef<Mesh>(null)
  const reduced = useMotionPreference()
  const math = useMemo(() => ({
    rotations: REGIONS.map(() => new Quaternion()),
    targets: REGIONS.map(() => new Quaternion()),
    referenceRotations: REGIONS.map(() => new Quaternion()),
    points: HEIGHTS.map((y) => new Vector3(0, y, 0)),
    referencePoints: HEIGHTS.map((y) => new Vector3(0, y, 0)),
    curve: new CatmullRomCurve3(HEIGHTS.map((y) => new Vector3(0, y, .46))),
    referenceCurve: new CatmullRomCurve3(HEIGHTS.map((y) => new Vector3(0, y, .46))),
    delta: new Vector3(), temp: new Vector3(), center: new Vector3(),
    qa: new Quaternion(), up: new Vector3(0, 1, 0),
    a: new Vector3(), b: new Vector3(),
    riskColor: new Color(),
  }), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame((_, dt) => {
    const state = useTelemetryStore.getState()
    if (!state.telemetry || !state.presentation) return
    const { telemetry, presentation } = state
    const blend = reduced ? 1 : 1 - Math.exp(-12 * Math.min(dt, .1))
    REGIONS.forEach((region, i) => {
      const imu = telemetry.imus.find((sensor) => sensor.region === region)
      if (!imu) return
      const { x, y, z, w } = imu.orientation
      math.targets[i].set(x, y, z, w).normalize() // Wire is w,x,y,z; Three takes x,y,z,w.
      math.rotations[i].slerp(math.targets[i], blend)
      const ref = presentation.reference.find((sensor) => sensor.region === region)?.orientation
      if (ref) math.referenceRotations[i].set(ref.x, ref.y, ref.z, ref.w).normalize()
      if (i === 0) {
        math.points[0].set(0, 0, 0); math.referencePoints[0].set(0, 0, 0)
      } else {
        math.delta.set(0, HEIGHTS[i] - HEIGHTS[i - 1], 0).applyQuaternion(math.rotations[i])
        math.points[i].copy(math.points[i - 1]).add(math.delta)
        math.delta.set(0, HEIGHTS[i] - HEIGHTS[i - 1], 0).applyQuaternion(math.referenceRotations[i])
        math.referencePoints[i].copy(math.referencePoints[i - 1]).add(math.delta)
      }
      math.delta.set(0, 0, .46).applyQuaternion(math.rotations[i])
      math.curve.points[i].copy(math.points[i]).add(math.delta)
      math.delta.set(0, 0, .46).applyQuaternion(math.referenceRotations[i])
      math.referenceCurve.points[i].copy(math.referencePoints[i]).add(math.delta)
      const anchor = anchors.current[i]
      if (anchor) {
        anchor.position.copy(math.curve.points[i])
        anchor.quaternion.copy(math.rotations[i])
      }
    })
    const position = geometry.getAttribute('position') as BufferAttribute
    for (let row = 0; row <= RINGS; row++) {
      const t = row / RINGS, segment = Math.min(2, Math.floor(t * 3)), f = t * 3 - segment
      math.qa.copy(math.rotations[segment]).slerp(math.rotations[segment + 1], f)
      // Sculpted shoulder/waist/pelvis loft. Cutaway reveals the four-anchor spine.
      const width = .67 - .14 * Math.sin(t * Math.PI * 1.8) + .51 * Math.exp(-Math.pow((t - .86) / .17, 2))
      const taper = t > .94 ? 1 - (t - .94) * 8 : 1
      math.center.copy(math.points[segment]).lerp(math.points[segment + 1], f)
      for (let col = 0; col <= SIDES; col++) {
        const angle = Math.PI / 2 + .17 + col / SIDES * (Math.PI * 2 - .34)
        math.temp.set(Math.cos(angle) * width * taper, 0, Math.sin(angle) * (.35 + .12 * Math.sin(t * Math.PI)))
        math.temp.applyQuaternion(math.qa).add(math.center)
        position.setXYZ(row * (SIDES + 1) + col, math.temp.x, math.temp.y, math.temp.z)
      }
    }
    position.needsUpdate = true
    geometry.computeVertexNormals()
    // Reuse cylinder meshes and vectors; no per-frame geometry allocations.
    const place = (mesh: Mesh | null, curve: CatmullRomCurve3, start: number, end: number) => {
      if (!mesh) return
      curve.getPoint(start, math.a); curve.getPoint(end, math.b)
      mesh.position.copy(math.a).add(math.b).multiplyScalar(.5)
      math.delta.copy(math.b).sub(math.a)
      mesh.scale.y = math.delta.length()
      mesh.quaternion.setFromUnitVectors(math.up, math.delta.normalize())
    }
    spineSegments.current.forEach((mesh, i) => place(mesh, math.curve, i / 64, (i + 1) / 64))
    neutralSegments.current.forEach((mesh, i) => {
      if (mesh) mesh.visible = presentation.reference.length === 4
      place(mesh, math.referenceCurve, i / 32, (i + .55) / 32)
    })
    if (risk.current) {
      const regionIndex = REGIONS.indexOf(presentation.region ?? 'lumbar')
      risk.current.visible = presentation.region !== null && presentation.severity !== 'normal'
      place(risk.current, math.curve, Math.max(0, (regionIndex - .4) / 3), Math.min(1, (regionIndex + .4) / 3))
      const material = risk.current.material as MeshStandardMaterial
      material.color.set(presentation.severity === 'critical' ? '#e75b5b' : presentation.severity === 'warning' ? '#e58449' : '#d8b35a')
    }
    if (rings.current) {
      rings.current.children.forEach((child, i) => {
        const t = (i + .5) / rings.current!.children.length
        const segment = Math.min(2, Math.floor(t * 3)), f = t * 3 - segment
        child.position.copy(math.points[segment]).lerp(math.points[segment + 1], f)
        child.quaternion.copy(math.rotations[segment]).slerp(math.rotations[segment + 1], f)
      })
    }
  })
  return <group position={[0, -1.65, 0]}>
    <mesh geometry={geometry} frustumCulled={false}>
      <meshStandardMaterial color="#304746" metalness={.3} roughness={.58} side={DoubleSide} />
    </mesh>
    <group ref={rings}>
      {Array.from({ length: 13 }, (_, i) => {
        const t = (i + .5) / 13
        const width = .67 - .14 * Math.sin(t * Math.PI * 1.8) + .51 * Math.exp(-Math.pow((t - .86) / .17, 2))
        const points = Array.from({ length: 65 }, (_, n) => {
          const angle = Math.PI / 2 + .18 + n / 64 * (Math.PI * 2 - .36)
          return [Math.cos(angle) * width * 1.005, 0, Math.sin(angle) * (.35 + .12 * Math.sin(t * Math.PI)) * 1.005] as [number, number, number]
        })
        return <group key={i}><Line points={points} color="#60807a" transparent opacity={.2} lineWidth={.7} /></group>
      })}
    </group>
    {Array.from({ length: 64 }, (_, i) => <mesh key={'path' + i} ref={(node) => { spineSegments.current[i] = node }}>
      <cylinderGeometry args={[.024, .024, 1, 8]} />
      <meshStandardMaterial color="#a5e7dc" emissive="#73cfc1" emissiveIntensity={.65} roughness={.3} />
    </mesh>)}
    {Array.from({ length: 32 }, (_, i) => <mesh key={'ref' + i} ref={(node) => { neutralSegments.current[i] = node }}>
      <cylinderGeometry args={[.012, .012, 1, 5]} />
      <meshBasicMaterial color="#92a4ae" transparent opacity={.55} depthTest={false} />
    </mesh>)}
    <mesh ref={risk}>
      <cylinderGeometry args={[.075, .075, 1, 12]} />
      <meshStandardMaterial color="#d8b35a" transparent opacity={.32} depthWrite={false} />
    </mesh>
    {REGIONS.map((region, i) => <group key={region} ref={(node) => { anchors.current[i] = node }}>
      <mesh onClick={(event) => { event.stopPropagation(); select(region) }}>
        <boxGeometry args={[.18, .13, .11]} />
        <meshStandardMaterial color={selected === region ? '#d6fff2' : '#78caba'} metalness={.65} roughness={.25} />
      </mesh>
      <mesh position={[0, 0, .065]} visible={selected === region}>
        <ringGeometry args={[.125, .135, 32]} />
        <meshBasicMaterial color="#a5e7dc" side={DoubleSide} />
      </mesh>
      {(overlays || selected === region) && <Html position={[i % 2 ? .35 : -.35, .05, .06]} style={{ pointerEvents: 'none' }}>
        <span className={'anchor-label ' + (i % 2 ? '' : 'anchor-left')}><i />{String(i + 1).padStart(2, '0')} / {LABELS[i]}</span>
      </Html>}
    </group>)}
  </group>
}

function CameraRig({ view, resetKey }: Pick<Props, 'view' | 'resetKey'>) {
  const controls = useRef<OrbitControlsImpl>(null)
  const { camera } = useThree()
  const reduced = useMotionPreference()
  const target = useMemo(() => new Vector3(), [])
  const moving = useRef(true)
  useEffect(() => {
    if (view === 'front') target.set(-.3, .45, -7)
    else if (view === 'side') target.set(7, .4, .2)
    else target.set(3.1, 1.2, 6.3)
    moving.current = view !== 'orbit'
  }, [view, resetKey, target])
  useFrame((_, dt) => {
    if (!moving.current) return
    camera.position.lerp(target, reduced ? 1 : 1 - Math.exp(-9 * dt))
    controls.current?.target.set(0, -.05, 0)
    controls.current?.update()
    if (camera.position.distanceTo(target) < .005) moving.current = false
  })
  return <OrbitControls ref={controls} enabled={view === 'orbit'} enablePan={false} minDistance={5.3} maxDistance={11} minPolarAngle={.65} maxPolarAngle={2.1} enableDamping={!reduced} />
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <div className="scene-fallback">3D view unavailable<br /><small>Posture readings remain available in the instrument panel.</small></div> : this.props.children }
}

export const PostureScene = memo(function PostureScene(props: Props) {
  const [visible, setVisible] = useState(!document.hidden)
  useEffect(() => {
    const update = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  return <SceneBoundary><Canvas dpr={[1, 1.5]} frameloop={visible ? 'always' : 'never'} camera={{ position: [3.1, 1.2, 6.3], fov: 34 }} gl={{ antialias: true, alpha: true }}>
    <ambientLight intensity={.65} />
    <directionalLight position={[-3, 6, 5]} color="#dceee9" intensity={3} />
    <directionalLight position={[3, 2, -4]} color="#6dafa5" intensity={4} />
    <directionalLight position={[0, -2, 6]} color="#778c9c" intensity={.6} />
    <Torso overlays={props.overlays} selected={props.selected} select={props.select} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.69, 0]}>
      <ringGeometry args={[1.45, 1.46, 96]} /><meshBasicMaterial color="#4b6864" transparent opacity={.35} side={DoubleSide} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.7, 0]}>
      <circleGeometry args={[1.45, 96]} /><meshBasicMaterial color="#152222" transparent opacity={.3} />
    </mesh>
    <CameraRig view={props.view} resetKey={props.resetKey} />
  </Canvas></SceneBoundary>
})
