// =============================================================================
// MINIMALIST BUTTON COMPONENT (LEGACY)
// =============================================================================
// This component has been migrated to use the unified Chakra UI v3 Button
// from @/app/components/ui/Button for consistency across the application
// =============================================================================

import { Button as UnifiedButton, ButtonProps } from '@/app/components/ui/Button';
import { IconName } from '@/app/components/icons/Icon';
import { ReactNode, forwardRef } from 'react';

interface MinimalistButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

// Map minimalist variants to Chakra UI v3 Button
const mapMinimalistVariant = (variant: MinimalistButtonProps['variant']): { variant: ButtonProps['variant']; colorPalette: ButtonProps['colorPalette'] } => {
  switch (variant) {
    case 'primary':
      return { variant: 'solid', colorPalette: 'orange' };
    case 'secondary':
      return { variant: 'subtle', colorPalette: 'gray' };
    case 'ghost':
      return { variant: 'ghost', colorPalette: 'gray' };
    case 'outline':
      return { variant: 'outline', colorPalette: 'gray' };
    default:
      return { variant: 'solid', colorPalette: 'orange' };
  }
};

/**
 * Minimalist Button Component
 * 
 * @deprecated Use Button from '@/app/components/ui/Button' directly
 * 
 * This wrapper provides backwards compatibility for existing MinimalistButton usage
 * while using the unified Chakra UI v3 Button implementation.
 */
export const MinimalistButton = forwardRef<HTMLButtonElement, MinimalistButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      children,
      onClick,
      disabled = false,
      className = '',
      fullWidth = false
    },
    ref
  ) => {
    const { variant: newVariant, colorPalette } = mapMinimalistVariant(variant);

    return (
      <UnifiedButton
        ref={ref}
        variant={newVariant}
        colorPalette={colorPalette}
        size={size}
        onClick={onClick}
        disabled={disabled}
        className={className}
        fullWidth={fullWidth}
        icon={icon}
        iconPosition={iconPosition}
      >
        {children}
      </UnifiedButton>
    );
  }
);

MinimalistButton.displayName = 'MinimalistButton';