import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Orb } from './components/Orb';

function App() {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-indigo-900">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Orb />
        <OrbitControls enableZoom={false} />
      </Canvas>
      
      {/* Overlay text */}
      <div className="absolute top-0 left-0 w-full p-4 text-center text-white">
        <h1 className="text-4xl font-bold mb-2">Interactive 3D Orb</h1>
        <p className="text-lg opacity-80">Drag to rotate • Built with Three.js</p>
      </div>
    </div>
  );
}

export default App;