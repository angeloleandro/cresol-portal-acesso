'use client';

import { Spinner, Box, Text, VStack } from "@chakra-ui/react";
import { CRESOL_UI_CONFIG, CRESOL_TEXT_CONSTANTS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils/cn';

// =============================================================================
// STANDARDIZED SPINNER COMPONENT - UNIFIED LOADING SYSTEM
// =============================================================================
// Single source of truth for ALL loading spinners in the application
// Supports all contexts: home, admin, buttons, forms, modals, overlays
// Eliminates loading pattern inconsistencies throughout the app
// =============================================================================

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'home' | 'admin' | 'light' | 'dark';
type SpinnerType = 'chakra' | 'inline' | 'overlay';

interface StandardizedSpinnerProps {
  // === CORE PROPS ===
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  type?: SpinnerType;
  
  // === DISPLAY PROPS ===
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  centered?: boolean;
  
  // === STYLING PROPS ===
  className?: string;
  color?: string;
  
  // === ACCESSIBILITY PROPS ===
  ariaLabel?: string;
  role?: string;
}

// Enhanced configuration using design tokens (eliminando hardcode)
const colorConfig = {
  home: {
    color: CRESOL_UI_CONFIG.spinner.contexts.home.color,
    trackColor: CRESOL_UI_CONFIG.spinner.contexts.home.trackColor,
  },
  admin: {
    color: CRESOL_UI_CONFIG.spinner.contexts.admin.color,
    trackColor: CRESOL_UI_CONFIG.spinner.contexts.admin.trackColor,
  },
  light: {
    color: CRESOL_UI_CONFIG.spinner.contexts.light.color,
    trackColor: CRESOL_UI_CONFIG.spinner.contexts.light.trackColor,
  },
  dark: {
    color: CRESOL_UI_CONFIG.spinner.contexts.dark.color,
    trackColor: CRESOL_UI_CONFIG.spinner.contexts.dark.trackColor,
  }
};

// Chakra UI size mapping
const chakraSizeMapping = {
  xs: 'sm',
  sm: 'md', 
  md: 'lg',
  lg: 'xl',
  xl: 'xl'
} as const;

// Inline spinner size mapping (for non-Chakra contexts)
const inlineSizeMapping = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
} as const;

// =============================================================================
// INLINE SPINNER COMPONENT (for buttons, inputs, and compact spaces)
// =============================================================================

export function InlineSpinner({ 
  size = 'sm', 
  variant = 'home', 
  color,
  className = '',
  ariaLabel = 'Loading...'
}: Pick<StandardizedSpinnerProps, 'size' | 'variant' | 'color' | 'className' | 'ariaLabel'>) {
  const config = colorConfig[variant];
  const sizeClass = inlineSizeMapping[size];
  const spinnerColor = color || config.color;
  
  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-2 border-transparent',
        sizeClass,
        className
      )}
      style={{
        borderTopColor: spinnerColor,
        borderRightColor: spinnerColor,
      }}
      role="status"
      aria-label={ariaLabel}
    />
  );
}

// =============================================================================
// OVERLAY SPINNER COMPONENT (for modal overlays and fullscreen loading)
// =============================================================================

export function OverlaySpinner({
  size = 'lg',
  variant = 'home',
  message,
  fullScreen = false,
  className = '',
  ariaLabel
}: StandardizedSpinnerProps) {
  const config = colorConfig[variant];
  
  const overlayClass = fullScreen 
    ? 'fixed inset-0 z-50' 
    : 'absolute inset-0';
    
  return (
    <div
      className={cn(
        overlayClass,
        'flex items-center justify-center',
        'bg-black/30 backdrop-blur-sm',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel || message || CRESOL_TEXT_CONSTANTS.system.loading}
    >
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <VStack gap={3} align="center">
          <InlineSpinner size={size} variant={variant} />
          {message && (
            <Text 
              fontSize="sm" 
              color={variant === 'admin' ? 'gray.600' : 'gray.700'}
              textAlign="center" 
              maxWidth="xs"
            >
              {message}
            </Text>
          )}
        </VStack>
      </div>
    </div>
  );
}

// =============================================================================
// CONVENIENCE COMPONENTS (backward compatibility and ease of use)
// =============================================================================

export const HomeSpinner = ({ 
  size = 'md', 
  message, 
  fullScreen = false,
  className = '',
  type = 'chakra'
}: Omit<StandardizedSpinnerProps, 'variant'>) => (
  <StandardizedSpinner 
    size={size} 
    message={message} 
    fullScreen={fullScreen} 
    variant="home"
    type={type}
    className={className}
  />
);

export const AdminSpinner = ({ 
  size = 'md', 
  message, 
  fullScreen = false,
  className = '',
  type = 'chakra'
}: Omit<StandardizedSpinnerProps, 'variant'>) => (
  <StandardizedSpinner 
    size={size} 
    message={message} 
    fullScreen={fullScreen} 
    variant="admin"
    type={type}
    className={className}
  />
);

export const ButtonSpinner = ({ 
  size = 'sm', 
  variant = 'light',
  className = ''
}: Pick<StandardizedSpinnerProps, 'size' | 'variant' | 'className'>) => (
  <InlineSpinner 
    size={size} 
    variant={variant}
    className={cn('mr-2', className)}
  />
);

// =============================================================================
// MAIN STANDARDIZED SPINNER COMPONENT
// =============================================================================

export default function StandardizedSpinner({ 
  size = 'md', 
  variant = 'home',
  type = 'chakra',
  message, 
  fullScreen = false,
  overlay = false,
  centered = true,
  className = '',
  color,
  ariaLabel,
  role = 'status'
}: StandardizedSpinnerProps) {
  
  // Handle overlay type
  if (overlay || fullScreen) {
    return (
      <OverlaySpinner
        size={size}
        variant={variant}
        message={message}
        fullScreen={fullScreen}
        className={className}
        ariaLabel={ariaLabel}
      />
    );
  }
  
  // Handle inline type
  if (type === 'inline') {
    if (message) {
      return (
        <div className={cn('flex items-center', centered && 'justify-center', className)}>
          <InlineSpinner size={size} variant={variant} color={color} />
          <Text 
            fontSize="sm" 
            color={variant === 'admin' ? 'gray.600' : 'gray.700'}
            ml={2}
          >
            {message}
          </Text>
        </div>
      );
    }
    
    return (
      <InlineSpinner 
        size={size} 
        variant={variant} 
        color={color}
        className={className}
        ariaLabel={ariaLabel}
      />
    );
  }
  
  // Default Chakra UI type
  const config = colorConfig[variant];
  const chakraSize = chakraSizeMapping[size];
  
  const spinnerContent = (
    <VStack gap={3} align="center">
      <Spinner
        size={chakraSize}
        color={color || config.color}
        css={{ "--spinner-track-color": config.trackColor }}
        className={className}
      />
      {message && (
        <Text 
          fontSize="sm" 
          color={variant === 'admin' ? 'gray.600' : 'gray.700'}
          textAlign="center" 
          maxWidth="xs"
        >
          {message}
        </Text>
      )}
    </VStack>
  );

  if (fullScreen) {
    return (
      <Box
        display="flex"
        minHeight="100vh"
        alignItems="center"
        justifyContent="center"
        bg={CRESOL_UI_CONFIG.spinner.overlay.background}
        role={role}
        aria-live="polite"
        aria-label={ariaLabel || message || CRESOL_TEXT_CONSTANTS.system.loading}
      >
        {spinnerContent}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent={centered ? "center" : "flex-start"}
      py={8}
      role={role}
      aria-live="polite"
      aria-label={ariaLabel || message || CRESOL_TEXT_CONSTANTS.system.loading}
    >
      {spinnerContent}
    </Box>
  );
}