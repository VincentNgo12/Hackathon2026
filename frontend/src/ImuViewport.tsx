import { Line, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Quaternion } from 'three'
import type { ImuTelemetry } from './telemetry'

const fallbackRegions: ImuTelemetry[] = [
  'pelvis',
  'lumbar',
  'thoracic',
  'upper_thoracic',
].map((region) => ({
  region: region as ImuTelemetry['region'],
  orientation: { w: 1, x: 0, y: 0, z: 0 },
}))

function SensorStack({ imus }: { imus: ImuTelemetry[] }) {
  const points: [number, number, number][] = imus.map((_, index) => [
    0,
    index * 1.25 - 1.9,
    0,
  ])

  return (
    <group>
      <Line points={points} color="#5f7494" lineWidth={3} />
      {imus.map((imu, index) => {
        const { w, x, y, z } = imu.orientation
        return (
          <mesh
            key={imu.region}
            position={points[index]}
            quaternion={new Quaternion(x, y, z, w)}
          >
            <sphereGeometry args={[0.28, 24, 24]} />
            <meshStandardMaterial color="#62d3a4" roughness={0.4} />
          </mesh>
        )
      })}
    </group>
  )
}

export function ImuViewport({ imus = fallbackRegions }: { imus?: ImuTelemetry[] }) {
  return (
    <div className="viewport" aria-label="3D view of four simulated IMU positions">
      <Canvas camera={{ position: [4.5, 0, 5.5], fov: 42 }}>
        <color attach="background" args={['#101722']} />
        <ambientLight intensity={1.3} />
        <directionalLight position={[4, 5, 5]} intensity={2} />
        <SensorStack imus={imus.length === 4 ? imus : fallbackRegions} />
        <OrbitControls enablePan={false} minDistance={4} maxDistance={9} />
      </Canvas>
    </div>
  )
}
