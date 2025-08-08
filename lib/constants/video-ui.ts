/**
 * Video System Configuration
 * Comprehensive centralized configuration eliminating all hardcoded values
 */

// API Configuration
export const VIDEO_API_CONFIG = {
  endpoints: {
    videos: '/api/videos',
    adminVideos: '/api/admin/videos',
    simpleUpload: '/api/videos/simple-upload',
  },
  timeouts: {
    upload: 300000, // 5 minutes
    processing: 120000, // 2 minutes
    thumbnail: 30000, // 30 seconds
    request: 10000, // 10 seconds
  },
  retries: {
    maxAttempts: 3,
    delay: 1000, // 1 second
  }
} as const;

// File Configuration
export const VIDEO_FILE_CONFIG = {
  maxSize: 500 * 1024 * 1024, // 500MB
  chunkSize: 1024 * 1024, // 1MB chunks
  supportedFormats: ['mp4', 'webm', 'mov', 'avi'] as const,
  supportedMimeTypes: [
    'video/mp4',
    'video/webm', 
    'video/quicktime',
    'video/x-msvideo',
    'video/mov',
    'video/avi'
  ] as const,
  acceptAttribute: 'video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.webm,.mov,.avi',
  cacheControl: '3600', // 1 hour
} as const;

// Thumbnail Configuration
export const VIDEO_THUMBNAIL_CONFIG = {
  dimensions: {
    width: 1280,
    height: 720,
    aspectRatio: 16 / 9,
    previewWidth: 320,
    previewHeight: 180,
  },
  quality: {
    jpeg: 0.8,
    webp: 0.85,
    png: 0.9,
  },
  generation: {
    defaultTimestamp: 5.0, // 5 seconds
    fallbackTimestamp: 1.0, // 1 second
    maxRetries: 3,
    seekTimeout: 2000, // 2 seconds
  },
  youtube: {
    qualities: ['default', 'hqdefault', 'maxresdefault'] as const,
    defaultQuality: 'hqdefault' as const,
    urlPattern: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  }
} as const;

// UI Configuration
export const VIDEO_UI_CONFIG = {
  animations: {
    fadeIn: 200,
    slideDown: 300,
    modalTransition: 250,
    progressTransition: 300,
    hoverTransition: 200,
  },
  delays: {
    clickPrevent: 100, // Prevent double clicks
    warningDisplay: 5000, // 5 seconds
    successDisplay: 3000, // 3 seconds
    errorDisplay: 0, // Permanent until dismissed
    tooltipShow: 500,
  },
  progressBar: {
    height: 8, // 8px
    minValue: 0,
    maxValue: 100,
    updateInterval: 100, // 100ms
  },
  cropper: {
    aspectRatio: 16 / 9,
    minZoom: 1,
    maxZoom: 3,
    zoomStep: 0.01,
    rotationMin: 0,
    rotationMax: 360,
    rotationStep: 1,
  },
  layout: {
    containerMaxWidth: '42rem', // 672px
    thumbnailHeight: {
      mobile: '8rem', // 128px
      desktop: '12rem', // 192px
    },
    uploadAreaHeight: '12rem', // 192px
    modalMaxHeight: '85vh',
  }
} as const;

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
    CLICK_PREVENTED: 'Por favor, aguarde antes de clicar novamente',
    GENERATION_FAILED: 'Erro ao gerar thumbnail - tente um arquivo diferente',
    BROWSER_UNSUPPORTED: 'Seu navegador tem suporte limitado para geração automática',
  },
  SUCCESS: {
    UPLOAD_COMPLETE: 'Vídeo enviado com sucesso',
    PROCESSING_COMPLETE: 'Processamento concluído',
    SAVED: 'Vídeo salvo com sucesso',
    DELETED: 'Vídeo removido com sucesso',
    THUMBNAIL_GENERATED: 'Thumbnail gerada automaticamente',
  },
  INFO: {
    PROCESSING: 'Processando vídeo...',
    UPLOADING: 'Enviando arquivo...',
    GENERATING_THUMBNAIL: 'Gerando thumbnail...',
    DRAG_DROP: 'Arraste o arquivo aqui ou clique para selecionar',
    MAX_SIZE_INFO: 'Tamanho máximo: 500MB',
    SUPPORTED_FORMATS: 'Formatos suportados: MP4, WebM, MOV, AVI',
    YOUTUBE_AUTO: 'Será usada a thumbnail padrão do YouTube',
    VIDEO_AUTO: 'Thumbnail será gerada automaticamente do vídeo',
    CUSTOM_UPLOAD: 'Faça upload de uma imagem personalizada (recomendado: 1280x720px)',
    NO_THUMBNAIL: 'Nenhuma thumbnail será exibida',
    THUMBNAIL_FORMATS: 'Formatos suportados: JPG, PNG, WebP. Recomendado: 1280x720px (16:9)',
    REPLACE_CURRENT: 'Substituir vídeo atual (opcional)',
    KEEP_CURRENT: 'Deixe vazio para manter atual ou selecione novo arquivo para substituir.',
    FILE_PROGRESS: '% enviado',
    WAIT_PROCESSING: 'Por favor, não feche esta janela',
  },
  LABELS: {
    VIDEO_TITLE: 'Título do Vídeo',
    VIDEO_FILE: 'Arquivo de Vídeo',
    THUMBNAIL: 'Thumbnail',
    UPLOAD_TYPE: 'Tipo de Upload',
    YOUTUBE_URL: 'URL do YouTube',
    YOUTUBE_OPTION: 'YouTube',
    DIRECT_OPTION: 'Upload Direto',
    YOUTUBE_HELP: 'Link do vídeo',
    DIRECT_HELP: 'Arquivo local',
    AUTO_THUMBNAIL: 'Automática (YouTube)',
    AUTO_THUMBNAIL_VIDEO: 'Automática (do vídeo)',
    CUSTOM_THUMBNAIL: 'Enviar imagem',
    NO_THUMBNAIL: 'Sem thumbnail',
    CURRENT_FILE: 'Arquivo Atual',
    ADVANCED_SETTINGS: 'Configurações Avançadas',
    REQUIRED: 'obrigatório',
    CANCEL: 'Cancelar',
    SAVE: 'Salvar Vídeo',
    UPDATE: 'Atualizar Vídeo',
    UPLOADING: 'Enviando...',
    PROCESSING_ACTION: 'Processando...',
    REMOVE_FILE: 'Remover arquivo',
    CLICK_SELECT: 'clique para selecionar',
    CHANGE_IMAGE: 'Alterar imagem',
    APPLY_CROP: 'Aplicar',
    CANCEL_CROP: 'Cancelar',
    ZOOM_CONTROL: 'Controle de zoom da imagem',
    ROTATION_CONTROL: 'Controle de rotação da imagem',
    CHOOSE_TIME: 'Escolher momento:',
    REGENERATE_THUMBNAIL: 'Gerar em outro momento',
    GENERATE_THUMBNAIL: 'Gerar Thumbnail',
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

// Storage Configuration  
export const VIDEO_STORAGE_CONFIG = {
  buckets: {
    videos: 'videos',
    banners: 'banners',
    thumbnails: 'images',
  },
  folders: {
    uploads: 'uploads',
    thumbnails: 'thumbnails', 
  },
  paths: {
    publicUrl: (bucket: string, filePath: string) => 
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`,
  }
} as const;

// YouTube Configuration
export const YOUTUBE_CONFIG = {
  thumbnail: {
    baseUrl: 'https://img.youtube.com/vi',
    qualities: VIDEO_THUMBNAIL_CONFIG.youtube.qualities,
    defaultQuality: VIDEO_THUMBNAIL_CONFIG.youtube.defaultQuality,
  },
  urlPatterns: [VIDEO_THUMBNAIL_CONFIG.youtube.urlPattern],
  embed: {
    baseUrl: 'https://www.youtube.com/embed',
    parameters: {
      autoplay: 0,
      rel: 0,
      showinfo: 0,
    }
  }
} as const;

// CSS Classes Configuration
export const VIDEO_CSS_CONFIG = {
  dimensions: {
    thumbnailAspect: 'aspect-video',
    uploadHeight: 'h-48', // 192px
    previewHeight: 'h-32 sm:h-40 lg:h-48', 
    modalMaxWidth: 'max-w-3xl',
    containerMaxWidth: 'max-w-2xl',
  },
  spacing: {
    sectionGap: 'space-y-8',
    fieldGap: 'space-y-4', 
    buttonGap: 'gap-3',
    iconGap: 'gap-2',
  },
  responsive: {
    sizes: {
      thumbnail: '(max-width: 768px) 100vw, 50vw',
      image: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    },
    breakpoints: {
      mobile: 'sm:',
      tablet: 'md:',
      desktop: 'lg:',
      large: 'xl:',
    }
  },
  states: {
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    loading: 'animate-spin',
    hidden: 'sr-only',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-100',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-100',
  }
} as const;

// Type Exports with comprehensive type safety
export type VideoApiConfig = typeof VIDEO_API_CONFIG;
export type VideoFileConfig = typeof VIDEO_FILE_CONFIG;
export type VideoThumbnailConfig = typeof VIDEO_THUMBNAIL_CONFIG;
export type VideoUIConfig = typeof VIDEO_UI_CONFIG;
export type VideoStorageConfig = typeof VIDEO_STORAGE_CONFIG;
export type VideoMessages = typeof VIDEO_MESSAGES;
export type VideoUIClasses = typeof VIDEO_UI_CLASSES;
export type VideoUploadConfig = typeof VIDEO_UPLOAD_CONFIG;
export type YoutubeConfig = typeof YOUTUBE_CONFIG;
export type VideoCSSConfig = typeof VIDEO_CSS_CONFIG;

// Utility type for video message keys
export type VideoMessageKey = keyof typeof VIDEO_MESSAGES.ERRORS | 
  keyof typeof VIDEO_MESSAGES.SUCCESS | 
  keyof typeof VIDEO_MESSAGES.INFO |
  keyof typeof VIDEO_MESSAGES.LABELS;

// Helper functions with centralized logic
export const VIDEO_HELPERS = {
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  isValidVideoMimeType: (mimeType: string): boolean => 
    VIDEO_FILE_CONFIG.supportedMimeTypes.includes(mimeType as any),
  
  extractYouTubeId: (url: string): string | null => {
    const match = url.match(VIDEO_THUMBNAIL_CONFIG.youtube.urlPattern);
    return match ? match[1] : null;
  },
  
  getYouTubeThumbnail: (videoId: string, quality = VIDEO_THUMBNAIL_CONFIG.youtube.defaultQuality): string => 
    `${YOUTUBE_CONFIG.thumbnail.baseUrl}/${videoId}/${quality}.jpg`,
  
  validateFileSize: (file: File): boolean => 
    file.size <= VIDEO_FILE_CONFIG.maxSize,
  
  getMaxFileSizeDisplay: (): string => 
    VIDEO_HELPERS.formatFileSize(VIDEO_FILE_CONFIG.maxSize),
    
  getProgressPercentage: (loaded: number, total: number): number => 
    Math.round((loaded / total) * VIDEO_UI_CONFIG.progressBar.maxValue),
} as const;