import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import type { Mesh } from 'three';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';

interface OrbProps {
  morphIntensity: number;
  volumeSensitivity: number;
  size: number;
  color: string;
}

export function Orb({ morphIntensity, volumeSensitivity, size, color }: OrbProps) {
  const meshRef = useRef<Mesh>(null);
  const { getFrequencyData, startAnalyzing, isActive, error } = useAudioAnalyzer({
    fftSize: 256,
    smoothingTimeConstant: 0.8,
  });

  useEffect(() => {
    startAnalyzing();
  }, []);

  useFrame((state) => {
    if (!meshRef.current || !isActive) return;

    const frequencyData = getFrequencyData();
    const averageFrequency = frequencyData.reduce((acc, val) => acc + val, 0) / frequencyData.length;
    const normalizedFrequency = averageFrequency / 255;

    // Apply audio-reactive transformations
    meshRef.current.scale.x = size * (1 + normalizedFrequency * volumeSensitivity);
    meshRef.current.scale.y = size * (1 + normalizedFrequency * volumeSensitivity);
    meshRef.current.scale.z = size * (1 + normalizedFrequency * volumeSensitivity);

    // Rotate the orb
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
  });

  if (error) {
    console.error('Audio Error:', error);
  }

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={morphIntensity}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}