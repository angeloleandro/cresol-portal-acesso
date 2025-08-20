/**
 * Sistema de Alertas Cresol - Exports Centralizados
 * 
 * Ponto único de importação para todos os componentes e utilitários
 * do sistema de alertas baseado em Chakra UI v3
 * 
 * Uso:
 * ```
 * import { useAlert, AlertProvider, AlertContainer } from '@/app/components/alerts';
 * ```
 */

import React from 'react';
import { AlertProvider } from './AlertProvider';
import type { AlertPosition, AlertStatus, AlertVariant } from './types';

// =====================================================
// COMPONENTES PRINCIPAIS
// =====================================================

export { 
  Alert,
  SuccessAlert,
  ErrorAlert,
  WarningAlert,
  InfoAlert
} from './Alert';

export { 
  AlertContainer,
  TopAlertContainer,
  BottomAlertContainer,
  TopRightAlertContainer,
  TopLeftAlertContainer,
  BottomRightAlertContainer,
  BottomLeftAlertContainer
} from './AlertContainer';

export { 
  AlertProvider,
  AlertContext
} from './AlertProvider';

// =====================================================
// HOOKS E UTILITÁRIOS
// =====================================================

export { useAlert } from './useAlert';

// =====================================================
// MENSAGENS PADRONIZADAS
// =====================================================

export {
  CRUD_MESSAGES,
  MODULE_MESSAGES,
  SYSTEM_MESSAGES,
  ERROR_MESSAGES,
  generateCrudMessage,
  generateEntityMessage
} from './messages';

// =====================================================
// TIPOS TYPESCRIPT
// =====================================================

export type {
  AlertStatus,
  AlertVariant,
  AlertPosition,
  AlertSize,
  AlertOptions,
  ActiveAlert,
  AlertContextValue,
  AlertConfig,
  AlertProps,
  AlertContainerProps,
  AlertMessage,
  CrudOperation,
  OperationResult,
  EntityContext
} from './types';

// =====================================================
// CONFIGURAÇÕES PADRÃO
// =====================================================

/**
 * Configuração padrão recomendada para uso no app
 */
export const DEFAULT_ALERT_CONFIG = {
  defaultPosition: 'top-right' as const,
  defaultVariant: 'subtle' as const,
  defaultSize: 'md' as const,
  maxAlerts: 5,
  animationEnabled: true,
  pauseOnHover: true,
  closeOnClickOutside: false,
  defaultDurations: {
    success: 5000,
    error: 7000,
    warning: 6000,
    info: 5000,
    neutral: 5000
  }
};

// =====================================================
// COMPONENTES COMPOSTOS (HIGH-ORDER)
// =====================================================

/**
 * Provider completo com configuração padrão Cresol
 */
export const CresolAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const alertProviderProps = { config: DEFAULT_ALERT_CONFIG, children };
  return React.createElement(AlertProvider, alertProviderProps);
};

// =====================================================
// UTILITÁRIOS DE CONVENIÊNCIA
// =====================================================

/**
 * Mapeamento de cores de status para usar com Chakra UI
 */
export const ALERT_STATUS_COLORS = {
  success: 'green',
  error: 'red',
  warning: 'yellow',
  info: 'blue',
  neutral: 'gray'
} as const;

/**
 * Durações padrão por tipo de alerta (ms)
 */
export const ALERT_DURATIONS = {
  success: 5000,
  error: 7000,
  warning: 6000,
  info: 5000,
  neutral: 5000,
  loading: null, // Não remove automaticamente
  progress: null // Não remove automaticamente
} as const;

/**
 * Z-index padrão para diferentes tipos de alertas
 */
export const ALERT_Z_INDEX = {
  toast: 1500,
  modal: 1600,
  overlay: 1700
} as const;

// =====================================================
// VALIDADORES E HELPERS
// =====================================================

/**
 * Validar se uma posição é válida
 */
export const isValidAlertPosition = (position: string): position is AlertPosition => {
  const validPositions = [
    'top', 'bottom', 'top-right', 'top-left', 'bottom-right', 'bottom-left'
  ];
  return validPositions.includes(position);
};

/**
 * Validar se um status é válido
 */
export const isValidAlertStatus = (status: string): status is AlertStatus => {
  const validStatuses = ['success', 'error', 'warning', 'info', 'neutral'];
  return validStatuses.includes(status);
};

/**
 * Validar se uma variante é válida
 */
export const isValidAlertVariant = (variant: string): variant is AlertVariant => {
  const validVariants = ['subtle', 'solid', 'surface'];
  return validVariants.includes(variant);
};

// =====================================================
// RE-EXPORTS DE DEPENDÊNCIAS
// =====================================================

// Re-exportar tipos importantes do React para conveniência
export type { ReactNode } from 'react';

// =====================================================
// DOCUMENTAÇÃO DE USO
// =====================================================

/**
 * GUIA DE INÍCIO RÁPIDO
 * 
 * 1. Instalar no layout principal:
 * ```tsx
 * import { AlertProvider, AlertContainer } from '@/app/components/alerts';
 * 
 * function Layout({ children }) {
 *   return (
 *     <AlertProvider>
 *       {children}
 *       <AlertContainer />
 *     </AlertProvider>
 *   );
 * }
 * ```
 * 
 * 2. Usar em componentes:
 * ```tsx
 * import { useAlert } from '@/app/components/alerts';
 * 
 * function MyComponent() {
 *   const alert = useAlert();
 *   
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       alert.showSuccess('Dados salvos com sucesso!');
 *     } catch (error) {
 *       alert.showError('Erro ao salvar dados', error.message);
 *     }
 *   };
 * }
 * ```
 * 
 * 3. Usar mensagens padronizadas:
 * ```tsx
 * const alert = useAlert();
 * 
 * // Sucesso em operações CRUD
 * alert.users.created();
 * alert.collections.statusChanged(true);
 * 
 * // Operações assíncronas com loading
 * await alert.handleAsyncOperation(
 *   () => uploadFile(),
 *   'Enviando arquivo...',
 *   'Arquivo enviado com sucesso!'
 * );
 * ```
 */