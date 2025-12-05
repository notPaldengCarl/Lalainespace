
import React, { useState, useEffect } from 'react';
import { Music, Settings, Save, ListMusic } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { DEFAULT_SPOTIFY_PLAYLIST } from '../constants';

const PRESETS = [
  { name: 'Lofi Girl', id: '0vvXsWCC9xrXsKd4FyS8kM' },
  { name: 'Cozy Jazz', id: '37i9dQZF1DXaImRpG7HXqp' },
  { name: 'Deep Focus', id: '37i9dQZF1DWZeKCadgRdKQ' },
  { name: 'Peaceful Piano', id: '37i9dQZF1DX4sWSpwq3LiO' },
  { name: 'Nature Sounds', id: '37i9dQZF1DX4PP3DA4J0N8' },
  { name: 'Rainy Day', id: '37i9dQZF1DXbvABJXBIyiY' },
];

export const SpotifyWidget: React.FC = () => {
  const [playlistId, setPlaylistId] = useState(() => {
    return localStorage.getItem('lalaine_spotify_id') || DEFAULT_SPOTIFY_PLAYLIST;
  });
  const [inputUrl, setInputUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem('lalaine_spotify_id', playlistId);
  }, [playlistId]);

  const handleUpdate = () => {
    let newId = inputUrl;
    if (inputUrl.includes('spotify.com')) {
      const parts = inputUrl.split('/');
      const lastPart = parts[parts.length - 1];
      newId = lastPart.split('?')[0];
    }

    if (newId.trim()) {
      setPlaylistId(newId);
      setIsEditing(false);
      setInputUrl('');
    }
  };

  return (
    <Card 
      className="h-full p-0 overflow-hidden relative group border-none bg-black"
    >
        {isEditing ? (
          <div className="absolute inset-0 bg-panel z-20 p-4 flex flex-col gap-2 overflow-y-auto animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-coffee text-sm">Select Playlist</h3>
                <button onClick={() => setIsEditing(false)} className="text-mocha hover:text-coffee"><Settings size={16} /></button>
            </div>
            
            {/* Presets */}
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => { setPlaylistId(preset.id); setIsEditing(false); }}
                  className="text-xs text-left px-2 py-2 rounded-lg bg-white/60 hover:bg-accent hover:text-white transition-colors truncate"
                >
                  {preset.name}
                </button>
              ))}
            </div>
            
            <div className="h-px bg-mocha/10 my-1" />

            {/* Custom Input */}
            <div className="flex gap-2">
              <input 
                type="text" 
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Or paste ID..."
                className="flex-1 px-2 py-1.5 rounded-lg text-xs bg-white border border-transparent focus:border-accent outline-none"
              />
              <Button size="sm" onClick={handleUpdate} className="!py-1 !px-2">
                <Save size={14} />
              </Button>
            </div>
          </div>
        ) : (
            <button 
                onClick={() => setIsEditing(true)} 
                className="absolute top-2 right-2 z-10 text-white/50 hover:text-white p-1.5 bg-black/20 hover:bg-black/50 backdrop-blur-sm rounded-full transition-colors opacity-0 group-hover:opacity-100"
                title="Change Playlist"
            >
                <Settings size={14} />
            </button>
        )}
        
        <div className="w-full h-full bg-[#212121]">
          <iframe
            style={{ display: 'block', border: 'none' }}
            src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
            width="100%"
            height="100%"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify Embed"
          />
        </div>
    </Card>
  );
};
