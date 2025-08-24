/**
 * Production Logger
 * 
 * Sistema de logging otimizado para produção que:
 * - Remove logs de debug em produção
 * - Mantém logs de erro críticos
 * - Permite logging condicional baseado em environment
 */

const _isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

interface LogContext {
  operation?: string;
  module?: string;
  userId?: string;
  [key: string]: unknown;
}

class ProductionLogger {
  /**
   * Log de erro crítico - sempre executado
   * Para erros que precisam ser registrados em produção
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[ERROR] ${timestamp} - ${message}`;
    
    // eslint-disable-next-line no-console
    console.error(logMessage, error || '', context ? `Context: ${JSON.stringify(context)}` : '');
  }

  /**
   * Log de warning - sempre executado 
   * Para situações que não são erros mas precisam de atenção
   */
  warn(message: string, data?: unknown, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[WARN] ${timestamp} - ${message}`;
    
    // eslint-disable-next-line no-console
    console.warn(logMessage, data || '', context ? `Context: ${JSON.stringify(context)}` : '');
  }

  /**
   * Log de informação - apenas em desenvolvimento
   * Para informações úteis durante desenvolvimento
   */
  info(message: string, data?: unknown, context?: LogContext): void {
    if (isDevelopment) {
      const timestamp = new Date().toISOString();
      const logMessage = `[INFO] ${timestamp} - ${message}`;
      
      // eslint-disable-next-line no-console
      console.log(logMessage, data || '', context ? `Context: ${JSON.stringify(context)}` : '');
    }
  }

  /**
   * Log de debug - apenas em desenvolvimento
   * Para debugging detalhado
   */
  debug(message: string, data?: unknown, context?: LogContext): void {
    if (isDevelopment) {
      const timestamp = new Date().toISOString();
      const logMessage = `[DEBUG] ${timestamp} - ${message}`;
      
      // eslint-disable-next-line no-console
      console.debug(logMessage, data || '', context ? `Context: ${JSON.stringify(context)}` : '');
    }
  }

  /**
   * Log condicional - apenas quando flag específica está ativada
   * Para logs que podem ser ativados via environment variable
   */
  conditional(flag: string, message: string, data?: unknown, context?: LogContext): void {
    const shouldLog = process.env[`LOG_${flag.toUpperCase()}`] === 'true' || isDevelopment;
    
    if (shouldLog) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${flag.toUpperCase()}] ${timestamp} - ${message}`;
      
      // eslint-disable-next-line no-console
      console.log(logMessage, data || '', context ? `Context: ${JSON.stringify(context)}` : '');
    }
  }

  /**
   * Log de API - para debugging de API calls
   */
  api(operation: string, status: string, data?: unknown): void {
    if (isDevelopment || process.env.LOG_API === 'true') {
      const timestamp = new Date().toISOString();
      const logMessage = `[API] ${timestamp} - ${operation} - ${status}`;
      
      // eslint-disable-next-line no-console
      console.log(logMessage, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  /**
   * Log de performance - para monitoramento de performance
   */
  performance(operation: string, duration: number, context?: LogContext): void {
    if (isDevelopment || process.env.LOG_PERFORMANCE === 'true') {
      const timestamp = new Date().toISOString();
      const logMessage = `[PERF] ${timestamp} - ${operation} completed in ${duration}ms`;
      
      // eslint-disable-next-line no-console
      console.log(logMessage, context ? `Context: ${JSON.stringify(context)}` : '');
    }
  }
}

// Instância singleton
export const logger = new ProductionLogger();

// Convenience exports para compatibilidade
export const logError = logger.error.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logDebug = logger.debug.bind(logger);
export const logApi = logger.api.bind(logger);
export const logPerformance = logger.performance.bind(logger);

export default logger;