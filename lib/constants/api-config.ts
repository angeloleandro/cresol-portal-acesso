/**
 * API Configuration Constants
 * Centralized configuration for all API routes and related functionality
 * Eliminates hardcoded values in API endpoints
 */

// ===== HTTP STATUS CODES =====
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const;

// ===== API ENDPOINTS =====
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh'
  },
  
  // Admin endpoints
  admin: {
    // Sector Content
    sectorContent: '/api/admin/sector-content',
    
    // User Management
    users: '/api/admin/users',
    createUser: '/api/admin/create-user',
    updateUserRole: '/api/admin/update-user-role',
    directUpdateRole: '/api/admin/update-user-role/direct-update',
    resetPassword: '/api/admin/reset-password',
    approveAccessRequest: '/api/admin/approve-access-request',
    
    // Sector & Subsector Management
    subsectors: '/api/admin/subsectors',
    subsectorAdmins: '/api/admin/subsector-admins',
    subsectorTeam: '/api/admin/subsector-team',
    
    // Content Management
    banners: '/api/admin/banners',
    bannersPositions: '/api/admin/banners/positions',
    economicIndicators: '/api/admin/economic-indicators',
    gallery: '/api/admin/gallery',
    galleryUpload: '/api/admin/gallery/upload',
    videos: '/api/admin/videos',
    videosUpload: '/api/admin/videos/upload',
    systemLinks: '/api/admin/system-links',
    
    // Collections
    collections: '/api/admin/collections',
    collectionsStats: '/api/admin/collections/stats'
  },
  
  // Public endpoints
  public: {
    collections: '/api/collections',
    videos: '/api/videos',
    notifications: '/api/notifications'
  },
  
  // Notifications
  notifications: {
    base: '/api/notifications',
    bulk: '/api/notifications/bulk',
    groups: '/api/notifications/groups',
    send: '/api/notifications/send'
  },
  
  // Collections specific endpoints
  collections: {
    base: '/api/collections',
    byId: (id: string) => `/api/collections/${id}`,
    items: (id: string) => `/api/collections/${id}/items`,
    itemById: (collectionId: string, itemId: string) => `/api/collections/${collectionId}/items/${itemId}`,
    reorder: (id: string) => `/api/collections/${id}/reorder`,
    uploadCover: '/api/collections/upload/cover'
  },
  
  // Videos specific endpoints
  videos: {
    base: '/api/videos',
    generateThumbnail: '/api/videos/generate-thumbnail',
    simpleUpload: '/api/videos/simple-upload',
    upload: '/api/videos/upload'
  }
} as const;

// ===== REQUEST CONFIGURATION =====
export const REQUEST_CONFIG = {
  timeouts: {
    default: 10000, // 10 seconds
    upload: 300000, // 5 minutes
    processing: 120000, // 2 minutes
    auth: 5000 // 5 seconds
  },
  
  retries: {
    maxAttempts: 3,
    delay: 1000, // 1 second
    backoffMultiplier: 2
  },
  
  headers: {
    contentType: {
      json: 'application/json',
      formData: 'multipart/form-data',
      urlEncoded: 'application/x-www-form-urlencoded'
    },
    accept: {
      json: 'application/json',
      any: '*/*'
    }
  }
} as const;

// ===== RESPONSE FORMATS =====
export const RESPONSE_FORMATS = {
  success: {
    data: 'data',
    message: 'message',
    status: 'status'
  },
  error: {
    error: 'error',
    message: 'message',
    details: 'details',
    code: 'code',
    status: 'status'
  }
} as const;

// ===== CONTENT TYPES =====
export const CONTENT_TYPES = {
  // Sector content
  sectorNews: 'sector_news',
  sectorEvents: 'sector_events',
  
  // Subsector content
  subsectorNews: 'subsector_news',
  subsectorEvents: 'subsector_events',
  
  // Actions
  createNews: 'create_news',
  updateNews: 'update_news',
  deleteNews: 'delete_news',
  createEvent: 'create_event',
  updateEvent: 'update_event',
  deleteEvent: 'delete_event',
  
  // Subsector actions
  updateSubsectorNews: 'update_subsector_news',
  updateSubsectorEvent: 'update_subsector_event'
} as const;

// ===== ERROR MESSAGES =====
export const API_ERROR_MESSAGES = {
  // Authentication errors
  unauthorized: 'Não autorizado',
  sessionExpired: 'Sessão expirada',
  invalidCredentials: 'Credenciais inválidas',
  permissionDenied: 'Permissão negada',
  userNotFound: 'Usuário não encontrado na sessão',
  
  // Validation errors
  missingFields: 'Campos obrigatórios faltando',
  invalidData: 'Dados inválidos',
  invalidType: 'Tipo inválido',
  invalidId: 'ID é obrigatório para atualização',
  
  // Server errors
  internalError: 'Erro interno do servidor',
  networkError: 'Erro de conexão. Tente novamente.',
  serviceUnavailable: 'Serviço temporariamente indisponível',
  
  // Content specific errors
  newsNotFound: 'Notícia não encontrada',
  eventNotFound: 'Evento não encontrado',
  systemNotFound: 'Sistema não encontrado',
  sectorNotFound: 'Setor não encontrado',
  subsectorNotFound: 'Subsetor não encontrado',
  
  // File errors
  uploadFailed: 'Falha no upload do arquivo',
  fileNotFound: 'Arquivo não encontrado',
  invalidFileType: 'Tipo de arquivo não suportado',
  fileTooLarge: 'Arquivo muito grande'
} as const;

// ===== SUCCESS MESSAGES =====
export const API_SUCCESS_MESSAGES = {
  // CRUD operations
  created: 'Criado com sucesso',
  updated: 'Atualizado com sucesso',
  deleted: 'Excluído com sucesso',
  
  // Specific operations
  newsCreated: 'Notícia criada com sucesso',
  newsUpdated: 'Notícia atualizada com sucesso',
  newsDeleted: 'Notícia excluída com sucesso',
  
  eventCreated: 'Evento criado com sucesso',
  eventUpdated: 'Evento atualizado com sucesso',
  eventDeleted: 'Evento excluído com sucesso',
  
  systemCreated: 'Sistema criado com sucesso',
  systemUpdated: 'Sistema atualizado com sucesso',
  systemDeleted: 'Sistema excluído com sucesso',
  
  // File operations
  uploadSuccess: 'Upload realizado com sucesso',
  imageProcessed: 'Imagem processada com sucesso'
} as const;

// ===== VALIDATION RULES =====
export const API_VALIDATION = {
  news: {
    title: {
      required: true,
      minLength: 3,
      maxLength: 255
    },
    summary: {
      required: true,
      minLength: 10,
      maxLength: 500
    },
    content: {
      required: true,
      minLength: 20,
      maxLength: 10000
    }
  },
  
  events: {
    title: {
      required: true,
      minLength: 3,
      maxLength: 255
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 2000
    },
    startDate: {
      required: true
    },
    location: {
      maxLength: 255
    }
  },
  
  systems: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    url: {
      required: true,
      pattern: /^https?:\/\/.+/
    },
    description: {
      maxLength: 500
    }
  }
} as const;

// ===== RATE LIMITING =====
export const RATE_LIMITS = {
  default: {
    requests: 100,
    window: 900000 // 15 minutes
  },
  
  auth: {
    requests: 5,
    window: 300000 // 5 minutes
  },
  
  upload: {
    requests: 10,
    window: 3600000 // 1 hour
  }
} as const;

// ===== CACHE CONFIGURATION =====
export const CACHE_CONFIG = {
  ttl: {
    short: 300, // 5 minutes
    medium: 1800, // 30 minutes
    long: 3600, // 1 hour
    extended: 86400 // 24 hours
  },
  
  keys: {
    sectors: 'sectors',
    subsectors: 'subsectors',
    users: 'users',
    systems: 'systems',
    news: 'news',
    events: 'events'
  }
} as const;

// ===== PAGINATION =====
export const PAGINATION_CONFIG = {
  defaultLimit: 10,
  maxLimit: 100,
  defaultOffset: 0,
  
  params: {
    limit: 'limit',
    offset: 'offset',
    page: 'page',
    perPage: 'per_page'
  }
} as const;

// ===== SORTING =====
export const SORT_CONFIG = {
  defaultOrder: 'desc',
  defaultField: 'created_at',
  
  directions: {
    asc: 'asc',
    desc: 'desc'
  },
  
  fields: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    title: 'title',
    name: 'name',
    startDate: 'start_date'
  }
} as const;

// ===== FILTER OPTIONS =====
export const FILTER_CONFIG = {
  publication: {
    all: 'all',
    published: 'published',
    draft: 'draft'
  },
  
  status: {
    active: 'active',
    inactive: 'inactive'
  },
  
  dateRange: {
    today: 'today',
    week: 'week',
    month: 'month',
    year: 'year',
    custom: 'custom'
  }
} as const;

// ===== LOGGING CONFIGURATION =====
export const LOG_CONFIG = {
  levels: {
    error: 'error',
    warn: 'warn',
    info: 'info',
    debug: 'debug'
  },
  
  contexts: {
    api: 'API',
    auth: 'AUTH',
    database: 'DB',
    upload: 'UPLOAD',
    validation: 'VALIDATION'
  },
  
  format: {
    timestamp: true,
    context: true,
    method: true,
    url: true,
    userAgent: false,
    ip: false
  }
} as const;

// ===== TYPE EXPORTS =====
export type HttpStatus = typeof HTTP_STATUS;
export type ApiEndpoints = typeof API_ENDPOINTS;
export type RequestConfig = typeof REQUEST_CONFIG;
export type ResponseFormats = typeof RESPONSE_FORMATS;
export type ContentTypes = typeof CONTENT_TYPES;
export type ApiErrorMessages = typeof API_ERROR_MESSAGES;
export type ApiSuccessMessages = typeof API_SUCCESS_MESSAGES;
export type ApiValidation = typeof API_VALIDATION;
export type RateLimits = typeof RATE_LIMITS;
export type CacheConfig = typeof CACHE_CONFIG;
export type PaginationConfig = typeof PAGINATION_CONFIG;
export type SortConfig = typeof SORT_CONFIG;
export type FilterConfig = typeof FILTER_CONFIG;
export type LogConfig = typeof LOG_CONFIG;

// ===== HELPER FUNCTIONS =====
export const API_HELPERS = {
  /**
   * Build query string from parameters
   */
  buildQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  },

  /**
   * Get full endpoint URL with query parameters
   */
  buildUrl: (endpoint: string, params?: Record<string, any>): string => {
    if (!params) return endpoint;
    const queryString = API_HELPERS.buildQueryString(params);
    return queryString ? `${endpoint}?${queryString}` : endpoint;
  },

  /**
   * Check if status code indicates success
   */
  isSuccessStatus: (status: number): boolean => {
    return status >= 200 && status < 300;
  },

  /**
   * Check if status code indicates client error
   */
  isClientError: (status: number): boolean => {
    return status >= 400 && status < 500;
  },

  /**
   * Check if status code indicates server error
   */
  isServerError: (status: number): boolean => {
    return status >= 500 && status < 600;
  }
} as const;