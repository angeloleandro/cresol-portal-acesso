'use client';

import { ReactNode } from 'react';

interface StandardizedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

/**
 * Botão padronizado seguindo o design system da página /admin/users
 * 
 * Variants:
 * - primary: Laranja Cresol (#F58220) - Para ações principais
 * - secondary: Cinza - Para ações secundárias
 * - danger: Vermelho - Para ações destrutivas
 * 
 * Features:
 * - Hover states consistentes
 * - Transition animations (duration-150)
 * - Estados loading e disabled
 * - Tamanhos responsivos
 * - Arredondamento padrão
 */
export default function StandardizedButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = ''
}: StandardizedButtonProps) {
  const baseClasses = 'font-medium rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary/20',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500/20',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/20'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}