'use client';

import { ReactNode } from 'react';

interface StandardizedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

/**
 * Card padronizado seguindo o design system da página /admin/users
 * 
 * Features:
 * - Fundo branco com borda cinza clara
 * - Arredondamento consistente (rounded-lg)
 * - Shadow sutil
 * - Estados hover opcionais
 * - Padding configurável
 * - Layout flexível
 */
export default function StandardizedCard({
  children,
  className = '',
  hover = false,
  padding = 'md'
}: StandardizedCardProps) {
  const baseClasses = 'bg-white border border-gray-200 rounded-lg';
  
  const hoverClasses = hover ? 'hover:shadow-md hover:border-gray-300 transition-all duration-200' : '';
  
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div className={`${baseClasses} ${hoverClasses} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}