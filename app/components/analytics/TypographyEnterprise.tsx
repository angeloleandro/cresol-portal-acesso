'use client';

interface PageTitleProps {
  children: string;
  className?: string;
  gradient?: boolean;
}

export function PageTitle({ children, className = '', gradient = true }: PageTitleProps) {
  return (
    <h1 className={`
      text-3xl md:text-4xl lg:text-5xl font-bold 
      ${gradient 
        ? 'bg-gradient-to-r from-gray-900 via-orange-600 to-orange-500 bg-clip-text text-transparent' 
        : 'text-gray-900'
      }
      leading-tight tracking-tight
      ${className}
    `}>
      {children}
    </h1>
  );
}

interface SectionTitleProps {
  children: string;
  className?: string;
  subtitle?: string;
}

export function SectionTitle({ children, className = '', subtitle }: SectionTitleProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
        {children}
      </h2>
      {subtitle && (
        <p className="text-gray-600 text-sm md:text-base">
          {subtitle}
        </p>
      )}
      <div className="mt-3 h-px bg-gradient-to-r from-orange-400 via-orange-200 to-transparent"></div>
    </div>
  );
}

interface MetricValueProps {
  value: number | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export function MetricValue({ 
  value, 
  className = '', 
  size = 'lg',
  animated = false 
}: MetricValueProps) {
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-lg md:text-xl';
      case 'md': return 'text-xl md:text-2xl';
      case 'lg': return 'text-2xl md:text-3xl lg:text-4xl';
      case 'xl': return 'text-3xl md:text-4xl lg:text-5xl';
      default: return 'text-2xl md:text-3xl lg:text-4xl';
    }
  };

  return (
    <div className={`
      ${getSizeClass()} 
      font-bold text-gray-900 
      tabular-nums leading-none
      ${animated ? 'transition-all duration-300 ease-out' : ''}
      ${className}
    `}>
      {value}
    </div>
  );
}

interface MetricLabelProps {
  children: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'muted';
}

export function MetricLabel({ 
  children, 
  className = '', 
  variant = 'primary' 
}: MetricLabelProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'text-gray-700 font-medium';
      case 'secondary': return 'text-gray-600 font-normal';
      case 'muted': return 'text-gray-500 font-normal';
      default: return 'text-gray-700 font-medium';
    }
  };

  return (
    <p className={`
      text-sm md:text-base 
      ${getVariantClass()}
      uppercase tracking-wide
      ${className}
    `}>
      {children}
    </p>
  );
}

interface CardTitleProps {
  children: string;
  className?: string;
  actions?: React.ReactNode;
}

export function CardTitle({ children, className = '', actions }: CardTitleProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h3 className="text-lg md:text-xl font-semibold text-gray-900">
        {children}
      </h3>
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
}

interface StatisticProps {
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: string;
  };
  className?: string;
}

export function Statistic({ 
  label, 
  value, 
  trend, 
  className = '' 
}: StatisticProps) {
  const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return 'text-emerald-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-baseline space-x-2">
        <MetricValue value={value} size="md" />
        {trend && (
          <span className={`text-sm font-medium ${getTrendColor(trend.direction)}`}>
            {trend.direction === 'up' && '+'}
            {trend.direction === 'down' && '-'}
            {trend.value}
          </span>
        )}
      </div>
      <MetricLabel variant="muted">{label}</MetricLabel>
    </div>
  );
}

interface DescriptionTextProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function DescriptionText({ 
  children, 
  className = '', 
  size = 'md' 
}: DescriptionTextProps) {
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'md': return 'text-base';
      case 'lg': return 'text-lg';
      default: return 'text-base';
    }
  };

  return (
    <p className={`
      ${getSizeClass()}
      text-gray-600 leading-relaxed
      ${className}
    `}>
      {children}
    </p>
  );
}

interface BadgeTextProps {
  children: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export function BadgeText({ 
  children, 
  className = '', 
  variant = 'primary' 
}: BadgeTextProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'bg-orange-100 text-orange-800';
      case 'secondary':
        return 'bg-green-100 text-green-800';
      case 'success':
        return 'bg-emerald-100 text-emerald-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full
      text-xs font-medium
      ${getVariantClass()}
      ${className}
    `}>
      {children}
    </span>
  );
}

interface GradientTextProps {
  children: string;
  className?: string;
  from?: string;
  to?: string;
}

export function GradientText({ 
  children, 
  className = '',
  from = 'from-orange-600',
  to = 'to-orange-400'
}: GradientTextProps) {
  return (
    <span className={`
      bg-gradient-to-r ${from} ${to} 
      bg-clip-text text-transparent
      ${className}
    `}>
      {children}
    </span>
  );
}