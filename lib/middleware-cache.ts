/**
 * Middleware Performance Cache System
 * Otimiza performance do middleware através de cache de dados de usuário e sessão
 */

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
}

// Cache em memória para dados de usuário (limita a 1000 entradas)
const userCache = new Map<string, SessionCache>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_SIZE = 1000;

/**
 * Limpa cache expirado para evitar memory leaks
 */
function cleanExpiredCache(): void {
  const now = Date.now();
  const expiredKeys = Array.from(userCache.entries())
    .filter(([_, data]) => data.expiresAt < now)
    .map(([key]) => key);
    
  for (const key of expiredKeys) {
    userCache.delete(key);
  }
  
  // Se o cache ainda está muito grande, remove as entradas mais antigas
  if (userCache.size > MAX_CACHE_SIZE) {
    const sortedEntries = Array.from(userCache.entries())
      .sort(([, a], [, b]) => a.expiresAt - b.expiresAt);
      
    const toDelete = sortedEntries.slice(0, userCache.size - MAX_CACHE_SIZE);
    for (const [key] of toDelete) {
      userCache.delete(key);
    }
  }
}

/**
 * Gera chave de cache baseada no token de acesso
 */
function getCacheKey(accessToken: string): string {
  // Usa os últimos 12 caracteres do token como chave (mais seguro que o token completo)
  return accessToken.slice(-12);
}

/**
 * Recupera dados do usuário do cache
 */
export function getCachedUserData(accessToken: string): UserCacheData | null {
  cleanExpiredCache();
  
  const cacheKey = getCacheKey(accessToken);
  const cached = userCache.get(cacheKey);
  
  if (!cached || cached.expiresAt < Date.now()) {
    if (cached) userCache.delete(cacheKey);
    return null;
  }
  
  return cached.userData;
}

/**
 * Armazena dados do usuário no cache
 */
export function setCachedUserData(accessToken: string, userData: UserCacheData): void {
  cleanExpiredCache();
  
  const cacheKey = getCacheKey(accessToken);
  const expiresAt = Date.now() + CACHE_DURATION;
  
  userCache.set(cacheKey, {
    userId: userData.id,
    userData: {
      ...userData,
      cachedAt: Date.now()
    },
    expiresAt
  });
}

/**
 * Remove dados do cache (usado no logout)
 */
export function clearCachedUserData(accessToken: string): void {
  const cacheKey = getCacheKey(accessToken);
  userCache.delete(cacheKey);
}

/**
 * Limpa todo o cache (usado em desenvolvimento)
 */
export function clearAllCache(): void {
  userCache.clear();
}

/**
 * Estatísticas do cache (para debugging)
 */
export function getCacheStats(): {
  size: number;
  hitRate: number;
  oldestEntry?: number;
  newestEntry?: number;
} {
  const now = Date.now();
  const entries = Array.from(userCache.values());
  const ages = entries.map(entry => now - entry.userData.cachedAt);
  
  return {
    size: userCache.size,
    hitRate: 0, // Seria necessário trackear hits/misses para calcular
    oldestEntry: ages.length > 0 ? Math.max(...ages) : undefined,
    newestEntry: ages.length > 0 ? Math.min(...ages) : undefined,
  };
}