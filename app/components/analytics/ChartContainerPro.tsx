'use client';

import { ReactNode, useState, memo, useCallback, useMemo } from 'react';
import { Icon } from '@/app/components/icons/Icon';

interface ChartContainerProProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Ant Design inspired chart actions */
  actions?: ReactNode;
  /** HeroUI inspired extra content */
  extra?: ReactNode;
  /** Professional size variants */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Enhanced variant system */
  variant?: 'default' | 'minimal' | 'elevated' | 'bordered' | 'glass';
  /** Chart type for specific styling */
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'mixed';
  /** Loading state */
  isLoading?: boolean;
  /** Collapsible functionality */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Header layout */
  headerLayout?: 'default' | 'centered' | 'split' | 'minimal';
  /** Footer content */
  footer?: ReactNode;
  /** Export functionality */
  onExport?: () => void;
  /** Refresh functionality */
  onRefresh?: () => void;
  /** Full screen toggle */
  onFullscreen?: () => void;
  /** Professional hover effects */
  hoverEffect?: 'subtle' | 'lift' | 'glow' | 'border' | 'none';
  /** Cresol brand integration */
  brandColor?: 'orange' | 'green' | 'blue' | 'purple' | 'gray' | 'emerald';
  className?: string;
}

const sizeConfig = {
  sm: {
    padding: 'p-4',
    headerPadding: 'px-4 py-3',
    footerPadding: 'px-4 py-3',
    title: 'text-lg',
    subtitle: 'text-sm',
    minHeight: 'min-h-[300px]',
    iconSize: 'h-4 w-4',
    buttonSize: 'h-8 w-8',
    spacing: 'space-y-3'
  },
  md: {
    padding: 'p-6',
    headerPadding: 'px-6 py-4',
    footerPadding: 'px-6 py-4',
    title: 'text-xl',
    subtitle: 'text-base',
    minHeight: 'min-h-[400px]',
    iconSize: 'h-5 w-5',
    buttonSize: 'h-9 w-9',
    spacing: 'space-y-4'
  },
  lg: {
    padding: 'p-8',
    headerPadding: 'px-8 py-6',
    footerPadding: 'px-8 py-6',
    title: 'text-2xl',
    subtitle: 'text-lg',
    minHeight: 'min-h-[500px]',
    iconSize: 'h-6 w-6',
    buttonSize: 'h-10 w-10',
    spacing: 'space-y-6'
  },
  xl: {
    padding: 'p-10',
    headerPadding: 'px-10 py-8',
    footerPadding: 'px-10 py-8',
    title: 'text-3xl',
    subtitle: 'text-xl',
    minHeight: 'min-h-[600px]',
    iconSize: 'h-8 w-8',
    buttonSize: 'h-12 w-12',
    spacing: 'space-y-8'
  }
};

const ChartContainerPro = memo(function ChartContainerPro({
  title,
  subtitle,
  children,
  actions,
  extra,
  size = 'md',
  variant = 'default',
  chartType = 'bar',
  isLoading = false,
  collapsible = false,
  defaultCollapsed = false,
  headerLayout = 'default',
  footer,
  onExport,
  onRefresh,
  onFullscreen,
  hoverEffect = 'subtle',
  brandColor = 'orange',
  className = ''
}: ChartContainerProProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Memoized handlers para evitar re-renders desnecessários
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleCollapseToggle = useCallback(() => setIsCollapsed(prev => !prev), []);
  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen(prev => !prev);
    onFullscreen?.();
  }, [onFullscreen]);

  // Memoized configurations
  const sizeStyles = useMemo(() => sizeConfig[size], [size]);

  // Memoized variant styles with Cresol brand integration
  const styles = useMemo(() => {
    const brandColors = {
      orange: {
        primary: 'border-orange-200',
        accent: 'text-orange-600',
        bg: 'bg-orange-50',
        hover: 'hover:border-orange-300',
        shadow: 'shadow-orange-100/30',
        gradient: 'from-orange-400 to-orange-600'
      },
      green: {
        primary: 'border-emerald-200',
        accent: 'text-emerald-600',
        bg: 'bg-emerald-50',
        hover: 'hover:border-emerald-300',
        shadow: 'shadow-emerald-100/30',
        gradient: 'from-emerald-400 to-emerald-600'
      },
      blue: {
        primary: 'border-blue-200',
        accent: 'text-blue-600',
        bg: 'bg-blue-50',
        hover: 'hover:border-blue-300',
        shadow: 'shadow-blue-100/30',
        gradient: 'from-blue-400 to-blue-600'
      },
      purple: {
        primary: 'border-purple-200',
        accent: 'text-purple-600',
        bg: 'bg-purple-50',
        hover: 'hover:border-purple-300',
        shadow: 'shadow-purple-100/30',
        gradient: 'from-purple-400 to-purple-600'
      },
      gray: {
        primary: 'border-gray-200',
        accent: 'text-gray-600',
        bg: 'bg-gray-50',
        hover: 'hover:border-gray-300',
        shadow: 'shadow-gray-100/30',
        gradient: 'from-gray-400 to-gray-600'
      },
      emerald: {
        primary: 'border-emerald-200',
        accent: 'text-emerald-600',
        bg: 'bg-emerald-50',
        hover: 'hover:border-emerald-300',
        shadow: 'shadow-emerald-100/30',
        gradient: 'from-emerald-400 to-emerald-600'
      }
    };

    const colors = brandColors[brandColor];

    switch (variant) {
      case 'minimal':
        return {
          container: 'bg-transparent border-0',
          header: 'border-b border-gray-100',
          footer: 'border-t border-gray-100',
          shadow: '',
          hover: ''
        };
      case 'elevated':
        return {
          container: `bg-white border ${colors.primary} shadow-lg`,
          header: 'border-b border-gray-100',
          footer: 'border-t border-gray-100',
          shadow: `hover:shadow-xl ${colors.shadow}`,
          hover: colors.hover
        };
      case 'bordered':
        return {
          container: `bg-white border-2 ${colors.primary}`,
          header: `border-b border-gray-100`,
          footer: `border-t border-gray-100`,
          shadow: 'shadow-sm',
          hover: colors.hover
        };
      case 'glass':
        return {
          container: 'bg-white/80 backdrop-blur-md border border-white/20',
          header: 'border-b border-white/10',
          footer: 'border-t border-white/10',
          shadow: 'shadow-lg',
          hover: 'hover:bg-white/90'
        };
      case 'default':
      default:
        return {
          container: `bg-white border ${colors.primary} shadow-sm`,
          header: 'border-b border-gray-100',
          footer: 'border-t border-gray-100',
          shadow: `hover:shadow-md ${colors.shadow}`,
          hover: colors.hover
        };
    }
  }, [variant, brandColor]);

  // Memoized hover effect styles
  const hoverEffectStyles = useMemo(() => {
    switch (hoverEffect) {
      case 'lift':
        return 'hover:transform hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300';
      case 'glow':
        return `${styles.shadow} transition-all duration-300`;
      case 'border':
        return `${styles.hover} transition-all duration-300`;
      case 'subtle':
        return 'hover:bg-gray-50/50 transition-all duration-200';
      case 'none':
      default:
        return '';
    }
  }, [hoverEffect, styles]);

  // Memoized header layout styles
  const headerLayoutStyles = useMemo(() => {
    switch (headerLayout) {
      case 'centered':
        return 'flex flex-col items-center text-center space-y-2';
      case 'split':
        return 'flex items-center justify-between';
      case 'minimal':
        return 'flex items-center space-x-4';
      case 'default':
      default:
        return 'flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0';
    }
  }, [headerLayout]);

  // Memoized brand colors
  const colors = useMemo(() => ({
    orange: { gradient: 'from-orange-400 to-orange-600', accent: 'text-orange-600' },
    green: { gradient: 'from-emerald-400 to-emerald-600', accent: 'text-emerald-600' },
    blue: { gradient: 'from-blue-400 to-blue-600', accent: 'text-blue-600' },
    purple: { gradient: 'from-purple-400 to-purple-600', accent: 'text-purple-600' },
    gray: { gradient: 'from-gray-400 to-gray-600', accent: 'text-gray-600' },
    emerald: { gradient: 'from-emerald-400 to-emerald-600', accent: 'text-emerald-600' }
  }[brandColor] || { gradient: 'from-orange-400 to-orange-600', accent: 'text-orange-600' }), [brandColor]);

  // Memoized Toolbar Button Component
  const ToolbarButton = memo(function ToolbarButton({ icon, onClick: onButtonClick, tooltip }: { icon: string; onClick?: () => void; tooltip: string }) {
    return (
    <button
      onClick={onButtonClick}
      className={`
        ${sizeStyles.buttonSize} rounded-lg flex items-center justify-center
        bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800
        transition-all duration-200 hover:scale-105
        border border-gray-200 hover:border-gray-300
        focus:outline-none focus:ring-2 focus:ring-orange-200 focus:ring-opacity-50
      `}
      title={tooltip}
    >
      <Icon name={icon as any} className={sizeStyles.iconSize} />
    </button>
    );
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`
        ${styles.container} rounded-2xl ${sizeStyles.minHeight} overflow-hidden
        ${className}
      `}>
        <div className={`${styles.header} ${sizeStyles.headerPadding}`}>
          <div className="animate-pulse">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={sizeStyles.padding}>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="flex justify-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-14"></div>
            </div>
          </div>
        </div>
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>
    );
  }

  return (
    <div 
      className={`
        relative ${styles.container} rounded-2xl overflow-hidden
        ${hoverEffectStyles}
        ${isFullscreen ? 'fixed inset-4 z-50' : sizeStyles.minHeight}
        ${className}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Enhanced Top Border Gradient */}
      <div className={`
        absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}
        ${isHovered ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-300
      `}></div>

      {/* Professional Header */}
      <div className={`${styles.header} ${sizeStyles.headerPadding} relative`}>
        <div className={headerLayoutStyles}>
          {/* Title Section */}
          <div className={headerLayout === 'split' ? 'flex-1' : ''}>
            <h3 className={`${sizeStyles.title} font-bold text-gray-900 leading-tight`}>
              {title}
            </h3>
            {subtitle && (
              <p className={`${sizeStyles.subtitle} text-gray-600 mt-1 leading-relaxed`}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions and Controls */}
          <div className="flex items-center space-x-3">
            {/* Custom Actions */}
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center space-x-2 bg-gray-50/50 rounded-lg p-1 border border-gray-200">
              {onRefresh && (
                <ToolbarButton 
                  icon="refresh" 
                  onClick={onRefresh} 
                  tooltip="Atualizar dados"
                />
              )}
              
              {onExport && (
                <ToolbarButton 
                  icon="download" 
                  onClick={onExport} 
                  tooltip="Exportar gráfico"
                />
              )}

              {onFullscreen && (
                <ToolbarButton 
                  icon="expand" 
                  onClick={handleFullscreenToggle} 
                  tooltip={isFullscreen ? "Sair tela cheia" : "Tela cheia"}
                />
              )}

              {collapsible && (
                <ToolbarButton 
                  icon={isCollapsed ? "chevron-down" : "chevron-up"} 
                  onClick={handleCollapseToggle} 
                  tooltip={isCollapsed ? "Expandir" : "Recolher"}
                />
              )}
            </div>

            {/* Extra Content */}
            {extra && (
              <div className="ml-4">
                {extra}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Content Area */}
      {!isCollapsed && (
        <div className={`${sizeStyles.padding} ${sizeStyles.spacing} flex-1`}>
          <div className="relative">
            {/* Chart Type Indicator */}
            <div className={`
              absolute top-2 left-2 z-10 px-2 py-1 rounded-md text-xs font-medium
              bg-white/90 backdrop-blur-sm border border-gray-200
              ${colors.accent} shadow-sm
            `}>
              {chartType.charAt(0).toUpperCase() + chartType.slice(1)}
            </div>

            {/* Chart Container */}
            <div className="relative bg-gradient-to-br from-gray-50/30 to-white rounded-xl border border-gray-100 overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      )}

      {/* Professional Footer */}
      {footer && !isCollapsed && (
        <div className={`${styles.footer} ${sizeStyles.footerPadding}`}>
          {footer}
        </div>
      )}

      {/* Hover Glow Effect */}
      {hoverEffect === 'glow' && (
        <div className={`
          absolute inset-0 rounded-2xl 
          bg-gradient-to-br from-${brandColor}-50/0 to-${brandColor}-100/0
          ${isHovered ? `from-${brandColor}-50/10 to-${brandColor}-100/5` : ''}
          transition-all duration-500 pointer-events-none
        `}></div>
      )}

      {/* Professional Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="flex flex-col items-center space-y-4">
            <div className={`
              h-8 w-8 border-2 border-gray-300 border-t-${brandColor}-500 
              rounded-full animate-spin
            `}></div>
            <p className="text-sm font-medium text-gray-600">
              Carregando gráfico...
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

ChartContainerPro.displayName = 'ChartContainerPro';

export default ChartContainerPro;