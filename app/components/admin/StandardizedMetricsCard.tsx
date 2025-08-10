'use client';

import React from 'react';
import { Icon, type IconName } from '@/app/components/icons';

/**
 * STANDARDIZED METRICS CARD COMPONENT
 * 
 * Card de métricas padronizado seguindo o design system Cresol.
 * Usado em dashboards e páginas administrativas para exibir estatísticas.
 * 
 * Features:
 * - Design clean e minimalista
 * - Cores da paleta Cresol
 * - Sistema de ícones integrado
 * - Trends opcionais (crescimento/decrescimento)
 * - Variants de cor: primary, secondary, info, success, warning, danger
 * - Sizes: sm, md (padrão), lg
 * - Hover states e animations
 * - Responsivo e acessível
 * - TypeScript completo
 */

interface TrendData {
  value: number;
  isPositive: boolean;
  period?: string; // ex: 'vs. mês anterior'
}

interface StandardizedMetricsCardProps {
  /** Título da métrica */
  title: string;
  /** Valor principal da métrica */
  value: string | number;
  /** Nome do ícone do sistema existente */
  icon?: IconName;
  /** Variant de cor do card */
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'danger';
  /** Dados de tendência opcional */
  trend?: TrendData;
  /** Descrição adicional */
  description?: string;
  /** Tamanho do card */
  size?: 'sm' | 'md' | 'lg';
  /** Classes CSS adicionais */
  className?: string;
  /** Callback ao clicar no card */
  onClick?: () => void;
  /** Indica se o card está carregando */
  loading?: boolean;
}

export const StandardizedMetricsCard: React.FC<StandardizedMetricsCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  description,
  size = 'md',
  className = '',
  onClick,
  loading = false
}) => {
  // Configuração de cores PADRONIZADA CRESOL
  // APENAS cores permitidas: #F58220 (primary) + tons de cinza neutros
  const colorConfig = {
    primary: {
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      accent: 'text-primary',
      border: 'border-primary/20',
      hoverBorder: 'hover:border-primary/40'
    },
    secondary: {
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-400',
      accent: 'text-gray-900',
      border: 'border-gray-200',
      hoverBorder: 'hover:border-gray-300'
    },
    info: {
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-400',
      accent: 'text-gray-900',
      border: 'border-gray-200',
      hoverBorder: 'hover:border-gray-300'
    },
    success: {
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-400',
      accent: 'text-gray-900',
      border: 'border-gray-200',
      hoverBorder: 'hover:border-gray-300'
    },
    warning: {
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-400',
      accent: 'text-gray-900',
      border: 'border-gray-200',
      hoverBorder: 'hover:border-gray-300'
    },
    danger: {
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-400',
      accent: 'text-gray-900',
      border: 'border-gray-200',
      hoverBorder: 'hover:border-gray-300'
    }
  };

  // Configuração de tamanhos
  const sizeConfig = {
    sm: {
      padding: 'p-4',
      titleSize: 'text-sm',
      valueSize: 'text-xl',
      iconSize: 'w-8 h-8',
      iconPadding: 'p-2'
    },
    md: {
      padding: 'p-5',
      titleSize: 'text-sm',
      valueSize: 'text-2xl',
      iconSize: 'w-10 h-10',
      iconPadding: 'p-2.5'
    },
    lg: {
      padding: 'p-6',
      titleSize: 'text-base',
      valueSize: 'text-3xl',
      iconSize: 'w-12 h-12',
      iconPadding: 'p-3'
    }
  };

  const colors = colorConfig[color];
  const sizes = sizeConfig[size];

  const cardClasses = `
    bg-white rounded-lg border transition-all duration-200 
    ${colors.border} ${colors.hoverBorder}
    ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}
    ${sizes.padding}
    ${className}
  `.trim();

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      // Format numbers with locale-appropriate separators
      return val.toLocaleString('pt-BR');
    }
    return String(val);
  };

  if (loading) {
    return (
      <div className={cardClasses}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded-sm w-1/2"></div>
            <div className={`${sizes.iconSize} bg-gray-200 rounded-sm-lg`}></div>
          </div>
          <div className="h-8 bg-gray-200 rounded-sm w-1/3 mb-2"></div>
          {trend && (
            <div className="h-3 bg-gray-200 rounded-sm w-1/4"></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Header com título e ícone */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-medium text-gray-600 ${sizes.titleSize}`}>
          {title}
        </h3>
        {icon && (
          <div className={`
            ${colors.iconBg} rounded-lg flex items-center justify-center
            ${sizes.iconSize} ${sizes.iconPadding}
            transition-transform duration-200 hover:scale-110
          `}>
            <Icon 
              name={icon} 
              className={`w-full h-full ${colors.iconColor}`}
            />
          </div>
        )}
      </div>

      {/* Valor principal */}
      <div className={`
        font-bold ${colors.accent} ${sizes.valueSize}
        ${loading ? 'animate-pulse' : ''}
      `}>
        {formatValue(value)}
      </div>

      {/* Trend e descrição */}
      <div className="mt-2 space-y-1">
        {trend && (
          <div className="flex items-center gap-1 text-xs">
            <Icon 
              name={trend.isPositive ? "trending-up" : "trending-down"}
              className="w-3 h-3 text-gray-400"
            />
            <span className="font-medium text-gray-600">
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            {trend.period && (
              <span className="text-gray-500">{trend.period}</span>
            )}
          </div>
        )}
        
        {description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Subtle bottom accent line para variant primary */}
      {color === 'primary' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-b-lg"></div>
      )}
    </div>
  );
};

/**
 * Grid container para cards de métricas
 * Responsivo e com espaçamento padronizado
 */
export const StandardizedMetricsGrid: React.FC<{
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}> = ({ children, columns = 3, className = '' }) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`
      grid gap-4 sm:gap-6 
      ${gridClasses[columns]}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default StandardizedMetricsCard;