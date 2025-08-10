'use client';

import { ReactNode } from 'react';

interface StandardizedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  /** Título opcional do card (renderiza um header limpo quando presente) */
  title?: ReactNode;
  /** Subtítulo/descrição opcional para o header */
  subtitle?: ReactNode;
  /** Ações alinhadas à direita no header (botões, etc.) */
  actions?: ReactNode;
  /** Conteúdo do rodapé (separado por uma borda superior sutil) */
  footer?: ReactNode;
  /** Variante visual do card */
  variant?: 'default' | 'elevated' | 'subtle' | 'outline';
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
  padding = 'md',
  title,
  subtitle,
  actions,
  footer,
  variant = 'default'
}: StandardizedCardProps) {
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    outline: 'bg-white border border-gray-200',
    elevated: 'bg-white border border-gray-100 shadow-sm',
    subtle: 'bg-gray-50 border border-gray-200'
  } as const;

  const baseClasses = `${variantClasses[variant]} rounded-lg`;
  
  const hoverClasses = hover ? 'hover:shadow-md hover:border-gray-300 transition-all duration-200' : '';
  
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {/* Header opcional */}
      {(title || actions || subtitle) && (
        <div className={`px-4 ${padding !== 'sm' ? 'pt-4' : 'pt-3'} ${subtitle ? 'pb-2' : 'pb-3'} border-b border-gray-100`}> 
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex-shrink-0">{actions}</div>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      <div className={`${paddingClasses[padding]}`}>
        {children}
      </div>

      {/* Footer opcional */}
      {footer && (
        <div className={`px-4 ${padding !== 'sm' ? 'pb-4' : 'pb-3'} ${subtitle || title ? 'pt-2' : 'pt-3'} border-t border-gray-100`}>
          {footer}
        </div>
      )}
    </div>
  );
}