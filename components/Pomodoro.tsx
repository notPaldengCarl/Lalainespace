
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Brain, Settings, Save, X, Clock, Wind } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { TimerMode, TimerConfig } from '../types';

interface PomodoroProps {
  onComplete: () => void;
}

const DEFAULT_SETTINGS: TimerConfig = {
  [TimerMode.FOCUS]: 25,
  [TimerMode.SHORT_BREAK]: 5,
  [TimerMode.LONG_BREAK]: 15,
};

export const Pomodoro: React.FC<PomodoroProps> = ({ onComplete }) => {
  // --- State ---
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [isActive, setIsActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Load settings from local storage or use default
  const [settings, setSettings] = useState<TimerConfig>(() => {
    const saved = localStorage.getItem('lalaine_timer_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Edit state for settings form
  const [editValues, setEditValues] = useState<TimerConfig>(settings);

  // Timer state
  // We initialize timeLeft based on current mode and settings
  const [timeLeft, setTimeLeft] = useState(settings[TimerMode.FOCUS] * 60);
  
  const timerRef = useRef<number | null>(null);

  // --- Effects ---

  // Persist settings
  useEffect(() => {
    localStorage.setItem('lalaine_timer_settings', JSON.stringify(settings));
  }, [settings]);

  // Timer Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished
            if (timerRef.current) clearInterval(timerRef.current);
            setIsActive(false);
            onComplete();
            
            // Play notification
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.volume = 0.5;
              audio.play().catch(() => {});
            } catch (e) {}
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, onComplete]);

  // Handle Mode Change (Reset timer when mode changes)
  useEffect(() => {
    setIsActive(false);
    setTimeLeft(settings[mode] * 60);
  }, [mode, settings]);

  // --- Handlers ---

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(settings[mode] * 60);
  };

  const handleSaveSettings = () => {
    setSettings(editValues);
    setIsSettingsOpen(false);
    // If we are currently in a mode, update the time left immediately if not active
    if (!isActive) {
      setTimeLeft(editValues[mode] * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = settings[mode] * 60;
    // Avoid division by zero
    if (total === 0) return 0;
    return ((total - timeLeft) / total) * 100;
  };

  const isBreakMode = mode === TimerMode.SHORT_BREAK || mode === TimerMode.LONG_BREAK;

  // --- Render ---

  if (isSettingsOpen) {
    return (
      <Card title="Timer Settings" icon={<Clock size={24} />} className="relative">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-coffee">Focus (min)</label>
              <input 
                type="number" 
                value={editValues[TimerMode.FOCUS]}
                onChange={(e) => setEditValues({...editValues, [TimerMode.FOCUS]: parseInt(e.target.value) || 1})}
                className="p-2 rounded-lg bg-white border border-accentLight/30 focus:border-accent outline-none text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-coffee">Short Break (min)</label>
              <input 
                type="number" 
                value={editValues[TimerMode.SHORT_BREAK]}
                onChange={(e) => setEditValues({...editValues, [TimerMode.SHORT_BREAK]: parseInt(e.target.value) || 1})}
                className="p-2 rounded-lg bg-white border border-accentLight/30 focus:border-accent outline-none text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-coffee">Long Break (min)</label>
              <input 
                type="number" 
                value={editValues[TimerMode.LONG_BREAK]}
                onChange={(e) => setEditValues({...editValues, [TimerMode.LONG_BREAK]: parseInt(e.target.value) || 1})}
                className="p-2 rounded-lg bg-white border border-accentLight/30 focus:border-accent outline-none text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSaveSettings} size="sm" className="flex-1">
              <Save size={16} className="mr-2" /> Save
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsSettingsOpen(false)}>
              <X size={16} />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Focus Timer" 
      icon={<Brain size={20} />}
      className="relative overflow-hidden"
      action={
        <button 
          onClick={() => {
            setEditValues(settings); // Sync edit values with current settings
            setIsSettingsOpen(true);
          }}
          className="text-mocha hover:text-accent transition-colors p-1.5 hover:bg-white/50 rounded-lg"
          title="Edit Durations"
        >
          <Clock size={18} />
        </button>
      }
    >
      <div className="flex flex-col items-center justify-center py-2 space-y-4 relative z-10">
        
        {/* Mode Toggles */}
        <div className="flex p-1 bg-white/40 rounded-lg space-x-1">
          <button
            onClick={() => setMode(TimerMode.FOCUS)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === TimerMode.FOCUS ? 'bg-white text-accent shadow-sm' : 'text-mocha hover:bg-white/50'}`}
          >
            Focus
          </button>
          <button
            onClick={() => setMode(TimerMode.SHORT_BREAK)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === TimerMode.SHORT_BREAK ? 'bg-white text-accent shadow-sm' : 'text-mocha hover:bg-white/50'}`}
          >
            Short
          </button>
          <button
            onClick={() => setMode(TimerMode.LONG_BREAK)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === TimerMode.LONG_BREAK ? 'bg-white text-accent shadow-sm' : 'text-mocha hover:bg-white/50'}`}
          >
            Long
          </button>
        </div>

        {/* Timer Display - Compacted */}
        <div className="relative w-32 h-32 flex items-center justify-center group">
          
          {/* Breathing Visualizer (Only active during break + active) */}
          {isBreakMode && isActive ? (
             <div className="absolute inset-0 flex items-center justify-center">
                {/* Outer Breathing Circle */}
                <div className="w-full h-full rounded-full bg-accent/20 animate-[ping_8s_ease-in-out_infinite] opacity-50" />
                {/* Inner Breathing Circle */}
                <div className="absolute w-24 h-24 rounded-full bg-accent/30 animate-[pulse_8s_ease-in-out_infinite]" />
                
                <div className="absolute text-[10px] text-accent uppercase tracking-widest font-bold top-20 opacity-0 group-hover:opacity-100 transition-opacity">
                   Breathe
                </div>
             </div>
          ) : (
            /* Standard Progress Ring */
            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-accentLight/20"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 58}
                strokeDashoffset={2 * Math.PI * 58 * (1 - getProgress() / 100)}
                className="text-accent transition-all duration-1000 ease-linear"
                strokeLinecap="round"
              />
            </svg>
          )}

          <div className="text-3xl font-serif font-bold text-coffee tabular-nums tracking-wider relative z-10">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Controls - Compacted */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={toggleTimer}
            size="md"
            className="w-28"
          >
            {isActive ? (
              <><Pause size={18} className="mr-2" /> Pause</>
            ) : (
              <><Play size={18} className="mr-2" /> Start</>
            )}
          </Button>
          <Button 
            variant="secondary"
            onClick={resetTimer}
            size="md"
            title="Reset Timer"
          >
            <RotateCcw size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
};
