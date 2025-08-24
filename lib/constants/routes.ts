

// === API ROUTES ===
export const API_ROUTES = {
  // Base API path
  base: '/api',
  
  // Authentication routes
  auth: {
    base: '/api/auth',
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    resetPassword: '/api/auth/reset-password',
    verifyEmail: '/api/auth/verify-email'
  },
  
  // Admin routes
  admin: {
    base: '/api/admin',
    
    // User management
    users: '/api/admin/users',
    createUser: '/api/admin/create-user',
    updateUserRole: '/api/admin/update-user-role',
    directUpdateRole: '/api/admin/update-user-role/direct-update',
    resetPassword: '/api/admin/reset-password',
    approveAccessRequest: '/api/admin/approve-access-request',
    
    // Sectors and subsectors
    sectors: '/api/admin/sectors',
    subsectors: '/api/admin/subsectors',
    subsectorAdmins: '/api/admin/subsector-admins',
    subsectorTeam: '/api/admin/subsector-team',
    
    // Content management
    news: '/api/admin/news',
    events: '/api/admin/events',
    documents: '/api/admin/documents',
    messages: '/api/admin/messages',
    messageGroups: '/api/admin/message-groups',
    
    // Media management
    gallery: '/api/admin/gallery',
    galleryUpload: '/api/admin/gallery/upload',
    videos: '/api/admin/videos',
    videosUpload: '/api/admin/videos/upload',
    banners: '/api/admin/banners',
    bannersPositions: '/api/admin/banners/positions',
    
    // System management
    systemLinks: '/api/admin/system-links',
    economicIndicators: '/api/admin/economic-indicators',
    
    // Collections
    collections: '/api/admin/collections',
    collectionsStats: '/api/admin/collections/stats',
    
    // Monitoring
    monitoring: '/api/admin/monitoring',
    analytics: '/api/admin/analytics'
  },
  
  // Public API routes
  public: {
    collections: '/api/collections',
    videos: '/api/videos',
    notifications: '/api/notifications',
    search: '/api/search',
    stats: '/api/stats'
  },
  
  // Notifications
  notifications: {
    base: '/api/notifications',
    bulk: '/api/notifications/bulk',
    groups: '/api/notifications/groups',
    send: '/api/notifications/send',
    markRead: '/api/notifications/mark-read'
  },
  
  // Videos specific
  videos: {
    base: '/api/videos',
    upload: '/api/videos/upload',
    simpleUpload: '/api/videos/simple-upload',
    generateThumbnail: '/api/videos/generate-thumbnail',
    process: '/api/videos/process'
  },
  
  // Collections specific  
  collections: {
    base: '/api/collections',
    byId: (id: string) => `/api/collections/${id}`,
    items: (id: string) => `/api/collections/${id}/items`,
    itemById: (collectionId: string, itemId: string) => `/api/collections/${collectionId}/items/${itemId}`,
    reorder: (id: string) => `/api/collections/${id}/reorder`,
    uploadCover: '/api/collections/upload/cover'
  },
  
  // Dynamic sector routes
  sectors: {
    byId: (id: string) => `/api/admin/sectors/${id}`,
    images: (id: string) => `/api/admin/sectors/${id}/images`,
    imagesUpload: (id: string) => `/api/admin/sectors/${id}/images/upload`,
    videos: (id: string) => `/api/admin/sectors/${id}/videos`,
    videosUpload: (id: string) => `/api/admin/sectors/${id}/videos/upload`,
    documents: (id: string) => `/api/admin/sectors/${id}/documents`,
    news: (id: string) => `/api/admin/sectors/${id}/news`,
    events: (id: string) => `/api/admin/sectors/${id}/events`
  },
  
  // Dynamic subsector routes
  subsectors: {
    byId: (id: string) => `/api/admin/subsectors/${id}`,
    images: (id: string) => `/api/admin/subsectors/${id}/images`,
    imagesUpload: (id: string) => `/api/admin/subsectors/${id}/images/upload`,
    videos: (id: string) => `/api/admin/subsectors/${id}/videos`,
    videosUpload: (id: string) => `/api/admin/subsectors/${id}/videos/upload`,
    documents: (id: string) => `/api/admin/subsectors/${id}/documents`,
    news: (id: string) => `/api/admin/subsectors/${id}/news`,
    events: (id: string) => `/api/admin/subsectors/${id}/events`
  },
  
  // Dashboard and stats
  dashboard: {
    stats: '/api/dashboard/stats',
    recent: '/api/dashboard/recent',
    notifications: '/api/dashboard/notifications'
  }
} as const;

// === PAGE ROUTES (Frontend) ===
export const PAGE_ROUTES = {
  // Public pages
  home: '/home',
  dashboard: '/dashboard',
  login: '/login',
  profile: '/profile',
  
  // Content pages
  news: '/noticias',
  newsById: (id: string) => `/noticias/${id}`,
  events: '/eventos',
  eventsById: (id: string) => `/eventos/${id}`,
  documents: '/documentos',
  documentsById: (id: string) => `/documentos/${id}`,
  videos: '/videos',
  gallery: '/galeria',
  collections: '/colecoes',
  collectionsById: (id: string) => `/colecoes/${id}`,
  
  // System pages
  systems: '/sistemas',
  messages: '/mensagens',
  messagesById: (id: string) => `/mensagens/${id}`,
  
  // Sector pages
  sectors: '/setores',
  sectorById: (id: string) => `/setores/${id}`,
  subsectors: '/subsetores',
  subsectorById: (id: string) => `/subsetores/${id}`,
  
  // Admin pages
  admin: {
    base: '/admin',
    
    // User management
    users: '/admin/users',
    
    // Content management
    news: '/admin/news',
    events: '/admin/events',
    documents: '/admin/documents',
    messages: '/admin/messages',
    
    // Media management
    gallery: '/admin/gallery',
    videos: '/admin/videos',
    banners: '/admin/banners',
    
    // System management
    systemLinks: '/admin/system-links',
    economicIndicators: '/admin/economic-indicators',
    
    // Collections
    collections: '/admin/collections',
    collectionsById: (id: string) => `/admin/collections/${id}`,
    
    // Sectors management
    sectors: '/admin/sectors',
    sectorById: (id: string) => `/admin/sectors/${id}`,
    
    // Monitoring
    monitoring: '/admin/monitoring',
    analytics: '/admin/analytics',
    
    // Configuration
    positions: '/admin/positions',
    workLocations: '/admin/work-locations'
  },
  
  // Sector admin pages
  adminSector: {
    base: '/admin-setor',
    sectors: '/admin-setor/setores',
    sectorById: (id: string) => `/admin-setor/setores/${id}`
  },
  
  // Subsector admin pages
  adminSubsector: {
    base: '/admin-subsetor',
    subsectors: '/admin-subsetor/subsetores',
    subsectorById: (id: string) => `/admin-subsetor/subsetores/${id}`
  }
} as const;

// === STORAGE PATHS ===
export const STORAGE_PATHS = {
  // Base bucket
  bucket: 'images',
  
  // Folder structure
  folders: {
    avatars: 'avatars',
    banners: 'banners',
    thumbnails: 'thumbnails',
    uploads: 'uploads',
    documents: 'documents',
    videos: 'videos',
    gallery: 'gallery',
    sectorNews: 'sector-news',
    subsectorNews: 'subsector-news',
    temp: 'temp'
  },
  
  // Full paths
  paths: {
    avatars: 'images/avatars',
    banners: 'images/banners',
    thumbnails: 'images/thumbnails',
    uploads: 'images/uploads',
    documents: 'documents',
    videos: 'videos',
    gallery: 'images/gallery',
    sectorNews: 'images/sector-news',
    subsectorNews: 'images/subsector-news',
    temp: 'images/temp'
  },
  
  // Dynamic paths
  sectorImages: (sectorId: string) => `images/sectors/${sectorId}`,
  subsectorImages: (subsectorId: string) => `images/subsectors/${subsectorId}`,
  userAvatar: (userId: string) => `images/avatars/${userId}`,
  videoThumbnail: (videoId: string) => `images/thumbnails/${videoId}`,
  collectionCover: (collectionId: string) => `images/collections/${collectionId}`
} as const;

// === EXTERNAL URLS ===
export const EXTERNAL_URLS = {
  // Social media
  social: {
    facebook: 'https://facebook.com/cresol',
    instagram: 'https://instagram.com/cresol',
    linkedin: 'https://linkedin.com/company/cresol',
    youtube: 'https://youtube.com/@cresol'
  },
  
  // Company
  company: {
    website: 'https://cresol.com.br',
    support: 'https://suporte.cresol.com.br',
    documentation: 'https://docs.cresol.com.br'
  },
  
  // Services
  services: {
    maps: 'https://maps.google.com',
    analytics: 'https://analytics.google.com',
    cdn: 'https://cdn.cresol.com.br'
  }
} as const;

// === REDIRECT PATHS ===
export const REDIRECT_PATHS = {
  // After login
  afterLogin: {
    admin: '/admin',
    sectorAdmin: '/admin-setor',
    subsectorAdmin: '/admin-subsetor',
    user: '/home'
  },
  
  // After logout
  afterLogout: '/login',
  
  // Error pages
  error: {
    notFound: '/404',
    serverError: '/500',
    unauthorized: '/401',
    forbidden: '/403'
  },
  
  // Fallback redirects
  fallback: {
    home: '/home',
    dashboard: '/dashboard',
    login: '/login'
  }
} as const;

// === NAVIGATION ROUTES ===
export const NAVIGATION_ROUTES = {
  // Main navigation
  main: [
    { name: 'Início', path: '/home', icon: 'home' },
    { name: 'Sistemas', path: '/sistemas', icon: 'systems' },
    { name: 'Notícias', path: '/noticias', icon: 'news' },
    { name: 'Eventos', path: '/eventos', icon: 'events' },
    { name: 'Documentos', path: '/documentos', icon: 'documents' },
    { name: 'Vídeos', path: '/videos', icon: 'videos' },
    { name: 'Galeria', path: '/galeria', icon: 'gallery' },
    { name: 'Mensagens', path: '/mensagens', icon: 'messages' }
  ],
  
  // Admin navigation
  admin: [
    { name: 'Usuários', path: '/admin/users', icon: 'users' },
    { name: 'Setores', path: '/admin/sectors', icon: 'sectors' },
    { name: 'Notícias', path: '/admin/news', icon: 'news' },
    { name: 'Eventos', path: '/admin/events', icon: 'events' },
    { name: 'Documentos', path: '/admin/documents', icon: 'documents' },
    { name: 'Vídeos', path: '/admin/videos', icon: 'videos' },
    { name: 'Galeria', path: '/admin/gallery', icon: 'gallery' },
    { name: 'Banners', path: '/admin/banners', icon: 'banners' },
    { name: 'Sistemas', path: '/admin/system-links', icon: 'systems' },
    { name: 'Indicadores', path: '/admin/economic-indicators', icon: 'indicators' },
    { name: 'Coleções', path: '/admin/collections', icon: 'collections' },
    { name: 'Mensagens', path: '/admin/messages', icon: 'messages' },
    { name: 'Monitoramento', path: '/admin/monitoring', icon: 'monitoring' },
    { name: 'Analíticos', path: '/admin/analytics', icon: 'analytics' }
  ],
  
  // User profile menu
  profile: [
    { name: 'Meu Perfil', path: '/profile', icon: 'user' },
    { name: 'Configurações', path: '/profile/settings', icon: 'settings' },
    { name: 'Sair', path: '/logout', icon: 'logout' }
  ]
} as const;

// === CONSOLIDATED EXPORT ===
export const ROUTE_CONSTANTS = {
  api: API_ROUTES,
  pages: PAGE_ROUTES,
  storage: STORAGE_PATHS,
  external: EXTERNAL_URLS,
  redirect: REDIRECT_PATHS,
  navigation: NAVIGATION_ROUTES
} as const;

// === HELPER FUNCTIONS ===
export const ROUTE_HELPERS = {
  /**
   * Build URL with query parameters
   */
  buildUrl: (baseUrl: string, params?: Record<string, any>): string => {
    if (!params) return baseUrl;
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  },
  
  /**
   * Get full storage URL
   */
  getStorageUrl: (path: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${baseUrl}/storage/v1/object/public/${path}`;
  },
  
  /**
   * Check if route is admin route
   */
  isAdminRoute: (path: string): boolean => {
    return path.startsWith('/admin');
  },
  
  /**
   * Check if route is sector admin route
   */
  isSectorAdminRoute: (path: string): boolean => {
    return path.startsWith('/admin-setor');
  },
  
  /**
   * Check if route is subsector admin route
   */
  isSubsectorAdminRoute: (path: string): boolean => {
    return path.startsWith('/admin-subsetor');
  },
  
  /**
   * Get redirect path based on user role
   */
  getRedirectByRole: (role: string): string => {
    switch (role) {
      case 'admin':
        return REDIRECT_PATHS.afterLogin.admin;
      case 'sector_admin':
        return REDIRECT_PATHS.afterLogin.sectorAdmin;
      case 'subsector_admin':
        return REDIRECT_PATHS.afterLogin.subsectorAdmin;
      default:
        return REDIRECT_PATHS.afterLogin.user;
    }
  },
  
  /**
   * Extract ID from dynamic route
   */
  extractIdFromRoute: (route: string, pattern: string): string | null => {
    const regex = new RegExp(pattern.replace('[id]', '([^/]+)'));
    const match = route.match(regex);
    return match ? match[1] : null;
  },
  
  /**
   * Check if current path matches route
   */
  matchesRoute: (currentPath: string, targetRoute: string): boolean => {
    if (targetRoute.includes('[id]')) {
      const pattern = targetRoute.replace('[id]', '[^/]+');
      return new RegExp(`^${pattern}$`).test(currentPath);
    }
    return currentPath === targetRoute;
  }
} as const;

// === TYPESCRIPT TYPES ===
export type ApiRoutes = typeof API_ROUTES;
export type PageRoutes = typeof PAGE_ROUTES;
export type StoragePaths = typeof STORAGE_PATHS;
export type ExternalUrls = typeof EXTERNAL_URLS;
export type RedirectPaths = typeof REDIRECT_PATHS;
export type NavigationRoutes = typeof NAVIGATION_ROUTES;
export type RouteConstants = typeof ROUTE_CONSTANTS;
export type RouteHelpers = typeof ROUTE_HELPERS;