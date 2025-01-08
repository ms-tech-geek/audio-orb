import { useState, useEffect } from 'react';

export interface AudioAnalyzerConfig {
  fftSize?: number;
  smoothingTimeConstant?: number;
}

export function useAudioAnalyzer(config: AudioAnalyzerConfig = {}) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyzer, setAnalyzer] = useState<AnalyserNode | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAudio = async () => {
      try {
        const context = new AudioContext();
        const analyzerNode = context.createAnalyser();
        
        analyzerNode.fftSize = config.fftSize || 2048;
        analyzerNode.smoothingTimeConstant = config.smoothingTimeConstant || 0.8;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = context.createMediaStreamSource(stream);
        source.connect(analyzerNode);

        setAudioContext(context);
        setAnalyzer(analyzerNode);
        setIsActive(true);
        setError(null);
      } catch (err) {
        setError('Could not access microphone');
        console.error('Audio initialization error:', err);
      }
    };

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [config.fftSize, config.smoothingTimeConstant]);

  const getFrequencyData = () => {
    if (!analyzer) return new Uint8Array();
    
    const dataArray = new Uint8Array(analyzer.frequencyBinCount);
    analyzer.getByteFrequencyData(dataArray);
    return dataArray;
  };

  const startAnalyzing = () => {
    if (!audioContext) {
      const context = new AudioContext();
      setAudioContext(context);
    }
  };

  return {
    isActive,
    error,
    getFrequencyData,
    startAnalyzing
  };
}