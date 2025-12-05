import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, title, icon, className = '', action }) => {
  return (
    <div className={`bg-panel rounded-3xl p-6 shadow-sm border border-white/50 flex flex-col h-full ${className}`}>
      {(title || icon) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {icon && <div className="text-accent">{icon}</div>}
            {title && <h2 className="font-serif text-xl font-semibold text-coffee">{title}</h2>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};