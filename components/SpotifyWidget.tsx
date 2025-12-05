
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
      title="Spotify Player" 
      icon={<Music size={24} />} 
      className="h-full min-h-[220px]"
      action={
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="text-mocha hover:text-accent p-1 transition-colors bg-white/50 rounded-lg"
          title="Change Playlist"
        >
          <Settings size={16} />
        </button>
      }
    >
      <div className="flex flex-col h-full gap-2">
        {isEditing && (
          <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-top-2 bg-white/40 p-2 rounded-xl">
            {/* Presets */}
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => { setPlaylistId(preset.id); setIsEditing(false); }}
                  className="text-xs text-left px-2 py-1.5 rounded-lg bg-white/60 hover:bg-accent hover:text-white transition-colors truncate"
                >
                  {preset.name}
                </button>
              ))}
            </div>
            
            <div className="h-px bg-mocha/10" />

            {/* Custom Input */}
            <div className="flex gap-2">
              <input 
                type="text" 
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Or paste ID/Link..."
                className="flex-1 px-2 py-1.5 rounded-lg text-xs bg-white border border-transparent focus:border-accent outline-none"
              />
              <Button size="sm" onClick={handleUpdate} className="!py-1 !px-2">
                <Save size={14} />
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex-1 rounded-xl overflow-hidden shadow-sm bg-[#212121]">
          <iframe
            style={{ borderRadius: '12px', display: 'block', border: 'none' }}
            src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
            width="100%"
            height="100%"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify Embed"
          />
        </div>
      </div>
    </Card>
  );
};
