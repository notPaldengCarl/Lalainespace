
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Star, Clock, Trash2, Maximize2, Minimize2, Cake } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { 
  format, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  endOfWeek,
  differenceInDays,
  setYear,
  getYear,
  isAfter,
  startOfToday
} from 'date-fns';
import { CalendarEvent } from '../types';

// Helpers to replace missing date-fns exports
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseISO = (str: string) => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

interface CalendarWidgetProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events, onAddEvent, onDeleteEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Date Picker Mode
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Modal State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  // Birthday Calculation
  const getDaysUntilBirthday = () => {
    const today = startOfToday();
    const currentYear = getYear(today);
    let birthday = new Date(currentYear, 3, 10); // Month is 0-indexed: 3 = April
    
    // If birthday has passed this year, look at next year
    if (isAfter(today, birthday)) {
      birthday = setYear(birthday, currentYear + 1);
    }
    
    // If today is birthday
    if (isSameDay(today, birthday)) return 0;

    return differenceInDays(birthday, today);
  };

  const daysUntilBirthday = getDaysUntilBirthday();

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Handle Opening Modal
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewEventTitle('');
    setNewEventTime('');
    setIsImportant(false);
  };

  // Handle Adding Event
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !selectedDate) return;

    onAddEvent({
      date: format(selectedDate, 'yyyy-MM-dd'),
      title: newEventTitle,
      time: newEventTime,
      isImportant
    });
    setNewEventTitle('');
    setNewEventTime('');
    setIsImportant(false);
  };

  const handleDelete = (id: string) => {
    const Swal = (window as any).Swal;
    if (Swal) {
       Swal.fire({
          title: 'Delete Event?',
          text: 'Remove this from your calendar?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete',
          customClass: {
             container: 'z-[110]' // Ensure it is above the modal
          }
       }).then((result: any) => {
          if (result.isConfirmed) onDeleteEvent(id);
       });
    } else {
       if (confirm('Delete this event?')) onDeleteEvent(id);
    }
  };

  const selectedDayEvents = selectedDate 
    ? events.filter(ev => isSameDay(parseISO(ev.date), selectedDate))
    : [];

  const handleMonthInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [y, m] = e.target.value.split('-');
    setCurrentDate(new Date(parseInt(y), parseInt(m) - 1, 1));
    setShowDatePicker(false);
  };

  return (
    <>
      <Card 
        icon={<CalendarIcon size={24} />}
        className="h-full flex flex-col relative"
        title="Calendar"
        action={
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1 bg-white/50 rounded-lg p-1 relative">
                <button onClick={prevMonth} className="p-1 hover:bg-white rounded-md text-mocha transition-colors">
                  <ChevronLeft size={16} />
                </button>
                
                {/* Clickable Month/Year or Input */}
                <div className="relative">
                  {!showDatePicker ? (
                    <button 
                      onClick={() => setShowDatePicker(true)}
                      className="text-xs md:text-sm font-medium text-coffee px-2 min-w-[70px] text-center hover:bg-white rounded transition-colors"
                      title="Click to jump to date"
                    >
                      {format(currentDate, 'MMM yyyy')}
                    </button>
                  ) : (
                    <input 
                      type="month" 
                      value={format(currentDate, 'yyyy-MM')}
                      onChange={handleMonthInput}
                      onBlur={() => setShowDatePicker(false)}
                      autoFocus
                      className="w-28 text-xs p-1 rounded border border-accent bg-white outline-none"
                    />
                  )}
                </div>

                <button onClick={nextMonth} className="p-1 hover:bg-white rounded-md text-mocha transition-colors">
                  <ChevronRight size={16} />
                </button>
             </div>
             <button 
                onClick={() => setIsExpanded(true)}
                className="p-1.5 hover:bg-white/50 rounded-lg text-mocha transition-colors"
                title="Expand Calendar"
             >
                <Maximize2 size={18} />
             </button>
          </div>
        }
      >
        <div className="h-full flex flex-col">
          
          {/* Birthday Counter Banner */}
          <div className="mb-3 bg-gradient-to-r from-pink-100 to-rose-50 p-2 rounded-xl flex items-center justify-between shadow-sm border border-pink-200">
             <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white rounded-full text-pink-500 shadow-sm">
                   <Cake size={16} />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">Her Birthday</span>
                   <span className="text-xs font-serif font-bold text-pink-800">April 10</span>
                </div>
             </div>
             <div className="text-right">
                {daysUntilBirthday === 0 ? (
                  <span className="text-xs font-bold text-pink-600 animate-pulse">Today! 🎉</span>
                ) : (
                  <span className="text-xs font-medium text-pink-500">{daysUntilBirthday} days left</span>
                )}
             </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-[10px] font-semibold text-mocha uppercase tracking-wider py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 flex-1">
            {days.map((day) => {
              const dayEvents = events.filter(ev => isSameDay(parseISO(ev.date), day));
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);
              
              return (
                <button
                  key={day.toString()}
                  onClick={() => handleDateClick(day)}
                  className={`
                    relative flex flex-col items-center justify-start py-1 rounded-lg transition-all min-h-[36px]
                    ${!isCurrentMonth ? 'text-mocha/30' : 'text-coffee'}
                    ${isToday ? 'bg-accent/10 font-bold text-accent' : ''}
                    ${isSelected ? 'ring-2 ring-accent ring-inset bg-accent/5' : 'hover:bg-white/60'}
                  `}
                >
                  <span className="text-xs z-10">{format(day, 'd')}</span>
                  
                  {/* Event Indicators */}
                  <div className="flex gap-0.5 mt-0.5 z-10">
                    {dayEvents.slice(0, 3).map((ev, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full border border-white ${ev.isImportant ? 'bg-red-400' : 'bg-accentLight'}`} 
                      />
                    ))}
                    {dayEvents.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-mocha/30" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Expanded Full Screen Calendar Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-cream/95 backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in duration-300">
          <div className="p-4 border-b border-mocha/10 flex items-center justify-between bg-panel/50">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="p-2 hover:bg-white rounded-lg transition-colors"><ChevronLeft /></button>
                  <h2 className="text-2xl font-serif font-bold text-coffee min-w-[200px] text-center">{format(currentDate, 'MMMM yyyy')}</h2>
                  <button onClick={nextMonth} className="p-2 hover:bg-white rounded-lg transition-colors"><ChevronRight /></button>
                </div>
                <button 
                  onClick={() => setCurrentDate(new Date())} 
                  className="px-3 py-1 text-sm bg-accent text-white rounded-lg hover:bg-accent/90"
                >
                  Today
                </button>
             </div>
             <button onClick={() => setIsExpanded(false)} className="p-2 hover:bg-white rounded-lg text-mocha">
               <Minimize2 />
             </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="h-full flex flex-col">
              <div className="grid grid-cols-7 mb-2 border-b border-mocha/10">
                {weekDays.map(day => (
                  <div key={day} className="p-2 font-bold text-mocha text-sm uppercase tracking-wider">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 flex-1 auto-rows-fr gap-px bg-mocha/10 border border-mocha/10 rounded-lg overflow-hidden">
                 {days.map(day => {
                    const dayEvents = events.filter(ev => isSameDay(parseISO(ev.date), day));
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    return (
                      <div 
                        key={day.toString()} 
                        onClick={() => handleDateClick(day)}
                        className={`bg-cream hover:bg-white transition-colors p-2 flex flex-col gap-1 min-h-[100px] cursor-pointer ${!isCurrentMonth ? 'opacity-50 bg-panel' : ''}`}
                      >
                         <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-accent text-white' : 'text-coffee'}`}>
                           {format(day, 'd')}
                         </span>
                         <div className="flex flex-col gap-1 mt-1">
                           {dayEvents.map(ev => (
                             <div key={ev.id} className={`text-xs px-1.5 py-0.5 rounded truncate ${ev.isImportant ? 'bg-red-100 text-red-700' : 'bg-accentLight/20 text-coffee'}`}>
                               {ev.time && <span className="opacity-70 mr-1">{ev.time}</span>}
                               {ev.title}
                             </div>
                           ))}
                         </div>
                      </div>
                    )
                 })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Modal (Event Details) */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeModal} />
          
          <div className="bg-panel rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200 border border-white/20">
            {/* Modal Header */}
            <div className="p-4 border-b border-mocha/10 flex justify-between items-center bg-white/40">
              <h3 className="font-serif text-xl font-bold text-coffee flex items-center gap-2">
                <span className="text-accent">{format(selectedDate, 'd')}</span>
                {format(selectedDate, 'MMMM yyyy')}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-black/5 rounded-full text-mocha transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 min-h-[200px] flex flex-col">
               <div className="flex-1 space-y-2 mb-4 overflow-y-auto max-h-[200px] custom-scrollbar">
                 {selectedDayEvents.length === 0 ? (
                   <div className="text-center py-8 text-mocha/50 flex flex-col items-center">
                     <Clock size={32} className="mb-2 opacity-20" />
                     <p className="text-sm">No plans for this day.</p>
                   </div>
                 ) : (
                   selectedDayEvents.map(ev => (
                     <div key={ev.id} className={`group flex items-center justify-between p-3 rounded-xl bg-white/60 border border-transparent hover:border-accentLight/30 hover:shadow-sm transition-all ${ev.isImportant ? 'border-l-4 border-l-red-400' : ''}`}>
                        <div className="flex flex-col">
                          <span className={`font-medium text-sm ${ev.isImportant ? 'text-red-800' : 'text-coffee'}`}>{ev.title}</span>
                          {ev.time && <span className="text-[10px] text-mocha font-mono">{ev.time}</span>}
                        </div>
                        <button onClick={() => handleDelete(ev.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1">
                          <Trash2 size={14} />
                        </button>
                     </div>
                   ))
                 )}
               </div>

               {/* Input Form */}
               <form onSubmit={handleAdd} className="flex flex-col gap-2 pt-4 border-t border-mocha/10">
                  <div className="flex gap-2">
                     <input
                      type="time"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="w-24 px-2 py-2.5 rounded-xl bg-white/50 border border-transparent focus:bg-white focus:border-accent outline-none text-xs text-coffee"
                    />
                    <div className="relative flex-1">
                      <input
                        autoFocus
                        type="text"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="Subject..."
                        className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-white/50 border border-transparent focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all text-sm text-coffee"
                      />
                      <button 
                        type="button" 
                        onClick={() => setIsImportant(!isImportant)}
                        className={`absolute right-2 top-2.5 p-0.5 rounded transition-colors ${isImportant ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                        title="Mark Important"
                      >
                        <Star size={16} fill={isImportant ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={!newEventTitle.trim()} className="w-full">
                    Add Plan
                  </Button>
               </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
