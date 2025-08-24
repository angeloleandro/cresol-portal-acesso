

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
    documents: '/api/admin/documents',
    news: '/api/admin/news',
    events: '/api/admin/events',
    messages: '/api/admin/messages',
    messageGroups: '/api/admin/message-groups',
    
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
  },
  
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
    const queryString = REQUEST_CONFIG.buildQueryString(params);
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

// ===== EXPORT ALIASES =====
// These exports maintain backwards compatibility with existing imports
export const RESPONSE_FORMATS = {
  json: REQUEST_CONFIG.headers.accept.json,
  any: REQUEST_CONFIG.headers.accept.any
} as const;

// Content types for API content tables
export const CONTENT_TYPES = {
  // Basic table names
  sectorNews: 'sector_news',
  subsectorNews: 'subsector_news',
  sectorEvents: 'sector_events',
  subsectorEvents: 'subsector_events',
  sectorDocuments: 'sector_documents',
  subsectorDocuments: 'subsector_documents',
  
  // Operation types
  createNews: 'create_news',
  updateNews: 'update_news',
  updateSubsectorNews: 'update_subsector_news',
  updateEvent: 'update_event',
  updateDocument: 'update_document',
  
  // HTTP content types
  ...REQUEST_CONFIG.headers.contentType
} as const;

export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'Authentication required. Please login.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  
  // Additional messages for sector-content API
  unauthorized: 'Token de autorização necessário',
  internalError: 'Erro interno do servidor',
  invalidId: 'ID inválido fornecido',
  userNotFound: 'Usuário não encontrado',
  permissionDenied: 'Acesso negado - permissões insuficientes',
  missingFields: 'Campos obrigatórios ausentes',
  invalidType: 'Tipo de conteúdo inválido'
} as const;

export const DEFAULT_HEADERS = {
  'Content-Type': REQUEST_CONFIG.headers.contentType.json,
  'Accept': REQUEST_CONFIG.headers.accept.json
} as const;

export const API_TIMEOUTS = REQUEST_CONFIG.timeouts;

export const RESPONSE_CODES = HTTP_STATUS;

export const API_HELPERS = {
  buildQueryString: REQUEST_CONFIG.buildQueryString,
  buildUrl: REQUEST_CONFIG.buildUrl,
  isSuccessStatus: REQUEST_CONFIG.isSuccessStatus,
  isClientError: REQUEST_CONFIG.isClientError,
  isServerError: REQUEST_CONFIG.isServerError
} as const;

// === MISSING EXPORTS IDENTIFIED ===
// Exports que eram referenciados no index.ts mas não existiam

export const API_SUCCESS_MESSAGES = {
  OPERATION_SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  UPLOADED: 'File uploaded successfully',
  AUTHENTICATED: 'Authentication successful',
  VALIDATED: 'Validation passed'
} as const;

export const API_VALIDATION = {
  rules: {
    required: 'This field is required',
    email: 'Invalid email format',
    minLength: 'Minimum length not met',
    maxLength: 'Maximum length exceeded',
    pattern: 'Invalid format'
  },
  patterns: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s\-\(\)]+$/,
    url: /^https?:\/\/.+/
  }
} as const;

export const RATE_LIMITS = {
  requests: {
    perMinute: 60,
    perHour: 3600,
    perDay: 86400
  },
  burst: {
    size: 10,
    refillRate: 1
  },
  endpoints: {
    auth: { limit: 5, window: 900 }, // 5 requests per 15 minutes
    upload: { limit: 10, window: 3600 }, // 10 uploads per hour
    api: { limit: 100, window: 3600 } // 100 API calls per hour
  }
} as const;

export const CACHE_CONFIG = {
  ttl: {
    short: 300,    // 5 minutes
    medium: 1800,  // 30 minutes  
    long: 3600,    // 1 hour
    extended: 86400 // 24 hours
  },
  keys: {
    user: 'user:',
    session: 'session:',
    api: 'api:',
    static: 'static:'
  },
  strategies: {
    memory: 'memory',
    redis: 'redis',
    filesystem: 'filesystem'
  }
} as const;

export const PAGINATION_CONFIG = {
  defaults: {
    page: 1,
    limit: 10,
    maxLimit: 100,
    offset: 0
  },
  params: {
    page: 'page',
    limit: 'limit', 
    offset: 'offset',
    total: 'total',
    count: 'count'
  }
} as const;

export const SORT_CONFIG = {
  directions: {
    asc: 'asc',
    desc: 'desc',
    ascending: 'ascending',
    descending: 'descending'
  },
  params: {
    sortBy: 'sortBy',
    sortOrder: 'sortOrder',
    orderBy: 'orderBy'
  },
  defaults: {
    field: 'created_at',
    direction: 'desc'
  }
} as const;

export const FILTER_CONFIG = {
  operators: {
    eq: 'eq',      // equals
    ne: 'ne',      // not equals
    gt: 'gt',      // greater than
    gte: 'gte',    // greater than or equal
    lt: 'lt',      // less than
    lte: 'lte',    // less than or equal
    like: 'like',  // contains
    in: 'in',      // in array
    nin: 'nin'     // not in array
  },
  params: {
    filter: 'filter',
    search: 'search',
    query: 'q'
  }
} as const;

export const LOG_CONFIG = {
  levels: {
    error: 'error',
    warn: 'warn', 
    info: 'info',
    debug: 'debug',
    trace: 'trace'
  },
  formats: {
    json: 'json',
    text: 'text',
    structured: 'structured'
  },
  destinations: {
    console: 'console',
    file: 'file',
    remote: 'remote'
  }
} as const;