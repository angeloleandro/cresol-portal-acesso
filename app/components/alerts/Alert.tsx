'use client';

/**
 * Componente Alert Base - Sistema Cresol
 * 
 * Implementa alertas seguindo padrões Chakra UI v3
 * Suporta modos toast (flutuante) e inline (estático)
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Alert as ChakraAlert, CloseButton, Box } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AlertProps, AlertStatus } from './types';

/**
 * Componente Alert reutilizável
 */
export const Alert: React.FC<AlertProps> = ({
  status = 'info',
  title,
  description,
  variant = 'subtle',
  size = 'md',
  isClosable = true,
  duration = null,
  mode = 'inline',
  action,
  icon,
  onRemove,
  isExiting = false,
  rootProps = {},
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration || 0);

  /**
   * Configurações de duração por status
   */
  const getDefaultDuration = useCallback((alertStatus: AlertStatus): number => {
    const durations: Record<AlertStatus, number> = {
      success: 5000,
      error: 7000,
      warning: 6000,
      info: 5000,
      neutral: 5000
    };
    return durations[alertStatus];
  }, []);

  /**
   * Fechar alerta
   */
  const handleClose = useCallback(() => {
    setIsVisible(false);
    
    // Aguardar animação antes de remover
    setTimeout(() => {
      onRemove?.();
    }, 200);
  }, [onRemove]);

  /**
   * Auto-dismiss logic
   */
  useEffect(() => {
    if (!duration && duration !== 0) {
      const defaultDuration = getDefaultDuration(status);
      remainingTimeRef.current = defaultDuration;
    } else {
      remainingTimeRef.current = duration;
    }

    if (remainingTimeRef.current > 0 && !isPaused && isVisible) {
      startTimeRef.current = Date.now();
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, remainingTimeRef.current);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [duration, status, isPaused, isVisible, getDefaultDuration, handleClose]);

  /**
   * Pausar timer ao hover (para toasts)
   */
  const handleMouseEnter = () => {
    if (mode === 'toast' && timeoutRef.current && remainingTimeRef.current > 0) {
      setIsPaused(true);
      clearTimeout(timeoutRef.current);
      
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }
  };

  /**
   * Retomar timer ao sair do hover
   */
  const handleMouseLeave = () => {
    if (mode === 'toast' && isPaused && remainingTimeRef.current > 0) {
      setIsPaused(false);
      startTimeRef.current = Date.now();
      
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, remainingTimeRef.current);
    }
  };

  /**
   * Animações para toast
   */
  const getToastAnimations = () => {
    return {
      initial: { 
        scale: mode === 'toast' ? 0.95 : 1
      },
      animate: { 
        scale: 1
      },
      exit: { 
        transition: { duration: 0.2 }
      }
    };
  };

  /**
   * Estilos específicos por modo
   */
  const getModeStyles = () => {
    if (mode === 'toast') {
      return {
        zIndex: 1500
      };
    }
    
    return {
      width: '100%'
    };
  };

  /**
   * Renderização condicional com animação
   */
  const AlertContent = (
    <ChakraAlert.Root
      status={status}
      variant={variant}
      size={size}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={getModeStyles()}
      {...rootProps}
    >
      {/* Indicador/Ícone */}
      <ChakraAlert.Indicator>
        {icon || undefined}
      </ChakraAlert.Indicator>

      {/* Conteúdo principal */}
      <ChakraAlert.Content flex="1" pr={isClosable ? "32px" : "0"}>
        <ChakraAlert.Title fontWeight="semibold">
          {title}
        </ChakraAlert.Title>
        
        {description && (
          <ChakraAlert.Description mt={1} opacity={0.8}>
            {description}
          </ChakraAlert.Description>
        )}
      </ChakraAlert.Content>

      {/* Ação personalizada */}
      {action && (
        <Box ml={3} alignSelf="flex-start">
          <button
            onClick={action.onClick}
            style={{
              fontWeight: 'medium'
            }}
          >
            {action.label}
          </button>
        </Box>
      )}

      {/* Botão de fechar */}
      {isClosable && (
        <CloseButton
          onClick={handleClose}
          position="absolute"
          top="12px"
          right="12px"
          size="sm"
          zIndex={10}
        />
      )}

      {/* Barra de progresso para auto-dismiss */}
      {mode === 'toast' && remainingTimeRef.current > 0 && (
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          height="2px"
          bg="currentColor"
          opacity={0.3}
        >
          <motion.div
            style={{
              width: '100%'
            }}
            animate={{
              scaleX: isPaused ? 1 : 0
            }}
            transition={{
              ease: 'linear'
            }}
          />
        </Box>
      )}
    </ChakraAlert.Root>
  );

  // Para modo inline, sem animação
  if (mode === 'inline') {
    return isVisible ? AlertContent : null;
  }

  // Para modo toast, com animação
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          {...getToastAnimations()}
          layout
          style={{ 
            display: 'flex'
          }}
        >
          {AlertContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Componente Alert para casos específicos de sucesso
 */
export const SuccessAlert: React.FC<Omit<AlertProps, 'status'>> = (props) => (
  <Alert {...props} status="success" />
);

/**
 * Componente Alert para casos específicos de erro
 */
export const ErrorAlert: React.FC<Omit<AlertProps, 'status'>> = (props) => (
  <Alert {...props} status="error" />
);

/**
 * Componente Alert para casos específicos de aviso
 */
export const WarningAlert: React.FC<Omit<AlertProps, 'status'>> = (props) => (
  <Alert {...props} status="warning" />
);

/**
 * Componente Alert para casos específicos de informação
 */
export const InfoAlert: React.FC<Omit<AlertProps, 'status'>> = (props) => (
  <Alert {...props} status="info" />
);

export default Alert;