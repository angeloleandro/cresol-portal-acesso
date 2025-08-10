'use client';

import { Spinner, Box, Text, VStack } from "@chakra-ui/react";
import { CRESOL_UI_CONFIG, CRESOL_TEXT_CONSTANTS } from '@/lib/design-tokens';

interface StandardizedSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  variant?: 'home' | 'admin';
  className?: string;
}

// Configuração usando design tokens centralizados (eliminando hardcode)
const colorConfig = {
  home: {
    color: CRESOL_UI_CONFIG.spinner.contexts.home.color,
    trackColor: CRESOL_UI_CONFIG.spinner.contexts.home.trackColor,
  },
  admin: {
    color: CRESOL_UI_CONFIG.spinner.contexts.admin.color,
    trackColor: CRESOL_UI_CONFIG.spinner.contexts.admin.trackColor,
  }
};

const sizeMapping = {
  xs: 'sm',
  sm: 'md', 
  md: 'lg',
  lg: 'xl',
  xl: 'xl'
} as const;

export const HomeSpinner = ({ 
  size = 'md', 
  message, 
  fullScreen = false,
  className = ''
}: Omit<StandardizedSpinnerProps, 'variant'>) => (
  <StandardizedSpinner 
    size={size} 
    message={message} 
    fullScreen={fullScreen} 
    variant="home"
    className={className}
  />
);

export const AdminSpinner = ({ 
  size = 'md', 
  message, 
  fullScreen = false,
  className = ''
}: Omit<StandardizedSpinnerProps, 'variant'>) => (
  <StandardizedSpinner 
    size={size} 
    message={message} 
    fullScreen={fullScreen} 
    variant="admin"
    className={className}
  />
);

export default function StandardizedSpinner({ 
  size = 'md', 
  message, 
  fullScreen = false,
  variant = 'home',
  className = ''
}: StandardizedSpinnerProps) {
  const config = colorConfig[variant];
  const chakraSize = sizeMapping[size];
  
  const spinnerContent = (
    <VStack gap={3} align="center">
      <Spinner
        size={chakraSize}
        color={config.color}
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
        role="status"
        aria-live="polite"
        aria-label={message || CRESOL_TEXT_CONSTANTS.system.loading}
      >
        {spinnerContent}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={8}
      role="status"
      aria-live="polite"
      aria-label={message || CRESOL_TEXT_CONSTANTS.system.loading}
    >
      {spinnerContent}
    </Box>
  );
}