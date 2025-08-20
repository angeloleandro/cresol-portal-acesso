'use client';

import { ReactNode, ElementType, forwardRef } from 'react';
import { Button, ButtonProps } from '@/app/components/ui/Button';

// =============================================================================
// BACKWARDS COMPATIBILITY WRAPPER
// =============================================================================
// This component provides backwards compatibility for existing StandardizedButton usage
// while redirecting to the new Chakra UI v3 compliant Button implementation
// =============================================================================

interface LegacyStandardizedButtonProps {
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
  as?: ElementType<any>;
  [key: string]: any;
}

// =============================================================================
// LEGACY VARIANT MAPPING TO CHAKRA UI V3
// =============================================================================
const mapLegacyVariant = (variant: LegacyStandardizedButtonProps['variant']): 'primary' | 'secondary' => {
  switch (variant) {
    case 'primary':
    case 'danger':
    case 'success':
      return 'primary';
    case 'secondary':
    case 'outline':
    case 'ghost':
    case 'link':
    case 'warning':
    case 'info':
    default:
      return 'secondary';
  }
};

// =============================================================================
// LEGACY SIZE MAPPING TO CHAKRA UI V3
// =============================================================================
const mapLegacySize = (size: LegacyStandardizedButtonProps['size']): 'xs' | 'sm' | 'md' => {
  switch (size) {
    case 'xs':
      return 'xs';
    case 'sm':
      return 'sm';
    case 'lg':
    case 'xl':
    case 'md':
    default:
      return 'md';
  }
};

/**
 * LEGACY STANDARDIZED BUTTON WRAPPER
 * 
 * This component provides backwards compatibility for existing StandardizedButton usage.
 * It maps legacy props to the new Chakra UI v3 Button component specifications.
 * 
 * @deprecated Use Button from '@/app/components/ui/Button' directly for new implementations
 * 
 * LEGACY VARIANT MAPPING:
 * - primary → solid + orange
 * - secondary → outline + gray  
 * - danger → solid + red
 * - outline → outline + orange
 * - ghost → ghost + gray
 * - link → plain + orange
 * - success → solid + green
 * - warning → solid + yellow
 * - info → solid + blue
 * 
 * All other functionality is preserved exactly as before.
 */
const StandardizedButton = forwardRef<HTMLButtonElement, LegacyStandardizedButtonProps>(
  (
    {
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
      as,
      ...rest
    },
    ref
  ) => {
    // Map legacy props to new Button props
    const newVariant = mapLegacyVariant(variant);
    const newSize = mapLegacySize(size);

    // Handle icon composition (legacy support)
    const iconElement = icon && iconPosition ? icon : undefined;

    return (
      <Button
        ref={ref}
        type={type}
        variant={newVariant}
        size={newSize}
        disabled={disabled}
        onClick={onClick}
        className={className}
        icon={iconElement}
        iconPosition={iconPosition}
        {...rest}
      >
        {children}
      </Button>
    );
  }
);

StandardizedButton.displayName = 'StandardizedButton';

export default StandardizedButton;

// Export type for backwards compatibility
export type { LegacyStandardizedButtonProps as StandardizedButtonProps };