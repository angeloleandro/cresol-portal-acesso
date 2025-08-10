'use client';

import { ReactNode, useState, useEffect, memo, useCallback, useMemo } from 'react';

interface DashboardGridAdvancedProps {
  children: ReactNode;
  /** Grid layout configuration */
  layout?: 'masonry' | 'uniform' | 'responsive' | 'fixed' | 'auto';
  /** Column configuration for different breakpoints */
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  /** Gap configuration */
  gap?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  } | number;
  /** Aspect ratio for uniform layout */
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'golden' | number;
  /** Minimum item width for auto layout */
  minItemWidth?: number;
  /** Maximum item width for auto layout */
  maxItemWidth?: number;
  /** Animation configuration */
  animation?: {
    enabled?: boolean;
    type?: 'fade' | 'slide' | 'scale' | 'stagger';
    duration?: number;
    delay?: number;
  };
  /** Loading state */
  isLoading?: boolean;
  /** Loading skeleton configuration */
  loadingConfig?: {
    count?: number;
    variant?: 'card' | 'metric' | 'chart';
    animation?: 'pulse' | 'shimmer' | 'wave';
  };
  /** Professional styling variant */
  variant?: 'default' | 'minimal' | 'elevated' | 'bordered' | 'glass';
  /** Cresol brand integration */
  brandColor?: 'orange' | 'green' | 'blue' | 'purple' | 'gray';
  /** Container padding */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Auto-sizing behavior */
  autoSize?: boolean;
  /** Responsive behavior */
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const defaultColumns = {
  xs: 1,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  '2xl': 4
};

const defaultGap = {
  xs: 4,
  sm: 4,
  md: 6,
  lg: 6,
  xl: 8,
  '2xl': 8
};

const paddingConfig = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10'
};

const DashboardGridAdvanced = memo(function DashboardGridAdvanced({
  children,
  layout = 'responsive',
  columns = defaultColumns,
  gap = defaultGap,
  aspectRatio,
  minItemWidth = 280,
  maxItemWidth = 400,
  animation = { enabled: true, type: 'stagger', duration: 300, delay: 50 },
  isLoading = false,
  loadingConfig = { count: 8, variant: 'metric', animation: 'shimmer' },
  variant = 'default',
  brandColor = 'orange',
  padding = 'none',
  autoSize = false,
  responsive = true,
  className = '',
  style
}: DashboardGridAdvancedProps) {
  const [mounted, setMounted] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    
    if (autoSize && typeof window !== 'undefined') {
      const updateWidth = () => {
        const container = document.getElementById('dashboard-grid-container');
        if (container) {
          setContainerWidth(container.offsetWidth);
        }
      };

      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, [autoSize]);

  // Enhanced variant styles with Cresol brand integration
  const getVariantStyles = () => {
    const brandColors = {
      orange: {
        accent: 'border-orange-200',
        bg: 'bg-orange-50/30',
        hover: 'hover:bg-orange-50/50'
      },
      green: {
        accent: 'border-emerald-200',
        bg: 'bg-emerald-50/30',
        hover: 'hover:bg-emerald-50/50'
      },
      blue: {
        accent: 'border-blue-200',
        bg: 'bg-blue-50/30',
        hover: 'hover:bg-blue-50/50'
      },
      purple: {
        accent: 'border-purple-200',
        bg: 'bg-purple-50/30',
        hover: 'hover:bg-purple-50/50'
      },
      gray: {
        accent: 'border-gray-200',
        bg: 'bg-gray-50/30',
        hover: 'hover:bg-gray-50/50'
      }
    };

    const colors = brandColors[brandColor];

    switch (variant) {
      case 'minimal':
        return {
          container: 'bg-transparent',
          item: ''
        };
      case 'elevated':
        return {
          container: `bg-white shadow-lg rounded-lg border ${colors.accent}`,
          item: 'transform transition-all duration-300 hover:scale-[1.01]'
        };
      case 'bordered':
        return {
          container: `bg-white border-2 ${colors.accent} rounded-lg`,
          item: 'border border-gray-100 rounded-md'
        };
      case 'glass':
        return {
          container: 'bg-white/80 backdrop-blur-md border border-white/20 rounded-lg shadow-lg',
          item: 'bg-white/50 backdrop-blur-sm rounded-md'
        };
      case 'default':
      default:
        return {
          container: 'bg-white border border-gray-200 rounded-lg shadow-sm',
          item: ''
        };
    }
  };

  const styles = getVariantStyles();

  // Calculate grid classes based on layout type
  const getGridClasses = () => {
    const gapValue = typeof gap === 'number' ? gap : gap;
    const gapClasses = typeof gapValue === 'number' 
      ? `gap-${gapValue}` 
      : `gap-${gapValue.xs} sm:gap-${gapValue.sm} md:gap-${gapValue.md} lg:gap-${gapValue.lg} xl:gap-${gapValue.xl} 2xl:gap-${gapValue['2xl']}`;

    switch (layout) {
      case 'masonry':
        return `columns-${columns.xs} sm:columns-${columns.sm} md:columns-${columns.md} lg:columns-${columns.lg} xl:columns-${columns.xl} 2xl:columns-${columns['2xl']} ${gapClasses}`;
      
      case 'uniform':
        return `grid grid-cols-${columns.xs} sm:grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} xl:grid-cols-${columns.xl} 2xl:grid-cols-${columns['2xl']} ${gapClasses}`;
      
      case 'responsive':
        return `grid grid-cols-${columns.xs} sm:grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} xl:grid-cols-${columns.xl} 2xl:grid-cols-${columns['2xl']} ${gapClasses} auto-rows-max`;
      
      case 'fixed':
        return `grid ${gapClasses}`;
      
      case 'auto':
        const autoColumns = Math.floor(containerWidth / minItemWidth) || 1;
        return `grid grid-cols-${Math.min(autoColumns, columns.xl || 4)} ${gapClasses}`;
      
      default:
        return `grid grid-cols-${columns.xs} sm:grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} xl:grid-cols-${columns.xl} 2xl:grid-cols-${columns['2xl']} ${gapClasses}`;
    }
  };

  // Get aspect ratio classes
  const getAspectRatioClass = () => {
    if (!aspectRatio) return '';
    
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'video': return 'aspect-video';
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-[4/3]';
      case 'golden': return 'aspect-[1.618/1]';
      default: 
        if (typeof aspectRatio === 'number') {
          return `aspect-[${aspectRatio}/1]`;
        }
        return '';
    }
  };

  // Animation styles
  const getAnimationStyles = () => {
    if (!animation?.enabled || !mounted) return {};

    switch (animation.type) {
      case 'fade':
        return {
          animationName: 'fadeInUp',
          animationDuration: `${animation.duration}ms`,
          animationFillMode: 'both'
        };
      case 'slide':
        return {
          animationName: 'slideInUp',
          animationDuration: `${animation.duration}ms`,
          animationFillMode: 'both'
        };
      case 'scale':
        return {
          animationName: 'scaleIn',
          animationDuration: `${animation.duration}ms`,
          animationFillMode: 'both'
        };
      case 'stagger':
        return {
          animationName: 'fadeInUp',
          animationDuration: `${animation.duration}ms`,
          animationFillMode: 'both'
        };
      default:
        return {};
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => {
    const skeletonItems = Array.from({ length: loadingConfig.count || 8 }, (_, i) => i);
    
    const getSkeletonContent = () => {
      switch (loadingConfig.variant) {
        case 'metric':
          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded-sm w-24"></div>
                  <div className="h-3 bg-gray-200 rounded-sm w-16"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded-sm w-20"></div>
              <div className="h-3 bg-gray-200 rounded-sm w-32"></div>
            </div>
          );
        case 'chart':
          return (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded-sm w-32"></div>
                <div className="h-8 w-20 bg-gray-200 rounded-sm"></div>
              </div>
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="flex justify-center space-x-4">
                <div className="h-3 bg-gray-200 rounded-sm w-16"></div>
                <div className="h-3 bg-gray-200 rounded-sm w-20"></div>
                <div className="h-3 bg-gray-200 rounded-sm w-14"></div>
              </div>
            </div>
          );
        case 'card':
        default:
          return (
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded-sm w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded-sm w-1/2"></div>
              </div>
            </div>
          );
      }
    };

    const getSkeletonAnimation = () => {
      switch (loadingConfig.animation) {
        case 'shimmer':
          return 'animate-shimmer';
        case 'wave':
          return 'animate-wave';
        case 'pulse':
        default:
          return 'animate-pulse';
      }
    };

    return (
      <>
        {skeletonItems.map((i) => (
          <div 
            key={i}
            className={`
              bg-white rounded-md border border-gray-200 p-6 overflow-hidden relative
              ${getAspectRatioClass()}
              ${styles.item}
            `}
          >
            <div className={getSkeletonAnimation()}>
              {getSkeletonContent()}
            </div>
            {/* Enhanced Shimmer Effect */}
            {loadingConfig.animation === 'shimmer' && (
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            )}
          </div>
        ))}
      </>
    );
  };

  // Enhanced children with animation delays
  const renderChildren = () => {
    if (!children) return null;

    const childrenArray = Array.isArray(children) ? children : [children];
    
    return childrenArray.map((child, index) => {
      if (!child) return null;

      const animationDelay = animation?.enabled && animation.type === 'stagger' 
        ? { animationDelay: `${(animation.delay || 50) * index}ms` }
        : {};

      return (
        <div
          key={index}
          className={`
            ${getAspectRatioClass()}
            ${styles.item}
            ${animation?.enabled ? 'animate-fade-in-up' : ''}
          `}
          style={{
            ...getAnimationStyles(),
            ...animationDelay
          }}
        >
          {child}
        </div>
      );
    });
  };

  return (
    <div 
      id="dashboard-grid-container"
      className={`
        ${styles.container}
        ${paddingConfig[padding]}
        ${className}
      `}
      style={style}
    >
      <div 
        className={`
          ${getGridClasses()}
          ${layout === 'masonry' ? '' : 'items-start'}
        `}
      >
        {isLoading ? <LoadingSkeleton /> : renderChildren()}
      </div>

      {/* CSS Animation Keyframes (inject into document head) */}
      {mounted && animation?.enabled && (
        <style jsx global>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          
          @keyframes wave {
            0%, 60%, 100% {
              transform: initial;
            }
            30% {
              transform: translateY(-15px);
            }
          }
          
          .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          
          .animate-shimmer {
            animation: shimmer 1.5s ease-in-out infinite;
          }
          
          .animate-wave {
            animation: wave 1.3s ease-in-out infinite;
          }
        `}</style>
      )}
    </div>
  );
});

DashboardGridAdvanced.displayName = 'DashboardGridAdvanced';

export default DashboardGridAdvanced;

// Specialized Components for Common Use Cases

// Metrics Grid Component
interface MetricsGridAdvancedProps extends Omit<DashboardGridAdvancedProps, 'layout' | 'aspectRatio'> {
  metrics?: 'compact' | 'standard' | 'detailed';
}

export function MetricsGridAdvanced({ 
  metrics = 'standard', 
  columns = { xs: 1, sm: 2, md: 2, lg: 4, xl: 4, '2xl': 6 },
  gap = 6,
  ...props 
}: MetricsGridAdvancedProps) {
  const aspectRatio = metrics === 'compact' ? undefined : metrics === 'detailed' ? 'portrait' : 'landscape';
  
  return (
    <DashboardGridAdvanced
      layout="responsive"
      columns={columns}
      gap={gap}
      aspectRatio={aspectRatio}
      animation={{ enabled: true, type: 'stagger', duration: 300, delay: 100 }}
      brandColor="orange"
      {...props}
    />
  );
}

// Charts Grid Component
interface ChartsGridAdvancedProps extends Omit<DashboardGridAdvancedProps, 'layout' | 'aspectRatio'> {
  chartSize?: 'small' | 'medium' | 'large';
}

export function ChartsGridAdvanced({ 
  chartSize = 'medium',
  columns = { xs: 1, sm: 1, md: 2, lg: 2, xl: 3, '2xl': 3 },
  gap = 8,
  ...props 
}: ChartsGridAdvancedProps) {
  const aspectRatioMap = {
    small: 'video' as const,
    medium: 'landscape' as const,
    large: 'golden' as const
  };
  
  return (
    <DashboardGridAdvanced
      layout="uniform"
      columns={columns}
      gap={gap}
      aspectRatio={aspectRatioMap[chartSize]}
      animation={{ enabled: true, type: 'fade', duration: 400 }}
      brandColor="green"
      {...props}
    />
  );
}