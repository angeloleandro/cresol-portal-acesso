/**
 * Utilitário para tratamento padronizado de erros
 */

export interface ErrorDetails {
  message: string;
  code?: string;
  context?: Record<string, any>;
}

export class AppError extends Error {
  public readonly code?: string;
  public readonly context?: Record<string, any>;
  public readonly isOperational: boolean;

  constructor(
    message: string, 
    code?: string, 
    context?: Record<string, any>, 
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Logger de desenvolvimento - apenas exibe logs em ambiente de desenvolvimento
 */
export const devLog = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
          }
  },
  
  warn: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, data ? data : '');
    }
  },
  
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, error ? error : '');
    }
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
          }
  }
};

/**
 * Manipulador de erros para APIs
 */
export const handleApiError = (error: unknown, context?: string): ErrorDetails => {
  let message = 'Erro interno do servidor';
  let code = 'INTERNAL_ERROR';
  let errorContext: Record<string, any> = {};

  if (error instanceof AppError) {
    message = error.message;
    code = error.code || 'APP_ERROR';
    errorContext = error.context || {};
  } else if (error instanceof Error) {
    message = error.message;
    code = 'UNKNOWN_ERROR';
    errorContext = { originalError: error.name };
  } else if (typeof error === 'string') {
    message = error;
    code = 'STRING_ERROR';
  }

  // Log apenas em desenvolvimento
  devLog.error(`API Error${context ? ` in ${context}` : ''}`, {
    message,
    code,
    context: errorContext
  });

  return {
    message,
    code,
    context: errorContext
  };
};

/**
 * Manipulador de erros para componentes React
 */
export const handleComponentError = (error: unknown, componentName?: string): string => {
  let message = 'Ocorreu um erro inesperado';

  if (error instanceof AppError) {
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  // Log apenas em desenvolvimento
  devLog.error(`Component Error${componentName ? ` in ${componentName}` : ''}`, error);

  return message;
};

/**
 * Verifica se um erro é de autenticação
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const authKeywords = ['auth', 'authentication', 'unauthorized', 'token', 'session'];
    return authKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword)
    );
  }
  return false;
};

/**
 * Verifica se um erro é de permissão
 */
export const isPermissionError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const permissionKeywords = ['permission', 'forbidden', 'access denied', 'not allowed'];
    return permissionKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword)
    );
  }
  return false;
};

/**
 * Cria uma mensagem de erro user-friendly baseada no tipo de erro
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  if (isAuthError(error)) {
    return 'Sua sessão expirou. Por favor, faça login novamente.';
  }
  
  if (isPermissionError(error)) {
    return 'Você não tem permissão para realizar esta ação.';
  }
  
  if (error instanceof Error) {
    // Mapear erros específicos do Supabase para mensagens user-friendly
    if (error.message.includes('duplicate key')) {
      return 'Este registro já existe no sistema.';
    }
    
    if (error.message.includes('foreign key')) {
      return 'Não é possível realizar esta operação devido a dependências existentes.';
    }
    
    if (error.message.includes('network')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    if (error.message.includes('timeout')) {
      return 'A operação demorou muito para responder. Tente novamente.';
    }
  }
  
  return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
};

/**
 * Manipulador de erros para operações assíncronas
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const message = errorMessage || getUserFriendlyMessage(error);
    devLog.error('SafeAsync Error', error);
    return { data: null, error: message };
  }
}; 