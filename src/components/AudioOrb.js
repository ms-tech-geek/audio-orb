// src/components/AudioOrb.js
import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function Scene({ sensitivity = 0.5, color = "#00ff88" }) {
  const meshRef = useRef()
  const analyserRef = useRef()
  
  // Create vertex distortion
  const [noise] = useState(() => new Array(2048).fill(0).map(() => Math.random() * 2 - 1))
  
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 4)
    const pos = geo.attributes.position
    const pa = new Float32Array(pos.count * 3)
    for (let i = 0; i < pos.count; i++) {
      pa[i * 3] = pos.array[i * 3]
      pa[i * 3 + 1] = pos.array[i * 3 + 1]
      pa[i * 3 + 2] = pos.array[i * 3 + 2]
    }
    geo.setAttribute('originalPosition', new THREE.BufferAttribute(pa, 3))
    return geo
  }, [])

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 512
        source.connect(analyser)
        analyserRef.current = analyser
      })
      .catch(err => console.log("Mic access denied:", err))
  }, [])

  useFrame((state) => {
    if (analyserRef.current && meshRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      const scale = 1 + (average / 128) * sensitivity
      
      // Apply vertex distortion
      const positions = meshRef.current.geometry.attributes.position
      const original = meshRef.current.geometry.attributes.originalPosition
      
      for (let i = 0; i < positions.count; i++) {
        const offset = noise[i] * (average / 255) * sensitivity
        positions.array[i * 3] = original.array[i * 3] + offset
        positions.array[i * 3 + 1] = original.array[i * 3 + 1] + offset
        positions.array[i * 3 + 2] = original.array[i * 3 + 2] + offset
      }
      
      positions.needsUpdate = true
      meshRef.current.scale.set(scale, scale, scale)
      meshRef.current.rotation.x += 0.001
      meshRef.current.rotation.y += 0.001
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshPhongMaterial 
        color={color}
        wireframe
        shininess={100}
      />
    </mesh>
  )
}

export default function AudioOrb() {
  const [sensitivity, setSensitivity] = useState(0.5)
  const [color, setColor] = useState("#00ff88")

  return (
    <>
      <div style={{ 
        position: 'absolute', 
        zIndex: 1, 
        padding: '20px',
        background: 'rgba(0,0,0,0.7)',
        borderRadius: '10px',
        margin: '20px'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ color: 'white', marginRight: '10px' }}>Sensitivity: </label>
          <input 
            type="range" 
            min="0" 
            max="2" 
            step="0.1" 
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
          />
        </div>
        <div>
          <label style={{ color: 'white', marginRight: '10px' }}>Color: </label>
          <input 
            type="color" 
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
      </div>
      <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
        <Canvas camera={{ position: [0, 0, 4] }}>
          <OrbitControls />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Scene sensitivity={sensitivity} color={color} />
        </Canvas>
      </div>
    </>
  )
}