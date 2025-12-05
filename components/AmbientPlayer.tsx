
import React, { useState, useRef, useEffect } from 'react';
import { CloudRain, Flame, Coffee, Waves, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { Card } from './Card';

const SOUNDS = [
  { id: 'rain', icon: <CloudRain size={20} />, label: 'Rain', url: 'https://assets.mixkit.co/active_storage/sfx/1271/1271-preview.mp3' }, // Placeholder URL
  { id: 'fire', icon: <Flame size={20} />, label: 'Fire', url: 'https://assets.mixkit.co/active_storage/sfx/2635/2635-preview.mp3' },
  { id: 'cafe', icon: <Coffee size={20} />, label: 'Cafe', url: 'https://assets.mixkit.co/active_storage/sfx/1286/1286-preview.mp3' }, 
  { id: 'waves', icon: <Waves size={20} />, label: 'Ocean', url: 'https://assets.mixkit.co/active_storage/sfx/1187/1187-preview.mp3' },
];

export const AmbientPlayer: React.FC = () => {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeSound]);

  const toggleSound = (soundId: string) => {
    if (activeSound === soundId) {
      // Toggle play/pause for current
      setIsPlaying(!isPlaying);
    } else {
      // Switch sound
      setActiveSound(soundId);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.load(); // Reload for new source
      }
    }
  };

  const currentSound = SOUNDS.find(s => s.id === activeSound);

  return (
    <Card 
        title="Ambient Mode" 
        icon={isPlaying ? <Volume2 size={24} className="text-accent animate-pulse" /> : <VolumeX size={24} />}
        className="h-full bg-panel"
    >
      <div className="flex items-center justify-between h-full pt-1">
        {/* Hidden Audio Element */}
        <audio 
            ref={audioRef} 
            src={currentSound?.url} 
            loop 
            className="hidden"
        />

        <div className="grid grid-cols-4 gap-2 w-full">
            {SOUNDS.map(sound => {
                const isActive = activeSound === sound.id;
                return (
                    <button
                        key={sound.id}
                        onClick={() => toggleSound(sound.id)}
                        className={`
                            flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all duration-300
                            ${isActive 
                                ? 'bg-accent text-white shadow-md scale-105' 
                                : 'bg-white/40 text-mocha hover:bg-white hover:text-coffee'}
                        `}
                    >
                        {isActive && isPlaying ? (
                            <div className="relative">
                                {sound.icon}
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                            </div>
                        ) : (
                            sound.icon
                        )}
                        <span className="text-[10px] font-medium tracking-wide">{sound.label}</span>
                    </button>
                )
            })}
        </div>
      </div>
    </Card>
  );
};
