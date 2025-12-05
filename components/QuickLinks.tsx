
import React, { useState, useEffect } from 'react';
import { Plus, X, Globe, Link as LinkIcon } from 'lucide-react';
import { Card } from './Card';
import { QuickLink } from '../types';
import { DEFAULT_QUICK_LINKS } from '../constants';
import { Button } from './Button';

interface QuickLinksProps {
  variant?: 'default' | 'sidebar';
}

export const QuickLinks: React.FC<QuickLinksProps> = ({ variant = 'default' }) => {
  const [links, setLinks] = useState<QuickLink[]>(() => {
    // Changed key to v2 to force update the defaults to the new logos
    const saved = localStorage.getItem('lalaine_quicklinks_v2');
    return saved ? JSON.parse(saved) : DEFAULT_QUICK_LINKS;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    localStorage.setItem('lalaine_quicklinks_v2', JSON.stringify(links));
  }, [links]);

  const handleAdd = () => {
    if (!newTitle || !newUrl) return;
    const link: QuickLink = {
      id: Date.now().toString(),
      title: newTitle,
      url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
      icon: '🔗'
    };
    setLinks([...links, link]);
    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLinks(links.filter(l => l.id !== id));
  };

  const renderIcon = (icon: string | undefined) => {
    if (!icon) return <Globe size={18} />;
    
    // Check if it's a URL (for the logos)
    if (icon.startsWith('http') || icon.startsWith('data:')) {
      return (
        <img 
          src={icon} 
          alt="icon" 
          className="w-full h-full object-contain p-1.5" 
          loading="lazy"
        />
      );
    }
    
    // Fallback for emojis
    return <span className="text-xl">{icon}</span>;
  };

  // Sidebar Render Logic
  if (variant === 'sidebar') {
    return (
      <div className="mt-6 px-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-mocha uppercase tracking-wider">Quick Links</h3>
          <button 
            onClick={() => setIsAdding(!isAdding)} 
            className="text-mocha hover:text-accent transition-colors"
          >
            {isAdding ? <X size={14} /> : <Plus size={14} />}
          </button>
        </div>

        {isAdding && (
          <div className="bg-white/40 p-2 rounded-lg mb-3 flex flex-col gap-2">
             <input 
               value={newTitle}
               onChange={e => setNewTitle(e.target.value)}
               placeholder="Name"
               className="p-1.5 rounded-md text-xs outline-none bg-white/60 focus:ring-1 focus:ring-accent"
             />
             <input 
               value={newUrl}
               onChange={e => setNewUrl(e.target.value)}
               placeholder="URL"
               className="p-1.5 rounded-md text-xs outline-none bg-white/60 focus:ring-1 focus:ring-accent"
             />
             <Button size="sm" onClick={handleAdd} disabled={!newTitle || !newUrl} className="!py-1 !text-xs">Add</Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {links.map(link => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 p-2 rounded-lg bg-white/30 hover:bg-white transition-all hover:shadow-sm relative overflow-hidden"
              title={link.title}
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {renderIcon(link.icon)}
              </span>
              <span className="text-xs font-medium text-coffee truncate">{link.title}</span>
              <button 
                onClick={(e) => handleDelete(link.id, e)}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-red-100 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </a>
          ))}
        </div>
      </div>
    );
  }

  // Default Card Render Logic
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-semibold text-coffee">Quick Links</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="p-1 rounded-full hover:bg-white text-mocha transition-colors"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white/50 p-3 rounded-xl mb-3 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
           <input 
             value={newTitle}
             onChange={e => setNewTitle(e.target.value)}
             placeholder="Name (e.g. Gmail)"
             className="p-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-accent"
           />
           <input 
             value={newUrl}
             onChange={e => setNewUrl(e.target.value)}
             placeholder="URL"
             className="p-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-accent"
           />
           <Button size="sm" onClick={handleAdd} disabled={!newTitle || !newUrl}>Add</Button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        {links.map(link => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-white transition-all hover:shadow-sm relative"
          >
            <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
               {renderIcon(link.icon)}
            </div>
            <span className="text-[10px] font-medium text-coffee truncate w-full text-center">{link.title}</span>
            
            <button 
              onClick={(e) => handleDelete(link.id, e)}
              className="absolute -top-1 -right-1 bg-red-100 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={10} />
            </button>
          </a>
        ))}
        
        {links.length < 8 && !isAdding && (
           <button 
             onClick={() => setIsAdding(true)}
             className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border-2 border-dashed border-accentLight/30 hover:border-accentLight hover:bg-white/30 text-mocha/50 hover:text-mocha transition-all"
           >
             <Plus size={20} />
             <span className="text-[10px]">Add</span>
           </button>
        )}
      </div>
    </Card>
  );
};
