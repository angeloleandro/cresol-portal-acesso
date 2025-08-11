// Collection Constants - Portal Cresol
// Constantes centralizadas para o sistema de coleções

// Tipos de Coleção
export const COLLECTION_TYPES = {
  MIXED: 'mixed' as const,
  IMAGES: 'images' as const,
  VIDEOS: 'videos' as const,
} as const;

export const COLLECTION_TYPE_LABELS = {
  [COLLECTION_TYPES.MIXED]: 'Misto (Imagens + Vídeos)',
  [COLLECTION_TYPES.IMAGES]: 'Apenas Imagens',
  [COLLECTION_TYPES.VIDEOS]: 'Apenas Vídeos',
} as const;

// Tipos de Item
export const ITEM_TYPES = {
  IMAGE: 'image' as const,
  VIDEO: 'video' as const,
} as const;

export const ITEM_TYPE_LABELS = {
  [ITEM_TYPES.IMAGE]: 'Imagem',
  [ITEM_TYPES.VIDEO]: 'Vídeo',
} as const;

// Limites e Configurações
export const COLLECTION_CONFIG = {
  // Paginação
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
  
  // Limites de conteúdo
  MAX_NAME_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_ITEMS_PER_COLLECTION: 100,
  
  // Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'] as const,
  
  // Performance
  VIRTUAL_LIST_THRESHOLD: 50,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  
  // Ordenação
  DEFAULT_ORDER_INCREMENT: 10,
} as const;

// Estados de Status
export const COLLECTION_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
} as const;

export const COLLECTION_STATUS_LABELS = {
  true: 'Ativo',
  false: 'Inativo',
} as const;

// Opções de Ordenação
export const SORT_OPTIONS = {
  NAME_ASC: { field: 'name', order: 'asc' } as const,
  NAME_DESC: { field: 'name', order: 'desc' } as const,
  DATE_ASC: { field: 'created_at', order: 'asc' } as const,
  DATE_DESC: { field: 'created_at', order: 'desc' } as const,
  ORDER_ASC: { field: 'order_index', order: 'asc' } as const,
  ORDER_DESC: { field: 'order_index', order: 'desc' } as const,
} as const;

export const SORT_LABELS = {
  'name-asc': 'Nome (A-Z)',
  'name-desc': 'Nome (Z-A)',
  'created_at-asc': 'Mais Antigo',
  'created_at-desc': 'Mais Recente',
  'order_index-asc': 'Ordem Crescente',
  'order_index-desc': 'Ordem Decrescente',
} as const;

// Cores Tema Padrão (seguindo design system Cresol)
export const THEME_COLORS = [
  '#F58220', // Cresol Orange (primary)
  '#005C46', // Cresol Green (secondary)
  '#FF6B35', // Orange Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#96CEB4', // Mint Green
  '#FECA57', // Yellow
  '#FF9FF3', // Pink
  '#54A0FF', // Blue
  '#5F27CD', // Purple
] as const;

// Mensagens de Erro
export const ERROR_MESSAGES = {
  // Validação
  NAME_REQUIRED: 'Nome da coleção é obrigatório',
  NAME_TOO_LONG: `Nome não pode exceder ${COLLECTION_CONFIG.MAX_NAME_LENGTH} caracteres`,
  DESCRIPTION_TOO_LONG: `Descrição não pode exceder ${COLLECTION_CONFIG.MAX_DESCRIPTION_LENGTH} caracteres`,
  INVALID_COLOR: 'Cor deve estar no formato hexadecimal (#RRGGBB)',
  
  // Operações
  COLLECTION_NOT_FOUND: 'Coleção não encontrada',
  COLLECTION_ALREADY_EXISTS: 'Já existe uma coleção com este nome',
  CANNOT_DELETE_WITH_ITEMS: 'Não é possível excluir coleção que possui itens',
  
  // Itens
  ITEM_ALREADY_IN_COLLECTION: 'Este item já está na coleção',
  MAX_ITEMS_EXCEEDED: `Coleção não pode ter mais de ${COLLECTION_CONFIG.MAX_ITEMS_PER_COLLECTION} itens`,
  INVALID_ITEM_TYPE: 'Tipo de item inválido para esta coleção',
  
  // Upload
  FILE_TOO_LARGE: `Arquivo muito grande. Máximo ${COLLECTION_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
  INVALID_FILE_TYPE: 'Tipo de arquivo não suportado',
  UPLOAD_FAILED: 'Falha no upload do arquivo',
  
  // Genérico
  NETWORK_ERROR: 'Erro de conexão. Tente novamente.',
  PERMISSION_DENIED: 'Você não tem permissão para esta operação',
  UNKNOWN_ERROR: 'Erro desconhecido. Contate o suporte.',
} as const;

// Mensagens de Sucesso
export const SUCCESS_MESSAGES = {
  COLLECTION_CREATED: 'Coleção criada com sucesso!',
  COLLECTION_UPDATED: 'Coleção atualizada com sucesso!',
  COLLECTION_DELETED: 'Coleção excluída com sucesso!',
  COLLECTION_ACTIVATED: 'Coleção ativada com sucesso!',
  COLLECTION_DEACTIVATED: 'Coleção desativada com sucesso!',
  
  ITEM_ADDED: 'Item adicionado à coleção!',
  ITEM_REMOVED: 'Item removido da coleção!',
  ITEMS_REORDERED: 'Ordem dos itens atualizada!',
  
  UPLOAD_COMPLETED: 'Upload concluído com sucesso!',
  BULK_OPERATION_COMPLETED: 'Operação em lote concluída!',
} as const;

// URLs da API
export const API_ENDPOINTS = {
  // Coleções
  COLLECTIONS: '/api/collections',
  COLLECTION_BY_ID: (id: string) => `/api/collections/${id}`,
  
  // Itens de Coleção
  COLLECTION_ITEMS: (id: string) => `/api/collections/${id}/items`,
  COLLECTION_ITEM_BY_ID: (collectionId: string, itemId: string) => 
    `/api/collections/${collectionId}/items/${itemId}`,
  REORDER_ITEMS: (id: string) => `/api/collections/${id}/reorder`,
  
  // Admin
  ADMIN_COLLECTIONS: '/api/admin/collections',
  ADMIN_COLLECTION_BY_ID: (id: string) => `/api/admin/collections/${id}`,
  ADMIN_COLLECTION_STATS: '/api/admin/collections/stats',
  ADMIN_BULK_OPERATIONS: '/api/admin/collections/bulk',
  
  // Upload
  UPLOAD_COVER: '/api/collections/upload/cover',
  UPLOAD_ITEMS: '/api/collections/upload/items',
} as const;

// Storage Buckets
export const STORAGE_BUCKETS = {
  COLLECTIONS: 'collections',
  COVERS: 'collections/covers',
  ITEMS: 'collections/items',
} as const;

// Classes CSS Reutilizáveis (seguindo Tailwind do projeto)
export const CSS_CLASSES = {
  // Cards
  CARD_BASE: 'bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow',
  CARD_CONTENT: 'p-4',
  
  // Botões
  BUTTON_PRIMARY: 'bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-md transition-colors',
  BUTTON_SECONDARY: 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-md transition-colors',
  BUTTON_DANGER: 'bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-md transition-colors',
  
  // Status
  STATUS_ACTIVE: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
  STATUS_INACTIVE: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
  
  // Grid
  GRID_RESPONSIVE: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  GRID_RESPONSIVE_LARGE: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
  
  // Loading
  LOADING_SPINNER: 'animate-spin rounded-full h-6 w-6 border-b-2 border-primary',
  SKELETON: 'animate-pulse bg-gray-200 rounded',
} as const;

// Configurações de Performance
export const PERFORMANCE_CONFIG = {
  // Debounce para search
  SEARCH_DEBOUNCE_MS: 300,
  
  // Throttle para scroll
  SCROLL_THROTTLE_MS: 100,
  
  // Lazy loading
  LAZY_LOAD_THRESHOLD: '100px',
  
  // Cache
  STALE_TIME: 5 * 60 * 1000, // 5 minutos
  CACHE_TIME: 10 * 60 * 1000, // 10 minutos
} as const;

// Features flags (para rollout gradual)
export const FEATURE_FLAGS = {
  DRAG_AND_DROP: true,
  BULK_OPERATIONS: true,
  ADVANCED_FILTERS: true,
  REAL_TIME_UPDATES: false, // Future feature
  AI_ORGANIZATION: false, // Future feature
} as const;