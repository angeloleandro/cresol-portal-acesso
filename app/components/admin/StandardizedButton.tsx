'use client';

import { Button } from '@chakra-ui/react';
import { ReactNode, ElementType, forwardRef } from 'react';

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
const mapLegacyVariant = (variant: LegacyStandardizedButtonProps['variant']): 'solid' | 'outline' | 'ghost' | 'subtle' => {
  switch (variant) {
    case 'primary':
    case 'danger':
    case 'success':
      return 'solid';
    case 'outline':
      return 'outline';
    case 'ghost':
      return 'ghost';
    case 'secondary':
    case 'link':
    case 'warning':
    case 'info':
    default:
      return 'subtle';
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

const StandardizedButton = forwardRef<HTMLButtonElement, LegacyStandardizedButtonProps>(
  (
    {
      children,
      onClick,
      type = 'button',
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading: _loading = false,
      fullWidth: _fullWidth = false,
      icon,
      iconPosition = 'left',
      className = '',
      href: _href,
      target: _target,
      rel: _rel,
      as: _as,
      ...rest
    },
    ref
  ) => {
    // Map legacy props to new Button props
    const newVariant = mapLegacyVariant(variant);
    const newSize = mapLegacySize(size);

    // Handle icon composition (legacy support)
    const hasIcon = icon && iconPosition;
    const iconLeft = hasIcon && iconPosition === 'left';
    const iconRight = hasIcon && iconPosition === 'right';

    return (
      <Button
        ref={ref}
        type={type}
        variant={newVariant}
        size={newSize}
        disabled={disabled}
        onClick={onClick}
        className={className}
        {...rest}
      >
        {iconLeft && <span className="mr-2">{icon}</span>}
        {children}
        {iconRight && <span className="ml-2">{icon}</span>}
      </Button>
    );
  }
);

StandardizedButton.displayName = 'StandardizedButton';

export default StandardizedButton;

// Export type for backwards compatibility
export type { LegacyStandardizedButtonProps as StandardizedButtonProps };