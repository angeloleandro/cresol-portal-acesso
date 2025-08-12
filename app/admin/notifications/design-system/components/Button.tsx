// =============================================================================
// NOTIFICATIONS DESIGN SYSTEM - BUTTON COMPONENT
// =============================================================================
// This component has been migrated to use the unified Chakra UI v3 Button
// from @/app/components/ui/Button for consistency across the application
// =============================================================================

import { Button as UnifiedButton, ButtonProps } from '@/app/components/ui/Button';
import { ReactNode, forwardRef } from 'react';

interface NotificationButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

// Map notifications variants to Chakra UI v3 Button
const mapNotificationVariant = (variant: NotificationButtonProps['variant']): { variant: ButtonProps['variant']; colorPalette: ButtonProps['colorPalette'] } => {
  switch (variant) {
    case 'primary':
      return { variant: 'solid', colorPalette: 'orange' };
    case 'secondary':
      return { variant: 'subtle', colorPalette: 'gray' };
    case 'outline':
      return { variant: 'outline', colorPalette: 'orange' };
    case 'ghost':
      return { variant: 'ghost', colorPalette: 'gray' };
    case 'danger':
      return { variant: 'solid', colorPalette: 'red' };
    default:
      return { variant: 'solid', colorPalette: 'orange' };
  }
};

/**
 * Notifications Design System Button Component
 * 
 * @deprecated Use Button from '@/app/components/ui/Button' directly
 * 
 * This wrapper provides backwards compatibility for the notifications system
 * while using the unified Chakra UI v3 Button implementation.
 */
export const Button = forwardRef<HTMLButtonElement, NotificationButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      type = 'button',
      onClick,
      className = '',
      icon,
      fullWidth = false,
    },
    ref
  ) => {
    const { variant: newVariant, colorPalette } = mapNotificationVariant(variant);

    return (
      <UnifiedButton
        ref={ref}
        variant={newVariant}
        colorPalette={colorPalette}
        size={size}
        disabled={disabled}
        loading={loading}
        type={type}
        onClick={onClick}
        className={className}
        fullWidth={fullWidth}
        startElement={icon}
      >
        {children}
      </UnifiedButton>
    );
  }
);

Button.displayName = 'NotificationButton';