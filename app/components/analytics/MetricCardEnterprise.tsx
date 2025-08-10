'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Icon } from '@/app/components/icons/Icon';
import { NumberTicker } from './NumberTicker';

interface MetricCardEnterpriseProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: string;
  suffix?: string;
  prefix?: string;
  /** Chakra UI inspired size scale */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Enhanced variant system with Cresol brand colors */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  /** Chakra UI inspired color palette */
  colorPalette?: 'orange' | 'green' | 'blue' | 'gray' | 'red' | 'purple';
  isLoading?: boolean;
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
  /** Enable/disable NumberTicker animation */
  enableAnimation?: boolean;
  /** Animation duration for NumberTicker */
  animationDuration?: number;
  /** Number formatting options */
  formatOptions?: Intl.NumberFormatOptions;
  className?: string;
}

// Chakra UI inspired size configurations
const sizeConfig = {
  sm: {
    padding: 'p-4',
    iconSize: 'h-5 w-5',
    iconPadding: 'p-2',
    title: 'text-xs',
    numberSize: 'lg' as const,
    spacing: 'space-y-2'
  },
  md: {
    padding: 'p-6',
    iconSize: 'h-6 w-6',
    iconPadding: 'p-3',
    title: 'text-sm',
    numberSize: 'xl' as const,
    spacing: 'space-y-4'
  },
  lg: {
    padding: 'p-8',
    iconSize: 'h-7 w-7',
    iconPadding: 'p-4',
    title: 'text-base',
    numberSize: 'xl' as const,
    spacing: 'space-y-6'
  },
  xl: {
    padding: 'p-10',
    iconSize: 'h-8 w-8',
    iconPadding: 'p-5',
    title: 'text-lg',
    numberSize: 'xl' as const,
    spacing: 'space-y-8'
  }
};

export default function MetricCardEnterprise({
  title,
  value,
  previousValue,
  icon,
  suffix = '',
  prefix = '',
  size = 'md',
  variant = 'primary',
  colorPalette,
  isLoading = false,
  trend,
  subtitle,
  enableAnimation = true,
  animationDuration = 1000,
  formatOptions,
  className = ''
}: MetricCardEnterpriseProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        current = value;
        clearInterval(timer);
      }
      setDisplayValue(Math.floor(current));
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, mounted, isLoading]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1);
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1);
    }
    return num.toString();
  };

  const getFormattedSuffix = (num: number): string => {
    if (num >= 1000000) {
      return 'M' + suffix;
    } else if (num >= 1000) {
      return 'K' + suffix;
    }
    return suffix;
  };

  // Enhanced variant system with Chakra UI semantic tokens approach
  const getVariantStyles = () => {
    // Use colorPalette override if provided
    const effectiveColor = colorPalette || getDefaultPaletteForVariant(variant);
    
    switch (effectiveColor) {
      case 'orange':
        return {
          border: 'border-orange-200',
          iconBg: 'bg-orange-50',
          iconColor: 'text-orange-600',
          hoverBorder: 'hover:border-orange-300',
          hoverShadow: 'hover:shadow-orange-100/50',
          topGradient: 'from-orange-400 to-orange-600',
          numberColor: 'orange' as const
        };
      case 'green':
        return {
          border: 'border-green-200',
          iconBg: 'bg-green-50',
          iconColor: 'text-green-600',
          hoverBorder: 'hover:border-green-300',
          hoverShadow: 'hover:shadow-green-100/50',
          topGradient: 'from-green-400 to-green-600',
          numberColor: 'green' as const
        };
      case 'blue':
        return {
          border: 'border-blue-200',
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          hoverBorder: 'hover:border-blue-300',
          hoverShadow: 'hover:shadow-blue-100/50',
          topGradient: 'from-blue-400 to-blue-600',
          numberColor: 'blue' as const
        };
      case 'red':
        return {
          border: 'border-red-200',
          iconBg: 'bg-red-50',
          iconColor: 'text-red-600',
          hoverBorder: 'hover:border-red-300',
          hoverShadow: 'hover:shadow-red-100/50',
          topGradient: 'from-red-400 to-red-600',
          numberColor: 'red' as const
        };
      case 'purple':
        return {
          border: 'border-purple-200',
          iconBg: 'bg-purple-50',
          iconColor: 'text-purple-600',
          hoverBorder: 'hover:border-purple-300',
          hoverShadow: 'hover:shadow-purple-100/50',
          topGradient: 'from-purple-400 to-purple-600',
          numberColor: 'gray' as const
        };
      case 'gray':
      default:
        return {
          border: 'border-gray-200',
          iconBg: 'bg-gray-50',
          iconColor: 'text-gray-600',
          hoverBorder: 'hover:border-gray-300',
          hoverShadow: 'hover:shadow-gray-100/50',
          topGradient: 'from-gray-400 to-gray-600',
          numberColor: 'gray' as const
        };
    }
  };

  // Map variant to default color palette (Chakra UI semantic approach)
  const getDefaultPaletteForVariant = (variant: string) => {
    switch (variant) {
      case 'primary': return 'orange';
      case 'secondary': return 'green';
      case 'success': return 'green';
      case 'warning': return 'orange';
      case 'info': return 'blue';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <Icon name="trending-up" className="h-3 w-3 text-emerald-600" />;
      case 'down':
        return <Icon name="trending-down" className="h-3 w-3 text-red-600" />;
      case 'stable':
        return <Icon name="minus" className="h-3 w-3 text-blue-600" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600 bg-emerald-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      case 'stable':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const styles = getVariantStyles();
  const sizeStyles = sizeConfig[size];

  if (isLoading) {
    return (
      <div className={`relative bg-white rounded-md border border-gray-200 ${sizeStyles.padding} overflow-hidden ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`${sizeStyles.iconSize.replace('h-', 'w-').replace('w-', 'h-')} bg-gray-200 rounded-sm-lg`}></div>
              <div>
                <div className="h-4 bg-gray-200 rounded-sm w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded-sm w-16"></div>
              </div>
            </div>
          </div>
          <div className="h-8 bg-gray-200 rounded-sm w-20 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded-sm w-32"></div>
        </div>
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
    );
  }

  return (
    <div 
      className={`
        relative bg-white rounded-md border ${styles.border} ${sizeStyles.padding}
        transition-all duration-300 ease-out
        ${styles.hoverBorder} hover:transform hover:scale-[1.02] hover:-translate-y-1
        hover:shadow-lg ${styles.hoverShadow}
        group cursor-pointer overflow-hidden
        ${className}
      `}
    >
      {/* Top Border Gradient */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${styles.topGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      {/* Header */}
      <div className={`flex items-start justify-between ${sizeStyles.spacing.split('-')[1] === 'y' ? 'mb-4' : 'mb-6'}`}>
        <div className="flex items-center space-x-3">
          <div className={`${sizeStyles.iconPadding} rounded-md ${styles.iconBg} group-hover:scale-110 transition-transform duration-200`}>
            <Icon name={icon as any} className={`${sizeStyles.iconSize} ${styles.iconColor}`} />
          </div>
          <div>
            <p className={`${sizeStyles.title} font-medium text-gray-600 uppercase tracking-wide`}>
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {/* Trend Indicator */}
        {trend && (
          <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>
              {trend === 'up' && '+'}
              {previousValue && Math.abs(((value - previousValue) / previousValue) * 100).toFixed(1)}
              {previousValue && '%'}
            </span>
          </div>
        )}
      </div>

      {/* Main Value with NumberTicker */}
      <div className="space-y-2">
        <div className="flex items-baseline space-x-1">
          <NumberTicker
            value={value}
            prefix={prefix}
            suffix={getFormattedSuffix(value)}
            duration={animationDuration}
            disableAnimation={!enableAnimation}
            size={sizeStyles.numberSize}
            colorPalette={styles.numberColor}
            formatOptions={formatOptions}
            className="font-bold"
          />
        </div>

        {/* Previous Value Comparison */}
        {previousValue && (
          <p className="text-sm text-gray-500">
            vs {formatNumber(previousValue)}{getFormattedSuffix(previousValue)} anterior
          </p>
        )}
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 rounded-md bg-gradient-to-br from-${styles.numberColor}-50/0 to-${styles.numberColor}-100/0 group-hover:from-${styles.numberColor}-50/20 group-hover:to-${styles.numberColor}-100/10 transition-all duration-300 pointer-events-none`}></div>
    </div>
  );
}