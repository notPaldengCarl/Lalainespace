
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Book, 
  Menu, 
  Maximize2, 
  Minimize2, 
  Eye,
  Download,
  Upload,
  User,
  Settings,
  X,
  Smartphone,
  Lock,
  Unlock,
  LogOut,
  Award,
  Cloud,
  Check,
  Sun,
  Moon,
  CloudRain,
  Sunrise
} from 'lucide-react';
import { Pomodoro } from './components/Pomodoro';
import { RantSpace } from './components/RantSpace';
import { TodoList } from './components/TodoList';
import { CalendarWidget } from './components/CalendarWidget';
import { SpotifyWidget } from './components/SpotifyWidget';
import { ChatBot } from './components/ChatBot';
import { Notebook } from './components/notebooks/Notebook'; 
import { HabitTracker } from './components/HabitTracker';
import { BudgetTracker } from './components/BudgetTracker';
import { QuickLinks } from './components/QuickLinks';
import { Achievements } from './components/Achievements';
import { AmbientPlayer } from './components/AmbientPlayer';
import { Button } from './components/Button';
import { TodoItem, UserStats, CalendarEvent, Habit, ThemeType } from './types';
import { INITIAL_STATS, DEFAULT_HABITS } from './constants';

type ViewMode = 'dashboard' | 'notebook' | 'achievements';

const COZY_QUOTES = [
  "Slow progress is still progress.",
  "You are doing enough.",
  "Inhale peace, exhale stress.",
  "One thing at a time.",
  "Productivity is about rhythm, not speed.",
  "Rest is a responsibility.",
  "Make it happen, then make it cozy.",
  "Bloom where you are planted.",
  "Your potential is endless.",
  "Small steps every day."
];

const App: React.FC = () => {
  // --- Global State ---
  const [view, setView] = useState<ViewMode>('dashboard');
  
  // Security State
  const [pin, setPin] = useState(() => localStorage.getItem('lalaine_pin') || '');
  const [isLocked, setIsLocked] = useState(() => !!localStorage.getItem('lalaine_pin'));
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Exclusive UI States
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // User & Sync State
  const [user, setUser] = useState<{name: string, email?: string, photo?: string}>(() => {
    const saved = localStorage.getItem('lalaine_user_profile');
    return saved ? JSON.parse(saved) : { name: 'Lalaine', email: undefined, photo: undefined };
  });
  const [isSyncEnabled, setIsSyncEnabled] = useState(false);

  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  const [focusMode, setFocusMode] = useState(false);
  const [theme, setTheme] = useState<ThemeType>(() => (localStorage.getItem('lalaine_theme') as ThemeType) || 'latte');

  // --- Widget Visibility State ---
  const [visibleWidgets, setVisibleWidgets] = useState({
    habits: true,
    calendar: true,
    spotify: true,
    rant: true,
    budget: true,
    quicklinks: true,
    ambient: true,
  });
  const [isCustomizing, setIsCustomizing] = useState(false);

  // --- Data State ---
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('lalaine_todos');
    return saved ? JSON.parse(saved) : [];
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('lalaine_events');
    return saved ? JSON.parse(saved) : [];
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('lalaine_habits');
    return saved ? JSON.parse(saved) : DEFAULT_HABITS;
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('lalaine_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  // Daily Quote State
  const [dailyQuote, setDailyQuote] = useState("");

  // --- Effects ---
  useEffect(() => { localStorage.setItem('lalaine_todos', JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem('lalaine_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('lalaine_habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('lalaine_stats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('lalaine_user_profile', JSON.stringify(user)); }, [user]);
  
  // Theme Application
  useEffect(() => {
    localStorage.setItem('lalaine_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Set Daily Quote
  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyQuote(COZY_QUOTES[dayOfYear % COZY_QUOTES.length]);
  }, []);

  // PWA Install Listener
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsAppInstalled(false);
    };
    
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsAppInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsAppInstalled(true));
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Streak Calculation
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = stats.lastActive ? stats.lastActive.split('T')[0] : null;

    if (lastActive !== today) {
      setStats(prev => {
        const isConsecutive = lastActive && 
          new Date(today).getTime() - new Date(lastActive).getTime() === 86400000;
        
        return {
          ...prev,
          lastActive: new Date().toISOString(),
          daysStreak: isConsecutive ? prev.daysStreak + 1 : 1
        };
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Handlers ---
  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setSidebarOpen(newState);
    if (newState) setIsChatOpen(false); // Close chat if sidebar opens
  };

  const toggleChat = () => {
    const newState = !isChatOpen;
    setIsChatOpen(newState);
    if (newState) setSidebarOpen(false); // Close sidebar if chat opens
  };

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setInstallPrompt(null);
        }
      });
    } else {
      // Manual Instructions
      const Swal = (window as any).Swal;
      if (Swal) {
        Swal.fire({
          icon: 'info',
          title: 'Install App',
          text: 'To install Lalaine, look for the "Install" icon in your browser address bar (top right), or click the browser menu (⋮) and select "Install Lalaine".',
          confirmButtonColor: 'var(--color-accent)'
        });
      } else {
        alert('To install, click the "Install" icon in your browser address bar or menu.');
      }
    }
  };

  // --- Security Logic ---
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === pin) {
      setIsLocked(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Incorrect PIN');
      setPinInput('');
    }
  };

  const handleSetPin = () => {
    const newPin = prompt("Enter a new 4-digit PIN:");
    if (newPin && newPin.length === 4 && !isNaN(Number(newPin))) {
      setPin(newPin);
      localStorage.setItem('lalaine_pin', newPin);
      alert("Security PIN set! You will need this to enter the app next time.");
    } else if (newPin) {
      alert("Invalid PIN. Please enter exactly 4 digits.");
    }
  };

  const handleRemovePin = () => {
    if (confirm("Remove security PIN? Anyone on this device can access your data.")) {
      setPin('');
      localStorage.removeItem('lalaine_pin');
    }
  };

  const handleLockNow = () => {
    setIsLocked(true);
    setSidebarOpen(false);
  };

  // --- Google Auth Simulation ---
  const handleGoogleSignIn = () => {
    // This is a simulation since we can't implement real OAuth in this environment
    const Swal = (window as any).Swal;
    if (Swal) {
      let timerInterval: any;
      Swal.fire({
        title: 'Connecting to Google...',
        html: 'Authenticating secure session...',
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        },
        willClose: () => {
          clearInterval(timerInterval);
        }
      }).then((result: any) => {
         // Simulate successful login
         setUser({
           name: 'Lalaine User',
           email: 'user@example.com',
           photo: 'https://ui-avatars.com/api/?name=Lalaine+User&background=B78A67&color=fff'
         });
         setIsSyncEnabled(true);
         setStats(prev => ({ ...prev, profileUpdated: true }));
         
         Swal.fire({
           icon: 'success',
           title: 'Signed In',
           text: 'Your account is now connected. Cloud sync is active (Demo Mode).',
           timer: 2000,
           showConfirmButton: false
         });
      });
    }
  };

  const handleSignOut = () => {
    setUser({ name: 'Lalaine', email: undefined, photo: undefined });
    setIsSyncEnabled(false);
  };

  // --- Data Backup & Restore ---
  const handleBackup = () => {
    const data = {
      username: user.name,
      todos,
      events,
      habits,
      stats,
      theme,
      notebook_folders: JSON.parse(localStorage.getItem('lalaine_notebook_folders') || '[]'),
      notebook_pages: JSON.parse(localStorage.getItem('lalaine_notebook_pages') || '[]'),
      budget: JSON.parse(localStorage.getItem('lalaine_budget') || '[]'),
      quicklinks: JSON.parse(localStorage.getItem('lalaine_quicklinks_v2') || '[]'),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lalaine_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Basic validation
        if (!data.timestamp) throw new Error('Invalid backup file');

        if (confirm(`Restore data from ${new Date(data.timestamp).toLocaleDateString()}? This will replace your current data.`)) {
          // Restore LocalStorage
          if(data.username) setUser(prev => ({...prev, name: data.username}));
          if(data.todos) localStorage.setItem('lalaine_todos', JSON.stringify(data.todos));
          if(data.events) localStorage.setItem('lalaine_events', JSON.stringify(data.events));
          if(data.habits) localStorage.setItem('lalaine_habits', JSON.stringify(data.habits));
          if(data.stats) localStorage.setItem('lalaine_stats', JSON.stringify(data.stats));
          if(data.notebook_folders) localStorage.setItem('lalaine_notebook_folders', JSON.stringify(data.notebook_folders));
          if(data.notebook_pages) localStorage.setItem('lalaine_notebook_pages', JSON.stringify(data.notebook_pages));
          if(data.budget) localStorage.setItem('lalaine_budget', JSON.stringify(data.budget));
          if(data.quicklinks) localStorage.setItem('lalaine_quicklinks_v2', JSON.stringify(data.quicklinks));
          if(data.theme) localStorage.setItem('lalaine_theme', data.theme);

          // Reload to apply
          window.location.reload();
        }
      } catch (err) {
        alert('Failed to restore data. Invalid file format.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // --- Widget Handlers ---
  const handleAddTodo = (text: string, projectId: string) => {
    const newTodo: TodoItem = { id: Date.now().toString(), text, completed: false, createdAt: Date.now(), projectId };
    const hour = new Date().getHours();
    
    // Stats Update
    setStats(prev => ({ 
      ...prev, 
      hasWorkedLate: prev.hasWorkedLate || hour >= 22,
      hasWorkedEarly: prev.hasWorkedEarly || hour < 6
    }));
    
    setTodos([newTodo, ...todos]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map(t => {
      if (t.id === id) {
        if (!t.completed) setStats(prev => ({ ...prev, todosCompleted: prev.todosCompleted + 1 }));
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
    setStats(prev => ({ ...prev, todosDeleted: (prev.todosDeleted || 0) + 1 }));
  };

  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    setEvents([...events, { ...eventData, id: Date.now().toString() }]);
    setStats(prev => ({ ...prev, eventsCreated: (prev.eventsCreated || 0) + 1 }));
  };

  const handleDeleteEvent = (id: string) => setEvents(events.filter(e => e.id !== id));
  
  const handlePomodoroComplete = () => {
    const hour = new Date().getHours();
    setStats(prev => ({ 
        ...prev, 
        pomodorosCompleted: prev.pomodorosCompleted + 1,
        totalFocusMinutes: (prev.totalFocusMinutes || 0) + 25, // Assuming 25min default
        hasWorkedLate: prev.hasWorkedLate || hour >= 22,
        hasWorkedEarly: prev.hasWorkedEarly || hour < 6
    }));
  };
  
  const handleRantReleased = () => setStats(prev => ({ ...prev, rantsReleased: prev.rantsReleased + 1 }));

  // Habit Handlers
  const handleToggleHabit = (id: string, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const isCompleted = !h.history[date];
        if (isCompleted) {
            setStats(s => ({ ...s, habitsCompleted: (s.habitsCompleted || 0) + 1 }));
        }
        return {
          ...h,
          history: { ...h.history, [date]: isCompleted }
        };
      }
      return h;
    }));
  };

  const handleAddHabit = (title: string) => {
    setHabits([...habits, { id: Date.now().toString(), title, history: {} }]);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const handleThemeChange = (newTheme: ThemeType) => {
     setTheme(newTheme);
     setStats(prev => ({...prev, themeChanged: true }));
  }

  // Greeting Logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return { text: "Up late?", icon: <Moon size={24} className="text-indigo-400" /> };
    if (hour < 12) return { text: "Good Morning,", icon: <Sunrise size={24} className="text-orange-400" /> };
    if (hour < 18) return { text: "Good Afternoon,", icon: <Sun size={24} className="text-yellow-500" /> };
    return { text: "Good Evening,", icon: <Moon size={24} className="text-indigo-900" /> };
  };

  const greeting = getGreeting();

  // Detect Electron
  const isElectron = typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent);

  // --- LOCK SCREEN RENDER ---
  if (isLocked) {
    return (
      <div className="h-screen w-screen bg-cream flex flex-col items-center justify-center p-4">
        <div className="bg-panel p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border border-white/20 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-accent rounded-2xl mx-auto flex items-center justify-center text-white mb-6 shadow-lg">
             <Lock size={32} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-coffee mb-2">Welcome Back</h2>
          <p className="text-mocha text-sm mb-6">Please enter your PIN to continue.</p>
          
          <form onSubmit={handleUnlock} className="space-y-4">
            <input 
              autoFocus
              type="password" 
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full text-center text-3xl tracking-[1em] py-3 rounded-xl bg-white/50 border border-transparent focus:border-accent outline-none text-coffee font-serif"
              placeholder="••••"
            />
            {pinError && <p className="text-red-500 text-xs font-bold">{pinError}</p>}
            
            <Button type="submit" className="w-full py-3">Unlock</Button>
          </form>
          
          <p className="mt-6 text-xs text-mocha/50 italic">
            Forgot PIN? Clearing your browser data will reset it (and your data).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-cream text-coffee overflow-hidden font-sans transition-colors duration-500">
      
      {/* Mobile/Tablet Sidebar Overlay (Hidden on Large screens) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`
          fixed lg:relative z-50 h-full w-64 bg-panel border-r border-white/20 flex flex-col transition-all duration-300 shadow-xl lg:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${focusMode ? 'lg:-ml-64' : ''}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-8 cursor-pointer group" onClick={() => setIsAccountModalOpen(true)}>
            <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform overflow-hidden">
               {user.photo ? <img src={user.photo} alt="user" className="w-full h-full object-cover" /> : <User size={18} />}
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-coffee leading-none mb-1 truncate max-w-[140px]">
                {user.name}
              </h1>
              <p className="text-[10px] text-mocha uppercase tracking-wider flex items-center gap-1">
                 My Account <Settings size={10} />
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => { setView('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                view === 'dashboard' ? 'bg-white shadow-sm text-accent font-medium' : 'text-mocha hover:bg-white/50'
              }`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>
            <button
              onClick={() => { setView('notebook'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                view === 'notebook' ? 'bg-white shadow-sm text-accent font-medium' : 'text-mocha hover:bg-white/50'
              }`}
            >
              <Book size={20} />
              Notebook
            </button>
            <button
              onClick={() => { setView('achievements'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                view === 'achievements' ? 'bg-white shadow-sm text-accent font-medium' : 'text-mocha hover:bg-white/50'
              }`}
            >
              <Award size={20} />
              Achievements
            </button>
            
            {/* Install Button (Always visible on web unless installed) */}
            {!isAppInstalled && !isElectron && (
              <button
                onClick={handleInstallClick}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${installPrompt ? 'text-accent animate-pulse bg-accent/5' : 'text-mocha hover:bg-white/50 opacity-70'}`}
              >
                <Smartphone size={20} />
                Install App
              </button>
            )}

            {/* Lock Button */}
            {pin && (
              <button
                 onClick={handleLockNow}
                 className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-mocha hover:bg-white/50 transition-all font-medium mt-4 border-t border-mocha/10"
              >
                <LogOut size={20} />
                Lock App
              </button>
            )}
          </nav>
        </div>
        
        {/* Theme Selector */}
        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold text-mocha uppercase tracking-wider mb-3">Theme</h3>
          <div className="grid grid-cols-6 gap-2">
             {[
               { id: 'latte', color: '#FBF7F3' }, 
               { id: 'mocha', color: '#3D322C' }, 
               { id: 'sage', color: '#E2E8E1' },
               { id: 'rose', color: '#FFE4E8' },
               { id: 'ocean', color: '#F0F4F8' },
               { id: 'lavender', color: '#F7F5FA' }
             ].map(t => (
               <button
                key={t.id}
                onClick={() => handleThemeChange(t.id as ThemeType)}
                className={`
                  w-6 h-6 rounded-full border border-mocha/20 transition-transform hover:scale-110 shadow-sm
                  ${theme === t.id ? 'border-accent scale-110 ring-2 ring-accent/20' : ''}
                `}
                style={{ backgroundColor: t.color }}
                title={t.id}
               />
             ))}
          </div>
        </div>
        
        {/* Quick Links in Sidebar (Visible if toggled) */}
        {visibleWidgets.quicklinks && (
           <QuickLinks variant="sidebar" />
        )}

        {/* Sidebar Footer */}
        <div className="mt-auto p-6 border-t border-white/20">
          <div className="bg-white/30 rounded-xl p-4">
            <div className="flex justify-between items-center text-xs text-mocha mb-2">
              <span>Daily Streak</span>
              <span className="font-bold text-accent">{stats.daysStreak} days</span>
            </div>
            <div className="w-full bg-black/5 rounded-full h-1.5 overflow-hidden">
              <div className="bg-accent h-full w-3/4 rounded-full" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/20 bg-cream/80 backdrop-blur-sm z-30 sticky top-0 transition-colors duration-500">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-white/50 rounded-lg text-coffee active:scale-95 transition-transform"
            >
              <Menu size={20} />
            </button>
            
            <h2 className="text-lg font-medium text-mocha hidden md:block capitalize font-serif">
              {view}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {view === 'dashboard' && (
              <button
                onClick={() => setIsCustomizing(!isCustomizing)}
                className={`p-2 rounded-lg transition-all ${isCustomizing ? 'bg-accent text-white' : 'hover:bg-white/50 text-mocha'}`}
                title="Customize Widgets"
              >
                <Eye size={18} />
              </button>
            )}
            
            <div className="h-6 w-px bg-mocha/20 mx-1" />

            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${
                focusMode ? 'bg-accent text-white shadow-md' : 'bg-white/50 text-mocha hover:bg-white'
              }`}
              title="Toggle Focus Mode"
            >
              {focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span className="hidden sm:inline">{focusMode ? 'Exit Focus' : 'Focus'}</span>
            </button>
          </div>
        </header>

        {/* Customization Bar (Visible when customization is active) */}
        {isCustomizing && view === 'dashboard' && (
          <div className="bg-panel border-b border-white/20 p-4 flex flex-wrap gap-4 items-center justify-center animate-in slide-in-from-top-2">
            <span className="text-xs font-bold text-mocha uppercase mr-2">Toggle Widgets:</span>
            {Object.keys(visibleWidgets).map(key => (
              <button
                key={key}
                onClick={() => setVisibleWidgets(prev => ({ ...prev, [key]: !prev[key as keyof typeof visibleWidgets] }))}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${
                  visibleWidgets[key as keyof typeof visibleWidgets] 
                    ? 'bg-accent text-white border-accent' 
                    : 'bg-transparent text-mocha border-mocha/30 hover:border-mocha'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            
            {/* VIEW: DASHBOARD */}
            {view === 'dashboard' && (
              <div className="flex flex-col gap-6 pb-20">
                
                {/* Greeting Widget */}
                <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-2">
                   <div>
                      <div className="flex items-center gap-2 text-coffee">
                         {greeting.icon}
                         <h1 className="font-serif text-2xl md:text-3xl font-bold">{greeting.text} {user.name.split(' ')[0]}</h1>
                      </div>
                      <p className="text-mocha text-sm mt-1 italic opacity-80">"{dailyQuote}"</p>
                   </div>
                   
                   {/* Mini Weather/Status (Static for now to fit constraints, could be API later) */}
                   <div className="flex items-center gap-3 bg-white/40 px-4 py-2 rounded-xl backdrop-blur-sm">
                      <CloudRain size={20} className="text-accent" />
                      <div className="flex flex-col">
                         <span className="text-xs font-bold text-coffee">Cozy Weather</span>
                         <span className="text-[10px] text-mocha">Perfect for focus</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
                  {/* HERO ROW: CALENDAR */}
                  {visibleWidgets.calendar && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-12 min-h-[400px]">
                      <CalendarWidget 
                        events={events}
                        onAddEvent={handleAddEvent}
                        onDeleteEvent={handleDeleteEvent}
                      />
                    </div>
                  )}

                  {/* PRODUCTIVITY ROW: TODO & FOCUS */}
                  <div className="col-span-1 md:col-span-1 lg:col-span-7 h-full min-h-[500px]">
                      <TodoList 
                        todos={todos} 
                        onAdd={handleAddTodo} 
                        onToggle={handleToggleTodo} 
                        onDelete={handleDeleteTodo} 
                      />
                  </div>

                  <div className="col-span-1 md:col-span-1 lg:col-span-5 flex flex-col gap-6">
                    <Pomodoro onComplete={handlePomodoroComplete} />
                    {visibleWidgets.habits && (
                      <div className="flex-1 min-h-[300px]">
                        <HabitTracker 
                          habits={habits}
                          onToggleHabit={handleToggleHabit}
                          onAddHabit={handleAddHabit}
                          onDeleteHabit={handleDeleteHabit}
                        />
                      </div>
                    )}
                  </div>

                  {/* UTILITY ROW: BUDGET, RANT, MEDIA */}
                  {visibleWidgets.budget && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-4 min-h-[400px]">
                        <BudgetTracker />
                    </div>
                  )}

                  {visibleWidgets.rant && (
                    <div className="col-span-1 md:col-span-1 lg:col-span-4 min-h-[400px]">
                        <RantSpace onRantReleased={handleRantReleased} />
                    </div>
                  )}

                  <div className="col-span-1 md:col-span-1 lg:col-span-4 space-y-6">
                    {visibleWidgets.ambient && (
                      <div className="h-[140px] flex-shrink-0">
                        <AmbientPlayer />
                      </div>
                    )}

                    {visibleWidgets.spotify && (
                      <div className="h-[220px] flex-shrink-0">
                        <SpotifyWidget />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: NOTEBOOK */}
            {view === 'notebook' && (
              <div className="h-[calc(100dvh-5rem)] md:h-[calc(100dvh-6rem)]">
                <Notebook />
              </div>
            )}

             {/* VIEW: ACHIEVEMENTS */}
             {view === 'achievements' && (
              <div className="h-[calc(100dvh-5rem)] md:h-[calc(100dvh-6rem)]">
                <Achievements stats={stats} />
              </div>
            )}

          </div>
        </div>

        {/* ChatBot is always available but controlled by App to manage exclusion with Sidebar */}
        <ChatBot isOpen={isChatOpen} onToggle={toggleChat} />

        {/* Account Modal */}
        {isAccountModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cream/90 backdrop-blur-sm animate-in fade-in">
             <div className="bg-panel w-full max-w-md rounded-3xl shadow-2xl p-6 border border-white/20 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
               <button 
                onClick={() => setIsAccountModalOpen(false)}
                className="absolute right-4 top-4 text-mocha hover:text-coffee"
               >
                 <X size={20} />
               </button>
               
               <div className="text-center mb-6">
                 <div className="w-20 h-20 bg-accent rounded-full mx-auto flex items-center justify-center text-white mb-3 shadow-lg border-4 border-white overflow-hidden">
                   {user.photo ? <img src={user.photo} alt="User" className="w-full h-full object-cover" /> : <User size={32} />}
                 </div>
                 <h2 className="text-2xl font-serif font-bold text-coffee">{user.name}</h2>
                 <p className="text-sm text-mocha">{user.email || 'Offline Account'}</p>
                 
                 {isSyncEnabled && (
                   <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold mt-2 uppercase tracking-wide">
                     <Cloud size={10} /> Sync Active
                   </span>
                 )}
               </div>

               <div className="space-y-6">
                 
                 {/* Google Auth Section */}
                 {!user.email ? (
                   <button 
                     onClick={handleGoogleSignIn}
                     className="w-full py-3 bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                   >
                     <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-5 h-5" alt="Google" />
                     Sign in with Google
                   </button>
                 ) : (
                    <button 
                     onClick={handleSignOut}
                     className="w-full py-2 border border-red-200 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-50"
                   >
                     Sign Out
                   </button>
                 )}

                 {/* Name Edit */}
                 <div className="bg-white/50 p-3 rounded-xl">
                   <label className="text-xs font-bold uppercase text-mocha/60 block mb-1">Display Name</label>
                   <input 
                     value={user.name}
                     onChange={(e) => {
                       setUser(prev => ({ ...prev, name: e.target.value }));
                     }}
                     className="w-full bg-transparent text-coffee font-semibold outline-none"
                   />
                 </div>
                 
                 {/* Security Section */}
                 <div>
                    <h3 className="text-xs font-bold uppercase text-mocha/60 mb-2 flex items-center gap-2">
                       <Lock size={12} /> Device Security
                    </h3>
                    <div className="bg-white/50 p-3 rounded-xl space-y-2">
                      {pin ? (
                        <div className="flex items-center justify-between">
                           <span className="text-sm text-coffee font-medium flex items-center gap-2">
                             <Lock size={14} className="text-accent" /> PIN is Active
                           </span>
                           <button onClick={handleRemovePin} className="text-xs text-red-500 hover:underline">Remove</button>
                        </div>
                      ) : (
                        <button 
                          onClick={handleSetPin}
                          className="w-full flex items-center justify-between text-sm text-coffee hover:bg-white/50 p-2 rounded-lg transition-colors"
                        >
                          <span>Set Security PIN</span>
                          <Unlock size={14} className="text-mocha" />
                        </button>
                      )}
                    </div>
                 </div>

                 <div className="h-px bg-mocha/10" />

                 {/* Sync Section */}
                 <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase text-mocha/60 mb-2 flex items-center gap-2">
                       <Upload size={12} /> Manual Backup
                    </h3>
                   
                   <button 
                    onClick={handleBackup}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-white text-coffee rounded-xl shadow-sm hover:bg-white/80 transition-all border border-transparent hover:border-accent"
                   >
                     <Download size={18} />
                     Save Data (Backup)
                   </button>
                   
                   <div className="relative">
                     <button className="w-full flex items-center justify-center gap-2 p-3 bg-accent text-white rounded-xl shadow-md hover:bg-accent/90 transition-all">
                       <Upload size={18} />
                       Restore Data (Load)
                     </button>
                     <input 
                       type="file" 
                       accept=".json"
                       onChange={handleRestore}
                       className="absolute inset-0 opacity-0 cursor-pointer"
                     />
                   </div>
                 </div>
               </div>
               
               {/* Footer Info */}
               <div className="mt-8 pt-4 border-t border-mocha/10 text-center text-[10px] text-mocha/40">
                  Lalaine v1.3 &bull; Cloud Enabled
               </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
