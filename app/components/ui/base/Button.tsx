// Componente Button unificado com Chakra UI v3
// Substitui todas as implementações de botões do projeto

'use client';

import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface ButtonProps extends Omit<ChakraButtonProps, 'colorScheme' | 'isDisabled' | 'isLoading'> {
  variant?: 'solid' | 'outline' | 'ghost' | 'surface' | 'plain';
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  // Legacy support
  isDisabled?: boolean;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'solid',
    loading,
    loadingText,
    fullWidth,
    children,
    isDisabled, // legacy
    isLoading, // legacy
    disabled,
    colorPalette,
    ...props 
  }, ref) => {
    // Support both old and new props
    const isDisabledFinal = disabled ?? isDisabled;
    const isLoadingFinal = loading ?? isLoading;
    
    // Default color palette
    const finalColorPalette = colorPalette || 'orange';

    return (
      <ChakraButton
        ref={ref}
        variant={variant}
        colorPalette={finalColorPalette}
        loading={isLoadingFinal}
        loadingText={loadingText}
        disabled={isDisabledFinal || isLoadingFinal}
        width={fullWidth ? 'full' : props.width}
        {...props}
      >
        {children}
      </ChakraButton>
    );
  }
);

Button.displayName = 'Button';

// Variantes pré-configuradas para uso comum
export const PrimaryButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button ref={ref} colorPalette="orange" {...props} />
));

export const SecondaryButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button ref={ref} variant="outline" colorPalette="green" {...props} />
));

export const DangerButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button ref={ref} colorPalette="red" {...props} />
));

export const GhostButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button ref={ref} variant="ghost" {...props} />
));

PrimaryButton.displayName = 'PrimaryButton';
SecondaryButton.displayName = 'SecondaryButton';
DangerButton.displayName = 'DangerButton';
GhostButton.displayName = 'GhostButton';