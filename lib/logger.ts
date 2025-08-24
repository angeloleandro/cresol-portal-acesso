/**
 * Sistema centralizado de logging para debugging de performance
 */

// Cores para diferentes tipos de log
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Cores do texto
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Cores de fundo
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m'
};

interface LogContext {
  component?: string;
  userId?: string;
  requestId?: string;
  operation?: string;
  sectorId?: string;
  includeUnpublished?: boolean;
  timings?: Record<string, number>;
  error?: Error | string | null;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface TimingResult {
  duration: number;
  label: string;
  context?: LogContext;
}

class PerformanceLogger {
  private timers = new Map<string, { start: number; label: string; context?: LogContext }>();
  private isDevelopment = process.env.NODE_ENV === 'development';

  // Gerar ID único para rastreamento de operações
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Formatar timestamp legível
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().slice(11, 23); // HH:mm:ss.sss
  }

  // Log colorido básico
  private colorLog(color: string, bgColor: string, icon: string, level: string, message: string, context?: LogContext) {
    if (!this.isDevelopment) return;
    
    const _timestamp = this.getTimestamp();
    const _contextStr = context ? 
      ` | ${Object.entries(context).map(([k, v]) => `${k}:${v}`).join(' ')}` : '';
    
      }

  // === LOGS PRINCIPAIS ===

  // 🚀 API Performance
  apiStart(label: string, context?: LogContext): string {
    const timerId = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timers.set(timerId, { start: performance.now(), label, context });
    
    this.colorLog(
      colors.blue, colors.bgBlue, '🚀', 'API START', 
      `${label}`, context
    );
    
    return timerId;
  }

  apiEnd(timerId: string): TimingResult | null {
    const timer = this.timers.get(timerId);
    if (!timer) return null;
    
    const duration = performance.now() - timer.start;
    this.timers.delete(timerId);
    
    const isStlow = duration > 1000;
    const isVerySlow = duration > 3000;
    
    this.colorLog(
      isVerySlow ? colors.red : isStlow ? colors.yellow : colors.green,
      isVerySlow ? colors.bgRed : isStlow ? colors.bgYellow : colors.bgGreen,
      isVerySlow ? '🔥' : isStlow ? '⚠️' : '✅',
      'API END',
      `${timer.label} • ${duration.toFixed(2)}ms`,
      timer.context
    );
    
    return { duration, label: timer.label, context: timer.context };
  }

  // 🔐 Authentication Performance
  authStart(operation: string, context?: LogContext): string {
    const timerId = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timers.set(timerId, { start: performance.now(), label: operation, context });
    
    this.colorLog(
      colors.magenta, colors.bgMagenta, '🔐', 'AUTH START', 
      `${operation}`, context
    );
    
    return timerId;
  }

  authEnd(timerId: string): TimingResult | null {
    const timer = this.timers.get(timerId);
    if (!timer) return null;
    
    const duration = performance.now() - timer.start;
    this.timers.delete(timerId);
    
    const isSlow = duration > 500;
    const isVerySlow = duration > 1500;
    
    this.colorLog(
      isVerySlow ? colors.red : isSlow ? colors.yellow : colors.green,
      isVerySlow ? colors.bgRed : isSlow ? colors.bgYellow : colors.bgGreen,
      isVerySlow ? '🔥' : isSlow ? '⚠️' : '🔓',
      'AUTH END',
      `${timer.label} • ${duration.toFixed(2)}ms`,
      timer.context
    );
    
    return { duration, label: timer.label, context: timer.context };
  }

  // 💾 Database Performance
  dbStart(query: string, context?: LogContext): string {
    const timerId = `db_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const shortQuery = query.length > 50 ? `${query.substring(0, 50)}...` : query;
    
    this.timers.set(timerId, { start: performance.now(), label: shortQuery, context });
    
    this.colorLog(
      colors.cyan, colors.bgCyan, '💾', 'DB START', 
      `${shortQuery}`, context
    );
    
    return timerId;
  }

  dbEnd(timerId: string): TimingResult | null {
    const timer = this.timers.get(timerId);
    if (!timer) return null;
    
    const duration = performance.now() - timer.start;
    this.timers.delete(timerId);
    
    const isSlow = duration > 200;
    const isVerySlow = duration > 1000;
    
    this.colorLog(
      isVerySlow ? colors.red : isSlow ? colors.yellow : colors.green,
      isVerySlow ? colors.bgRed : isSlow ? colors.bgYellow : colors.bgGreen,
      isVerySlow ? '🔥' : isSlow ? '⚠️' : '💚',
      'DB END',
      `${timer.label} • ${duration.toFixed(2)}ms`,
      timer.context
    );
    
    return { duration, label: timer.label, context: timer.context };
  }

  // ⚡ React Component Performance
  componentStart(componentName: string, context?: LogContext): string {
    const timerId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timers.set(timerId, { start: performance.now(), label: componentName, context });
    
    this.colorLog(
      colors.yellow, colors.bgYellow, '⚡', 'COMP START', 
      `${componentName}`, context
    );
    
    return timerId;
  }

  componentEnd(timerId: string): TimingResult | null {
    const timer = this.timers.get(timerId);
    if (!timer) return null;
    
    const duration = performance.now() - timer.start;
    this.timers.delete(timerId);
    
    const isSlow = duration > 100;
    const isVerySlow = duration > 500;
    
    this.colorLog(
      isVerySlow ? colors.red : isSlow ? colors.yellow : colors.green,
      isVerySlow ? colors.bgRed : isSlow ? colors.bgYellow : colors.bgGreen,
      isVerySlow ? '🔥' : isSlow ? '⚠️' : '⚡',
      'COMP END',
      `${timer.label} • ${duration.toFixed(2)}ms`,
      timer.context
    );
    
    return { duration, label: timer.label, context: timer.context };
  }

  // 🌐 HTTP Request Performance
  requestStart(method: string, url: string, context?: LogContext): string {
    const timerId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const shortUrl = url.length > 60 ? `${url.substring(0, 60)}...` : url;
    const label = `${method.toUpperCase()} ${shortUrl}`;
    
    this.timers.set(timerId, { start: performance.now(), label, context });
    
    this.colorLog(
      colors.blue, colors.bgBlue, '🌐', 'REQ START', 
      `${label}`, context
    );
    
    return timerId;
  }

  requestEnd(timerId: string, statusCode?: number): TimingResult | null {
    const timer = this.timers.get(timerId);
    if (!timer) return null;
    
    const duration = performance.now() - timer.start;
    this.timers.delete(timerId);
    
    const isSlow = duration > 1000;
    const isVerySlow = duration > 3000;
    const isError = statusCode && statusCode >= 400;
    
    const status = statusCode ? ` [${statusCode}]` : '';
    
    this.colorLog(
      isError ? colors.red : isVerySlow ? colors.red : isSlow ? colors.yellow : colors.green,
      isError ? colors.bgRed : isVerySlow ? colors.bgRed : isSlow ? colors.bgYellow : colors.bgGreen,
      isError ? '❌' : isVerySlow ? '🔥' : isSlow ? '⚠️' : '✅',
      'REQ END',
      `${timer.label}${status} • ${duration.toFixed(2)}ms`,
      timer.context
    );
    
    return { duration, label: timer.label, context: timer.context };
  }

  // === LOGS DE INFORMAÇÃO ===

  info(message: string, context?: LogContext) {
    this.colorLog(colors.blue, colors.bgBlue, 'ℹ️', 'INFO', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.colorLog(colors.yellow, colors.bgYellow, '⚠️', 'WARN', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    const errorMsg = error ? `${message} • ${error.message}` : message;
    this.colorLog(colors.red, colors.bgRed, '❌', 'ERROR', errorMsg, context);
    
    if (error && this.isDevelopment && error.stack) {
      // eslint-disable-next-line no-console
      console.error(`${colors.dim}${error.stack}${colors.reset}`);
    }
  }

  success(message: string, context?: LogContext) {
    this.colorLog(colors.green, colors.bgGreen, '✅', 'SUCCESS', message, context);
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      this.colorLog(colors.magenta, colors.bgMagenta, '🔍', 'DEBUG', message, context);
    }
  }

  // Compatibilidade com logger anterior
  perf(operation: string, startTime: number, context?: LogContext) {
    const duration = Date.now() - startTime;
    this.info(`${operation} completed in ${duration}ms`, { ...context, duration });
  }

  // === UTILITÁRIOS ===

  // Debugar objeto complexo
  debugObject(label: string, data: unknown, context?: LogContext) {
    if (!this.isDevelopment) return;
    
    this.colorLog(colors.magenta, colors.bgMagenta, '🔍', 'DEBUG', label, context);
    // eslint-disable-next-line no-console
    console.log(`${colors.dim}`, JSON.stringify(data, null, 2), `${colors.reset}`);
  }

  // Separador visual
  separator(title?: string) {
    if (!this.isDevelopment) return;
    
    const _line = '═'.repeat(80);
    const _titleStr = title ? ` ${title} ` : '';
      }

  // Limprar timers órfãos
  cleanup() {
    if (this.timers.size > 0) {
      this.warn(`Limpando ${this.timers.size} timers órfãos`);
      this.timers.clear();
    }
  }
}

// Instância singleton
export const logger = new PerformanceLogger();

// Helper functions para uso fácil
export const logAPI = (label: string, context?: LogContext) => logger.apiStart(label, context);
export const logAuth = (operation: string, context?: LogContext) => logger.authStart(operation, context);
export const logDB = (query: string, context?: LogContext) => logger.dbStart(query, context);
export const logComponent = (name: string, context?: LogContext) => logger.componentStart(name, context);
export const logRequest = (method: string, url: string, context?: LogContext) => logger.requestStart(method, url, context);

// Cleanup automático em desenvolvimento (apenas em Node.js, não no Edge Runtime)
if (process.env.NODE_ENV === 'development' && typeof process !== 'undefined' && process.on) {
  try {
    process.on('beforeExit', () => {
      logger.cleanup();
    });
  } catch (error) {
    // Ignore em Edge Runtime
  }
}