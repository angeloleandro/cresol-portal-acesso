'use client';

import { useContext, useCallback, useMemo } from 'react';

import { AlertContext } from './AlertProvider';
import { 
  CRUD_MESSAGES, 
  MODULE_MESSAGES, 
  SYSTEM_MESSAGES, 
  ERROR_MESSAGES,
  GenerateCrudMessage,
  GenerateEntityMessage
} from './messages';

import type { 
  AlertContextValue, 
  AlertOptions, 
  CrudOperation, 
  OperationResult, 
  EntityContext 
} from './types';

/**
 * Interface estendida do hook useAlert
 */
interface UseAlertReturn extends AlertContextValue {
  // Métodos para operações CRUD
  showCrudResult: (
    operation: CrudOperation,
    result: OperationResult,
    entity: string,
    details?: string
  ) => () => void;

  showEntityResult: (
    operation: CrudOperation,
    result: OperationResult,
    context: EntityContext,
    details?: string
  ) => () => void;

  // Mensagens específicas por módulo
  users: {
    created: () => () => void;
    updated: () => () => void;
    deleted: () => () => void;
    roleChanged: (role: string) => () => void;
    activated: () => () => void;
    deactivated: () => () => void;
    passwordReset: () => () => void;
  };

  sectors: {
    created: () => () => void;
    updated: () => () => void;
    deleted: () => () => void;
    memberAdded: () => () => void;
    memberRemoved: () => () => void;
  };

  subsectors: {
    created: () => () => void;
    updated: () => () => void;
    deleted: () => () => void;
    teamUpdated: () => () => void;
  };

  content: {
    newsCreated: () => () => void;
    newsUpdated: () => () => void;
    newsDeleted: () => () => void;
    eventCreated: () => () => void;
    eventUpdated: () => () => void;
    eventDeleted: () => () => void;
    messageCreated: () => () => void;
    messageUpdated: () => () => void;
    messageDeleted: () => () => void;
  };

  media: {
    imageUploaded: () => () => void;
    videoUploaded: () => () => void;
    fileDeleted: () => () => void;
    bannerCreated: () => () => void;
    bannerUpdated: () => () => void;
    bannerDeleted: () => () => void;
  };

  groups: {
    created: () => () => void;
    updated: () => () => void;
    deleted: () => () => void;
    memberAdded: () => () => void;
    memberRemoved: () => () => void;
  };

  collections: {
    created: () => () => void;
    updated: () => () => void;
    deleted: () => () => void;
    statusChanged: (isActive: boolean) => () => void;
    itemsAdded: (count: number) => () => void;
  };

  // Mensagens de sistema
  form: {
    submitted: () => () => void;
    validationError: () => () => void;
    saved: () => () => void;
  };

  auth: {
    loginSuccess: () => () => void;
    logoutSuccess: () => () => void;
    unauthorized: () => () => void;
    sessionExpired: () => () => void;
  };

  network: {
    offline: () => () => void;
    reconnected: () => () => void;
    timeout: () => () => void;
  };

  // Mensagens de erro comuns
  errors: {
    generic: () => () => void;
    network: () => () => void;
    server: () => () => void;
    notFound: (entity: string) => () => void;
    forbidden: () => () => void;
    validation: (field: string) => () => void;
  };

  // Utilitários para async operations
  handleAsyncOperation: <T>(
    operation: () => Promise<T>,
    loadingMessage: string,
    successMessage: string,
    errorMessage?: string
  ) => Promise<T>;

  // Wrapper para try/catch com alertas automáticos
  withErrorHandling: <T>(
    operation: () => Promise<T>,
    errorMessage?: string
  ) => Promise<T | null>;
}

/**
 * Hook useAlert
 */
export const useAlert = (): UseAlertReturn => {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error(
      'useAlert deve ser usado dentro de um AlertProvider. ' +
      'Certifique-se de envolver seu componente com <AlertProvider>.'
    );
  }

  /**
   * Método para mostrar resultado de operação CRUD
   */
  const showCrudResult = useCallback((
    operation: CrudOperation,
    result: OperationResult,
    entity: string,
    details?: string
  ) => {
    const message = GenerateCrudMessage(operation, result, entity, details);
    
    return context.showAlert({
      status: result === 'success' ? 'success' : result === 'error' ? 'error' : 'info',
      title: message.title,
      description: message.description
    });
  }, [context]);

  /**
   * Método para mostrar resultado com contexto de entidade
   */
  const showEntityResult = useCallback((
    operation: CrudOperation,
    result: OperationResult,
    entityContext: EntityContext,
    details?: string
  ) => {
    const message = GenerateEntityMessage(operation, result, entityContext, details);
    
    return context.showAlert({
      status: result === 'success' ? 'success' : result === 'error' ? 'error' : 'info',
      title: message.title,
      description: message.description
    });
  }, [context]);

  /**
   * Métodos específicos por módulo
   */
  const users = useMemo(() => ({
    created: () => context.showSuccess(MODULE_MESSAGES.users.created().title),
    updated: () => context.showSuccess(MODULE_MESSAGES.users.updated().title),
    deleted: () => context.showSuccess(MODULE_MESSAGES.users.deleted().title),
    roleChanged: (role: string) => {
      const message = MODULE_MESSAGES.users.roleChanged(role);
      return context.showSuccess(message.title, message.description);
    },
    activated: () => {
      const message = MODULE_MESSAGES.users.activated();
      return context.showSuccess(message.title, message.description);
    },
    deactivated: () => {
      const message = MODULE_MESSAGES.users.deactivated();
      return context.showSuccess(message.title, message.description);
    },
    passwordReset: () => {
      return context.showSuccess('Senha redefinida com sucesso!', 'A nova senha foi enviada para o usuário.');
    }
  }), [context]);

  const sectors = useMemo(() => ({
    created: () => context.showSuccess(MODULE_MESSAGES.sectors.created().title),
    updated: () => context.showSuccess(MODULE_MESSAGES.sectors.updated().title),
    deleted: () => context.showSuccess(MODULE_MESSAGES.sectors.deleted().title),
    memberAdded: () => {
      const message = MODULE_MESSAGES.sectors.memberAdded();
      return context.showSuccess(message.title, message.description);
    },
    memberRemoved: () => {
      const message = MODULE_MESSAGES.sectors.memberRemoved();
      return context.showSuccess(message.title, message.description);
    }
  }), [context]);

  const subsectors = useMemo(() => ({
    created: () => context.showSuccess(MODULE_MESSAGES.subsectors.created().title),
    updated: () => context.showSuccess(MODULE_MESSAGES.subsectors.updated().title),
    deleted: () => context.showSuccess(MODULE_MESSAGES.subsectors.deleted().title),
    teamUpdated: () => {
      const message = MODULE_MESSAGES.subsectors.teamUpdated();
      return context.showSuccess(message.title, message.description);
    }
  }), [context]);

  const content = useMemo(() => ({
    newsCreated: () => context.showSuccess(MODULE_MESSAGES.content.newsCreated().title),
    newsUpdated: () => context.showSuccess(MODULE_MESSAGES.content.newsUpdated().title),
    newsDeleted: () => context.showSuccess(MODULE_MESSAGES.content.newsDeleted().title),
    eventCreated: () => context.showSuccess(MODULE_MESSAGES.content.eventCreated().title),
    eventUpdated: () => context.showSuccess(MODULE_MESSAGES.content.eventUpdated().title),
    eventDeleted: () => context.showSuccess(MODULE_MESSAGES.content.eventDeleted().title),
    messageCreated: () => context.showSuccess(MODULE_MESSAGES.content.messageCreated().title),
    messageUpdated: () => context.showSuccess(MODULE_MESSAGES.content.messageUpdated().title),
    messageDeleted: () => context.showSuccess(MODULE_MESSAGES.content.messageDeleted().title)
  }), [context]);

  const media = useMemo(() => ({
    imageUploaded: () => context.showSuccess(MODULE_MESSAGES.media.imageUploaded().title),
    videoUploaded: () => context.showSuccess(MODULE_MESSAGES.media.videoUploaded().title),
    fileDeleted: () => context.showSuccess(MODULE_MESSAGES.media.fileDeleted().title),
    bannerCreated: () => context.showSuccess(MODULE_MESSAGES.media.bannerCreated().title),
    bannerUpdated: () => context.showSuccess(MODULE_MESSAGES.media.bannerUpdated().title),
    bannerDeleted: () => context.showSuccess(MODULE_MESSAGES.media.bannerDeleted().title)
  }), [context]);

  const groups = useMemo(() => ({
    created: () => context.showSuccess(MODULE_MESSAGES.groups.created().title),
    updated: () => context.showSuccess(MODULE_MESSAGES.groups.updated().title),
    deleted: () => context.showSuccess(MODULE_MESSAGES.groups.deleted().title),
    memberAdded: () => {
      const message = MODULE_MESSAGES.groups.memberAdded();
      return context.showSuccess(message.title, message.description);
    },
    memberRemoved: () => {
      const message = MODULE_MESSAGES.groups.memberRemoved();
      return context.showSuccess(message.title, message.description);
    }
  }), [context]);

  const collections = useMemo(() => ({
    created: () => context.showSuccess(MODULE_MESSAGES.collections.created().title),
    updated: () => context.showSuccess(MODULE_MESSAGES.collections.updated().title),
    deleted: () => context.showSuccess(MODULE_MESSAGES.collections.deleted().title),
    statusChanged: (isActive: boolean) => {
      const message = MODULE_MESSAGES.collections.statusChanged(isActive);
      return context.showSuccess(message.title, message.description);
    },
    itemsAdded: (count: number) => {
      const message = MODULE_MESSAGES.collections.itemsAdded(count);
      return context.showSuccess(message.title, message.description);
    }
  }), [context]);

  const form = useMemo(() => ({
    submitted: () => {
      const message = SYSTEM_MESSAGES.form.submitted();
      return context.showSuccess(message.title, message.description);
    },
    validationError: () => {
      const message = SYSTEM_MESSAGES.form.validationError();
      return context.showWarning(message.title, message.description);
    },
    saved: () => {
      const message = SYSTEM_MESSAGES.form.saved();
      return context.showSuccess(message.title, message.description);
    }
  }), [context]);

  const auth = useMemo(() => ({
    loginSuccess: () => {
      const message = SYSTEM_MESSAGES.auth.loginSuccess();
      return context.showSuccess(message.title, message.description);
    },
    logoutSuccess: () => {
      const message = SYSTEM_MESSAGES.auth.logoutSuccess();
      return context.showInfo(message.title, message.description);
    },
    unauthorized: () => {
      const message = SYSTEM_MESSAGES.auth.unauthorized();
      return context.showError(message.title, message.description);
    },
    sessionExpired: () => {
      const message = SYSTEM_MESSAGES.auth.sessionExpired();
      return context.showWarning(message.title, message.description);
    }
  }), [context]);

  const network = useMemo(() => ({
    offline: () => {
      const message = SYSTEM_MESSAGES.network.offline();
      return context.showWarning(message.title, message.description);
    },
    reconnected: () => {
      const message = SYSTEM_MESSAGES.network.reconnected();
      return context.showSuccess(message.title, message.description);
    },
    timeout: () => {
      const message = SYSTEM_MESSAGES.network.timeout();
      return context.showError(message.title, message.description);
    }
  }), [context]);

  const errors = useMemo(() => ({
    generic: () => {
      const message = ERROR_MESSAGES.generic();
      return context.showError(message.title, message.description);
    },
    network: () => {
      const message = ERROR_MESSAGES.network();
      return context.showError(message.title, message.description);
    },
    server: () => {
      const message = ERROR_MESSAGES.server();
      return context.showError(message.title, message.description);
    },
    notFound: (entity: string) => {
      const message = ERROR_MESSAGES.notFound(entity);
      return context.showError(message.title, message.description);
    },
    forbidden: () => {
      const message = ERROR_MESSAGES.forbidden();
      return context.showError(message.title, message.description);
    },
    validation: (field: string) => {
      const message = ERROR_MESSAGES.validation(field);
      return context.showError(message.title, message.description);
    }
  }), [context]);

  /**
   * Utilitário para operações assíncronas com alertas automáticos
   */
  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    loadingMessage: string,
    successMessage: string,
    errorMessage: string = 'Erro ao executar operação'
  ): Promise<T> => {
    const loadingAlert = context.showLoading(loadingMessage);

    try {
      const result = await operation();
      loadingAlert(); // Remove loading alert
      context.showSuccess(successMessage);
      return result;
    } catch (error) {
      loadingAlert(); // Remove loading alert
      const errorText = error instanceof Error ? error.message : String(error);
      context.showError(errorMessage, errorText);
      throw error;
    }
  }, [context]);

  /**
   * Wrapper para try/catch com tratamento automático de erros
   */
  const withErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    errorMessage: string = 'Ocorreu um erro inesperado'
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : String(error);
      context.showError(errorMessage, errorText);
      return null;
    }
  }, [context]);

  // Retornar interface completa
  return {
    ...context,
    showCrudResult,
    showEntityResult,
    users,
    sectors,
    subsectors,
    content,
    media,
    groups,
    collections,
    form,
    auth,
    network,
    errors,
    handleAsyncOperation,
    withErrorHandling
  };
};

export default useAlert;