import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Settings, 
  Cloud, 
  Waves, 
  Trees, 
  Mountain,
  Music,
  Zap
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SoundProfile {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  category: string;
  description: string;
  url: string;
  workModes: string[];
}

const soundProfiles: SoundProfile[] = [
  {
    id: "rain",
    name: "Rain",
    icon: Cloud,
    category: "nature",
    description: "Gentle rainfall for deep focus",
    url: "/sounds/rain.mp3",
    workModes: ["focus", "coding", "writing"]
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    icon: Waves,
    category: "nature",
    description: "Rhythmic ocean waves for relaxation",
    url: "/sounds/ocean.mp3",
    workModes: ["break", "meditation", "reading"]
  },
  {
    id: "forest",
    name: "Forest",
    icon: Trees,
    category: "nature",
    description: "Birds and rustling leaves",
    url: "/sounds/forest.mp3",
    workModes: ["creative", "brainstorming", "learning"]
  },
  {
    id: "waterfall",
    name: "Waterfall",
    icon: Mountain,
    category: "nature",
    description: "Cascading water sounds",
    url: "/sounds/waterfall.mp3",
    workModes: ["focus", "meditation", "deep-work"]
  },
  {
    id: "whales",
    name: "Whale Songs",
    icon: Waves,
    category: "marine",
    description: "Calming whale vocalizations",
    url: "/sounds/whales.mp3",
    workModes: ["meditation", "relaxation", "creative"]
  },
  {
    id: "piano",
    name: "Ambient Piano",
    icon: Music,
    category: "instrumental",
    description: "Soft piano melodies",
    url: "/sounds/piano.mp3",
    workModes: ["writing", "creative", "focus"]
  },
  {
    id: "guitar",
    name: "Acoustic Guitar",
    icon: Music,
    category: "instrumental",
    description: "Gentle guitar fingerpicking",
    url: "/sounds/guitar.mp3",
    workModes: ["creative", "brainstorming", "break"]
  },
  {
    id: "strings",
    name: "String Ensemble",
    icon: Music,
    category: "instrumental",
    description: "Ethereal string arrangements",
    url: "/sounds/strings.mp3",
    workModes: ["deep-work", "focus", "meditation"]
  }
];

export default function AmbientSounds() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([0.5]);
  const [currentSound, setCurrentSound] = useState<string>("rain");
  const [workMode, setWorkMode] = useState<string>("focus");
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Simulate adaptive sound selection based on current activity
  useEffect(() => {
    if (adaptiveMode) {
      const now = new Date();
      const hour = now.getHours();
      
      // Time-based adaptive suggestions
      let suggestedMode = "focus";
      if (hour >= 6 && hour < 9) suggestedMode = "morning";
      else if (hour >= 12 && hour < 14) suggestedMode = "break";
      else if (hour >= 18 && hour < 22) suggestedMode = "creative";
      else if (hour >= 22 || hour < 6) suggestedMode = "relaxation";
      
      setWorkMode(suggestedMode);
    }
  }, [adaptiveMode]);

  // Auto-select appropriate sound based on work mode
  useEffect(() => {
    if (adaptiveMode && workMode) {
      const suitableSounds = soundProfiles.filter(sound => 
        sound.workModes.includes(workMode) || 
        sound.workModes.includes(workMode.replace('-', ''))
      );
      
      if (suitableSounds.length > 0) {
        const randomSound = suitableSounds[Math.floor(Math.random() * suitableSounds.length)];
        setCurrentSound(randomSound.id);
      }
    }
  }, [workMode, adaptiveMode]);

  // Handle audio playback
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0];
      audioRef.current.loop = true;
      
      if (isEnabled && isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isEnabled, isPlaying, volume]);

  // Update audio source when sound changes
  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      // In production, these would be actual audio files
      // For demo, we'll use data URLs or simulate audio
      audioRef.current.src = `data:audio/wav;base64,${btoa('silence')}`;
      
      if (wasPlaying && isEnabled) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentSound]);

  const togglePlayback = () => {
    if (!isEnabled) {
      setIsEnabled(true);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const currentSoundProfile = soundProfiles.find(s => s.id === currentSound);
  const recommendedSounds = soundProfiles.filter(sound => 
    sound.workModes.includes(workMode) || sound.workModes.includes(workMode.replace('-', ''))
  );

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-teal-500" />
          Ambient Sounds
        </CardTitle>
        <CardDescription>
          {adaptiveMode ? `Auto-selected for ${workMode} mode` : "Custom sound environment"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              onClick={togglePlayback}
              className="w-12 h-12 rounded-full p-0"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
                id="ambient-sounds"
              />
              <label htmlFor="ambient-sounds" className="text-sm font-medium">
                Enable
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={adaptiveMode}
              onCheckedChange={setAdaptiveMode}
              id="adaptive-mode"
            />
            <label htmlFor="adaptive-mode" className="text-sm">
              <Zap className="w-4 h-4 inline mr-1" />
              Smart
            </label>
          </div>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Volume</label>
            <span className="text-sm text-slate-500">{Math.round(volume[0] * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-slate-400" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={1}
              step={0.1}
              className="flex-1"
              disabled={!isEnabled}
            />
            <Volume2 className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Work Mode Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Work Mode</label>
          <Select value={workMode} onValueChange={setWorkMode} disabled={adaptiveMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="focus">Deep Focus</SelectItem>
              <SelectItem value="creative">Creative Work</SelectItem>
              <SelectItem value="coding">Coding</SelectItem>
              <SelectItem value="writing">Writing</SelectItem>
              <SelectItem value="reading">Reading</SelectItem>
              <SelectItem value="meditation">Meditation</SelectItem>
              <SelectItem value="break">Break Time</SelectItem>
              <SelectItem value="brainstorming">Brainstorming</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Current Sound */}
        {currentSoundProfile && (
          <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                <currentSoundProfile.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  {currentSoundProfile.name}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {currentSoundProfile.description}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {currentSoundProfile.category}
              </Badge>
            </div>
          </div>
        )}

        {/* Sound Selection Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Sound Library</label>
            {adaptiveMode && recommendedSounds.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {recommendedSounds.length} recommended
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {soundProfiles.map((sound) => {
              const Icon = sound.icon;
              const isRecommended = recommendedSounds.some(r => r.id === sound.id);
              const isSelected = currentSound === sound.id;
              
              return (
                <Button
                  key={sound.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`justify-start h-auto p-2 ${isRecommended ? 'ring-2 ring-teal-200' : ''}`}
                  onClick={() => setCurrentSound(sound.id)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium text-xs">{sound.name}</div>
                  </div>
                  {isRecommended && (
                    <Zap className="w-3 h-3 ml-auto text-teal-500" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {isEnabled ? (isPlaying ? "Playing" : "Paused") : "Disabled"}
          </span>
          {adaptiveMode && (
            <span>Auto-adapts to your activity</span>
          )}
        </div>

        {/* Hidden audio element */}
        <audio ref={audioRef} preload="none" />
      </CardContent>
    </Card>
  );
}