// src/components/AudioOrb.js
import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function Scene({ sensitivity = 0.5, color = "#00ff88" }) {
  const meshRef = useRef()
  const analyserRef = useRef()

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        analyserRef.current = analyser
      })
      .catch(err => console.log("Mic access denied:", err))
  }, [])

  useFrame(() => {
    if (analyserRef.current && meshRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      const scale = 1 + (average / 128) * sensitivity
      meshRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        wireframe 
      />
    </mesh>
  )
}

export default function AudioOrb() {
  const [sensitivity, setSensitivity] = useState(0.5)
  const [color, setColor] = useState("#00ff88")

  return (
    <>
      <div style={{ position: 'absolute', zIndex: 1, padding: '20px' }}>
        <div>
          <label>Sensitivity: </label>
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
          <label>Color: </label>
          <input 
            type="color" 
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
      </div>
      <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
        <Canvas>
          <OrbitControls />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Scene sensitivity={sensitivity} color={color} />
        </Canvas>
      </div>
    </>
  )
}