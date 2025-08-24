'use client';

import { ReactNode } from 'react';

interface GridLayoutResponsivoProps {
  children: ReactNode;
  className?: string;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    large?: number;
  };
}

export default function GridLayoutResponsivo({
  children,
  className = '',
  gap = 'md',
  columns = {
    large: 4
  }
}: GridLayoutResponsivoProps) {
  
  const getGapClass = () => {
    switch (gap) {
      case 'sm': return 'gap-4';
      case 'md': return 'gap-6';
      case 'lg': return 'gap-8';
      case 'xl': return 'gap-10';
      default: return 'gap-6';
    }
  };

  const getGridClass = () => {
    const { mobile = 1, tablet = 2, desktop = 3, large = 4 } = columns;
    
    let gridClass = 'grid ';
    
    // Mobile first
    gridClass += `grid-cols-${mobile} `;
    
    // Tablet
    if (tablet !== mobile) {
      gridClass += `md:grid-cols-${tablet} `;
    }
    
    // Desktop
    if (desktop !== tablet) {
      gridClass += `lg:grid-cols-${desktop} `;
    }
    
    // Large desktop
    if (large !== desktop) {
      gridClass += `xl:grid-cols-${large} `;
    }
    
    return gridClass;
  };

  return (
    <div className={`${getGridClass()} ${getGapClass()} ${className}`}>
      {children}
    </div>
  );
}

// Componente especializado para métricas
interface MetricsGridProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * MetricsGrid function
 * @todo Add proper documentation
 */
export function MetricsGrid({ children, className = '', style }: MetricsGridProps) {
  return (
    <div 
      className={`
        grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 
        gap-6 mb-8
        ${className}
      `}
      style={style}
    >
      {children}
    </div>
  );
}

// Componente para layout de dashboard
interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * DashboardLayout function
 * @todo Add proper documentation
 */
export function DashboardLayout({ children, className = '', style }: DashboardLayoutProps) {
  return (
    <div 
      className={`
        grid grid-cols-1 lg:grid-cols-12 gap-8
        ${className}
      `}
      style={style}
    >
      {children}
    </div>
  );
}

// Componente para seção principal do dashboard
interface MainSectionProps {
  children: ReactNode;
  className?: string;
}

/**
 * MainSection function
 * @todo Add proper documentation
 */
export function MainSection({ children, className = '' }: MainSectionProps) {
  return (
    <div className={`
      lg:col-span-8 xl:col-span-9
      ${className}
    `}>
      {children}
    </div>
  );
}

// Componente para sidebar do dashboard
interface SidebarSectionProps {
  children: ReactNode;
  className?: string;
}

/**
 * SidebarSection function
 * @todo Add proper documentation
 */
export function SidebarSection({ children, className = '' }: SidebarSectionProps) {
  return (
    <div className={`
      lg:col-span-4 xl:col-span-3
      space-y-6
      ${className}
    `}>
      {children}
    </div>
  );
}

// Container responsivo principal
interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * ResponsiveContainer function
 * @todo Add proper documentation
 */
export function ResponsiveContainer({
  children,
  className = '',
  maxWidth = '7xl',
  padding = 'lg'
}: ResponsiveContainerProps) {
  
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case '7xl': return 'max-w-7xl';
      default: return 'max-w-7xl';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'sm': return 'px-4 sm:px-6';
      case 'md': return 'px-4 sm:px-6 lg:px-8';
      case 'lg': return 'px-4 sm:px-6 lg:px-8 py-8';
      case 'xl': return 'px-4 sm:px-6 lg:px-8 py-12';
      default: return 'px-4 sm:px-6 lg:px-8 py-8';
    }
  };

  return (
    <div className={`
      ${getMaxWidthClass()} mx-auto ${getPaddingClass()}
      ${className}
    `}>
      {children}
    </div>
  );
}