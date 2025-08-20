'use client';

/**
 * AlertProvider - Gerenciador Global de Alertas
 * 
 * Context provider que gerencia estado global dos alertas
 * Inclui configurações, fila de alertas e métodos de conveniência
 */

import React, { createContext, useCallback, useReducer, useMemo } from 'react';
import type { 
  AlertContextValue, 
  AlertOptions, 
  ActiveAlert, 
  AlertConfig,
  AlertStatus 
} from './types';

/**
 * Configuração padrão do sistema de alertas
 */
const DEFAULT_CONFIG: AlertConfig = {
  defaultDurations: {
    success: 5000,
    error: 7000,
    warning: 6000,
    info: 5000,
    neutral: 5000
  },
  defaultPosition: 'top-right',
  defaultVariant: 'subtle',
  defaultSize: 'md',
  maxAlerts: 5,
  animationEnabled: true,
  pauseOnHover: true,
  closeOnClickOutside: false
};

/**
 * Actions para o reducer de alertas
 */
type AlertAction = 
  | { type: 'ADD_ALERT'; payload: ActiveAlert }
  | { type: 'REMOVE_ALERT'; payload: string }
  | { type: 'CLEAR_ALERTS' }
  | { type: 'UPDATE_CONFIG'; payload: Partial<AlertConfig> };

/**
 * Estado do sistema de alertas
 */
interface AlertState {
  alerts: ActiveAlert[];
  config: AlertConfig;
}

/**
 * Estado inicial
 */
const initialState: AlertState = {
  alerts: [],
  config: DEFAULT_CONFIG
};

/**
 * Reducer para gerenciar alertas
 */
function alertReducer(state: AlertState, action: AlertAction): AlertState {
  switch (action.type) {
    case 'ADD_ALERT': {
      const newAlert = action.payload;
      
      // Verificar se já existe um alerta com mesmo ID
      const existingIndex = state.alerts.findIndex(alert => alert.id === newAlert.id);
      
      if (existingIndex >= 0) {
        // Substituir alerta existente
        const updatedAlerts = [...state.alerts];
        updatedAlerts[existingIndex] = newAlert;
        return { ...state, alerts: updatedAlerts };
      }
      
      // Adicionar novo alerta
      let newAlerts = [newAlert, ...state.alerts];
      
      // Respeitar limite máximo de alertas
      if (newAlerts.length > state.config.maxAlerts) {
        newAlerts = newAlerts.slice(0, state.config.maxAlerts);
      }
      
      return { ...state, alerts: newAlerts };
    }

    case 'REMOVE_ALERT': {
      const alertId = action.payload;
      const filteredAlerts = state.alerts.filter(alert => alert.id !== alertId);
      return { ...state, alerts: filteredAlerts };
    }

    case 'CLEAR_ALERTS': {
      return { ...state, alerts: [] };
    }

    case 'UPDATE_CONFIG': {
      const newConfig = { ...state.config, ...action.payload };
      return { ...state, config: newConfig };
    }

    default:
      return state;
  }
}

/**
 * Context do sistema de alertas
 */
export const AlertContext = createContext<AlertContextValue | null>(null);

/**
 * Gerar ID único para alertas
 */
function generateAlertId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Gerar ID baseado no conteúdo para evitar duplicatas
 */
function generateContentBasedId(title: string, description?: string): string {
  const content = `${title}-${description || ''}`;
  const hash = content.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return `alert-content-${Math.abs(hash)}`;
}

/**
 * Props do AlertProvider
 */
interface AlertProviderProps {
  children: React.ReactNode;
  config?: Partial<AlertConfig>;
}

/**
 * Provider de alertas
 */
export const AlertProvider: React.FC<AlertProviderProps> = ({ 
  children, 
  config: initialConfig 
}) => {
  const [state, dispatch] = useReducer(alertReducer, {
    ...initialState,
    config: { ...DEFAULT_CONFIG, ...initialConfig }
  });

  /**
   * Adicionar alerta ao sistema
   */
  const showAlert = useCallback((options: AlertOptions) => {
    const {
      id: providedId,
      status = 'info',
      title,
      description,
      duration,
      isClosable = true,
      position,
      variant,
      size,
      onClose,
      action,
      icon
    } = options;

    // Gerar ID único ou baseado no conteúdo
    const alertId = providedId || 
      (options.id !== undefined ? options.id : generateContentBasedId(title, description));

    // Determinar duração
    const alertDuration = duration !== undefined 
      ? duration 
      : state.config.defaultDurations[status];

    // Criar alerta ativo
    const activeAlert: ActiveAlert = {
      id: alertId,
      status,
      title,
      description: description || '',
      duration: alertDuration,
      isClosable,
      position: position || state.config.defaultPosition,
      variant: variant || state.config.defaultVariant,
      size: size || state.config.defaultSize,
      createdAt: Date.now(),
      onClose,
      action,
      icon
    };

    dispatch({ type: 'ADD_ALERT', payload: activeAlert });

    // Retornar função para remover o alerta
    return () => {
      dispatch({ type: 'REMOVE_ALERT', payload: alertId });
    };
  }, [state.config]);

  /**
   * Remover alerta específico
   */
  const removeAlert = useCallback((id: string) => {
    const alert = state.alerts.find(a => a.id === id);
    if (alert?.onClose) {
      alert.onClose();
    }
    dispatch({ type: 'REMOVE_ALERT', payload: id });
  }, [state.alerts]);

  /**
   * Limpar todos os alertas
   */
  const clearAlerts = useCallback(() => {
    // Chamar onClose de todos os alertas antes de limpar
    state.alerts.forEach(alert => {
      if (alert.onClose) {
        alert.onClose();
      }
    });
    dispatch({ type: 'CLEAR_ALERTS' });
  }, [state.alerts]);

  /**
   * Atualizar configurações
   */
  const updateConfig = useCallback((newConfig: Partial<AlertConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: newConfig });
  }, []);

  /**
   * Métodos de conveniência para tipos específicos
   */
  const showSuccess = useCallback((
    title: string, 
    description?: string, 
    options?: Partial<AlertOptions>
  ) => {
    return showAlert({
      status: 'success',
      title,
      description,
      ...options
    });
  }, [showAlert]);

  const showError = useCallback((
    title: string, 
    description?: string, 
    options?: Partial<AlertOptions>
  ) => {
    return showAlert({
      status: 'error',
      title,
      description,
      ...options
    });
  }, [showAlert]);

  const showWarning = useCallback((
    title: string, 
    description?: string, 
    options?: Partial<AlertOptions>
  ) => {
    return showAlert({
      status: 'warning',
      title,
      description,
      ...options
    });
  }, [showAlert]);

  const showInfo = useCallback((
    title: string, 
    description?: string, 
    options?: Partial<AlertOptions>
  ) => {
    return showAlert({
      status: 'info',
      title,
      description,
      ...options
    });
  }, [showAlert]);

  /**
   * Métodos utilitários para operações comuns
   */
  const showLoading = useCallback((
    message: string = 'Carregando...',
    options?: Partial<AlertOptions>
  ) => {
    return showAlert({
      status: 'info',
      title: message,
      duration: null, // Não remove automaticamente
      isClosable: false,
      ...options
    });
  }, [showAlert]);

  const showProgress = useCallback((
    title: string,
    progress: number,
    options?: Partial<AlertOptions>
  ) => {
    const progressText = `${Math.round(progress)}%`;
    return showAlert({
      status: 'info',
      title,
      description: `Progresso: ${progressText}`,
      duration: null,
      isClosable: false,
      ...options,
      id: options?.id || `progress-${title.toLowerCase().replace(/\s+/g, '-')}`
    });
  }, [showAlert]);

  /**
   * Valor do contexto memoizado
   */
  const contextValue = useMemo<AlertContextValue>(() => ({
    alerts: state.alerts,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeAlert,
    clearAlerts,
    config: state.config,
    updateConfig,
    // Métodos utilitários extras
    showLoading,
    showProgress
  }), [
    state.alerts,
    state.config,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeAlert,
    clearAlerts,
    updateConfig,
    showLoading,
    showProgress
  ]);

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertProvider;