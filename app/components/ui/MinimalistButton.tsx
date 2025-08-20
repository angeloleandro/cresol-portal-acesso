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

// Map minimalist variants to unified Button
const mapMinimalistVariant = (variant: MinimalistButtonProps['variant']): 'primary' | 'secondary' => {
  switch (variant) {
    case 'primary':
      return 'primary';
    case 'secondary':
    case 'ghost':
    case 'outline':
    default:
      return 'secondary';
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
    const newVariant = mapMinimalistVariant(variant);

    return (
      <UnifiedButton
        ref={ref}
        variant={newVariant}
        size={size}
        onClick={onClick}
        disabled={disabled}
        className={className}
        icon={icon}
        iconPosition={iconPosition}
      >
        {children}
      </UnifiedButton>
    );
  }
);

MinimalistButton.displayName = 'MinimalistButton';