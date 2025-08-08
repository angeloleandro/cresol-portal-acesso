/**
 * Video UI Constants
 * Centralized UI strings, error messages and configuration
 */

// Error Messages - Centralized for internationalization
export const VIDEO_MESSAGES = {
  ERRORS: {
    UNSUPPORTED_FORMAT: 'Formato não suportado. Use MP4, WebM, MOV ou AVI.',
    FILE_TOO_LARGE: 'Arquivo muito grande.',
    INVALID_FILE: 'Arquivo inválido',
    UPLOAD_FAILED: 'Falha no upload do vídeo',
    PROCESSING_FAILED: 'Falha no processamento do vídeo',
    NETWORK_ERROR: 'Erro de conexão. Tente novamente.',
    INVALID_YOUTUBE_URL: 'URL do YouTube inválida',
    THUMBNAIL_ERROR: 'Erro ao carregar thumbnail',
  },
  SUCCESS: {
    UPLOAD_COMPLETE: 'Vídeo enviado com sucesso',
    PROCESSING_COMPLETE: 'Processamento concluído',
    SAVED: 'Vídeo salvo com sucesso',
    DELETED: 'Vídeo removido com sucesso',
  },
  INFO: {
    PROCESSING: 'Processando vídeo...',
    UPLOADING: 'Enviando arquivo...',
    DRAG_DROP: 'Arraste o arquivo aqui ou clique para selecionar',
    MAX_SIZE_INFO: 'Tamanho máximo: 500MB',
    SUPPORTED_FORMATS: 'Formatos suportados: MP4, WebM, MOV, AVI',
  }
} as const;

// UI Classes - Centralized Tailwind classes
export const VIDEO_UI_CLASSES = {
  GRID: {
    TWO_COLUMN: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    SINGLE_COLUMN: 'grid grid-cols-1 gap-4',
    RESPONSIVE: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  },
  FLEX: {
    CENTER: 'flex items-center justify-center',
    ITEMS_CENTER: 'flex items-center gap-2',
    BETWEEN: 'flex items-center justify-between',
    COLUMN: 'flex flex-col gap-2',
  },
  TEXT: {
    LABEL: 'text-sm font-medium text-neutral-700',
    LABEL_CLICKABLE: 'text-sm font-medium text-neutral-700 cursor-pointer',
    HELP: 'text-xs text-neutral-500',
    ERROR: 'text-xs text-red-600',
    SUCCESS: 'text-xs text-green-600',
  },
  CONTAINERS: {
    SECTION: 'space-y-4',
    HELP_SPAN: 'text-xs text-neutral-500 col-span-1 sm:col-span-2',
    CARD: 'bg-white rounded-lg border border-neutral-200 p-6',
  }
} as const;

// Video Upload Configuration
export const VIDEO_UPLOAD_CONFIG = {
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  TIMEOUT: 30000, // 30 seconds
  PROGRESS_UPDATE_INTERVAL: 100, // 100ms
} as const;

// YouTube Configuration
export const YOUTUBE_CONFIG = {
  THUMBNAIL_QUALITIES: ['default', 'hqdefault', 'maxresdefault'] as const,
  URL_PATTERNS: [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  ],
} as const;

export type VideoMessages = typeof VIDEO_MESSAGES;
export type VideoUIClasses = typeof VIDEO_UI_CLASSES;
export type VideoUploadConfig = typeof VIDEO_UPLOAD_CONFIG;