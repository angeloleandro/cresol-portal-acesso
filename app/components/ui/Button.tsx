'use client';

import React, { forwardRef } from 'react';
import { Icon, IconName } from '@/app/components/icons/Icon';

// =============================================================================
// MINIMALIST BUTTON COMPONENT - CRESOL DESIGN STANDARD
// =============================================================================
// Simplified to only 2 variants: primary and secondary
// Clean, minimal design without animations or gradients
// =============================================================================

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'xs' | 'sm' | 'md';

interface ButtonProps {
  // === CORE PROPS ===
  variant?: ButtonVariant;
  size?: ButtonSize;
  
  // === STANDARD BUTTON PROPS ===
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  
  // === OPTIONAL ICON SUPPORT ===
  icon?: React.ReactNode | IconName;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  
  // === LINK PROPS ===
  href?: string;
  target?: string;
  rel?: string;
  
  // === FORWARDED PROPS ===
  [key: string]: any;
}

// =============================================================================
// VARIANT STYLES
// =============================================================================
const getVariantClasses = (variant: ButtonVariant): string => {
  switch (variant) {
    case 'primary':
      return 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/20';
    case 'secondary':
      return 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500/20';
    default:
      return 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/20';
  }
};

// =============================================================================
// SIZE STYLES
// =============================================================================
const getSizeClasses = (size: ButtonSize): string => {
  switch (size) {
    case 'xs':
      return 'px-2 py-1 text-xs h-6 min-w-[24px]';
    case 'sm':
      return 'px-3 py-1.5 text-sm h-8 min-w-[32px]';
    case 'md':
      return 'px-4 py-2 text-base h-10 min-w-[40px]';
    default:
      return 'px-3 py-1.5 text-sm h-8 min-w-[32px]';
  }
};

const getIconSize = (size: ButtonSize): string => {
  switch (size) {
    case 'xs':
      return 'w-3 h-3';
    case 'sm':
      return 'w-4 h-4';
    case 'md':
      return 'w-5 h-5';
    default:
      return 'w-4 h-4';
  }
};

// =============================================================================
// MAIN BUTTON COMPONENT
// =============================================================================
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'sm',
      type = 'button',
      disabled = false,
      onClick,
      className = '',
      icon,
      iconPosition = 'left',
      fullWidth = false,
      href,
      target,
      rel,
      ...rest
    },
    ref
  ) => {
    // =============================================================================
    // COMPUTE STYLES
    // =============================================================================
    const variantClasses = getVariantClasses(variant);
    const sizeClasses = getSizeClasses(size);
    const iconSizeClasses = getIconSize(size);
    
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-2',
      'rounded-md',
      'font-medium',
      'transition-colors',
      'duration-150',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'relative',
      'select-none'
    ].join(' ');

    const buttonClasses = [
      baseClasses,
      sizeClasses,
      variantClasses,
      fullWidth ? 'w-full' : '',
      className
    ].filter(Boolean).join(' ');

    // =============================================================================
    // RENDER ICON
    // =============================================================================
    const renderIcon = () => {
      if (!icon) return null;
      
      if (typeof icon === 'string') {
        return (
          <Icon 
            name={icon as IconName} 
            className={iconSizeClasses}
            aria-hidden="true"
          />
        );
      }
      
      return icon;
    };

    // =============================================================================
    // RENDER CONTENT
    // =============================================================================
    const renderContent = () => {
      if (icon) {
        return (
          <>
            {iconPosition === 'left' && renderIcon()}
            {children}
            {iconPosition === 'right' && renderIcon()}
          </>
        );
      }

      return children;
    };

    // =============================================================================
    // RENDER AS LINK OR BUTTON
    // =============================================================================
    if (href) {
      return (
        <a
          ref={ref as any}
          href={href}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : rel}
          className={buttonClasses}
          onClick={onClick as any}
          aria-disabled={disabled || undefined}
          {...rest}
        >
          {renderContent()}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={buttonClasses}
        aria-disabled={disabled || undefined}
        {...rest}
      >
        {renderContent()}
      </button>
    );
  }
);

Button.displayName = 'Button';

// =============================================================================
// EXPORTS
// =============================================================================
export default Button;
export type { ButtonProps };