/**
 * Constantes de API e endpoints
 */

// ========== API Base URLs ==========
export const API_BASE_URLS = {
  MAIN: process.env.NEXT_PUBLIC_API_URL || '',
  SUPABASE: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
} as const;

// ========== API Endpoints ==========
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    VERIFY: '/api/auth/verify',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },
  
  // Admin
  ADMIN: {
    USERS: '/api/admin/users',
    SECTORS: '/api/admin/sectors',
    SECTOR_CONTENT: '/api/admin/sector-content',
    SECTOR_CONTENT_BATCH: '/api/admin/sector-content-batch',
    SECTOR_TEAM: '/api/admin/sector-team',
    SUBSECTOR_TEAM: '/api/admin/subsector-team',
    COLLECTIONS: '/api/admin/collections',
    COLLECTIONS_STATS: '/api/admin/collections/stats',
    SYSTEM_LINKS: '/api/admin/system-links',
    ECONOMIC_INDICATORS: '/api/admin/economic-indicators',
    BANNERS: '/api/admin/banners',
    GALLERY: '/api/admin/gallery',
    VIDEOS: '/api/admin/videos',
  },
  
  // Public
  PUBLIC: {
    NEWS: '/api/news',
    EVENTS: '/api/events',
    DOCUMENTS: '/api/documents',
    MESSAGES: '/api/messages',
    SECTORS: '/api/sectors',
    SUBSECTORS: '/api/subsectors',
    DASHBOARD_STATS: '/api/dashboard/stats',
    POSITIONS: '/api/positions',
    WORK_LOCATIONS: '/api/work-locations',
    NOTIFICATIONS: '/api/notifications',
  },
  
  // Upload
  UPLOAD: {
    IMAGE: '/api/upload/image',
    VIDEO: '/api/upload/video',
    DOCUMENT: '/api/upload/document',
    AVATAR: '/api/upload/avatar',
    THUMBNAIL: '/api/upload/thumbnail',
  },
} as const;

// ========== API Headers ==========
export const API_HEADERS = {
  DEFAULT: {
    'Content-Type': 'application/json',
  },
  FILE_UPLOAD: {
    // Não definir Content-Type para multipart/form-data
    // O browser define automaticamente com boundary
  },
  AUTH: (token: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }),
} as const;

// ========== API Response Status ==========
export const API_STATUS = {
  SUCCESS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
  },
  CLIENT_ERROR: {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
  },
  SERVER_ERROR: {
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  },
} as const;

// ========== API Query Parameters ==========
export const API_QUERY_PARAMS = {
  PAGINATION: {
    PAGE: 'page',
    LIMIT: 'limit',
    OFFSET: 'offset',
    PER_PAGE: 'per_page',
  },
  SORTING: {
    SORT_BY: 'sort_by',
    ORDER: 'order',
    ORDER_BY: 'order_by',
  },
  FILTERING: {
    SEARCH: 'search',
    FILTER: 'filter',
    CATEGORY: 'category',
    STATUS: 'status',
    FROM_DATE: 'from_date',
    TO_DATE: 'to_date',
  },
} as const;

// ========== API Methods ==========
export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

// ========== API Error Codes ==========
export const API_ERROR_CODES = {
  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

// ========== Retry Configuration ==========
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000, // 1 segundo
  MAX_DELAY: 10000, // 10 segundos
  BACKOFF_MULTIPLIER: 2,
  RETRY_STATUSES: [408, 429, 500, 502, 503, 504],
} as const;

// ========== Export Types ==========
export type ApiEndpointCategory = keyof typeof API_ENDPOINTS;
export type ApiMethod = typeof API_METHODS[keyof typeof API_METHODS];
export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];