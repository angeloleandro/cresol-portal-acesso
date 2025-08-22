'use client';

import React, { forwardRef } from 'react';
import { Icon } from '@/app/components/icons/Icon';

interface StandardSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  help?: string;
  fullWidth?: boolean;
  variant?: 'outline' | 'filled' | 'underline';
  selectSize?: 'sm' | 'md' | 'lg';
}

/**
 * StandardSelect - Componente de select nativo HTML estilizado
 * 
 * Versão simplificada para uso direto com select HTML nativo
 * Mantém consistência visual com FormSelect mas sem dependências externas
 */
export const StandardSelect = forwardRef<HTMLSelectElement, StandardSelectProps>(({
  label,
  error,
  help,
  fullWidth = true,
  variant = 'outline',
  selectSize = 'md',
  className = '',
  required,
  disabled,
  children,
  ...props
}, ref) => {
  
  // Classes base do select
  const selectClasses = [
    'w-full appearance-none font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50',
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50',
    'text-gray-700 bg-white cursor-pointer',
    'pr-10', // Espaço para o ícone da seta
  ];

  // Variantes
  if (variant === 'outline') {
    selectClasses.push(
      'border border-gray-300 rounded-md',
      'hover:border-gray-400'
    );
  } else if (variant === 'filled') {
    selectClasses.push(
      'bg-gray-50 border border-transparent rounded-md',
      'hover:bg-gray-100',
      'focus:bg-white focus:border-primary'
    );
  } else if (variant === 'underline') {
    selectClasses.push(
      'bg-transparent border-0 border-b-2 border-gray-300 rounded-none px-0',
      'focus:border-primary'
    );
  }

  // Tamanhos
  if (selectSize === 'sm') {
    selectClasses.push('text-sm px-3 py-2 h-9');
  } else if (selectSize === 'md') {
    selectClasses.push('text-base px-4 py-2.5 h-11');
  } else if (selectSize === 'lg') {
    selectClasses.push('text-lg px-5 py-3 h-12');
  }

  // Estado de erro
  if (error) {
    selectClasses.push('border-red-500 focus:ring-red-500 focus:ring-opacity-50');
  }

  const containerClasses = [
    'select-field-wrapper',
    fullWidth ? 'w-full' : 'w-auto',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={selectClasses.join(' ')}
          disabled={disabled}
          required={required}
          {...props}
        >
          {children}
        </select>
        
        {/* Ícone da seta */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Icon 
            name="chevron-down" 
            className="h-4 w-4 text-gray-500"
          />
        </div>
      </div>

      {error && (
        <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <Icon name="alert-circle" className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {help && !error && (
        <div className="mt-1 text-sm text-gray-500">
          {help}
        </div>
      )}
    </div>
  );
});

StandardSelect.displayName = 'StandardSelect';

export default StandardSelect;