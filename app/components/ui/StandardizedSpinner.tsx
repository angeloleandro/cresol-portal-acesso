'use client';

import { Spinner, Box, Text, VStack } from "@chakra-ui/react";

interface StandardizedSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  variant?: 'home' | 'admin';
  className?: string;
}

const colorConfig = {
  home: {
    color: '#F58220', // Cresol Orange
    trackColor: 'rgba(245, 130, 32, 0.2)' // Orange with transparency
  },
  admin: {
    color: '#727176', // Cresol Gray
    trackColor: 'rgba(114, 113, 118, 0.2)' // Gray with transparency
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
        bg="rgba(208, 208, 206, 0.3)" // cresol-gray-light with transparency
        role="status"
        aria-live="polite"
        aria-label={message || 'Carregando conteúdo'}
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
      aria-label={message || 'Carregando'}
    >
      {spinnerContent}
    </Box>
  );
}