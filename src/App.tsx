import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Orb } from './components/Orb';
import { Controls } from './components/Control';

function App() {
  const [morphIntensity, setMorphIntensity] = useState(0.5);
  const [volumeSensitivity, setVolumeSensitivity] = useState(1);
  const [size, setSize] = useState(1);
  const [color, setColor] = useState('#4338ca');
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-indigo-900">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Orb
          morphIntensity={morphIntensity}
          volumeSensitivity={volumeSensitivity}
          size={size}
          color={color}
        />
        <OrbitControls enableZoom={false} />
      </Canvas>
      
      <Controls
        morphIntensity={morphIntensity}
        setMorphIntensity={setMorphIntensity}
        volumeSensitivity={volumeSensitivity}
        setVolumeSensitivity={setVolumeSensitivity}
        size={size}
        setSize={setSize}
        color={color}
        setColor={setColor}
        isOpen={isControlsOpen}
        setIsOpen={setIsControlsOpen}
      />

      {/* Overlay text */}
      <div className="absolute top-0 left-0 w-full p-4 text-center text-white">
        <h1 className="text-4xl font-bold mb-2">Audio-Reactive 3D Orb</h1>
        <p className="text-lg opacity-80">
          Allow microphone access • Make some noise • Customize with controls
        </p>
      </div>
    </div>
  );
}

export default App;