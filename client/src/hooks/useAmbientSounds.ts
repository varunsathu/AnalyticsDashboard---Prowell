import { useState, useEffect, useRef } from "react";

interface SoundSettings {
  isEnabled: boolean;
  volume: number;
  currentSound: string;
  adaptiveMode: boolean;
  workMode: string;
}

export function useAmbientSounds() {
  const [settings, setSettings] = useState<SoundSettings>({
    isEnabled: false,
    volume: 0.5,
    currentSound: "rain",
    adaptiveMode: true,
    workMode: "focus"
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize Web Audio API
  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
      } catch (error) {
        console.warn("Web Audio API not supported, falling back to HTML5 audio");
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(settings.volume, audioContextRef.current!.currentTime);
    }
  }, [settings.volume]);

  // Auto-detect work mode based on current activity
  const detectWorkMode = () => {
    const hour = new Date().getHours();
    
    // Simple time-based detection
    if (hour >= 9 && hour < 12) return "focus";
    if (hour >= 12 && hour < 14) return "break";
    if (hour >= 14 && hour < 17) return "creative";
    if (hour >= 17 && hour < 19) return "coding";
    if (hour >= 19 && hour < 22) return "relaxation";
    
    return "focus";
  };

  // Adaptive mode logic
  useEffect(() => {
    if (settings.adaptiveMode) {
      const detectedMode = detectWorkMode();
      if (detectedMode !== settings.workMode) {
        updateSettings({ workMode: detectedMode });
      }
    }
  }, [settings.adaptiveMode, settings.workMode]);

  const updateSettings = (newSettings: Partial<SoundSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggle = () => {
    if (settings.isEnabled) {
      setIsPlaying(!isPlaying);
    } else {
      updateSettings({ isEnabled: true });
      setIsPlaying(true);
    }
  };

  const generateSoundData = (soundType: string, duration: number = 2) => {
    if (!audioContextRef.current) return null;

    const sampleRate = audioContextRef.current.sampleRate;
    const frameCount = sampleRate * duration;
    const audioBuffer = audioContextRef.current.createBuffer(2, frameCount, sampleRate);

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      
      switch (soundType) {
        case "rain":
          // Generate rain-like noise
          for (let i = 0; i < frameCount; i++) {
            channelData[i] = (Math.random() - 0.5) * 0.3 * Math.sin(i * 0.01);
          }
          break;
          
        case "ocean":
          // Generate wave-like sounds
          for (let i = 0; i < frameCount; i++) {
            const wave1 = Math.sin(2 * Math.PI * 0.5 * i / sampleRate);
            const wave2 = Math.sin(2 * Math.PI * 0.3 * i / sampleRate);
            const noise = (Math.random() - 0.5) * 0.1;
            channelData[i] = (wave1 + wave2) * 0.2 + noise;
          }
          break;
          
        case "forest":
          // Generate forest ambience
          for (let i = 0; i < frameCount; i++) {
            const rustling = (Math.random() - 0.5) * 0.1;
            const bird = Math.sin(2 * Math.PI * (220 + Math.random() * 100) * i / sampleRate) * 0.05;
            channelData[i] = rustling + (Math.random() > 0.995 ? bird : 0);
          }
          break;
          
        default:
          // Generate soft white noise
          for (let i = 0; i < frameCount; i++) {
            channelData[i] = (Math.random() - 0.5) * 0.1;
          }
      }
    }

    return audioBuffer;
  };

  const playSound = async (soundType: string) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    // Stop current sound
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
    }

    // Generate new sound
    const audioBuffer = generateSoundData(soundType);
    if (!audioBuffer) return;

    // Create and configure source
    sourceNodeRef.current = audioContextRef.current.createBufferSource();
    sourceNodeRef.current.buffer = audioBuffer;
    sourceNodeRef.current.loop = true;
    sourceNodeRef.current.connect(gainNodeRef.current);

    // Resume context if suspended
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    sourceNodeRef.current.start();
  };

  const stopSound = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
  };

  // Handle play/pause
  useEffect(() => {
    if (settings.isEnabled && isPlaying) {
      playSound(settings.currentSound);
    } else {
      stopSound();
    }
  }, [settings.isEnabled, isPlaying, settings.currentSound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  return {
    settings,
    isPlaying,
    updateSettings,
    toggle,
    setIsPlaying,
    isSupported: !!audioContextRef.current
  };
}