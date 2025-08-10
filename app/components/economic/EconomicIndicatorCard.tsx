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

  // Alguns indicadores principais devem sempre aparecer em laranja
  // Normaliza acentos e compara títulos conhecidos: COOPERADOS, ATIVOS, AGÊNCIAS
  const normalize = (s: string) => s
    .normalize('NFD')
    // Remove marcas diacríticas (faixa Unicode de combinadores)
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
  const highlightedTitles = new Set(['COOPERADOS', 'ATIVOS', 'AGENCIAS']);
  const isHighlighted = highlightedTitles.has(normalize(title));

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
          className={`economic-indicator-value ${isHighlighted ? 'text-primary' : ''}`}
          style={isHighlighted ? { color: 'var(--color-primary)' } : undefined}
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