'use client';

import { Icon } from '../icons/Icon';

interface EconomicIndicatorCardProps {
  title: string;
  value: string;
  icon: string;
  description?: string;
  index: number;
}

const iconMap: Record<string, string> = {
  users: 'user-group',
  building: 'building-1',
  bank: 'building-2',
  money: 'suitcase',
  treasure: 'chart-bar-vertical',
  'piggy-bank': 'suitcase',
  handshake: 'user-check',
  tractor: 'building-1',
  briefcase: 'suitcase',
};

export default function EconomicIndicatorCard({ 
  title, 
  value, 
  icon, 
  description, 
  index 
}: EconomicIndicatorCardProps) {
  const iconName = iconMap[icon] || 'suitcase';

  return (
    <article
      className="economic-indicator-card"
      aria-labelledby={`indicator-${index}-title`}
    >
      <div className="flex flex-col items-center">
        {/* Icon Container */}
        <div className="economic-indicator-icon-container">
          <Icon 
            name={iconName as any} 
            className="h-5 w-5 economic-indicator-icon" 
          />
        </div>
        
        {/* Value */}
        <div 
          className="economic-indicator-value"
          aria-label={`Valor: ${value}`}
        >
          {value}
        </div>
        
        {/* Title */}
        <h3 
          id={`indicator-${index}-title`}
          className="economic-indicator-title"
        >
          {title}
        </h3>
      </div>
    </article>
  );
}