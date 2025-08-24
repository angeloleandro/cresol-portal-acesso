/**
 * Constantes de limites e tamanhos do sistema
 */

// ========== Limites de Upload ==========
export const UPLOAD_LIMITS = {
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_SIZE_MB: 5,
    MAX_SIZE_TEXT: '5MB',
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  },
  VIDEO: {
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_SIZE_MB: 100,
    MAX_SIZE_TEXT: '100MB',
    ALLOWED_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
    ALLOWED_EXTENSIONS: ['.mp4', '.webm', '.ogg'],
  },
  DOCUMENT: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_SIZE_MB: 10,
    MAX_SIZE_TEXT: '10MB',
    ALLOWED_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx'],
  },
  AVATAR: {
    MAX_SIZE: 2 * 1024 * 1024, // 2MB
    MAX_SIZE_MB: 2,
    MAX_SIZE_TEXT: '2MB',
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  },
} as const;

// ========== Limites de Paginação ==========
export const PAGINATION_LIMITS = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
  MAX_PAGE_SIZE: 100,
  ITEMS_PER_PAGE_OPTIONS: [10, 20, 50, 100],
  
  // Limites específicos por tipo de conteúdo
  NEWS: 12,
  EVENTS: 10,
  DOCUMENTS: 20,
  MESSAGES: 15,
  VIDEOS: 9,
  IMAGES: 12,
  USERS: 20,
  SECTORS: 15,
} as const;

// ========== Limites de Texto ==========
export const TEXT_LIMITS = {
  TITLE: {
    MIN: 3,
    MAX: 200,
  },
  SUMMARY: {
    MIN: 10,
    MAX: 500,
  },
  DESCRIPTION: {
    MIN: 20,
    MAX: 5000,
  },
  MESSAGE: {
    MIN: 10,
    MAX: 2000,
  },
  COMMENT: {
    MIN: 1,
    MAX: 500,
  },
  PASSWORD: {
    MIN: 8,
    MAX: 128,
  },
  USERNAME: {
    MIN: 3,
    MAX: 50,
  },
  EMAIL: {
    MAX: 254, // RFC 5321
  },
} as const;

// ========== Timeouts ==========
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 segundos
  FILE_UPLOAD: 120000, // 2 minutos
  VIDEO_UPLOAD: 300000, // 5 minutos
  AUTH_CHECK: 5000, // 5 segundos
  DEBOUNCE_SEARCH: 300, // 300ms
  DEBOUNCE_INPUT: 500, // 500ms
  TOAST_DURATION: 5000, // 5 segundos
  LOADING_MIN_DISPLAY: 500, // 500ms
  RETRY_DELAY: 1000, // 1 segundo
  MAX_RETRIES: 3,
} as const;

// ========== Dimensões de Imagem ==========
export const IMAGE_DIMENSIONS = {
  THUMBNAIL: {
    WIDTH: 150,
    HEIGHT: 150,
  },
  SMALL: {
    WIDTH: 300,
    HEIGHT: 300,
  },
  MEDIUM: {
    WIDTH: 600,
    HEIGHT: 600,
  },
  LARGE: {
    WIDTH: 1200,
    HEIGHT: 1200,
  },
  BANNER: {
    WIDTH: 1920,
    HEIGHT: 600,
  },
  AVATAR: {
    WIDTH: 200,
    HEIGHT: 200,
  },
  GALLERY: {
    WIDTH: 800,
    HEIGHT: 600,
  },
} as const;

// ========== Limites de Cache ==========
export const CACHE_LIMITS = {
  MAX_AGE: 3600, // 1 hora em segundos
  STALE_WHILE_REVALIDATE: 86400, // 24 horas
  MAX_ITEMS: 100,
  TTL: {
    SHORT: 300, // 5 minutos
    MEDIUM: 1800, // 30 minutos
    LONG: 3600, // 1 hora
    VERY_LONG: 86400, // 24 horas
  },
} as const;

// ========== Validação ==========
export const VALIDATION = {
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL: /^https?:\/\/.+/,
    PHONE: /^\(\d{2}\) \d{4,5}-\d{4}$/,
    CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    YOUTUBE_URL: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
    HEX_COLOR: /^#[0-9A-F]{6}$/i,
  },
} as const;

// ========== Limites de Performance ==========
export const PERFORMANCE_LIMITS = {
  MAX_CONCURRENT_REQUESTS: 6,
  MAX_WEBSOCKET_RECONNECTS: 5,
  LAZY_LOAD_OFFSET: 100, // pixels
  INFINITE_SCROLL_THRESHOLD: 0.8, // 80% da página
  MAX_MEMORY_USAGE: 50 * 1024 * 1024, // 50MB
} as const;

// ========== Export Types ==========
export type UploadType = keyof typeof UPLOAD_LIMITS;
export type TextFieldType = keyof typeof TEXT_LIMITS;
export type ImageSizeType = keyof typeof IMAGE_DIMENSIONS;
export type CacheTTLType = keyof typeof CACHE_LIMITS.TTL;