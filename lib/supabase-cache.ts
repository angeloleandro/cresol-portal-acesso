import { logger } from './production-logger';


interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

interface CacheOptions {
  ttl?: number; // Time to live em millisegundos
  staleWhileRevalidate?: boolean; // Retorna dados antigos enquanto revalida
  forceRefresh?: boolean; // Força refresh ignorando cache
}

class SupabaseCache {
  private cache: Map<string, CacheEntry<unknown>>;
  private revalidating: Set<string>;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
  private readonly MAX_CACHE_SIZE = 100;
  
  constructor() {
    this.cache = new Map();
    this.revalidating = new Set();
    
    // Limpar cache expirado a cada minuto
    setInterval(() => this.cleanExpiredCache(), 60 * 1000);
  }
  
  /**
   * Gera chave única para a query
   */
  private generateKey(table: string, query: unknown): string {
    const queryString = JSON.stringify(query);
    return `${table}:${queryString}`;
  }
  
  /**
   * Verifica se o cache está válido
   */
  private isValid(entry: CacheEntry<unknown>): boolean {
    const now = Date.now();
    return now - entry.timestamp < entry.ttl;
  }
  
  /**
   * Limpa entradas expiradas do cache
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl * 2) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    // Se o cache estiver muito grande, remove os menos usados
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].hits - b[1].hits);
      
      const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }
  
  /**
   * Obtém dados do cache ou executa a query
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { 
      ttl = this.DEFAULT_TTL, 
      staleWhileRevalidate = true,
      forceRefresh = false 
    } = options;
    
    // Se forçar refresh, ignora cache
    if (forceRefresh) {
      return this.fetchAndCache(key, fetcher, ttl);
    }
    
    const cached = this.cache.get(key);
    
    // Se não tem cache, busca
    if (!cached) {
      logger.info(`[Cache] MISS: ${key}`);
      return this.fetchAndCache(key, fetcher, ttl);
    }
    
    // Incrementa hits
    cached.hits++;
    
    // Se o cache está válido, retorna
    if (this.isValid(cached)) {
      logger.info(`[Cache] HIT: ${key} (hits: ${cached.hits})`);
      return cached.data as T;
    }
    
    // Se staleWhileRevalidate está ativo
    if (staleWhileRevalidate && !this.revalidating.has(key)) {
      logger.info(`[Cache] STALE: ${key} - revalidating in background`);
      
      // Marca como revalidando
      this.revalidating.add(key);
      
      // Revalida em background
      this.fetchAndCache(key, fetcher, ttl)
        .then(() => {
          logger.info(`[Cache] REVALIDATED: ${key}`);
        })
        .catch((error) => {
          logger.error(`[Cache] Revalidation failed: ${key}`, error);
        })
        .finally(() => {
          this.revalidating.delete(key);
        });
      
      // Retorna dados antigos
      return cached.data as T;
    }
    
    // Se não pode usar stale, busca novo
    logger.info(`[Cache] EXPIRED: ${key} - fetching fresh data`);
    return this.fetchAndCache(key, fetcher, ttl);
  }
  
  /**
   * Busca dados e armazena no cache
   */
  private async fetchAndCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    try {
      const startTime = Date.now();
      const data = await fetcher();
      const fetchTime = Date.now() - startTime;
      
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
        hits: 0
      });
      
      logger.info(`[Cache] STORED: ${key} (fetch time: ${fetchTime}ms)`);
      return data;
    } catch (error) {
      logger.error(`[Cache] Fetch failed: ${key}`, error);
      
      // Se falhar, tenta retornar cache antigo se existir
      const cached = this.cache.get(key);
      if (cached) {
        logger.warn(`[Cache] Using stale data due to fetch error: ${key}`);
        return cached.data as T;
      }
      
      throw error;
    }
  }
  
  /**
   * Invalida cache para uma chave específica
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    logger.info(`[Cache] INVALIDATED: ${key}`);
  }
  
  /**
   * Invalida todo cache de uma tabela
   */
  invalidateTable(table: string): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.startsWith(`${table}:`)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
    logger.info(`[Cache] INVALIDATED TABLE: ${table} (${keysToDelete.length} entries)`);
  }
  
  /**
   * Invalida cache baseado em padrão
   */
  invalidatePattern(pattern: string): void {
    const keysToDelete: string[] = [];
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
    logger.info(`[Cache] INVALIDATED PATTERN: ${pattern} (${keysToDelete.length} entries)`);
  }
  
  /**
   * Limpa todo o cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.revalidating.clear();
    logger.info(`[Cache] CLEARED: ${size} entries removed`);
  }
  
  /**
   * Estatísticas do cache
   */
  getStats(): {
    size: number;
    entries: Array<{ key: string; hits: number; age: number; valid: boolean }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      hits: entry.hits,
      age: now - entry.timestamp,
      valid: this.isValid(entry)
    }));
    
    entries.sort((a, b) => b.hits - a.hits);
    
    return {
      size: this.cache.size,
      entries: entries.slice(0, 10) // Top 10 mais acessados
    };
  }
}

// Singleton instance
export const supabaseCache = new SupabaseCache();

/**
 * Hook helper para usar com React Query ou SWR
 */
/**
 * createCachedQuery function
 * @todo Add proper documentation
 */
export function createCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
) {
  return () => supabaseCache.get(key, fetcher, options);
}

/**
 * Decorator para métodos que fazem queries
 */
/**
 * cached function
 * @todo Add proper documentation
 */
export function Cached(options?: CacheOptions) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: unknown[]) {
      const key = `${(target as any).constructor.name}.${propertyKey}:${JSON.stringify(args)}`;
      return supabaseCache.get(
        key,
        () => originalMethod.apply(this, args),
        options
      );
    };
    
    return descriptor;
  };
}