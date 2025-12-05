
import React, { useRef, useState, useEffect } from 'react';
import { 
  Bold, Italic, List, CheckSquare, Heading, Eye, Download, 
  Type, FileText, Wand2, Sparkles, Loader2, Palette, Lock, Unlock, Edit3
} from 'lucide-react';
import { NotePage } from '../../types';
import { GoogleGenAI } from '@google/genai';
import { Button } from '../Button';

interface EditorProps {
  page?: NotePage;
  folderName?: string;
  onUpdate: (id: string, updates: Partial<NotePage>) => void;
}

type PageStyle = 'theme' | 'white' | 'yellow' | 'dark' | 'grid';

export const NotebookEditor: React.FC<EditorProps> = ({ page, folderName, onUpdate }) => {
  const [isPreview, setIsPreview] = useState(false); // Default to edit mode, let user toggle
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [isUnlockedSession, setIsUnlockedSession] = useState(false);
  const [pageStyle, setPageStyle] = useState<PageStyle>(() => {
    return (localStorage.getItem('lalaine_editor_style') as PageStyle) || 'theme';
  });

  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem('lalaine_editor_style', pageStyle);
  }, [pageStyle]);

  // Reset unlock session when page changes
  useEffect(() => {
    setIsUnlockedSession(false);
  }, [page?.id]);

  if (!page) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-mocha/30 bg-transparent">
        <FileText size={64} className="mb-4 opacity-20" />
        <p>Select a note to start writing</p>
      </div>
    );
  }

  // Handle Locked State
  if (page.isLocked && !isUnlockedSession) {
      const handleUnlock = () => {
          const Swal = (window as any).Swal;
          if (Swal) {
              Swal.fire({
                  title: 'Unlock Note',
                  text: 'Enter the App PIN (or confirm if no PIN).',
                  input: 'password',
                  inputAttributes: {
                      maxlength: '4',
                      autocapitalize: 'off',
                      autocorrect: 'off'
                  },
                  showCancelButton: true,
                  confirmButtonText: 'Unlock',
              }).then((result: any) => {
                  if (result.isConfirmed) {
                      const storedPin = localStorage.getItem('lalaine_pin');
                      if (!storedPin || result.value === storedPin) {
                          setIsUnlockedSession(true);
                      } else {
                          Swal.fire('Error', 'Incorrect PIN', 'error');
                      }
                  }
              });
          } else {
              const pin = prompt("Enter PIN:");
              const storedPin = localStorage.getItem('lalaine_pin');
              if (!storedPin || pin === storedPin) {
                  setIsUnlockedSession(true);
              } else {
                  alert("Incorrect PIN");
              }
          }
      };

      return (
          <div className="flex-1 flex flex-col items-center justify-center text-mocha/50 bg-panel/30">
              <div className="bg-white/50 p-8 rounded-full mb-6">
                  <Lock size={48} className="text-mocha" />
              </div>
              <h2 className="text-xl font-serif font-bold text-coffee mb-2">Note Locked</h2>
              <p className="text-sm mb-6">This content is protected.</p>
              <Button onClick={handleUnlock}>Unlock Note</Button>
          </div>
      )
  }

  // AI Integration
  const handleAiAction = async (action: 'polish' | 'continue') => {
    if (!page.content.trim() || isAiLoading) return;
    
    setIsAiLoading(true);
    setShowAiMenu(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-2.5-flash';
      
      let prompt = "";
      if (action === 'polish') {
        prompt = `Rewrite the following text to be more clear, concise, and fix any grammar mistakes. Keep the tone warm and professional. Return ONLY the rewritten text, no markdown code blocks:\n\n${page.content}`;
      } else {
        prompt = `Continue the following text naturally. Add about 2-3 sentences. Return ONLY the added text:\n\n${page.content}`;
      }

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const result = response.text;

      if (result) {
        if (action === 'polish') {
          onUpdate(page.id, { content: result.trim() });
        } else {
          // Append with a space if needed
          const separator = page.content.endsWith(' ') || page.content.endsWith('\n') ? '' : ' ';
          onUpdate(page.id, { content: page.content + separator + result.trim() });
        }
      }
    } catch (error) {
      alert("AI helper is taking a nap (Error connecting).");
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Markdown Insertion Helper
  const insertSyntax = (syntax: string) => {
    if (!editorRef.current) return;
    const el = editorRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = page.content;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + syntax + after;
    onUpdate(page.id, { content: newText });
    
    // Restore focus
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + syntax.length, start + syntax.length);
    }, 0);
  };

  const handleDownload = () => {
    const blob = new Blob([page.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.title}.md`;
    a.click();
  };

  // Checkbox Toggle Logic
  const toggleCheckbox = (lineIndex: number) => {
    const lines = page.content.split('\n');
    const line = lines[lineIndex];
    if (line.includes('[ ]')) {
        lines[lineIndex] = line.replace('[ ]', '[x]');
    } else if (line.includes('[x]')) {
        lines[lineIndex] = line.replace('[x]', '[ ]');
    }
    onUpdate(page.id, { content: lines.join('\n') });
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimLine = line.trim();
      
      // Headings
      if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mb-4 mt-6 border-b border-current pb-2 opacity-90">{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mb-3 mt-5 opacity-90">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mb-2 mt-4 opacity-90">{line.slice(4)}</h3>;
      
      // Checkboxes (Interactive)
      if (trimLine.startsWith('- [ ] ') || trimLine.startsWith('- [x] ')) {
         const isChecked = trimLine.includes('[x]');
         const content = line.replace(/- \[[x ]\] /, '');
         return (
            <div key={i} className="flex gap-3 items-start mb-1 group">
               <input 
                 type="checkbox" 
                 checked={isChecked} 
                 onChange={() => toggleCheckbox(i)}
                 className="mt-1.5 w-4 h-4 cursor-pointer accent-accent rounded border-gray-300 focus:ring-accent"
               />
               <span className={`text-base leading-relaxed ${isChecked ? 'line-through opacity-50 text-mocha' : ''}`}>
                 {content}
               </span>
            </div>
         );
      }

      // Lists
      if (line.startsWith('- ')) return <li key={i} className="ml-5 list-disc mb-1 pl-1 marker:text-mocha">{line.slice(2)}</li>;
      if (/^\d+\. /.test(line)) return <li key={i} className="ml-5 list-decimal mb-1 pl-1 marker:text-mocha">{line.replace(/^\d+\. /, '')}</li>;

      // Blockquote
      if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-accent pl-4 italic opacity-80 my-2 py-1">{line.slice(2)}</blockquote>;

      // Horizontal Rule
      if (trimLine === '---' || trimLine === '***') return <hr key={i} className="my-6 border-current opacity-20" />;

      // Empty Line
      if (trimLine === '') return <br key={i} />;

      // Paragraph (with basic bold/italic parsing)
      // Note: A full markdown parser handles nested inline styles better, this is a lightweight approximation
      const parts = line.split(/(\*\*.*?\*\*)|(\*.*?\*)|(`.*?`)/g).filter(Boolean);
      return (
        <p key={i} className="mb-2 min-h-[1.5em] leading-relaxed">
           {parts.map((part, idx) => {
              if (part.startsWith('**') && part.endsWith('**')) return <strong key={idx} className="font-bold">{part.slice(2, -2)}</strong>;
              if (part.startsWith('*') && part.endsWith('*')) return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
              if (part.startsWith('`') && part.endsWith('`')) return <code key={idx} className="bg-black/10 px-1 py-0.5 rounded font-mono text-sm">{part.slice(1, -1)}</code>;
              return part;
           })}
        </p>
      );
    });
  };

  // Style Configurations
  const getStyleClasses = () => {
    switch (pageStyle) {
      case 'white': return 'bg-white text-gray-800';
      case 'yellow': return 'bg-yellow-50 text-gray-800';
      case 'dark': return 'bg-[#1e1e1e] text-gray-200';
      case 'grid': return 'bg-white text-gray-800 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]';
      case 'theme': 
      default: return 'bg-transparent text-coffee';
    }
  };

  return (
    <div className={`flex-1 flex flex-col transition-colors relative ${getStyleClasses()}`}>
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-current/10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
               <input 
                 className="bg-transparent text-4xl w-12 cursor-pointer hover:bg-black/5 rounded text-center outline-none"
                 value={page.icon}
                 onChange={e => onUpdate(page.id, { icon: e.target.value })}
               />
               {folderName && <span className="text-xs bg-accent px-2 py-0.5 rounded text-white font-medium">{folderName}</span>}
               {page.isLocked && <Lock size={16} className="text-accent" title="Locked" />}
            </div>
            <input 
              className="w-full bg-transparent text-4xl font-serif font-bold outline-none placeholder:opacity-30"
              value={page.title}
              onChange={e => onUpdate(page.id, { title: e.target.value })}
              placeholder="Untitled Note"
            />
          </div>
          <div className="flex gap-1">
             {/* Page Style Menu */}
             <div className="relative">
                <button 
                  onClick={() => setShowStyleMenu(!showStyleMenu)}
                  className="p-2 rounded hover:bg-black/5 opacity-60 hover:opacity-100 transition-all"
                  title="Page Style"
                >
                  <Palette size={20} />
                </button>
                
                {showStyleMenu && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-panel rounded-xl shadow-xl overflow-hidden z-20 border border-white/20 animate-in fade-in zoom-in-95 p-1 text-coffee">
                    <button onClick={() => { setPageStyle('theme'); setShowStyleMenu(false); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/50 flex items-center gap-2 ${pageStyle === 'theme' ? 'bg-white shadow-sm' : ''}`}>
                      <div className="w-3 h-3 rounded-full bg-accent"/> Theme Default
                    </button>
                    <button onClick={() => { setPageStyle('white'); setShowStyleMenu(false); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/50 flex items-center gap-2 ${pageStyle === 'white' ? 'bg-white shadow-sm' : ''}`}>
                      <div className="w-3 h-3 rounded-full bg-white border border-gray-200"/> Clean White
                    </button>
                    <button onClick={() => { setPageStyle('yellow'); setShowStyleMenu(false); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/50 flex items-center gap-2 ${pageStyle === 'yellow' ? 'bg-white shadow-sm' : ''}`}>
                      <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-200"/> Legal Yellow
                    </button>
                    <button onClick={() => { setPageStyle('grid'); setShowStyleMenu(false); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/50 flex items-center gap-2 ${pageStyle === 'grid' ? 'bg-white shadow-sm' : ''}`}>
                      <div className="w-3 h-3 rounded-full bg-white border border-gray-200" style={{backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '4px 4px'}}/> Grid Paper
                    </button>
                    <button onClick={() => { setPageStyle('dark'); setShowStyleMenu(false); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/50 flex items-center gap-2 ${pageStyle === 'dark' ? 'bg-white shadow-sm' : ''}`}>
                      <div className="w-3 h-3 rounded-full bg-gray-800"/> Terminal Dark
                    </button>
                  </div>
                )}
                {showStyleMenu && <div className="fixed inset-0 z-10" onClick={() => setShowStyleMenu(false)} />}
             </div>

             <button onClick={handleDownload} className="opacity-60 hover:opacity-100 p-2 rounded hover:bg-black/5">
                <Download size={20} />
             </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-2 border-b border-current/10 flex items-center justify-between bg-black/5">
        <div className="flex gap-1 items-center">
           {!isPreview && (
             <>
               <button onClick={() => insertSyntax('**')} className="p-1.5 hover:bg-black/5 rounded opacity-70 hover:opacity-100" title="Bold"><Bold size={16}/></button>
               <button onClick={() => insertSyntax('_')} className="p-1.5 hover:bg-black/5 rounded opacity-70 hover:opacity-100" title="Italic"><Italic size={16}/></button>
               <div className="w-px h-5 bg-current/10 mx-1 self-center"/>
               <button onClick={() => insertSyntax('# ')} className="p-1.5 hover:bg-black/5 rounded opacity-70 hover:opacity-100" title="Heading"><Heading size={16}/></button>
               <button onClick={() => insertSyntax('- ')} className="p-1.5 hover:bg-black/5 rounded opacity-70 hover:opacity-100" title="List"><List size={16}/></button>
               <button onClick={() => insertSyntax('- [ ] ')} className="p-1.5 hover:bg-black/5 rounded opacity-70 hover:opacity-100" title="Task"><CheckSquare size={16}/></button>
               
               <div className="w-px h-5 bg-current/10 mx-1 self-center"/>
               
               <div className="relative">
                 <button 
                   onClick={() => setShowAiMenu(!showAiMenu)}
                   disabled={isAiLoading}
                   className={`flex items-center gap-1 p-1.5 px-2 rounded transition-all ${isAiLoading ? 'bg-accent/20 cursor-wait' : 'hover:bg-accent/10 text-accent'}`}
                 >
                   {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                   <span className="text-xs font-bold">AI</span>
                 </button>
                 
                 {showAiMenu && (
                   <div className="absolute top-full left-0 mt-2 w-40 bg-panel rounded-xl shadow-xl overflow-hidden z-20 border border-white/20 animate-in fade-in zoom-in-95 text-coffee">
                     <button 
                       onClick={() => handleAiAction('continue')}
                       className="w-full text-left px-4 py-2 text-xs hover:bg-white/50 flex items-center gap-2"
                     >
                       <Type size={12} /> Continue Writing
                     </button>
                     <button 
                       onClick={() => handleAiAction('polish')}
                       className="w-full text-left px-4 py-2 text-xs hover:bg-white/50 flex items-center gap-2"
                     >
                       <Sparkles size={12} /> Polish Grammar
                     </button>
                   </div>
                 )}
                 {showAiMenu && <div className="fixed inset-0 z-10" onClick={() => setShowAiMenu(false)} />}
               </div>
             </>
           )}
           {isPreview && <span className="text-xs text-mocha/50 italic px-2">Reading Mode</span>}
        </div>

        <button 
          onClick={() => setIsPreview(!isPreview)}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors ${isPreview ? 'bg-accent text-white shadow-md' : 'bg-black/5 hover:bg-black/10'}`}
        >
          {isPreview ? <Edit3 size={14} /> : <Eye size={14} />} {isPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar relative">
        {isAiLoading && (
          <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] z-10 flex items-center justify-center">
             <div className="bg-panel px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-coffee">
                <Sparkles size={16} className="text-accent animate-spin" />
                <span className="text-xs font-bold">Lalaine is writing...</span>
             </div>
          </div>
        )}
        
        {isPreview ? (
          <div className="prose prose-sm md:prose-base max-w-none prose-headings:font-serif prose-p:text-current prose-headings:text-current prose-strong:text-current prose-ul:text-current">
            {renderMarkdown(page.content)}
          </div>
        ) : (
          <textarea
            ref={editorRef}
            className="w-full h-full bg-transparent outline-none resize-none font-sans text-base leading-relaxed placeholder:opacity-30 text-current"
            value={page.content}
            onChange={e => onUpdate(page.id, { content: e.target.value })}
            placeholder="Start writing..."
            style={{ minHeight: '500px' }} 
          />
        )}
      </div>

      {/* Footer Status */}
      <div className="px-4 py-2 text-xs opacity-40 border-t border-current/10 flex justify-between">
        <span>{page.content.length} characters</span>
        <span>Last updated: {new Date(page.updatedAt).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
