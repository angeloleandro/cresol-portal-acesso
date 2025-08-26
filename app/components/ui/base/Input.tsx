// Componente Input unificado com Chakra UI v3
// Substitui todas as implementações de inputs do projeto

'use client';

import {
  Input as ChakraInput,
  InputProps as ChakraInputProps,
  Textarea as ChakraTextarea,
  TextareaProps as ChakraTextareaProps,
  Box,
  Text,
} from '@chakra-ui/react';
import { forwardRef, ReactNode } from 'react';

export interface InputProps extends Omit<ChakraInputProps, 'isInvalid' | 'invalid'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  required?: boolean;
  // Legacy support
  isInvalid?: boolean;
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth,
    required,
    isInvalid, // legacy
    invalid,
    ...props 
  }, ref) => {
    const hasError = Boolean(error) || invalid || isInvalid;

    return (
      <Box width={fullWidth ? 'full' : props.width}>
        {label && (
          <Text as="label" fontSize="sm" fontWeight="medium" mb={1} display="block">
            {label}
            {required && <Text as="span" color="red.500" ml={1}>*</Text>}
          </Text>
        )}
        
        <Box position="relative">
          {leftIcon && (
            <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" pointerEvents="none" zIndex={1}>
              {leftIcon}
            </Box>
          )}
          
          <ChakraInput
            ref={ref}
            pl={leftIcon ? 10 : undefined}
            pr={rightIcon ? 10 : undefined}
            borderColor={hasError ? 'red.500' : 'gray.300'}
            _hover={{ borderColor: hasError ? 'red.600' : 'gray.400' }}
            _focus={{ borderColor: hasError ? 'red.500' : 'orange.500', boxShadow: `0 0 0 1px var(--chakra-colors-${hasError ? 'red' : 'orange'}-500)` }}
            {...props}
          />
          
          {rightIcon && (
            <Box position="absolute" right={3} top="50%" transform="translateY(-50%)" zIndex={1}>
              {rightIcon}
            </Box>
          )}
        </Box>
        
        {error && (
          <Text fontSize="sm" color="red.500" mt={1}>{error}</Text>
        )}
        
        {helperText && !error && (
          <Text fontSize="sm" color="gray.500" mt={1}>{helperText}</Text>
        )}
      </Box>
    );
  }
);

Input.displayName = 'Input';

// Textarea component usando o mesmo padrão
export interface TextareaProps extends Omit<ChakraTextareaProps, 'isInvalid' | 'invalid'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  required?: boolean;
  // Legacy support
  isInvalid?: boolean;
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    label,
    error,
    helperText,
    fullWidth,
    required,
    isInvalid, // legacy
    invalid,
    ...props 
  }, ref) => {
    const hasError = Boolean(error) || invalid || isInvalid;

    return (
      <Box width={fullWidth ? 'full' : props.width}>
        {label && (
          <Text as="label" fontSize="sm" fontWeight="medium" mb={1} display="block">
            {label}
            {required && <Text as="span" color="red.500" ml={1}>*</Text>}
          </Text>
        )}
        
        <ChakraTextarea
          ref={ref}
          borderColor={hasError ? 'red.500' : 'gray.300'}
          _hover={{ borderColor: hasError ? 'red.600' : 'gray.400' }}
          _focus={{ borderColor: hasError ? 'red.500' : 'orange.500', boxShadow: `0 0 0 1px var(--chakra-colors-${hasError ? 'red' : 'orange'}-500)` }}
          {...props}
        />
        
        {error && (
          <Text fontSize="sm" color="red.500" mt={1}>{error}</Text>
        )}
        
        {helperText && !error && (
          <Text fontSize="sm" color="gray.500" mt={1}>{helperText}</Text>
        )}
      </Box>
    );
  }
);

Textarea.displayName = 'Textarea';