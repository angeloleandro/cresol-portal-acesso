import { logger } from './production-logger';


interface UserCacheData {
  id: string;
  role: string;
  email?: string;
  cachedAt: number;
}

interface SessionCache {
  userId: string;
  userData: UserCacheData;
  expiresAt: number;
  lastAccessed: number;
  accessCount: number;
}

// LRU Cache implementation para melhor gestão de memória
class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;
  
  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move para o final (mais recente)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: K, value: V): void {
    // Se já existe, delete primeiro para reordenar
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove o mais antigo (primeiro item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }
  
  delete(key: K): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  get size(): number {
    return this.cache.size;
  }
  
  entries(): IterableIterator<[K, V]> {
    return this.cache.entries();
  }
  
  values(): IterableIterator<V> {
    return this.cache.values();
  }
}

// Cache em memória otimizado com LRU
const userCache = new LRUCache<string, SessionCache>(1500);
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos (aumentado para reduzir miss rate)

// Métricas de cache
let cacheHits = 0;
let cacheMisses = 0;

function cleanExpiredCache(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];
  
  // Identifica chaves expiradas
  for (const [key, data] of userCache.entries()) {
    if (data.expiresAt < now) {
      expiredKeys.push(key);
    }
  }
  
  // Remove expiradas
  for (const key of expiredKeys) {
    userCache.delete(key);
  }
  
  // LRU já gerencia o tamanho máximo automaticamente
}

/**
 * Gera chave de cache baseada no token de acesso
 */
function getCacheKey(accessToken: string): string {
  // Usa os últimos 12 caracteres do token como chave (mais seguro que o token completo)
  return accessToken.slice(-12);
}

/**
 * Recupera dados do usuário do cache com refresh automático
 */
/**
 * getCachedUserData function
 * @todo Add proper documentation
 */
export function GetCachedUserData(accessToken: string): UserCacheData | null {
  const cacheKey = getCacheKey(accessToken);
  const cached = userCache.get(cacheKey); // LRU atualiza ordem automaticamente
  
  if (!cached) {
    cacheMisses++;
    return null;
  }
  
  const now = Date.now();
  
  // Verifica se expirou
  if (cached.expiresAt < now) {
    userCache.delete(cacheKey);
    cacheMisses++;
    return null;
  }
  
  // Atualiza métricas de acesso
  cached.lastAccessed = now;
  cached.accessCount++;
  userCache.set(cacheKey, cached);
  
  cacheHits++;
  
  // Retorna dados se ainda válidos
  return cached.userData;
}

/**
 * Armazena dados do usuário no cache com métricas aprimoradas
 */
/**
 * setCachedUserData function
 * @todo Add proper documentation
 */
export function SetCachedUserData(accessToken: string, userData: UserCacheData): void {
  const cacheKey = getCacheKey(accessToken);
  const now = Date.now();
  const expiresAt = now + CACHE_DURATION;
  
  // Verifica se já existe para preservar contadores
  const existing = userCache.get(cacheKey);
  
  userCache.set(cacheKey, {
    userId: userData.id,
    userData: {
      ...userData,
      cachedAt: now
    },
    expiresAt,
    lastAccessed: now,
    accessCount: existing ? existing.accessCount + 1 : 1
  });
  
  // Limpa cache expirado periodicamente (a cada 100 inserções)
  if (Math.random() < 0.01) {
    cleanExpiredCache();
  }
}

/**
 * Remove dados do cache (usado no logout)
 */
/**
 * clearCachedUserData function
 * @todo Add proper documentation
 */
export function ClearCachedUserData(accessToken: string): void {
  const cacheKey = getCacheKey(accessToken);
  userCache.delete(cacheKey);
}

/**
 * Limpa todo o cache (usado em desenvolvimento)
 */
/**
 * clearAllCache function
 * @todo Add proper documentation
 */
export function ClearAllCache(): void {
  userCache.clear();
}

/**
 * Estatísticas do cache (para debugging)
 */
/**
 * getCacheStats function
 * @todo Add proper documentation
 */
export function GetCacheStats(): {
  size: number;
  hitRate: number;
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  oldestEntry?: number;
  newestEntry?: number;
} {
  const now = Date.now();
  const entries = Array.from(userCache.values());
  const ages = entries.map(entry => now - entry.userData.cachedAt);
  const totalRequests = cacheHits + cacheMisses;
  const hitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;
  
  return {
    size: userCache.size,
    hitRate: Math.round(hitRate * 100) / 100,
    totalRequests,
    cacheHits,
    cacheMisses,
    oldestEntry: ages.length > 0 ? Math.max(...ages) : undefined,
    newestEntry: ages.length > 0 ? Math.min(...ages) : undefined,
  };
}

/**
 * warmupCache function
 * @todo Add proper documentation
 */
export function WarmupCache(userDataList: UserCacheData[], accessTokens: string[]): void {
  if (userDataList.length !== accessTokens.length) {
    logger.warn('[Cache] Warmup: Número de tokens e dados não coincidem');
    return;
  }

  for (let i = 0; i < userDataList.length && i < accessTokens.length; i++) {
    const userData = userDataList[i];
    const token = accessTokens[i];
    
    if (userData && token) {
      SetCachedUserData(token, userData);
    }
  }
  
  }

/**
 * Reset das métricas de cache (para testes)
 */
/**
 * resetCacheMetrics function
 * @todo Add proper documentation
 */
export function ResetCacheMetrics(): void {
  cacheHits = 0;
  cacheMisses = 0;
}