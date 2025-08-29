/**
 * Configuração centralizada de cache
 * Define TTLs (Time To Live) e estratégias de cache para todo o sistema
 */

// ========================================
// Configuração de ambiente
// ========================================

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// ========================================
// TTL Base em milissegundos
// ========================================

const MILLISECONDS = 1;
const SECONDS = 1000 * MILLISECONDS;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;
const DAYS = 24 * HOURS;

// ========================================
// TTLs por tipo de conteúdo
// ========================================

export const CACHE_TTL = {
  // Conteúdo estático (muda raramente)
  STATIC: {
    SYSTEM_LINKS: 30 * MINUTES,      // Links de sistemas
    ECONOMIC_INDICATORS: 1 * HOURS,   // Indicadores econômicos
    POSITIONS: 1 * HOURS,             // Cargos
    WORK_LOCATIONS: 1 * HOURS,        // Locais de trabalho
    COLLECTIONS: 30 * MINUTES         // Coleções
  },
  
  // Conteúdo dinâmico (muda frequentemente)
  DYNAMIC: {
    BANNERS: 10 * MINUTES,            // Banners ativos
    NEWS_FEATURED: 5 * MINUTES,       // Notícias em destaque
    NEWS_LIST: 10 * MINUTES,          // Lista de notícias
    EVENTS_ACTIVE: 5 * MINUTES,       // Eventos ativos
    EVENTS_LIST: 10 * MINUTES         // Lista de eventos
  },
  
  // Conteúdo de mídia
  MEDIA: {
    GALLERY_IMAGES: 15 * MINUTES,     // Imagens da galeria
    VIDEOS: 15 * MINUTES,             // Vídeos
    THUMBNAILS: 30 * MINUTES,         // Thumbnails
    AVATARS: 30 * MINUTES             // Avatares de usuário
  },
  
  // Dados de usuário
  USER: {
    PROFILE: 10 * MINUTES,            // Perfil do usuário
    PERMISSIONS: 5 * MINUTES,         // Permissões
    SESSION: 30 * MINUTES,            // Sessão
    NOTIFICATIONS: 1 * MINUTES        // Notificações
  },
  
  // Dados administrativos
  ADMIN: {
    SECTORS: 15 * MINUTES,            // Lista de setores
    SUBSECTORS: 15 * MINUTES,         // Lista de subsetores
    USERS_LIST: 5 * MINUTES,          // Lista de usuários
    ACCESS_REQUESTS: 2 * MINUTES,     // Solicitações de acesso
    AUDIT_LOGS: 5 * MINUTES           // Logs de auditoria
  },
  
  // APIs externas
  EXTERNAL: {
    WEATHER: 30 * MINUTES,            // Dados meteorológicos
    EXCHANGE_RATES: 15 * MINUTES,     // Taxas de câmbio
    STOCK_PRICES: 5 * MINUTES,        // Cotações
    RSS_FEEDS: 15 * MINUTES           // Feeds RSS
  }
} as const;

// ========================================
// Estratégias de cache
// ========================================

export const CACHE_STRATEGIES = {
  // Cache primeiro, depois revalida em background
  STALE_WHILE_REVALIDATE: {
    enabled: true,
    maxAge: 5 * MINUTES,
    staleTime: 1 * HOURS
  },
  
  // Sempre verificar com servidor antes de usar cache
  CACHE_AND_NETWORK: {
    enabled: true,
    maxAge: 10 * MINUTES
  },
  
  // Usar cache se disponível, senão buscar da rede
  CACHE_FIRST: {
    enabled: true,
    maxAge: 30 * MINUTES
  },
  
  // Sempre buscar da rede, cache como fallback
  NETWORK_FIRST: {
    enabled: true,
    fallbackTimeout: 3 * SECONDS
  },
  
  // Nunca usar cache
  NETWORK_ONLY: {
    enabled: false
  }
} as const;

// ========================================
// Configuração por ambiente
// ========================================

export const CACHE_ENV_CONFIG = {
  development: {
    enabled: true,
    defaultTTL: 5 * MINUTES,
    maxTTL: 30 * MINUTES,
    debugMode: true,
    logCacheHits: true
  },
  
  production: {
    enabled: true,
    defaultTTL: 10 * MINUTES,
    maxTTL: 1 * HOURS,
    debugMode: false,
    logCacheHits: false
  },
  
  test: {
    enabled: false,
    defaultTTL: 0,
    maxTTL: 0,
    debugMode: true,
    logCacheHits: true
  }
} as const;

// ========================================
// Configuração de invalidação
// ========================================

export const CACHE_INVALIDATION = {
  // Padrões para invalidação automática
  PATTERNS: {
    NEWS: ['news:*', 'featured:*', 'headlines:*'],
    EVENTS: ['events:*', 'calendar:*'],
    USERS: ['user:*', 'profile:*', 'permissions:*'],
    MEDIA: ['gallery:*', 'videos:*', 'images:*'],
    ADMIN: ['admin:*', 'sectors:*', 'subsectors:*']
  },
  
  // Eventos que disparam invalidação
  TRIGGERS: {
    USER_LOGIN: ['user:profile', 'user:permissions'],
    USER_LOGOUT: ['user:*'],
    CONTENT_UPDATE: ['news:*', 'events:*'],
    MEDIA_UPLOAD: ['gallery:*', 'videos:*'],
    SETTINGS_CHANGE: ['*'] // Invalida tudo
  }
} as const;

// ========================================
// Limites de cache
// ========================================

export const CACHE_LIMITS = {
  // Tamanho máximo do cache em MB
  MAX_SIZE_MB: isDevelopment ? 50 : 200,
  
  // Número máximo de entradas
  MAX_ENTRIES: isDevelopment ? 100 : 1000,
  
  // Tamanho máximo por entrada em KB
  MAX_ENTRY_SIZE_KB: 500,
  
  // Limpeza automática
  CLEANUP: {
    ENABLED: true,
    INTERVAL: 30 * MINUTES,
    REMOVE_EXPIRED: true,
    REMOVE_LEAST_USED: true,
    KEEP_PERCENTAGE: 80 // Manter 80% do cache após limpeza
  }
} as const;

// ========================================
// Helpers de cache
// ========================================

/**
 * Obtém TTL baseado no tipo de conteúdo
 */
export function getCacheTTL(contentType: string, subType?: string): number {
  // Busca em categorias aninhadas
  for (const [category, items] of Object.entries(CACHE_TTL)) {
    const categoryItems = items as Record<string, number>;
    
    // Tenta correspondência exata
    const key = subType ? `${contentType}_${subType}`.toUpperCase() : contentType.toUpperCase();
    if (key in categoryItems) {
      return categoryItems[key];
    }
    
    // Tenta apenas contentType
    if (contentType.toUpperCase() in categoryItems) {
      return categoryItems[contentType.toUpperCase()];
    }
  }
  
  // Retorna TTL padrão baseado no ambiente
  const envConfig = CACHE_ENV_CONFIG[isDevelopment ? 'development' : 'production'];
  return envConfig.defaultTTL;
}

/**
 * Determina se cache está habilitado
 */
export function isCacheEnabled(): boolean {
  const env = process.env.NODE_ENV || 'development';
  const config = CACHE_ENV_CONFIG[env as keyof typeof CACHE_ENV_CONFIG];
  return config?.enabled ?? true;
}

/**
 * Obtém estratégia de cache recomendada
 */
export function getCacheStrategy(contentType: string): keyof typeof CACHE_STRATEGIES {
  // Conteúdo crítico: sempre network first
  if (['USER', 'PERMISSIONS', 'SESSION'].includes(contentType.toUpperCase())) {
    return 'NETWORK_FIRST';
  }
  
  // Conteúdo estático: cache first
  if (['STATIC', 'MEDIA'].some(cat => contentType.toUpperCase().includes(cat))) {
    return 'CACHE_FIRST';
  }
  
  // Conteúdo dinâmico: stale while revalidate
  if (['DYNAMIC', 'NEWS', 'EVENTS'].some(cat => contentType.toUpperCase().includes(cat))) {
    return 'STALE_WHILE_REVALIDATE';
  }
  
  // Padrão: cache and network
  return 'CACHE_AND_NETWORK';
}

/**
 * Gera chave de cache única
 */
export function generateCacheKey(
  type: string,
  id?: string | number,
  params?: Record<string, any>
): string {
  const parts = [type];
  
  if (id !== undefined) {
    parts.push(String(id));
  }
  
  if (params && Object.keys(params).length > 0) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    parts.push(sortedParams);
  }
  
  return parts.join(':');
}

/**
 * Verifica se cache está expirado
 */
export function isCacheExpired(timestamp: number, ttl: number): boolean {
  return Date.now() - timestamp > ttl;
}

/**
 * Calcula tempo restante do cache
 */
export function getCacheRemainingTime(timestamp: number, ttl: number): number {
  const elapsed = Date.now() - timestamp;
  const remaining = ttl - elapsed;
  return Math.max(0, remaining);
}

/**
 * Formata TTL para exibição
 */
export function formatTTL(milliseconds: number): string {
  if (milliseconds < MINUTES) {
    return `${Math.round(milliseconds / SECONDS)}s`;
  }
  
  if (milliseconds < HOURS) {
    return `${Math.round(milliseconds / MINUTES)}min`;
  }
  
  if (milliseconds < DAYS) {
    return `${Math.round(milliseconds / HOURS)}h`;
  }
  
  return `${Math.round(milliseconds / DAYS)}d`;
}

// ========================================
// Configuração de cache por rota
// ========================================

export const ROUTE_CACHE_CONFIG: Record<string, { ttl: number; strategy: keyof typeof CACHE_STRATEGIES }> = {
  '/api/admin/general-news': {
    ttl: CACHE_TTL.DYNAMIC.NEWS_LIST,
    strategy: 'STALE_WHILE_REVALIDATE'
  },
  '/api/admin/sector-content': {
    ttl: CACHE_TTL.DYNAMIC.NEWS_LIST,
    strategy: 'CACHE_AND_NETWORK'
  },
  '/api/admin/banners': {
    ttl: CACHE_TTL.DYNAMIC.BANNERS,
    strategy: 'CACHE_FIRST'
  },
  '/api/admin/gallery': {
    ttl: CACHE_TTL.MEDIA.GALLERY_IMAGES,
    strategy: 'CACHE_FIRST'
  },
  '/api/admin/videos': {
    ttl: CACHE_TTL.MEDIA.VIDEOS,
    strategy: 'CACHE_FIRST'
  },
  '/api/admin/economic-indicators': {
    ttl: CACHE_TTL.STATIC.ECONOMIC_INDICATORS,
    strategy: 'CACHE_FIRST'
  },
  '/api/admin/system-links': {
    ttl: CACHE_TTL.STATIC.SYSTEM_LINKS,
    strategy: 'CACHE_FIRST'
  },
  '/api/auth/user': {
    ttl: CACHE_TTL.USER.PROFILE,
    strategy: 'NETWORK_FIRST'
  },
  '/api/notifications': {
    ttl: CACHE_TTL.USER.NOTIFICATIONS,
    strategy: 'NETWORK_ONLY'
  }
};

// ========================================
// Exportação de tipos
// ========================================

export type CacheCategory = keyof typeof CACHE_TTL;
export type CacheStrategy = keyof typeof CACHE_STRATEGIES;
export type CacheEnvironment = keyof typeof CACHE_ENV_CONFIG;