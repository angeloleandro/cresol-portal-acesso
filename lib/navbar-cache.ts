

interface SectorData {
  id: string;
  name: string;
  description?: string;
}

interface UserProfileData {
  id: string;
  role: string;
  email?: string;
  full_name?: string;
  sector_ids?: string[];
}

// Cache interfaces
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Cache stores
const sectorsCache = new Map<string, CacheEntry<SectorData[]>>();
const userProfileCache = new Map<string, CacheEntry<UserProfileData>>();

// Cache settings
const CACHE_DURATION = {
  sectors: 10 * 60 * 1000, // 10 minutos - setores mudam pouco
  userProfile: 5 * 60 * 1000, // 5 minutos - perfil de usuário
};

const MAX_CACHE_SIZE = 100; // Máximo de entradas por cache

/**
 * Função genérica para limpar cache expirado
 */
function cleanExpiredCache<T>(cache: Map<string, CacheEntry<T>>): void {
  const now = Date.now();
  const expiredKeys = Array.from(cache.entries())
    .filter(([_, entry]) => entry.expiresAt < now)
    .map(([key]) => key);
    
  for (const key of expiredKeys) {
    cache.delete(key);
  }
  
  // Limitar tamanho do cache
  if (cache.size > MAX_CACHE_SIZE) {
    const sortedEntries = Array.from(cache.entries())
      .sort(([, a], [, b]) => a.expiresAt - b.expiresAt);
      
    const toDelete = sortedEntries.slice(0, cache.size - MAX_CACHE_SIZE);
    for (const [key] of toDelete) {
      cache.delete(key);
    }
  }
}

/**
 * SECTORS CACHE
 */
/**
 * getCachedSectors function
 * @todo Add proper documentation
 */
export function GetCachedSectors(userRole: string, userId?: string): SectorData[] | null {
  cleanExpiredCache(sectorsCache);
  
  const cacheKey = userRole === 'sector_admin' && userId ? `${userRole}-${userId}` : userRole;
  const cached = sectorsCache.get(cacheKey);
  
  if (!cached || cached.expiresAt < Date.now()) {
    if (cached) sectorsCache.delete(cacheKey);
    return null;
  }
  
  return cached.data;
}

/**
 * setCachedSectors function
 * @todo Add proper documentation
 */
export function SetCachedSectors(
  sectors: SectorData[], 
  userRole: string, 
  userId?: string
): void {
  cleanExpiredCache(sectorsCache);
  
  const cacheKey = userRole === 'sector_admin' && userId ? `${userRole}-${userId}` : userRole;
  const expiresAt = Date.now() + CACHE_DURATION.sectors;
  
  sectorsCache.set(cacheKey, {
    data: sectors,
    timestamp: Date.now(),
    expiresAt
  });
}

/**
 * USER PROFILE CACHE
 */
/**
 * getCachedUserProfile function
 * @todo Add proper documentation
 */
export function GetCachedUserProfile(userId: string): UserProfileData | null {
  cleanExpiredCache(userProfileCache);
  
  const cached = userProfileCache.get(userId);
  
  if (!cached || cached.expiresAt < Date.now()) {
    if (cached) userProfileCache.delete(userId);
    return null;
  }
  
  return cached.data;
}

/**
 * setCachedUserProfile function
 * @todo Add proper documentation
 */
export function SetCachedUserProfile(profile: UserProfileData): void {
  cleanExpiredCache(userProfileCache);
  
  const expiresAt = Date.now() + CACHE_DURATION.userProfile;
  
  userProfileCache.set(profile.id, {
    data: profile,
    timestamp: Date.now(),
    expiresAt
  });
}

/**
 * CACHE INVALIDATION
 */
/**
 * invalidateSectorsCache function
 * @todo Add proper documentation
 */
export function InvalidateSectorsCache(userRole?: string, userId?: string): void {
  if (userRole && userId) {
    const cacheKey = userRole === 'sector_admin' ? `${userRole}-${userId}` : userRole;
    sectorsCache.delete(cacheKey);
  } else {
    sectorsCache.clear();
  }
}

/**
 * invalidateUserProfileCache function
 * @todo Add proper documentation
 */
export function InvalidateUserProfileCache(userId?: string): void {
  if (userId) {
    userProfileCache.delete(userId);
  } else {
    userProfileCache.clear();
  }
}

/**
 * clearAllNavbarCache function
 * @todo Add proper documentation
 */
export function ClearAllNavbarCache(): void {
  sectorsCache.clear();
  userProfileCache.clear();
}

/**
 * CACHE STATISTICS (para debugging)
 */
/**
 * getNavbarCacheStats function
 * @todo Add proper documentation
 */
export function GetNavbarCacheStats(): {
  sectors: { size: number; oldestEntry?: number };
  userProfiles: { size: number; oldestEntry?: number };
} {
  const now = Date.now();
  
  const getOldestEntry = <T>(cache: Map<string, CacheEntry<T>>) => {
    const entries = Array.from(cache.values());
    return entries.length > 0 ? Math.max(...entries.map(e => now - e.timestamp)) : undefined;
  };
  
  return {
    sectors: {
      size: sectorsCache.size,
      oldestEntry: getOldestEntry(sectorsCache)
    },
    userProfiles: {
      size: userProfileCache.size,
      oldestEntry: getOldestEntry(userProfileCache)
    }
  };
}