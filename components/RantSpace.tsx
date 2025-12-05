import React, { useState } from 'react';
import { Send, Wind, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface RantSpaceProps {
  onRantReleased: () => void;
}

export const RantSpace: React.FC<RantSpaceProps> = ({ onRantReleased }) => {
  const [text, setText] = useState('');
  const [isReleasing, setIsReleasing] = useState(false);

  const handleRelease = () => {
    if (!text.trim()) return;
    
    setIsReleasing(true);
    
    // Simulate the visual effect of "letting go"
    setTimeout(() => {
      setText('');
      setIsReleasing(false);
      onRantReleased();
    }, 1500);
  };

  return (
    <Card 
      title="Rantspace" 
      icon={<Wind size={24} />}
      className="h-full flex flex-col"
    >
      <div className="flex flex-col h-full relative">
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-mocha text-sm">
            Write it down. Let it out. <br/>
            <span className="opacity-70 text-xs">It vanishes when you release it.</span>
          </p>
          <div className="text-xs font-mono text-mocha/50 bg-white/50 px-2 py-1 rounded-md">
            {text.length} chars
          </div>
        </div>
        
        <div className="relative flex-1 group overflow-hidden rounded-2xl">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's bothering you? Type it all out here..."
            className={`
              w-full h-full p-6 bg-coffee text-white placeholder:text-white/30
              border-none outline-none resize-none font-sans text-base leading-relaxed
              transition-all duration-1000 ease-in-out
              ${isReleasing ? 'opacity-0 scale-105 blur-lg translate-y-[-20px]' : 'opacity-100 scale-100 blur-0'}
            `}
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
            disabled={isReleasing}
          />
          
          {/* Release Overlay Animation */}
          <div 
            className={`absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-cream/90 transition-opacity duration-1000 ${isReleasing ? 'opacity-100' : 'opacity-0'}`}
          >
            <Wind size={48} className="text-accent mb-4 animate-bounce" />
            <span className="text-accent font-serif italic text-xl">Releasing to the void...</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button 
            onClick={() => setText('')}
            disabled={!text.trim() || isReleasing}
            className="text-mocha/50 hover:text-red-400 text-xs flex items-center gap-1 transition-colors px-2 py-1"
          >
             {text.trim() && <><Trash2 size={12} /> Clear</>}
          </button>

          <Button 
            onClick={handleRelease} 
            disabled={!text.trim() || isReleasing}
            variant="primary"
            className="shadow-lg shadow-accent/20"
          >
            <Send size={18} className="mr-2" />
            Release
          </Button>
        </div>
      </div>
    </Card>
  );
};