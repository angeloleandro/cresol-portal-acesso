'use client';

import { memo } from 'react';

import { Icon } from '@/app/components/icons/Icon';

interface MetricCardData {
  /** Título do indicador */
  title: string;
  /** Valor principal */
  value: number | string;
  /** Valor anterior para comparação */
  previousValue?: number;
  /** Ícone contextual */
  icon?: string;
  /** Descrição adicional */
  description?: string;
  /** Sufixo da unidade */
  unit?: string;
  /** Tendência (up/down/stable) */
  trend?: 'up' | 'down' | 'stable';
  /** Cor personalizada */
  color?: 'orange' | 'green' | 'blue' | 'purple' | 'red' | 'gray';
  /** Função de clique */
  onClick?: () => void;
  /** Estado de carregamento */
  isLoading?: boolean;
  /** Classe adicional */
  className?: string;
}

interface MetricCardsProps {
  /** Array de dados dos cartões */
  data: MetricCardData[];
  /** Layout responsivo */
  responsive?: boolean;
  /** Tamanho dos cartões */
  size?: 'sm' | 'md' | 'lg';
  /** Estado de carregamento */
  isLoading?: boolean;
  /** Classe personalizada */
  className?: string;
}

interface MetricCardProps extends MetricCardData {
  size?: 'sm' | 'md' | 'lg';
}

// Configurações de tamanho
const sizeConfig = {
  sm: {
    padding: 'p-4',
    title: 'text-sm',
    value: 'text-2xl',
    description: 'text-xs',
    icon: 'h-5 w-5',
    spacing: 'space-y-2'
  },
  md: {
    padding: 'p-5',
    title: 'text-base',
    value: 'text-3xl',
    description: 'text-sm',
    icon: 'h-6 w-6',
    spacing: 'space-y-3'
  },
  lg: {
    padding: 'p-6',
    title: 'text-lg',
    value: 'text-4xl',
    description: 'text-base',
    icon: 'h-8 w-8',
    spacing: 'space-y-4'
  }
};

// Configurações de cores baseadas no Cresol
const colorConfig = {
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'text-orange-500',
    value: 'text-orange-600',
    accent: 'bg-orange-500',
    hover: 'hover:border-[#727176] hover:bg-orange-100'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-500',
    value: 'text-green-600',
    accent: 'bg-green-500',
    hover: 'hover:border-green-300 hover:bg-green-100'
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-500',
    value: 'text-blue-600',
    accent: 'bg-blue-500',
    hover: 'hover:border-blue-300 hover:bg-blue-100'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-500',
    value: 'text-purple-600',
    accent: 'bg-purple-500',
    hover: 'hover:border-purple-300 hover:bg-purple-100'
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-500',
    value: 'text-red-600',
    accent: 'bg-red-500',
    hover: 'hover:border-red-300 hover:bg-red-100'
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: 'text-gray-500',
    value: 'text-gray-600',
    accent: 'bg-gray-500',
    hover: 'hover:border-gray-300 hover:bg-gray-100'
  }
};

// Componente individual do card
const MetricCard = memo(function MetricCard({
  title,
  value,
  previousValue,
  icon,
  description,
  unit,
  trend = 'stable',
  color = 'gray',
  onClick,
  isLoading = false,
  size = 'md',
  className = ''
}: MetricCardProps) {
  const sizeStyles = sizeConfig[size];
  const colorStyles = colorConfig[color];
  
  // Calcular mudança percentual
  const getPercentageChange = (): number => {
    if (!previousValue || typeof value !== 'number') return 0;
    return Math.round(((value - previousValue) / previousValue) * 100);
  };

  // Formatar valor
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
  };

  // Ícone de tendência
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'minus';
    }
  };

  // Cor da tendência
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const percentageChange = getPercentageChange();

  return (
    <div
      onClick={onClick}
      className={`
        ${colorStyles.bg} ${colorStyles.border}
        border rounded-md transition-colors duration-200
        ${onClick ? `hover:border-gray-300 cursor-pointer` : ''}
        ${sizeStyles.padding} ${className}
        ${isLoading ? 'animate-pulse' : ''}
        focus:outline-none focus:ring-2 focus:ring-orange-200 focus:ring-opacity-50
      `}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
    >
      <div className={sizeStyles.spacing}>
        {/* Header com ícone e título */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={`${sizeStyles.title} font-medium text-gray-700 truncate`}>
              {title}
            </h3>
            {description && (
              <p className={`${sizeStyles.description} text-gray-500 mt-1`}>
                {description}
              </p>
            )}
          </div>
          {icon && (
            <div className={`flex-shrink-0 ml-3 ${colorStyles.icon}`}>
              <Icon name={icon as any} className={sizeStyles.icon} />
            </div>
          )}
        </div>

        {/* Valor principal */}
        <div className="flex items-baseline space-x-2">
          {isLoading ? (
            <div className={`${sizeStyles.value.includes('2xl') ? 'h-8' : sizeStyles.value.includes('3xl') ? 'h-10' : 'h-12'} bg-gray-200 rounded-sm w-24 animate-pulse`} />
          ) : (
            <>
              <span className={`${sizeStyles.value} font-bold ${colorStyles.value}`}>
                {formatValue(value)}
              </span>
              {unit && (
                <span className={`${sizeStyles.description} text-gray-500 font-normal`}>
                  {unit}
                </span>
              )}
            </>
          )}
        </div>

        {/* Tendência e mudança percentual */}
        {previousValue !== undefined && trend !== 'stable' && (
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
              <Icon name={getTrendIcon() as any} className="h-4 w-4" />
              <span className={`${sizeStyles.description} font-medium`}>
                {Math.abs(percentageChange)}%
              </span>
            </div>
            <span className={`${sizeStyles.description} text-gray-500`}>
              vs período anterior
            </span>
          </div>
        )}
      </div>

      {/* Indicador de hover para cards clicáveis */}
      {onClick && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      )}
    </div>
  );
});

// Skeleton loading component
const MetricCardSkeleton = memo(function MetricCardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeStyles = sizeConfig[size];

  return (
    <div className={`bg-white border border-gray-200 rounded-md ${sizeStyles.padding} animate-pulse`}>
      <div className={sizeStyles.spacing}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className={`h-4 bg-gray-200 rounded-sm w-3/4 mb-2`} />
            <div className={`h-3 bg-gray-200 rounded-sm w-1/2`} />
          </div>
          <div className={`${sizeStyles.icon} bg-gray-200 rounded-sm`} />
        </div>
        <div className={`${sizeStyles.value.includes('2xl') ? 'h-8' : sizeStyles.value.includes('3xl') ? 'h-10' : 'h-12'} bg-gray-200 rounded-sm w-20`} />
        <div className="flex space-x-2">
          <div className="h-3 bg-gray-200 rounded-sm w-12" />
          <div className="h-3 bg-gray-200 rounded-sm w-24" />
        </div>
      </div>
    </div>
  );
});

// Componente principal
const MetricCards = memo(function MetricCards({
  data,
  responsive = true,
  size = 'md',
  isLoading = false,
  className = ''
}: MetricCardsProps) {
  if (isLoading) {
    return (
      <div className={`
        grid gap-4 
        ${responsive ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-4'}
        ${className}
      `}>
        {Array.from({ length: 4 }).map((_, index) => (
          <MetricCardSkeleton key={index} size={size} />
        ))}
      </div>
    );
  }

  return (
    <div className={`
      grid gap-4
      ${responsive 
        ? `grid-cols-1 ${data.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} ${data.length >= 4 ? 'xl:grid-cols-4' : ''}` 
        : `grid-cols-${Math.min(data.length, 4)}`
      }
      ${className}
    `}>
      {data.map((cardData, index) => (
        <MetricCard
          key={`${cardData.title}-${index}`}
          {...cardData}
          size={size}
        />
      ))}
    </div>
  );
});

MetricCards.displayName = 'MetricCards';

export default MetricCards;
export type { MetricCardData, MetricCardsProps };