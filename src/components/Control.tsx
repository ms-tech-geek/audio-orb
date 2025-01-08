import { Settings } from 'lucide-react';

interface ControlsProps {
  morphIntensity: number;
  setMorphIntensity: (value: number) => void;
  volumeSensitivity: number;
  setVolumeSensitivity: (value: number) => void;
  size: number;
  setSize: (value: number) => void;
  color: string;
  setColor: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export function Controls({
  morphIntensity,
  setMorphIntensity,
  volumeSensitivity,
  setVolumeSensitivity,
  size,
  setSize,
  color,
  setColor,
  isOpen,
  setIsOpen
}: ControlsProps) {
  return (
    <div className="absolute right-4 top-4">
      <button
        aria-label='Submit'
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
      >
        <Settings className="w-6 h-6 text-white" />
      </button>
      
      {isOpen && (
        <div className="mt-4 bg-white/10 backdrop-blur-lg rounded-lg p-4 w-64">
          <h3 className="text-white font-semibold mb-4">Controls</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm block mb-2">
                Morph Intensity: {morphIntensity.toFixed(2)}
              </label>
              <input
                aria-label='Morph Intensity'
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={morphIntensity}
                onChange={(e) => setMorphIntensity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white text-sm block mb-2">
                Volume Sensitivity: {volumeSensitivity.toFixed(2)}
              </label>
              <input
                aria-label='Volume Intensity'
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={volumeSensitivity}
                onChange={(e) => setVolumeSensitivity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white text-sm block mb-2">
                Size: {size.toFixed(2)}
              </label>
              <input
                aria-label='Size'
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white text-sm block mb-2">
                Color
              </label>
              <input
                aria-label='Color'
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-8 rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}