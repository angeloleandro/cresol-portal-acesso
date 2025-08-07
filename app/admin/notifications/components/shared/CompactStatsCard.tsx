import React from 'react';

interface CompactStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary';
}

export const CompactStatsCard: React.FC<CompactStatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'primary' 
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-3">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </p>
        <p className={`text-lg font-bold ${
          color === 'primary' ? 'text-primary' : 'text-secondary'
        }`}>
          {value}
        </p>
      </div>
      <div className={`p-2 rounded-lg ${
        color === 'primary' 
          ? 'bg-primary/10 text-primary' 
          : 'bg-secondary/10 text-secondary'
      }`}>
        {icon}
      </div>
    </div>
  </div>
);