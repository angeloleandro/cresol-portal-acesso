import React from 'react';
import Icon from '@/app/components/icons/Icon';
import { Card } from '../../design-system/components/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  className?: string;
}

const colorConfig = {
  primary: {
    bg: 'bg-orange-50',
    iconBg: 'bg-primary',
    text: 'text-primary',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600',
  },
  secondary: {
    bg: 'bg-green-50',
    iconBg: 'bg-secondary',
    text: 'text-secondary',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600',
  },
  success: {
    bg: 'bg-green-50',
    iconBg: 'bg-green-500',
    text: 'text-green-600',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    iconBg: 'bg-yellow-500',
    text: 'text-yellow-600',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600',
  },
  info: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-500',
    text: 'text-blue-600',
    trendPositive: 'text-green-600',
    trendNegative: 'text-red-600',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  className = '',
}) => {
  const config = colorConfig[color];

  return (
    <Card variant="elevated" className={`transition-all duration-200 hover:scale-105 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span
                className={`
                  text-sm font-medium flex items-center gap-1
                  ${trend.isPositive ? config.trendPositive : config.trendNegative}
                `}
              >
                <Icon
                  name={trend.isPositive ? "trending-up" : "trending-down"}
                  className="w-3 h-3"
                />
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">{trend.period}</p>
          )}
        </div>
        
        <div className={`${config.iconBg} p-3 rounded-lg`}>
          <div className="text-white w-6 h-6 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
};