'use client';

import { ReactNode, ElementType, createElement } from 'react';

interface StandardizedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'link' | 'success' | 'warning' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
  /** Renderiza como outro elemento/componente (ex.: Link do Next) */
  as?: ElementType<any>;
  /** Props extras do elemento renderizado (polimórfico) */
  [key: string]: any;
}

/**
 * Componente de botão padronizado seguindo o Design System Cresol
 * 
 * VARIANTS:
 * - primary: Laranja Cresol (#F58220) - Ações principais
 * - secondary: Cinza escuro - Ações secundárias  
 * - danger: Vermelho - Ações destrutivas
 * - outline: Bordered - Ações alternativas
 * - ghost: Transparente - Ações sutis
 * - link: Sem background - Links de ação
 * - success: Verde - Confirmações
 * - warning: Amarelo - Avisos
 * - info: Azul - Informacional
 * 
 * SIZES:
 * - xs: Para elementos muito compactos
 * - sm: Para espaços reduzidos
 * - md: Padrão principal
 * - lg: Para destaque
 * - xl: Para CTAs principais
 * 
 * FEATURES:
 * - Border-radius padronizado (6px)
 * - Estados hover, focus, disabled, loading
 * - Suporte a ícones (esquerda/direita)
 * - Links externos e internos
 * - Animações suaves
 * - Acessibilidade completa
 */
export default function StandardizedButton(props: StandardizedButtonProps) {
  const {
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    className = '',
    href,
    target,
    rel,
    as: As,
    ...rest
  } = props;
  // Classes base com arredondamento padronizado
  const baseClasses = 'font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden';
  
  // Classes de variante
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary/20 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500/20 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/20 shadow-sm',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary/20 hover:border-primary/50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500/20',
    link: 'bg-transparent text-primary hover:text-primary-dark focus:ring-primary/20 underline-offset-4 hover:underline',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/20 shadow-sm',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500/20 shadow-sm',
    info: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/20 shadow-sm'
  };
  
  // Classes de tamanho
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  // Classes de largura
  const widthClasses = fullWidth ? 'w-full' : '';

  // Tamanho do spinner baseado no tamanho do botão
  const spinnerSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${className}`;

  // Se "as" foi fornecido, renderiza o componente/elemento passado (polimórfico)
  if (As) {
    return createElement(
      As as ElementType<any>,
      {
        href,
        target,
        rel: target === '_blank' ? 'noopener noreferrer' : rel,
        onClick,
        className: buttonClasses,
        'aria-disabled': disabled || loading || undefined,
        ...rest
      },
      <>
        {loading && (
          <div className={`${spinnerSizes[size]} border-2 border-current border-t-transparent rounded-full animate-spin`} />
        )}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </>
    );
  }

  // Render como link âncora se href for fornecido
  if (href) {
    const linkProps = {
      href,
      target,
      rel: target === '_blank' ? 'noopener noreferrer' : rel
    };

    return (
      <a
        {...linkProps}
        onClick={onClick}
        className={buttonClasses}
        {...rest}
      >
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
    >
      {loading && (
        <div className={`${spinnerSizes[size]} border-2 border-current border-t-transparent rounded-full animate-spin`} />
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
}