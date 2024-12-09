// src/components/AudioOrb.js
import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function Scene({ sensitivity = 0.5 }) {
  const meshRef = useRef()
  const analyserRef = useRef()
  
  // Create shader material for color gradient
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      wireframe: true,
      uniforms: {
        time: { value: 0 },
        audioFreq: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float audioFreq;
        varying vec3 vNormal;
        
        vec3 hsvToRgb(float h, float s, float v) {
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(vec3(h) + K.xyz) * 6.0 - K.www);
          return v * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), s);
        }
        
        void main() {
          float hue = (vNormal.y + 1.0) * 0.5 + audioFreq + time * 0.1;
          vec3 color = hsvToRgb(hue, 1.0, 1.0);
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });
  }, []);

  useFrame((state) => {
    if (analyserRef.current && meshRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      const scale = 1 + (average / 128) * sensitivity
      
      meshRef.current.scale.set(scale, scale, scale)
      meshRef.current.rotation.y += 0.01
      
      // Update shader uniforms
      meshRef.current.material.uniforms.time.value = state.clock.elapsedTime
      meshRef.current.material.uniforms.audioFreq.value = average / 255.0
    }
  })

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

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <icosahedronGeometry args={[1, 4]} />
    </mesh>
  )
}

export default function AudioOrb() {
  const [sensitivity, setSensitivity] = useState(0.5)

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
      </div>
      <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
        <Canvas camera={{ position: [0, 0, 4] }}>
          <OrbitControls />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Scene sensitivity={sensitivity} />
        </Canvas>
      </div>
    </>
  )
}