'use client';

import React, { forwardRef, createElement } from 'react';
import { CRESOL_UI_CONFIG } from '@/lib/design-tokens/ui-config';
import { Icon, IconName } from '@/app/components/icons/Icon';

// =============================================================================
// CHAKRA UI V3 BUTTON COMPONENT - EXACT SPECIFICATION IMPLEMENTATION
// =============================================================================
// Reference: design-system/component-button-chakra.md
// Implements all documented variants, sizes, and composition patterns
// Preserves 100% existing functionality while standardizing visuals
// =============================================================================

type ButtonVariant = 'solid' | 'subtle' | 'surface' | 'outline' | 'ghost' | 'plain';
type ButtonSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type ColorPalette = 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink';
type SpinnerPlacement = 'start' | 'end';

interface ButtonProps {
  // === CHAKRA UI V3 CORE PROPS ===
  variant?: ButtonVariant;
  size?: ButtonSize;
  colorPalette?: ColorPalette;
  loading?: boolean;
  loadingText?: React.ReactNode;
  spinner?: React.ReactNode;
  spinnerPlacement?: SpinnerPlacement;
  
  // === STANDARD BUTTON PROPS ===
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  
  // === COMPOSITION PROPS (CHAKRA UI PATTERNS) ===
  startElement?: React.ReactNode;
  endElement?: React.ReactNode;
  
  // === LEGACY PROPS (FOR BACKWARDS COMPATIBILITY) ===
  icon?: React.ReactNode | IconName;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  
  // === POLYMORPHIC PROPS ===
  as?: React.ElementType;
  asChild?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  
  // === FORWARDED PROPS ===
  [key: string]: any;
}

// =============================================================================
// CHAKRA UI V3 VARIANT SYSTEM
// =============================================================================
const getVariantClasses = (variant: ButtonVariant, colorPalette: ColorPalette): string => {
  const colorMap = {
    gray: { 
      bg: 'bg-gray-500', 
      bgHover: 'hover:bg-gray-600',
      bgLight: 'bg-gray-100',
      bgLightHover: 'hover:bg-gray-200',
      border: 'border-gray-300',
      borderHover: 'hover:border-gray-400',
      text: 'text-gray-700',
      textHover: 'hover:text-gray-800',
      focus: 'focus:ring-gray-500/20'
    },
    red: { 
      bg: 'bg-red-500', 
      bgHover: 'hover:bg-red-600',
      bgLight: 'bg-red-50',
      bgLightHover: 'hover:bg-red-100',
      border: 'border-red-300',
      borderHover: 'hover:border-red-400',
      text: 'text-red-600',
      textHover: 'hover:text-red-700',
      focus: 'focus:ring-red-500/20'
    },
    orange: { 
      bg: 'bg-primary', 
      bgHover: 'hover:bg-primary-dark',
      bgLight: 'bg-orange-50',
      bgLightHover: 'hover:bg-orange-100',
      border: 'border-primary',
      borderHover: 'hover:border-primary-dark',
      text: 'text-primary',
      textHover: 'hover:text-primary-dark',
      focus: 'focus:ring-primary/20'
    },
    yellow: { 
      bg: 'bg-yellow-500', 
      bgHover: 'hover:bg-yellow-600',
      bgLight: 'bg-yellow-50',
      bgLightHover: 'hover:bg-yellow-100',
      border: 'border-yellow-300',
      borderHover: 'hover:border-yellow-400',
      text: 'text-yellow-600',
      textHover: 'hover:text-yellow-700',
      focus: 'focus:ring-yellow-500/20'
    },
    green: { 
      bg: 'bg-green-500', 
      bgHover: 'hover:bg-green-600',
      bgLight: 'bg-green-50',
      bgLightHover: 'hover:bg-green-100',
      border: 'border-green-300',
      borderHover: 'hover:border-green-400',
      text: 'text-green-600',
      textHover: 'hover:text-green-700',
      focus: 'focus:ring-green-500/20'
    },
    teal: { 
      bg: 'bg-teal-500', 
      bgHover: 'hover:bg-teal-600',
      bgLight: 'bg-teal-50',
      bgLightHover: 'hover:bg-teal-100',
      border: 'border-teal-300',
      borderHover: 'hover:border-teal-400',
      text: 'text-teal-600',
      textHover: 'hover:text-teal-700',
      focus: 'focus:ring-teal-500/20'
    },
    blue: { 
      bg: 'bg-blue-500', 
      bgHover: 'hover:bg-blue-600',
      bgLight: 'bg-blue-50',
      bgLightHover: 'hover:bg-blue-100',
      border: 'border-blue-300',
      borderHover: 'hover:border-blue-400',
      text: 'text-blue-600',
      textHover: 'hover:text-blue-700',
      focus: 'focus:ring-blue-500/20'
    },
    cyan: { 
      bg: 'bg-cyan-500', 
      bgHover: 'hover:bg-cyan-600',
      bgLight: 'bg-cyan-50',
      bgLightHover: 'hover:bg-cyan-100',
      border: 'border-cyan-300',
      borderHover: 'hover:border-cyan-400',
      text: 'text-cyan-600',
      textHover: 'hover:text-cyan-700',
      focus: 'focus:ring-cyan-500/20'
    },
    purple: { 
      bg: 'bg-purple-500', 
      bgHover: 'hover:bg-purple-600',
      bgLight: 'bg-purple-50',
      bgLightHover: 'hover:bg-purple-100',
      border: 'border-purple-300',
      borderHover: 'hover:border-purple-400',
      text: 'text-purple-600',
      textHover: 'hover:text-purple-700',
      focus: 'focus:ring-purple-500/20'
    },
    pink: { 
      bg: 'bg-pink-500', 
      bgHover: 'hover:bg-pink-600',
      bgLight: 'bg-pink-50',
      bgLightHover: 'hover:bg-pink-100',
      border: 'border-pink-300',
      borderHover: 'hover:border-pink-400',
      text: 'text-pink-600',
      textHover: 'hover:text-pink-700',
      focus: 'focus:ring-pink-500/20'
    },
  };

  const colors = colorMap[colorPalette];

  switch (variant) {
    case 'solid':
      return `${colors.bg} ${colors.bgHover} text-white ${colors.focus} shadow-sm hover:shadow-md`;
    case 'subtle':
      return `${colors.bgLight} ${colors.bgLightHover} ${colors.text} ${colors.textHover} ${colors.focus}`;
    case 'surface':
      return `bg-white ${colors.bgLightHover} border ${colors.border} ${colors.borderHover} ${colors.text} ${colors.textHover} ${colors.focus} shadow-sm`;
    case 'outline':
      return `bg-transparent border ${colors.border} ${colors.borderHover} ${colors.text} ${colors.textHover} ${colors.focus} hover:${colors.bgLight}`;
    case 'ghost':
      return `bg-transparent ${colors.text} ${colors.textHover} ${colors.focus} hover:${colors.bgLight}`;
    case 'plain':
      return `bg-transparent ${colors.text} ${colors.textHover} ${colors.focus}`;
    default:
      return `${colors.bg} ${colors.bgHover} text-white ${colors.focus} shadow-sm hover:shadow-md`;
  }
};

// =============================================================================
// CHAKRA UI V3 SIZE SYSTEM
// =============================================================================
const getSizeClasses = (size: ButtonSize): { classes: string; iconSize: string; spinnerSize: string } => {
  switch (size) {
    case '2xs':
      return {
        classes: 'px-2 py-1 text-xs h-6 min-w-[24px]',
        iconSize: 'w-3 h-3',
        spinnerSize: 'w-3 h-3'
      };
    case 'xs':
      return {
        classes: 'px-2 py-1 text-xs h-6 min-w-[24px]',
        iconSize: 'w-3 h-3',
        spinnerSize: 'w-3 h-3'
      };
    case 'sm':
      return {
        classes: 'px-3 py-1.5 text-sm h-8 min-w-[32px]',
        iconSize: 'w-4 h-4',
        spinnerSize: 'w-4 h-4'
      };
    case 'md':
      return {
        classes: 'px-4 py-2 text-sm h-10 min-w-[40px]',
        iconSize: 'w-4 h-4',
        spinnerSize: 'w-4 h-4'
      };
    case 'lg':
      return {
        classes: 'px-6 py-3 text-base h-12 min-w-[48px]',
        iconSize: 'w-5 h-5',
        spinnerSize: 'w-5 h-5'
      };
    case 'xl':
      return {
        classes: 'px-8 py-4 text-lg h-14 min-w-[56px]',
        iconSize: 'w-6 h-6',
        spinnerSize: 'w-6 h-6'
      };
    case '2xl':
      return {
        classes: 'px-10 py-5 text-xl h-16 min-w-[64px]',
        iconSize: 'w-8 h-8',
        spinnerSize: 'w-8 h-8'
      };
    default:
      return {
        classes: 'px-4 py-2 text-sm h-10 min-w-[40px]',
        iconSize: 'w-4 h-4',
        spinnerSize: 'w-4 h-4'
      };
  }
};

// =============================================================================
// SPINNER COMPONENT (UNIFIED LOADING SPINNER)
// =============================================================================
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';

const ButtonSpinner: React.FC<{ size: string; className?: string }> = ({ size, className = '' }) => {
  // Map size to UnifiedLoadingSpinner size
  const spinnerSize = size.includes('w-3') ? 'small' : 
                     size.includes('w-4') ? 'default' : 
                     size.includes('w-5') ? 'default' : 
                     size.includes('w-6') ? 'large' : 
                     size.includes('w-8') ? 'large' : 'default';
  
  return (
    <UnifiedLoadingSpinner 
      size={spinnerSize as 'small' | 'default' | 'large'}
      className={`${className} inline-flex items-center`}
    />
  );
};

// =============================================================================
// MAIN BUTTON COMPONENT
// =============================================================================
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'solid',
      size = 'md',
      colorPalette = 'gray',
      loading = false,
      loadingText,
      spinner,
      spinnerPlacement = 'start',
      type = 'button',
      disabled = false,
      onClick,
      className = '',
      startElement,
      endElement,
      // Legacy props for backwards compatibility
      icon,
      iconPosition = 'left',
      fullWidth = false,
      // Polymorphic props
      as: As,
      asChild,
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
    const sizeConfig = getSizeClasses(size);
    const variantClasses = getVariantClasses(variant, colorPalette);
    
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-2',
      'rounded-md',
      'font-medium',
      'transition-all',
      'duration-150',
      'ease-out',
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
      sizeConfig.classes,
      variantClasses,
      fullWidth ? 'w-full' : '',
      className
    ].filter(Boolean).join(' ');

    const isDisabled = disabled || loading;

    // =============================================================================
    // RENDER CONTENT
    // =============================================================================
    const renderIcon = (iconProp: React.ReactNode | IconName | undefined, position: 'left' | 'right' | 'start' | 'end') => {
      if (!iconProp || loading) return null;
      
      if (typeof iconProp === 'string') {
        return (
          <Icon 
            name={iconProp as IconName} 
            className={sizeConfig.iconSize}
            aria-hidden="true"
          />
        );
      }
      
      return iconProp;
    };

    const renderSpinner = () => {
      if (spinner) {
        return spinner;
      }
      
      return (
        <ButtonSpinner 
          size={sizeConfig.spinnerSize}
          className=""
        />
      );
    };

    const renderContent = () => {
      if (loading && loadingText) {
        return (
          <div className="flex items-center justify-center gap-2">
            {spinnerPlacement === 'start' && renderSpinner()}
            <span>{loadingText}</span>
            {spinnerPlacement === 'end' && renderSpinner()}
          </div>
        );
      }

      if (loading) {
        return (
          <div className="flex items-center justify-center gap-2">
            {spinnerPlacement === 'start' && renderSpinner()}
            <span>{children}</span>
            {spinnerPlacement === 'end' && renderSpinner()}
          </div>
        );
      }

      // Chakra UI composition pattern
      if (startElement || endElement) {
        return (
          <>
            {startElement}
            {children}
            {endElement}
          </>
        );
      }

      // Legacy icon support
      if (icon) {
        return (
          <>
            {iconPosition === 'left' && renderIcon(icon, 'left')}
            {children}
            {iconPosition === 'right' && renderIcon(icon, 'right')}
          </>
        );
      }

      return children;
    };

    // =============================================================================
    // POLYMORPHIC RENDERING
    // =============================================================================
    
    // Render as custom component
    if (As) {
      return createElement(
        As,
        {
          ref,
          className: buttonClasses,
          href,
          target,
          rel: target === '_blank' ? 'noopener noreferrer' : rel,
          onClick,
          'aria-disabled': isDisabled || undefined,
          ...rest
        },
        renderContent()
      );
    }

    // Render as anchor for links
    if (href) {
      return (
        <a
          ref={ref as any}
          href={href}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : rel}
          className={buttonClasses}
          onClick={onClick as any}
          aria-disabled={isDisabled || undefined}
          {...rest}
        >
          {renderContent()}
        </a>
      );
    }

    // Default button rendering
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        className={buttonClasses}
        aria-disabled={isDisabled || undefined}
        {...rest}
      >
        {renderContent()}
      </button>
    );
  }
);

Button.displayName = 'Button';

// =============================================================================
// BUTTON GROUP COMPONENT (CHAKRA UI PATTERN)
// =============================================================================
interface ButtonGroupProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  colorPalette?: ColorPalette;
  attached?: boolean;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  variant,
  size,
  colorPalette,
  attached = false,
  className = ''
}) => {
  const baseClasses = attached 
    ? 'inline-flex [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:last-child)]:border-r-0'
    : 'inline-flex gap-2';

  const groupClasses = `${baseClasses} ${className}`;

  // Clone children and pass down group props
  const clonedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<ButtonProps>, {
        variant: child.props.variant || variant,
        size: child.props.size || size,
        colorPalette: child.props.colorPalette || colorPalette,
      });
    }
    return child;
  });

  return (
    <div className={groupClasses} role="group">
      {clonedChildren}
    </div>
  );
};

// =============================================================================
// ICON BUTTON COMPONENT (CHAKRA UI PATTERN)
// =============================================================================
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode | IconName;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, 'aria-label': ariaLabel, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        aria-label={ariaLabel}
        startElement={typeof icon === 'string' ? <Icon name={icon as IconName} /> : icon}
        {...props}
      >
        <span className="sr-only">{ariaLabel}</span>
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// =============================================================================
// EXPORTS AND LEGACY COMPATIBILITY
// =============================================================================
export default Button;
export type { ButtonProps, IconButtonProps };

// Legacy component name aliases for backwards compatibility
export { Button as StandardizedButton };
export { Button as ChakraButton };