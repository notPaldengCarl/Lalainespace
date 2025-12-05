
import React, { useState } from 'react';
import { CheckCircle2, Plus, Trash2, Activity } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Habit } from '../types';
import { format, addDays } from 'date-fns';

interface HabitTrackerProps {
  habits: Habit[];
  onToggleHabit: (id: string, date: string) => void;
  onAddHabit: (title: string) => void;
  onDeleteHabit: (id: string) => void;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, onToggleHabit, onAddHabit, onDeleteHabit }) => {
  const [newHabit, setNewHabit] = useState('');
  
  // Generate Today + Next 3 Days (Sliding Window)
  const displayDays = Array.from({ length: 4 }).map((_, i) => {
    return format(addDays(new Date(), i), 'yyyy-MM-dd');
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabit.trim()) {
      onAddHabit(newHabit);
      setNewHabit('');
    }
  };

  const confirmDelete = (id: string) => {
    const Swal = (window as any).Swal;
    if (Swal) {
      Swal.fire({
        title: 'Stop tracking?',
        text: 'This will delete the habit and its history.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it'
      }).then((result: any) => {
        if (result.isConfirmed) {
           onDeleteHabit(id);
        }
      });
    } else {
      if(confirm('Delete this habit?')) onDeleteHabit(id);
    }
  };

  return (
    <Card 
      title="Habit Tracker" 
      icon={<Activity size={24} />} 
      className="h-full"
    >
      <div className="flex flex-col h-full gap-4">
        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="New habit..."
            className="flex-1 px-3 py-2 rounded-xl bg-white border border-transparent focus:border-accentLight outline-none text-sm"
          />
          <Button type="submit" size="sm" disabled={!newHabit.trim()}>
            <Plus size={18} />
          </Button>
        </form>

        {/* Header Grid: Title Area + Date Columns */}
        <div className="flex items-center justify-between px-2 pr-4 border-b border-mocha/10 pb-2">
          <span className="text-[10px] text-mocha uppercase tracking-wider font-semibold">Habit</span>
          <div className="flex gap-2">
            {displayDays.map(d => {
               const isToday = d === format(new Date(), 'yyyy-MM-dd');
               return (
                 <div key={d} className={`w-10 text-center text-[10px] uppercase flex flex-col items-center ${isToday ? 'font-bold text-accent' : 'text-mocha'}`}>
                   <span>{format(new Date(d), 'MMM')}</span>
                   <span className="text-xs">{format(new Date(d), 'd')}</span>
                 </div>
               );
            })}
          </div>
        </div>

        {/* Habit List */}
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar max-h-[400px]">
          {habits.length === 0 && (
             <p className="text-sm text-mocha/60 italic text-center py-4">Start a new healthy routine.</p>
          )}

          {habits.map(habit => (
            <div key={habit.id} className="group bg-white/50 rounded-xl p-2 pl-3 flex items-center justify-between hover:bg-white transition-all">
              
              {/* Title & Delete */}
              <div className="flex items-center gap-2 min-w-0 overflow-hidden flex-1 mr-2">
                <button 
                  onClick={() => confirmDelete(habit.id)}
                  // Visible on mobile (default), opacity-0 on md+ until hover
                  // This ensures delete is easy to tap on mobile and doesn't require double-tap simulation
                  className="text-mocha/30 hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 cursor-pointer z-10"
                >
                  <Trash2 size={14} />
                </button>
                <span className="font-medium text-coffee text-sm truncate" title={habit.title}>{habit.title}</span>
              </div>

              {/* Day Dots Container */}
              <div className="flex gap-2 pr-2">
                {displayDays.map(date => {
                  const isCompleted = habit.history[date];
                  
                  return (
                    <button
                      key={date}
                      onClick={() => onToggleHabit(habit.id, date)}
                      className={`
                        w-10 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 flex-shrink-0
                        ${isCompleted ? 'bg-accent text-white shadow-sm' : 'bg-gray-200/50 hover:bg-accent/20 text-transparent'}
                      `}
                      title={date}
                    >
                      {isCompleted && <CheckCircle2 size={16} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
