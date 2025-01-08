import { useState } from 'react';

export interface AudioAnalyzerConfig {
  fftSize?: number;
  smoothingTimeConstant?: number;
}

export function useAudioAnalyzer(config: AudioAnalyzerConfig = {}) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyzer, setAnalyzer] = useState<AnalyserNode | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAnalyzing = async () => {
    try {
      // Create or resume AudioContext
      let context = audioContext;
      if (!context) {
        context = new AudioContext();
        setAudioContext(context);
      } else if (context.state === 'suspended') {
        await context.resume();
      }
  
      // Request microphone access and create AnalyserNode
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = context.createMediaStreamSource(stream);
      const analyzerNode = context.createAnalyser();
  
      analyzerNode.fftSize = config.fftSize || 2048;
      analyzerNode.smoothingTimeConstant = config.smoothingTimeConstant || 0.8;
  
      source.connect(analyzerNode);
      setAnalyzer(analyzerNode);
      setIsActive(true);
      setError(null);
    } catch (err) {
      setError('Could not access microphone');
      console.error('Error initializing audio:', err);
    }
  };
  

  const getFrequencyData = () => {
    if (!analyzer) return new Uint8Array();
    const dataArray = new Uint8Array(analyzer.frequencyBinCount);
    analyzer.getByteFrequencyData(dataArray);
    return dataArray;
  };

  return { isActive, error, getFrequencyData, startAnalyzing };
}
