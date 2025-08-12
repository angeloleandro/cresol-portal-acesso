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
const mapLegacyVariant = (variant: LegacyStandardizedButtonProps['variant']): { variant: ButtonProps['variant']; colorPalette: ButtonProps['colorPalette'] } => {
  switch (variant) {
    case 'primary':
      return { variant: 'solid', colorPalette: 'orange' };
    case 'secondary':
      return { variant: 'outline', colorPalette: 'gray' };
    case 'danger':
      return { variant: 'solid', colorPalette: 'red' };
    case 'outline':
      return { variant: 'outline', colorPalette: 'orange' };
    case 'ghost':
      return { variant: 'ghost', colorPalette: 'gray' };
    case 'link':
      return { variant: 'plain', colorPalette: 'orange' };
    case 'success':
      return { variant: 'solid', colorPalette: 'green' };
    case 'warning':
      return { variant: 'solid', colorPalette: 'yellow' };
    case 'info':
      return { variant: 'solid', colorPalette: 'blue' };
    default:
      return { variant: 'solid', colorPalette: 'orange' };
  }
};

// =============================================================================
// LEGACY SIZE MAPPING TO CHAKRA UI V3
// =============================================================================
const mapLegacySize = (size: LegacyStandardizedButtonProps['size']): ButtonProps['size'] => {
  switch (size) {
    case 'xs':
      return 'xs';
    case 'sm':
      return 'sm';
    case 'md':
      return 'md';
    case 'lg':
      return 'lg';
    case 'xl':
      return 'xl';
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
    const { variant: newVariant, colorPalette } = mapLegacyVariant(variant);
    const newSize = mapLegacySize(size);

    // Handle icon composition (legacy support)
    const startElement = icon && iconPosition === 'left' ? icon : undefined;
    const endElement = icon && iconPosition === 'right' ? icon : undefined;

    return (
      <Button
        ref={ref}
        type={type}
        variant={newVariant}
        colorPalette={colorPalette}
        size={newSize}
        disabled={disabled}
        loading={loading}
        fullWidth={fullWidth}
        onClick={onClick}
        className={className}
        href={href}
        target={target}
        rel={rel}
        as={as}
        startElement={startElement}
        endElement={endElement}
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