
import React from 'react';

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  projectId: string; 
}

export interface CalendarEvent {
  id: string;
  date: string; // ISO Date string (YYYY-MM-DD)
  title: string;
  isImportant: boolean;
  time?: string;
}

export enum TimerMode {
  FOCUS = 'focus',
  SHORT_BREAK = 'short',
  LONG_BREAK = 'long',
}

export interface TimerConfig {
  [TimerMode.FOCUS]: number;
  [TimerMode.SHORT_BREAK]: number;
  [TimerMode.LONG_BREAK]: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'focus' | 'tasks' | 'wellness' | 'finance' | 'general';
  icon: React.ReactNode;
  thresholdKey?: keyof UserStats;
  thresholdVal?: number;
  customCondition?: (stats: UserStats) => boolean;
}

export interface UserStats {
  pomodorosCompleted: number;
  totalFocusMinutes: number;
  todosCompleted: number;
  todosDeleted: number;
  rantsReleased: number;
  daysStreak: number;
  eventsCreated: number;
  habitsCompleted: number;
  lastActive: string | null;
  hasWorkedLate: boolean;
  hasWorkedEarly: boolean; // Before 6 AM
  themeChanged: boolean;
  profileUpdated: boolean;
  moneyTracked: number; // Total transactions added
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface NoteFolder {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

export interface NotePage {
  id: string;
  title: string;
  icon: string;
  content: string;
  updatedAt: number;
  folderId?: string; // Optional: if undefined, it's in root
}

export interface Habit {
  id: string;
  title: string;
  history: { [date: string]: boolean }; // ISO Date Key -> completed
}

export interface BudgetTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon?: string; // emoji or lucide name
}

export type ThemeType = 'latte' | 'mocha' | 'sage' | 'rose' | 'ocean' | 'lavender';
