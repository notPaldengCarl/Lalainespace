
import React, { useState } from 'react';
import { Award, Lock, CheckCircle2, Filter } from 'lucide-react';
import { Card } from './Card';
import { UserStats } from '../types';
import { ACHIEVEMENT_DATA } from '../constants';

interface AchievementsProps {
  stats: UserStats;
}

export const Achievements: React.FC<AchievementsProps> = ({ stats }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [category, setCategory] = useState<string>('all');

  // Calculate unlock status for all
  const processedAchievements = ACHIEVEMENT_DATA.map(achievement => {
    let isUnlocked = false;
    let currentVal = 0;
    let targetVal = achievement.thresholdVal || 1;

    if (achievement.customCondition) {
      isUnlocked = achievement.customCondition(stats);
      currentVal = isUnlocked ? 1 : 0;
      targetVal = 1;
    } else if (achievement.thresholdKey) {
      currentVal = stats[achievement.thresholdKey] as number || 0;
      isUnlocked = currentVal >= targetVal;
    }

    return { ...achievement, isUnlocked, currentVal, targetVal };
  });

  const filtered = processedAchievements.filter(a => {
    if (filter === 'unlocked' && !a.isUnlocked) return false;
    if (filter === 'locked' && a.isUnlocked) return false;
    if (category !== 'all' && a.category !== category) return false;
    return true;
  });

  const totalUnlocked = processedAchievements.filter(a => a.isUnlocked).length;
  const progress = Math.round((totalUnlocked / processedAchievements.length) * 100);

  return (
    <Card 
      title="Achievements" 
      icon={<Award size={24} />}
      className="h-full flex flex-col"
      action={
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold text-accent px-2 py-1 bg-accent/10 rounded-lg">
             {totalUnlocked} / {processedAchievements.length}
           </span>
        </div>
      }
    >
      <div className="flex flex-col h-full gap-4">
        
        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shrink-0">
          <div 
            className="h-full bg-gradient-to-r from-accent to-accentLight transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-mocha/10">
           <select 
             value={filter} 
             onChange={(e) => setFilter(e.target.value as any)}
             className="text-xs p-1.5 rounded-lg border border-mocha/20 bg-white text-coffee outline-none"
           >
             <option value="all">All Status</option>
             <option value="unlocked">Unlocked</option>
             <option value="locked">Locked</option>
           </select>

           <div className="h-6 w-px bg-mocha/10 mx-1" />
           
           {['all', 'focus', 'tasks', 'wellness', 'finance', 'general'].map(cat => (
             <button
               key={cat}
               onClick={() => setCategory(cat)}
               className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                 category === cat ? 'bg-coffee text-white' : 'bg-white text-mocha hover:bg-gray-100'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-max">
          {filtered.map((item) => {
            const progressPercentage = Math.min(100, Math.max(0, (item.currentVal / item.targetVal) * 100));

            return (
              <div 
                key={item.id}
                className={`
                  relative p-4 rounded-xl border transition-all duration-300 flex flex-col gap-3
                  ${item.isUnlocked 
                    ? 'bg-gradient-to-br from-white to-cream border-accent/30 shadow-sm' 
                    : 'bg-white/40 border-transparent opacity-80 hover:opacity-100'}
                `}
              >
                <div className="flex items-start gap-3">
                    <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner
                        ${item.isUnlocked ? 'bg-white' : 'bg-gray-200'}
                    `}>
                        {item.isUnlocked ? item.icon : <Lock size={16} className="text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h3 className={`font-bold text-sm truncate ${item.isUnlocked ? 'text-coffee' : 'text-mocha'}`}>
                                {item.title}
                            </h3>
                            {item.isUnlocked && <CheckCircle2 size={14} className="text-accent" />}
                        </div>
                        <p className="text-[11px] text-mocha leading-tight mt-0.5">
                            {item.description}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                {!item.isUnlocked && !item.customCondition && (
                    <div className="w-full space-y-1">
                        <div className="w-full bg-gray-200/50 rounded-full h-1.5 overflow-hidden">
                            <div 
                            className="bg-accent h-full rounded-full transition-all duration-500" 
                            style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <div className="text-[10px] text-right text-mocha/60 font-medium">
                             {item.currentVal} / {item.targetVal}
                        </div>
                    </div>
                )}
                
                {item.isUnlocked && (
                    <div className="mt-auto pt-2 border-t border-mocha/5 text-[10px] text-accent font-bold uppercase tracking-wider text-center">
                        Unlocked
                    </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
