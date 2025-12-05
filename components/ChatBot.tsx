
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, Bot, Trash2, Zap, Coffee } from 'lucide-react';
import { Button } from './Button';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types';

const SUGGESTIONS = [
  { icon: <Sparkles size={14} />, text: "Motivation boost ✨", prompt: "I need a quick motivation boost! Give me a short, inspiring quote or affirmation." },
  { icon: <Coffee size={14} />, text: "Break idea ☕", prompt: "I need a break. Give me a 5-minute restorative activity idea." },
  { icon: <Bot size={14} />, text: "Focus hack 🧠", prompt: "I'm having trouble concentrating. Give me one specific, actionable focus tip." },
  { icon: <Zap size={14} />, text: "Roast me 🔥", prompt: "Playfully roast me for procrastinating, but keep it friendly and motivating." },
];

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onToggle }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const processMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: "You are Lalaine, a warm, cozy, and supportive productivity companion. You help the user stay focused, offer gentle encouragement, and listen to their rants or ideas. Your tone is soft, friendly, and aesthetic (think beige, coffee, lo-fi vibes). Keep responses concise but kind. If the user asks for help, provide actionable but gentle advice. Use bolding (**text**) for emphasis.",
        },
        history: history
      });

      const result = await chat.sendMessage({ message: userMsg.text });
      const responseText = result.text;

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having a little trouble thinking right now. Maybe try again? ☕" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    processMessage(input);
  };

  const handleReset = () => {
    setMessages([]);
    setShowSuggestions(true);
  };

  // Helper to format text with bolding
  const formatMessage = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-coffee">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center ${isOpen ? 'bg-mocha rotate-90' : 'bg-accent'} text-white hover:bg-opacity-90`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      <div 
        className={`
          fixed bottom-24 right-6 w-[90vw] md:w-[400px] bg-cream/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 z-40 overflow-hidden transition-all duration-300 origin-bottom-right flex flex-col
          ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'}
        `}
        style={{ height: 'min(600px, 70vh)' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-panel to-white p-4 flex items-center justify-between border-b border-accentLight/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 p-2 rounded-full ring-2 ring-white">
              <Bot size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-coffee">Lalaine AI</h3>
              <p className="text-xs text-mocha flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <div className="flex gap-1">
             <button 
              onClick={() => setShowSuggestions(!showSuggestions)}
              className={`p-2 rounded-xl transition-colors ${showSuggestions ? 'bg-accent/10 text-accent' : 'text-mocha hover:bg-black/5'}`}
              title="Toggle Suggestions"
            >
              <Zap size={16} />
            </button>
            <button 
              onClick={handleReset}
              className="p-2 text-mocha hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="Reset Chat"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white/30 relative">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-mocha/60 p-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                 <Sparkles size={32} className="text-accentLight" />
              </div>
              <p className="text-sm font-medium text-coffee mb-1">Hi there! I'm Lalaine.</p>
              <p className="text-xs mb-6">I'm here to help you focus or just chat.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div 
                className={`
                  max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-accent text-white rounded-br-none' 
                    : 'bg-white text-coffee border border-white rounded-bl-none'}
                `}
              >
                {formatMessage(msg.text)}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-in fade-in">
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-white shadow-sm flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-accent" />
                <span className="text-xs text-mocha">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions (Overlay) */}
        {showSuggestions && !isLoading && (
            <div className="bg-white/40 backdrop-blur-sm p-2 border-t border-white overflow-x-auto">
              <div className="flex gap-2 min-w-max px-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => processMessage(s.prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-accentLight/20 rounded-full text-xs text-coffee hover:bg-accent hover:text-white hover:border-accent transition-all shadow-sm whitespace-nowrap"
                  >
                    {s.icon} {s.text}
                  </button>
                ))}
              </div>
            </div>
          )}

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-accentLight/20 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-panel focus:bg-white border-none focus:ring-2 focus:ring-accentLight/50 outline-none text-coffee placeholder:text-mocha/50 transition-all text-sm"
          />
          <Button type="submit" size="md" disabled={!input.trim() || isLoading} className="!px-3 aspect-square flex items-center justify-center">
            <Send size={18} className={input.trim() ? "text-white" : ""} />
          </Button>
        </form>
      </div>
    </>
  );
};
