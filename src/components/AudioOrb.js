// src/components/AudioOrb.js
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function Scene() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color="#00ff88" 
        wireframe 
      />
    </mesh>
  )
}

export default function AudioOrb() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas>
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Scene />
      </Canvas>
    </div>
  )
}