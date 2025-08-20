'use client';

/**
 * AlertContainer - Renderizador de Toasts
 * 
 * Responsável por posicionar e gerenciar toasts na tela
 * Suporta diferentes posições e stacking automático
 */

import React, { useContext } from 'react';
import { Box, Portal } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Alert } from './Alert';
import { AlertContext } from './AlertProvider';
import type { AlertContainerProps, AlertPosition } from './types';

import { logger } from '../../../lib/production-logger';
/**
 * Configurações de posicionamento por posição
 */
const getPositionStyles = (position: AlertPosition) => {
  const baseStyles = {
    pointerEvents: 'none' as const
  };

  switch (position) {
    case 'top':
      return {
        ...baseStyles,
        maxWidth: '90vw'
      };

    case 'bottom':
      return {
        ...baseStyles,
        maxWidth: '90vw'
      };

    case 'top-right':
      return {
        ...baseStyles,
        maxWidth: '400px'
      };

    case 'top-left':
      return {
        ...baseStyles,
        maxWidth: '400px'
      };

    case 'bottom-right':
      return {
        ...baseStyles,
        maxWidth: '400px'
      };

    case 'bottom-left':
      return {
        ...baseStyles,
        maxWidth: '400px'
      };

    default:
      return {
        ...baseStyles,
        maxWidth: '400px'
      };
  }
};

/**
 * Configurações de direção do stack baseado na posição
 */
const getStackDirection = (position: AlertPosition): 'column' | 'column-reverse' => {
  return position.includes('bottom') ? 'column-reverse' : 'column';
};

/**
 * Animações para container de toasts
 */
const getContainerAnimations = (position: AlertPosition) => {
  const isBottom = position.includes('bottom');
  const isCenter = position === 'top' || position === 'bottom';
  
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  };
};

/**
 * Componente AlertContainer
 */
export const AlertContainer: React.FC<AlertContainerProps> = ({
  position: overridePosition,
  className,
  zIndex = 1500
}) => {
  const alertContext = useContext(AlertContext);

  if (!alertContext) {
    logger.warn('AlertContainer deve ser usado dentro de AlertProvider');
    return null;
  }

  const { alerts, removeAlert, config } = alertContext;
  const position = overridePosition || config.defaultPosition;

  // Agrupar alertas por posição
  const alertsByPosition = alerts.reduce((acc, alert) => {
    const alertPosition = alert.position || position;
    if (!acc[alertPosition]) {
      acc[alertPosition] = [];
    }
    acc[alertPosition].push(alert);
    return acc;
  }, {} as Record<AlertPosition, typeof alerts>);

  /**
   * Renderizar grupo de alertas para uma posição específica
   */
  const renderAlertGroup = (groupPosition: AlertPosition, groupAlerts: typeof alerts) => {
    if (groupAlerts.length === 0) return null;

    const stackDirection = getStackDirection(groupPosition);
    const positionStyles = getPositionStyles(groupPosition);

    return (
      <Box
        key={groupPosition}
        style={{
          ...positionStyles,
          zIndex: zIndex
        }}
        className={className}
      >
        <motion.div
          {...getContainerAnimations(groupPosition)}
          style={{
            alignItems: groupPosition.includes('left') ? 'flex-start' : 
                      groupPosition.includes('right') ? 'flex-end' : 'center',
            width: '100%'
          }}
        >
          <AnimatePresence mode="popLayout">
            {groupAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ 
                  scale: 0.95
                }}
                animate={{ 
                  scale: 1
                }}
                exit={{ 
                  transition: { duration: 0.2 }
                }}
                transition={{ 
                  damping: 15
                }}
                style={{
                  maxWidth: '100%'
                }}
              >
                <Alert
                  {...alert}
                  mode="toast"
                  onRemove={() => removeAlert(alert.id)}
                  rootProps={{
                    style: {
                      // Adicionar leve transparência para alertas mais antigos
                      opacity: Math.max(0.8, 1 - (index * 0.1))
                    }
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </Box>
    );
  };

  // Se não há alertas, não renderizar nada
  if (alerts.length === 0) {
    return null;
  }

  return (
    <Portal>
      {Object.entries(alertsByPosition).map(([pos, positionAlerts]) =>
        renderAlertGroup(pos as AlertPosition, positionAlerts)
      )}
    </Portal>
  );
};

/**
 * Componente AlertContainer para posições específicas
 */
export const TopAlertContainer: React.FC<Omit<AlertContainerProps, 'position'>> = (props) => (
  <AlertContainer {...props} position="top" />
);

export const BottomAlertContainer: React.FC<Omit<AlertContainerProps, 'position'>> = (props) => (
  <AlertContainer {...props} position="bottom" />
);

export const TopRightAlertContainer: React.FC<Omit<AlertContainerProps, 'position'>> = (props) => (
  <AlertContainer {...props} position="top-right" />
);

export const TopLeftAlertContainer: React.FC<Omit<AlertContainerProps, 'position'>> = (props) => (
  <AlertContainer {...props} position="top-left" />
);

export const BottomRightAlertContainer: React.FC<Omit<AlertContainerProps, 'position'>> = (props) => (
  <AlertContainer {...props} position="bottom-right" />
);

export const BottomLeftAlertContainer: React.FC<Omit<AlertContainerProps, 'position'>> = (props) => (
  <AlertContainer {...props} position="bottom-left" />
);

export default AlertContainer;