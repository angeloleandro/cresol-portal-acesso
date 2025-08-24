'use client';

import { Disclosure } from '@headlessui/react';
import { ReactNode, useEffect, useState, useRef } from 'react';

import { Icon } from '@/app/components/icons/Icon';

import { NumberTicker } from './NumberTicker';

interface AccessibleMetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: string;
  suffix?: string;
  prefix?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  colorPalette?: 'orange' | 'green' | 'blue' | 'gray' | 'red' | 'purple' | 'emerald' | 'amber';
  isLoading?: boolean;
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
  description?: string;
  enableAnimation?: boolean;
  animationDuration?: number;
  formatOptions?: Intl.NumberFormatOptions;
  expandable?: boolean;
  expandedContent?: ReactNode;
  onActivate?: () => void;
  /** WCAG 2.1 AA Accessibility Props */
  ariaLabel?: string;
  ariaDescription?: string;
  liveRegion?: boolean;
  /** Focus management */
  autoFocus?: boolean;
  tabIndex?: number;
  /** Screen reader optimizations */
  hideFromScreenReader?: boolean;
  alternativeText?: string;
  className?: string;
}

const sizeConfig = {
  sm: {
    padding: 'p-4',
    iconSize: 'h-4 w-4',
    iconContainer: 'h-8 w-8',
    title: 'text-xs',
    subtitle: 'text-xs',
    description: 'text-xs',
    numberSize: 'sm' as const,
    focusRing: 'focus:ring-2 focus:ring-offset-1',
    minTouchTarget: 'min-h-[44px] min-w-[44px]',
    textSpacing: 'leading-relaxed'
  },
  md: {
    padding: 'p-6',
    iconSize: 'h-5 w-5',
    iconContainer: 'h-10 w-10',
    title: 'text-sm',
    subtitle: 'text-xs',
    description: 'text-sm',
    numberSize: 'lg' as const,
    focusRing: 'focus:ring-2 focus:ring-offset-2',
    minTouchTarget: 'min-h-[44px] min-w-[44px]',
    textSpacing: 'leading-relaxed'
  },
  lg: {
    padding: 'p-8',
    iconSize: 'h-6 w-6',
    iconContainer: 'h-12 w-12',
    title: 'text-base',
    subtitle: 'text-sm',
    description: 'text-base',
    numberSize: 'xl' as const,
    focusRing: 'focus:ring-2 focus:ring-offset-2',
    minTouchTarget: 'min-h-[48px] min-w-[48px]',
    textSpacing: 'leading-loose'
  },
  xl: {
    padding: 'p-10',
    iconSize: 'h-8 w-8',
    iconContainer: 'h-16 w-16',
    title: 'text-lg',
    subtitle: 'text-base',
    description: 'text-lg',
    numberSize: 'xl' as const,
    focusRing: 'focus:ring-2 focus:ring-offset-3',
    minTouchTarget: 'min-h-[48px] min-w-[48px]',
    textSpacing: 'leading-loose'
  }
};

export default function AccessibleMetricCard({
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
  expandable = false,
  expandedContent,
  onActivate,
  ariaLabel,
  ariaDescription,
  liveRegion = true,
  autoFocus = false,
  tabIndex,
  hideFromScreenReader = false,
  alternativeText,
  className = ''
}: AccessibleMetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [announced, setAnnounced] = useState(false);
  const cardRef = useRef<HTMLDivElement | HTMLButtonElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (autoFocus && cardRef.current) {
      cardRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (!mounted || isLoading) return;

    const duration = animationDuration;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        current = value;
        clearInterval(timer);
        
        // Announce completion for screen readers
        if (liveRegion && !announced && announceRef.current) {
          setAnnounced(true);
        }
      }
      setDisplayValue(Math.floor(current));
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, mounted, isLoading, animationDuration, liveRegion, announced]);

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

  const getVariantStyles = () => {
    const effectiveColor = colorPalette || getDefaultPaletteForVariant(variant);
    
    const colorStyles = {
      orange: {
        border: 'border-orange-200/60',
        focusRing: 'focus:ring-orange-200',
        iconBg: 'bg-gradient-to-br from-orange-50 to-orange-100/50',
        iconColor: 'text-orange-600',
        accentColor: 'text-orange-600',
        hoverBorder: 'hover:border-orange-300',
        numberColor: 'orange' as const,
      },
      green: {
        border: 'border-emerald-200/60',
        focusRing: 'focus:ring-emerald-200',
        iconBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
        iconColor: 'text-emerald-600',
        accentColor: 'text-emerald-600',
        hoverBorder: 'hover:border-emerald-300',
        numberColor: 'green' as const,
      },
      emerald: {
        border: 'border-emerald-200/60',
        focusRing: 'focus:ring-emerald-200',
        iconBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
        iconColor: 'text-emerald-600',
        accentColor: 'text-emerald-600',
        hoverBorder: 'hover:border-emerald-300',
        numberColor: 'green' as const,
      },
      blue: {
        border: 'border-blue-200/60',
        focusRing: 'focus:ring-blue-200',
        iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
        iconColor: 'text-blue-600',
        accentColor: 'text-blue-600',
        hoverBorder: 'hover:border-blue-300',
        numberColor: 'blue' as const,
      },
      red: {
        border: 'border-red-200/60',
        focusRing: 'focus:ring-red-200',
        iconBg: 'bg-gradient-to-br from-red-50 to-red-100/50',
        iconColor: 'text-red-600',
        accentColor: 'text-red-600',
        hoverBorder: 'hover:border-red-300',
        numberColor: 'red' as const,
      },
      purple: {
        border: 'border-purple-200/60',
        focusRing: 'focus:ring-purple-200',
        iconBg: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
        iconColor: 'text-purple-600',
        accentColor: 'text-purple-600',
        hoverBorder: 'hover:border-purple-300',
        numberColor: 'purple' as const,
      },
      amber: {
        border: 'border-amber-200/60',
        focusRing: 'focus:ring-amber-200',
        iconBg: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
        iconColor: 'text-amber-600',
        accentColor: 'text-amber-600',
        hoverBorder: 'hover:border-amber-300',
        numberColor: 'amber' as const,
      },
      gray: {
        border: 'border-gray-200/60',
        focusRing: 'focus:ring-gray-200',
        iconBg: 'bg-gradient-to-br from-gray-50 to-gray-100/50',
        iconColor: 'text-gray-600',
        accentColor: 'text-gray-700',
        hoverBorder: 'hover:border-gray-300',
        numberColor: 'gray' as const,
      }
    };

    return colorStyles[effectiveColor as keyof typeof colorStyles] || colorStyles.gray;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <Icon name="trending-up" className="h-3 w-3" aria-hidden="true" />;
      case 'down':
        return <Icon name="trending-down" className="h-3 w-3" aria-hidden="true" />;
      case 'stable':
        return <Icon name="minus" className="h-3 w-3" aria-hidden="true" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'down':
        return 'text-red-700 bg-red-50 border border-red-200';
      case 'stable':
        return 'text-blue-700 bg-blue-50 border border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border border-gray-200';
    }
  };

  const getTrendText = () => {
    const percentage = previousValue ? Math.abs(((value - previousValue) / previousValue) * 100).toFixed(1) : '0';
    
    switch (trend) {
      case 'up':
        return `Crescimento de ${percentage}%`;
      case 'down':
        return `Declínio de ${percentage}%`;
      case 'stable':
        return 'Estável';
      default:
        return '';
    }
  };

  const formatNumber = (num: number): string => {
    if (formatOptions) {
      return new Intl.NumberFormat('pt-BR', formatOptions).format(num);
    }
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1);
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1);
    }
    return num.toString();
  };

  const getFormattedSuffix = (num: number): string => {
    if (formatOptions) return suffix;
    
    if (num >= 1000000) {
      return 'M' + suffix;
    } else if (num >= 1000) {
      return 'K' + suffix;
    }
    return suffix;
  };

  const styles = getVariantStyles();
  const sizeStyles = sizeConfig[size];

  // Create accessible label
  const accessibleLabel = ariaLabel || `${title}: ${formatNumber(value)}${getFormattedSuffix(value)} ${getTrendText()}`;
  const accessibleDescription = ariaDescription || 
    `Métrica ${title}. Valor atual: ${formatNumber(value)}${getFormattedSuffix(value)}. ${
      previousValue ? `Valor anterior: ${formatNumber(previousValue)}${getFormattedSuffix(previousValue)}. ` : ''
    }${getTrendText()}. ${description || ''}`.trim();

  // Loading State with Enhanced Skeleton
  if (isLoading) {
    return (
      <div
        className={`
          relative bg-white/90 rounded-lg border-2 ${styles.border}
          ${sizeStyles.padding} min-h-[140px] overflow-hidden ${className}
        `}
        role="status"
        aria-label="Carregando métrica"
        aria-live="polite"
      >
        <div className="animate-pulse">
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
        
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
      </div>
    );
  }

  // Expandable card with HeadlessUI Disclosure
  if (expandable) {
    return (
      <Disclosure as="div" className={className}>
        {({ open }) => (
          <div
            className={`
              relative bg-white/90 rounded-lg border-2 ${styles.border}
              transition-all duration-200 ${styles.hoverBorder}
              ${sizeStyles.focusRing} ${styles.focusRing} focus-within:ring-opacity-50
            `}
            role="region"
            aria-label={accessibleLabel}
            aria-describedby={`expandable-description-${title.replace(/\s+/g, '-').toLowerCase()}`}
          >
            {/* Live region for screen readers */}
            {liveRegion && (
              <div
                ref={announceRef}
                className="sr-only"
                aria-live="polite"
                aria-atomic="true"
                role="status"
              >
                {announced && `${title} atualizada para ${formatNumber(value)}${getFormattedSuffix(value)}`}
              </div>
            )}

            <Disclosure.Button
              className={`
                w-full text-left ${sizeStyles.padding} ${sizeStyles.minTouchTarget}
                focus:outline-none ${sizeStyles.focusRing} ${styles.focusRing}
                transition-all duration-200 hover:bg-gray-50/50
              `}
              aria-expanded={open}
              aria-controls={`metric-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`
                    ${sizeStyles.iconContainer} rounded-md ${styles.iconBg}
                    flex items-center justify-center
                  `}>
                    <Icon 
                      name={icon as any} 
                      className={`${sizeStyles.iconSize} ${styles.iconColor}`}
                      aria-hidden="true"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`
                      ${sizeStyles.title} font-semibold text-gray-700 uppercase tracking-wide
                      truncate ${sizeStyles.textSpacing}
                    `}>
                      {title}
                    </h3>
                    {subtitle && (
                      <p className={`${sizeStyles.subtitle} text-gray-500 mt-1 truncate`}>
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {trend && (
                    <div 
                      className={`
                        px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1 
                        ${getTrendColor()}
                      `}
                      role="img"
                      aria-label={getTrendText()}
                    >
                      {getTrendIcon()}
                      <span>
                        {trend === 'up' && '+'}
                        {trend === 'down' && '-'}
                        {previousValue && Math.abs(((value - previousValue) / previousValue) * 100).toFixed(1)}
                        {previousValue && '%'}
                      </span>
                    </div>
                  )}
                  
                  <Icon
                    name={open ? "chevron-up" : "chevron-down"}
                    className={`h-5 w-5 ${styles.accentColor} transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="mt-4">
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
                
                {previousValue && (
                  <p className={`text-sm text-gray-500 mt-1 ${sizeStyles.textSpacing}`}>
                    vs {formatNumber(previousValue)}{getFormattedSuffix(previousValue)} anterior
                  </p>
                )}
              </div>
            </Disclosure.Button>

            <Disclosure.Panel
              id={`metric-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
              className={`${sizeStyles.padding} pt-0 border-t border-gray-100`}
            >
              {expandedContent || (
                <div className="space-y-3">
                  {description && (
                    <p className={`${sizeStyles.description} text-gray-600 ${sizeStyles.textSpacing}`}>
                      {description}
                    </p>
                  )}
                  
                  {alternativeText && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 font-medium">
                        Descrição alternativa:
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {alternativeText}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Disclosure.Panel>

            {/* Hidden description for expandable region */}
            <div 
              id={`expandable-description-${title.replace(/\s+/g, '-').toLowerCase()}`}
              className="sr-only"
            >
              {accessibleDescription}
            </div>
          </div>
        )}
      </Disclosure>
    );
  }

  // Standard accessible card
  const CardElement = onActivate ? 'button' : 'div';

  return (
    <CardElement
      ref={cardRef as any}
      className={`
        relative bg-white/90 rounded-lg border-2 ${styles.border}
        ${sizeStyles.padding} min-h-[140px] group cursor-pointer overflow-hidden
        transition-all duration-200 hover:transform hover:scale-[1.02] hover:-translate-y-1
        ${onActivate ? `${sizeStyles.focusRing} ${styles.focusRing} focus:outline-none focus:ring-opacity-50 ${sizeStyles.minTouchTarget}` : ''}
        ${styles.hoverBorder} ${className}
      `}
      onClick={onActivate}
      role={onActivate ? "button" : "region"}
      aria-label={accessibleLabel}
      aria-describedby={`description-${title.replace(/\s+/g, '-').toLowerCase()}`}
      tabIndex={onActivate ? (tabIndex || 0) : tabIndex}
      aria-hidden={hideFromScreenReader}
    >
      {/* Live region for screen readers */}
      {liveRegion && (
        <div
          ref={announceRef}
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
          role="status"
        >
          {announced && `${title} atualizada para ${formatNumber(value)}${getFormattedSuffix(value)}`}
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className={`
            ${sizeStyles.iconContainer} rounded-md ${styles.iconBg}
            group-hover:scale-110 transition-all duration-300
            flex items-center justify-center
          `}>
            <Icon 
              name={icon as any} 
              className={`${sizeStyles.iconSize} ${styles.iconColor}`}
              aria-hidden="true"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`
              ${sizeStyles.title} font-semibold text-gray-700 uppercase tracking-wide
              truncate ${sizeStyles.textSpacing}
            `}>
              {title}
            </h3>
            {subtitle && (
              <p className={`${sizeStyles.subtitle} text-gray-500 mt-1 truncate`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {trend && (
          <div 
            className={`
              px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1 
              ${getTrendColor()} transition-all duration-300 hover:scale-105
            `}
            role="img"
            aria-label={getTrendText()}
          >
            {getTrendIcon()}
            <span>
              {trend === 'up' && '+'}
              {trend === 'down' && '-'}
              {previousValue && Math.abs(((value - previousValue) / previousValue) * 100).toFixed(1)}
              {previousValue && '%'}
            </span>
          </div>
        )}
      </div>

      {/* Main Value Section */}
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

        {previousValue && (
          <p className={`text-sm text-gray-500 ${sizeStyles.textSpacing}`}>
            vs {formatNumber(previousValue)}{getFormattedSuffix(previousValue)} anterior
          </p>
        )}

        {description && (
          <p className={`${sizeStyles.description} text-gray-600 ${sizeStyles.textSpacing}`}>
            {description}
          </p>
        )}
      </div>

      {/* Hidden description for screen readers */}
      <div 
        id={`description-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className="sr-only"
      >
        {accessibleDescription}
      </div>
    </CardElement>
  );
}