'use client';

import { ReactNode, useEffect, useState, memo, useCallback, useMemo } from 'react';
import { Icon } from '@/app/components/icons/Icon';
import { NumberTicker } from './NumberTicker';

interface MetricCardEnterpriseProProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: string;
  suffix?: string;
  prefix?: string;
  /** Ant Design + HeroUI inspired size scale */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Enhanced variant system with Cresol brand colors */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  /** Advanced color palette with HeroUI semantics */
  colorPalette?: 'orange' | 'green' | 'blue' | 'gray' | 'red' | 'purple' | 'emerald' | 'amber';
  isLoading?: boolean;
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
  description?: string;
  /** Enable/disable NumberTicker animation */
  enableAnimation?: boolean;
  /** Animation duration for NumberTicker */
  animationDuration?: number;
  /** Number formatting options */
  formatOptions?: Intl.NumberFormatOptions;
  /** HeroUI-inspired interactive features */
  isPressable?: boolean;
  isBlurred?: boolean;
  /** Ant Design inspired additional content */
  extra?: ReactNode;
  /** Advanced hover effects */
  hoverEffect?: 'lift' | 'glow' | 'border' | 'shadow' | 'none';
  /** Loading skeleton style */
  skeletonStyle?: 'shimmer' | 'pulse' | 'wave';
  className?: string;
  onClick?: () => void;
}

// Enhanced size configurations inspired by both Ant Design and HeroUI
const sizeConfig = {
  sm: {
    padding: 'p-5',
    iconSize: 'h-5 w-5',
    iconContainer: 'h-10 w-10',
    iconPadding: 'p-2.5',
    title: 'text-xs',
    subtitle: 'text-xs',
    description: 'text-xs',
    numberSize: 'sm' as const,
    spacing: 'space-y-3',
    minHeight: 'h-[180px]'
  },
  md: {
    padding: 'p-6',
    iconSize: 'h-5 w-5',
    iconContainer: 'h-10 w-10',
    iconPadding: 'p-2.5',
    title: 'text-xs',
    subtitle: 'text-xs',
    description: 'text-sm',
    numberSize: 'lg' as const,
    spacing: 'space-y-4',
    minHeight: 'h-[180px]'
  },
  lg: {
    padding: 'p-7',
    iconSize: 'h-5 w-5',
    iconContainer: 'h-10 w-10',
    iconPadding: 'p-2.5',
    title: 'text-xs',
    subtitle: 'text-xs',
    description: 'text-sm',
    numberSize: 'xl' as const,
    spacing: 'space-y-4',
    minHeight: 'h-[180px]'
  },
  xl: {
    padding: 'p-8',
    iconSize: 'h-5 w-5',
    iconContainer: 'h-10 w-10',
    iconPadding: 'p-2.5',
    title: 'text-xs',
    subtitle: 'text-xs',
    description: 'text-base',
    numberSize: 'xl' as const,
    spacing: 'space-y-5',
    minHeight: 'h-[180px]'
  }
};

const MetricCardEnterprisePro = memo(function MetricCardEnterprisePro({
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
  description,
  enableAnimation = true,
  animationDuration = 1200,
  formatOptions,
  isPressable = false,
  isBlurred = false,
  extra,
  hoverEffect = 'lift',
  skeletonStyle = 'shimmer',
  className = '',
  onClick
}: MetricCardEnterpriseProProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoized handlers para evitar re-renders desnecessários
  const handleClick = useCallback(() => onClick?.(), [onClick]);


  const getFormattedSuffix = useMemo(() => {
    return (num: number): string => {
      if (formatOptions) return suffix;
      
      if (num >= 1000000) {
        return 'M' + suffix;
      } else if (num >= 1000) {
        return 'K' + suffix;
      }
      return suffix;
    };
  }, [formatOptions, suffix]);


  // Map variant to default color palette (Cresol semantic approach)
  const getDefaultPaletteForVariant = (variant: string) => {
    switch (variant) {
      case 'primary': return 'orange';
      case 'secondary': return 'emerald';
      case 'success': return 'emerald';
      case 'warning': return 'amber';
      case 'info': return 'blue';
      case 'error': return 'red';
      default: return 'gray';
    }
  };


  // Professional hover effects - subtle and clean
  const hoverEffectStyles = useMemo(() => {
    switch (hoverEffect) {
      case 'lift':
        return 'hover:transform hover:-translate-y-1 transition-all duration-200';
      case 'glow':
      case 'border':
      case 'shadow':
        return 'transition-all duration-200';
      case 'none':
      default:
        return 'transition-all duration-200';
    }
  }, [hoverEffect]);

  const skeletonStyles = useMemo(() => {
    switch (skeletonStyle) {
      case 'shimmer':
        return 'animate-shimmer';
      case 'wave':
        return 'animate-wave';
      case 'pulse':
      default:
        return 'animate-pulse';
    }
  }, [skeletonStyle]);

  const styles = useMemo(() => {
    const effectiveColor = colorPalette || getDefaultPaletteForVariant(variant);
    
    const baseStyles = {
      background: 'bg-white',
      border: 'border-gray-100',
      borderWidth: 'border',
      borderRadius: 'rounded-lg',
      shadow: 'shadow-sm',
    };

    switch (effectiveColor) {
      case 'orange': // Cresol Primary - Professional
        return {
          ...baseStyles,
          iconBg: 'bg-orange-50',
          iconColor: 'text-orange-600',
          accentColor: 'text-orange-600',
          hoverBorder: 'hover:border-gray-200',
          hoverShadow: 'hover:shadow-md',
          numberColor: 'orange' as const,
          ringColor: 'focus:ring-orange-100',
        };
      case 'green': // Alternative Blue - Professional
        return {
          ...baseStyles,
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          accentColor: 'text-blue-600',
          hoverBorder: 'hover:border-gray-200',
          hoverShadow: 'hover:shadow-md',
          numberColor: 'blue' as const,
          ringColor: 'focus:ring-blue-100',
        };
      case 'emerald':
        return {
          ...baseStyles,
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          accentColor: 'text-blue-600',
          hoverBorder: 'hover:border-gray-200',
          hoverShadow: 'hover:shadow-md',
          numberColor: 'blue' as const,
          ringColor: 'focus:ring-blue-100',
        };
      case 'blue':
        return {
          ...baseStyles,
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          accentColor: 'text-blue-600',
          hoverBorder: 'hover:border-gray-200',
          hoverShadow: 'hover:shadow-md',
          numberColor: 'blue' as const,
          ringColor: 'focus:ring-blue-100',
        };
      case 'red':
        return {
          ...baseStyles,
          iconBg: 'bg-red-50',
          iconColor: 'text-red-600',
          accentColor: 'text-red-600',
          hoverBorder: 'hover:border-gray-200',
          hoverShadow: 'hover:shadow-md',
          numberColor: 'red' as const,
          ringColor: 'focus:ring-red-100',
        };
      case 'purple':
        return {
          ...baseStyles,
          iconBg: 'bg-purple-50',
          iconColor: 'text-purple-600',
          accentColor: 'text-purple-600',
          hoverBorder: 'hover:border-gray-200',
          hoverShadow: 'hover:shadow-md',
          numberColor: 'purple' as const,
          ringColor: 'focus:ring-purple-100',
        };
      case 'amber':
        return {
          ...baseStyles,
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-600',
          accentColor: 'text-amber-600',
          hoverBorder: 'hover:border-gray-200',
          hoverShadow: 'hover:shadow-md',
          numberColor: 'amber' as const,
          ringColor: 'focus:ring-amber-100',
        };
      case 'gray':
      default:
        return {
          ...baseStyles,
          iconBg: 'bg-gray-50',
          iconColor: 'text-gray-600',
          accentColor: 'text-gray-700',
          hoverBorder: 'hover:border-gray-200',
          hoverShadow: 'hover:shadow-md',
          numberColor: 'gray' as const,
          ringColor: 'focus:ring-gray-100',
        };
    }
  }, [variant, colorPalette]);
  const sizeStyles = useMemo(() => sizeConfig[size], [size]);

  // Loading State with Enhanced Skeleton
  if (isLoading) {
    return (
      <div className={`
        relative ${styles.background} ${styles.borderRadius} ${styles.border} ${styles.borderWidth}
        ${sizeStyles.padding} ${sizeStyles.minHeight} overflow-hidden ${className}
      `}>
        <div className={skeletonStyles}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`${sizeStyles.iconContainer} bg-gray-200 rounded-sm-md`}></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded-sm w-24"></div>
                <div className="h-3 bg-gray-200 rounded-sm w-16"></div>
              </div>
            </div>
            {trend && <div className="h-6 w-12 bg-gray-200 rounded-sm-full"></div>}
          </div>
          
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded-sm w-20"></div>
            <div className="h-3 bg-gray-200 rounded-sm w-32"></div>
          </div>
        </div>
        
        {/* Enhanced Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
      </div>
    );
  }

  // Base card element
  const CardElement = isPressable ? 'button' : 'div';

  return (
    <CardElement 
      className={`
        relative ${styles.background} ${styles.borderRadius} 
        ${styles.border} ${styles.borderWidth} ${styles.shadow}
        ${sizeStyles.padding} ${sizeStyles.minHeight}
        group cursor-pointer overflow-hidden flex flex-col justify-between
        ${hoverEffectStyles} ${styles.hoverBorder} ${styles.hoverShadow}
        ${isPressable ? `${styles.ringColor} focus:outline-none focus:ring-2 focus:ring-opacity-50` : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          {/* Professional Icon Container */}
          <div className={`
            ${sizeStyles.iconContainer} ${sizeStyles.iconPadding} rounded-lg
            ${styles.iconBg} transition-all duration-200
          `}>
            <Icon name={icon as any} className={`${sizeStyles.iconSize} ${styles.iconColor}`} />
          </div>
          
          {/* Professional Title and Subtitle */}
          <div className="flex-1 min-w-0">
            <p className={`
              ${sizeStyles.title} font-medium text-gray-600 uppercase tracking-wide
              leading-snug break-words line-clamp-2
            `}>
              {title}
            </p>
            {subtitle && (
              <p className={`
                ${sizeStyles.subtitle} text-gray-400 mt-1 break-words line-clamp-2
              `}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        

        {/* Extra Content */}
        {extra && (
          <div className="ml-4">
            {extra}
          </div>
        )}
      </div>

      {/* Main Value Section with Enhanced Animation */}
      <div className="space-y-2">
        <div className="flex items-baseline space-x-1">
          <NumberTicker
            value={mounted ? value : 0}
            prefix={prefix}
            suffix={getFormattedSuffix(value)}
            duration={animationDuration}
            disableAnimation={!enableAnimation}
            size={sizeStyles.numberSize}
            colorPalette={styles.numberColor}
            formatOptions={formatOptions}
            className="font-bold tracking-tight"
          />
        </div>


        {/* Professional Description */}
        {description && (
          <p className={`${sizeStyles.description} text-gray-500 leading-relaxed mt-2`}>
            {description}
          </p>
        )}
      </div>

    </CardElement>
  );
});

MetricCardEnterprisePro.displayName = 'MetricCardEnterprisePro';

export default MetricCardEnterprisePro;