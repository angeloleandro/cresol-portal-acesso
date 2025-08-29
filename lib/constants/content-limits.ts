/**
 * Limites centralizados para conteúdo em todo o sistema
 * Evita valores hardcoded espalhados pelo código
 */

// ========================================
// Limites de caracteres para campos de texto
// ========================================

export const CHAR_LIMITS = {
  // Títulos
  TITLE: {
    MIN: 3,
    MAX: 255,
    PLACEHOLDER: 'Entre 3 e 255 caracteres'
  },
  
  // Resumos e descrições curtas
  SUMMARY: {
    MIN: 10,
    MAX: 500,
    PLACEHOLDER: 'Entre 10 e 500 caracteres'
  },
  
  // Conteúdo principal
  CONTENT: {
    MIN: 20,
    MAX: 10000,
    PLACEHOLDER: 'Entre 20 e 10.000 caracteres'
  },
  
  // Descrições longas
  DESCRIPTION: {
    MIN: 10,
    MAX: 1000,
    PLACEHOLDER: 'Entre 10 e 1.000 caracteres'
  },
  
  // Nomes
  NAME: {
    MIN: 2,
    MAX: 100,
    PLACEHOLDER: 'Entre 2 e 100 caracteres'
  },
  
  // Localizações
  LOCATION: {
    MIN: 3,
    MAX: 255,
    PLACEHOLDER: 'Entre 3 e 255 caracteres'
  },
  
  // URLs
  URL: {
    MIN: 10,
    MAX: 2048, // Limite padrão para URLs na web
    PLACEHOLDER: 'URL válida (máx. 2048 caracteres)'
  },
  
  // Captions e legendas
  CAPTION: {
    MIN: 0,
    MAX: 255,
    PLACEHOLDER: 'Máximo 255 caracteres (opcional)'
  }
} as const;

// ========================================
// Limites de arquivos
// ========================================

export const FILE_LIMITS = {
  // Imagens
  IMAGE: {
    MAX_SIZE_MB: 10,
    MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
    ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    MIME_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ]
  },
  
  // Documentos
  DOCUMENT: {
    MAX_SIZE_MB: 50,
    MAX_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
    ALLOWED_FORMATS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
    MIME_TYPES: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ]
  },
  
  // Vídeos
  VIDEO: {
    MAX_SIZE_MB: 500,
    MAX_SIZE_BYTES: 500 * 1024 * 1024, // 500MB
    ALLOWED_FORMATS: ['mp4', 'webm', 'ogg', 'mov', 'avi'],
    MIME_TYPES: [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
      'video/x-msvideo'
    ],
    MAX_DURATION_SECONDS: 3600 // 1 hora
  },
  
  // Avatar/Profile
  AVATAR: {
    MAX_SIZE_MB: 5,
    MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
    ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
    MIME_TYPES: [
      'image/jpeg',
      'image/png',
      'image/webp'
    ],
    DIMENSIONS: {
      MIN_WIDTH: 100,
      MIN_HEIGHT: 100,
      MAX_WIDTH: 2000,
      MAX_HEIGHT: 2000,
      ASPECT_RATIO: 1 // Quadrado
    }
  },
  
  // Banner
  BANNER: {
    MAX_SIZE_MB: 15,
    MAX_SIZE_BYTES: 15 * 1024 * 1024, // 15MB
    ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
    MIME_TYPES: [
      'image/jpeg',
      'image/png',
      'image/webp'
    ],
    DIMENSIONS: {
      RECOMMENDED_WIDTH: 1920,
      RECOMMENDED_HEIGHT: 600,
      MIN_WIDTH: 1200,
      MIN_HEIGHT: 400,
      ASPECT_RATIO: 3.2 // ~16:5
    }
  }
} as const;

// ========================================
// Limites de coleções/arrays
// ========================================

export const COLLECTION_LIMITS = {
  // Galeria de imagens
  GALLERY: {
    MIN_IMAGES: 1,
    MAX_IMAGES: 50,
    DEFAULT: 10
  },
  
  // Grupos de usuários
  GROUP_MEMBERS: {
    MIN: 1,
    MAX: 1000,
    DEFAULT: 100
  },
  
  // Tags/categorias
  TAGS: {
    MIN: 0,
    MAX: 10,
    DEFAULT: 5
  },
  
  // Anexos em mensagens
  ATTACHMENTS: {
    MIN: 0,
    MAX: 10,
    DEFAULT: 5
  },
  
  // Itens por página (paginação)
  PAGINATION: {
    MIN: 5,
    MAX: 100,
    DEFAULT: 20,
    OPTIONS: [10, 20, 50, 100]
  }
} as const;

// ========================================
// Limites numéricos
// ========================================

export const NUMERIC_LIMITS = {
  // Prioridade (0-10)
  PRIORITY: {
    MIN: 0,
    MAX: 10,
    DEFAULT: 0
  },
  
  // Ordem de exibição
  ORDER_INDEX: {
    MIN: 0,
    MAX: 9999,
    DEFAULT: 0
  },
  
  // Porcentagens
  PERCENTAGE: {
    MIN: 0,
    MAX: 100,
    DEFAULT: 0
  },
  
  // Avaliações/ratings
  RATING: {
    MIN: 0,
    MAX: 5,
    DEFAULT: 0
  }
} as const;

// ========================================
// Limites de data/tempo
// ========================================

export const TIME_LIMITS = {
  // Eventos
  EVENT: {
    MIN_DURATION_MINUTES: 15,
    MAX_DURATION_DAYS: 365,
    MAX_ADVANCE_BOOKING_DAYS: 365
  },
  
  // Sessões
  SESSION: {
    IDLE_TIMEOUT_MINUTES: 30,
    MAX_DURATION_HOURS: 24,
    REFRESH_INTERVAL_MINUTES: 5
  },
  
  // Tokens/Links temporários
  TEMPORARY_LINK: {
    EXPIRY_MINUTES: 60,
    PASSWORD_RESET_HOURS: 24,
    EMAIL_VERIFICATION_DAYS: 7
  }
} as const;

// ========================================
// Helpers de validação
// ========================================

/**
 * Valida se um texto está dentro dos limites especificados
 */
export function isWithinCharLimit(
  text: string,
  limitKey: keyof typeof CHAR_LIMITS
): boolean {
  const limit = CHAR_LIMITS[limitKey];
  const length = text.trim().length;
  return length >= limit.MIN && length <= limit.MAX;
}

/**
 * Valida se um arquivo está dentro dos limites de tamanho
 */
export function isWithinFileSize(
  sizeInBytes: number,
  fileType: keyof typeof FILE_LIMITS
): boolean {
  const limit = FILE_LIMITS[fileType];
  return sizeInBytes <= limit.MAX_SIZE_BYTES;
}

/**
 * Valida se um formato de arquivo é permitido
 */
export function isAllowedFileFormat(
  filename: string,
  fileType: keyof typeof FILE_LIMITS
): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return false;
  
  const limit = FILE_LIMITS[fileType];
  return (limit.ALLOWED_FORMATS as readonly string[]).includes(extension);
}

/**
 * Valida se um MIME type é permitido
 */
export function isAllowedMimeType(
  mimeType: string,
  fileType: keyof typeof FILE_LIMITS
): boolean {
  const limit = FILE_LIMITS[fileType];
  return (limit.MIME_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Formata tamanho de arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Retorna mensagem de erro para limite de caracteres
 */
export function getCharLimitError(
  currentLength: number,
  limitKey: keyof typeof CHAR_LIMITS
): string {
  const limit = CHAR_LIMITS[limitKey];
  
  if (currentLength < limit.MIN) {
    return `Mínimo de ${limit.MIN} caracteres (atual: ${currentLength})`;
  }
  
  if (currentLength > limit.MAX) {
    return `Máximo de ${limit.MAX} caracteres (atual: ${currentLength})`;
  }
  
  return '';
}

/**
 * Retorna mensagem de erro para limite de arquivo
 */
export function getFileSizeError(
  sizeInBytes: number,
  fileType: keyof typeof FILE_LIMITS
): string {
  const limit = FILE_LIMITS[fileType];
  
  if (sizeInBytes > limit.MAX_SIZE_BYTES) {
    return `Arquivo muito grande. Máximo: ${limit.MAX_SIZE_MB}MB (atual: ${formatFileSize(sizeInBytes)})`;
  }
  
  return '';
}

// ========================================
// Constantes de exibição
// ========================================

export const DISPLAY_LIMITS = {
  // Truncate de texto
  TRUNCATE: {
    TITLE: 50,
    SUMMARY: 150,
    CONTENT_PREVIEW: 200
  },
  
  // Itens em listas
  LIST_ITEMS: {
    RECENT: 5,
    FEATURED: 3,
    SIDEBAR: 10,
    DROPDOWN: 20
  },
  
  // Thumbnails
  THUMBNAIL: {
    WIDTH: 300,
    HEIGHT: 200,
    QUALITY: 80 // Porcentagem
  }
} as const;

// ========================================
// Exportação de tipos
// ========================================

export type CharLimitKey = keyof typeof CHAR_LIMITS;
export type FileLimitKey = keyof typeof FILE_LIMITS;
export type CollectionLimitKey = keyof typeof COLLECTION_LIMITS;
export type NumericLimitKey = keyof typeof NUMERIC_LIMITS;
export type TimeLimitKey = keyof typeof TIME_LIMITS;
export type DisplayLimitKey = keyof typeof DISPLAY_LIMITS;