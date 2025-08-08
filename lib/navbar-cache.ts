/**
 * Navbar Cache and Optimization System
 * Cache otimizado para dados do Navbar (setores, notificações, usuário)
 */

interface SectorData {
  id: string;
  name: string;
  description?: string;
}

interface NotificationData {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
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
const notificationsCache = new Map<string, CacheEntry<NotificationData[]>>();
const userProfileCache = new Map<string, CacheEntry<UserProfileData>>();

// Cache settings
const CACHE_DURATION = {
  sectors: 10 * 60 * 1000, // 10 minutos - setores mudam pouco
  notifications: 30 * 1000, // 30 segundos - notificações são mais dinâmicas
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
export function getCachedSectors(userRole: string, userId?: string): SectorData[] | null {
  cleanExpiredCache(sectorsCache);
  
  const cacheKey = userRole === 'sector_admin' && userId ? `${userRole}-${userId}` : userRole;
  const cached = sectorsCache.get(cacheKey);
  
  if (!cached || cached.expiresAt < Date.now()) {
    if (cached) sectorsCache.delete(cacheKey);
    return null;
  }
  
  return cached.data;
}

export function setCachedSectors(
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
 * NOTIFICATIONS CACHE
 */
export function getCachedNotifications(userId: string): NotificationData[] | null {
  cleanExpiredCache(notificationsCache);
  
  const cached = notificationsCache.get(userId);
  
  if (!cached || cached.expiresAt < Date.now()) {
    if (cached) notificationsCache.delete(userId);
    return null;
  }
  
  return cached.data;
}

export function setCachedNotifications(notifications: NotificationData[], userId: string): void {
  cleanExpiredCache(notificationsCache);
  
  const expiresAt = Date.now() + CACHE_DURATION.notifications;
  
  notificationsCache.set(userId, {
    data: notifications,
    timestamp: Date.now(),
    expiresAt
  });
}

export function updateCachedNotification(
  userId: string, 
  notificationId: string, 
  updates: Partial<NotificationData>
): boolean {
  const cached = notificationsCache.get(userId);
  if (!cached) return false;
  
  const updatedNotifications = cached.data.map(n => 
    n.id === notificationId ? { ...n, ...updates } : n
  );
  
  setCachedNotifications(updatedNotifications, userId);
  return true;
}

/**
 * USER PROFILE CACHE
 */
export function getCachedUserProfile(userId: string): UserProfileData | null {
  cleanExpiredCache(userProfileCache);
  
  const cached = userProfileCache.get(userId);
  
  if (!cached || cached.expiresAt < Date.now()) {
    if (cached) userProfileCache.delete(userId);
    return null;
  }
  
  return cached.data;
}

export function setCachedUserProfile(profile: UserProfileData): void {
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
export function invalidateSectorsCache(userRole?: string, userId?: string): void {
  if (userRole && userId) {
    const cacheKey = userRole === 'sector_admin' ? `${userRole}-${userId}` : userRole;
    sectorsCache.delete(cacheKey);
  } else {
    sectorsCache.clear();
  }
}

export function invalidateNotificationsCache(userId?: string): void {
  if (userId) {
    notificationsCache.delete(userId);
  } else {
    notificationsCache.clear();
  }
}

export function invalidateUserProfileCache(userId?: string): void {
  if (userId) {
    userProfileCache.delete(userId);
  } else {
    userProfileCache.clear();
  }
}

export function clearAllNavbarCache(): void {
  sectorsCache.clear();
  notificationsCache.clear();
  userProfileCache.clear();
}

/**
 * CACHE STATISTICS (para debugging)
 */
export function getNavbarCacheStats(): {
  sectors: { size: number; oldestEntry?: number };
  notifications: { size: number; oldestEntry?: number };
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
    notifications: {
      size: notificationsCache.size,
      oldestEntry: getOldestEntry(notificationsCache)
    },
    userProfiles: {
      size: userProfileCache.size,
      oldestEntry: getOldestEntry(userProfileCache)
    }
  };
}