// src/components/AudioOrb.js
import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'

function Scene({ sensitivity = 0.5 }) {
  const meshRef = useRef()
  const analyserRef = useRef()
  const [isAudioInitialized, setIsAudioInitialized] = useState(false)

  // Debug audio setup
  useEffect(() => {
    // First check microphone permission
    navigator.permissions.query({ name: 'microphone' })
      .then(result => {
        console.log('Microphone permission:', result.state)
      })

    // Initialize audio
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => {
        console.log('Audio stream obtained')
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        analyserRef.current = analyser
        setIsAudioInitialized(true)
        console.log('Audio analyzer setup complete')
      })
      .catch(err => console.error('Audio setup error:', err))
  }, [])

  // Animation and audio processing
  useFrame((state) => {
    if (analyserRef.current && meshRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)
      
      // Debug audio data
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      console.log('Audio level:', average)
      
      // Update orb
      const scale = 1 + (average / 255.0) * sensitivity
      meshRef.current.scale.set(scale, scale, scale)
      meshRef.current.material.uniforms.audioFreq.value = average / 255.0
      meshRef.current.material.uniforms.time.value = state.clock.elapsedTime
    }
  })

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      audioFreq: { value: 0 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec2 vUv;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float audioFreq;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      void main() {
        float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        vec3 baseColor = vec3(0.1, 0.5, 1.0);
        vec3 glowColor = mix(baseColor, vec3(1.0), fresnel * (1.0 + audioFreq));
        float alpha = fresnel * 0.8 + 0.2;
        gl_FragColor = vec4(glowColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending
  });

  return (
    <>
      <mesh ref={meshRef} material={shaderMaterial}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
      {!isAudioInitialized && (
        <Html center>
          <div style={{ color: 'white' }}>
            Please allow microphone access...
          </div>
        </Html>
      )}
    </>
  )
}

export default function AudioOrb() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Scene />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}