import { DashboardVideo } from '@/app/types/video';




export interface BaseThumbnailProps {
  video: DashboardVideo;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

export interface VideoThumbnailProps extends BaseThumbnailProps {
  aspectRatio?: AspectRatio;
  variant?: ThumbnailVariant;
  showOverlay?: boolean;
  showDuration?: boolean;
  showBadge?: boolean;
  onClick?: (video: DashboardVideo) => void;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: PlaceholderConfig;
  overlay?: OverlayConfig;
}

export type AspectRatio = 
  | '16/9'     // Padrão YouTube/vídeo
  | '4/3'      // Formato clássico
  | '1/1'      // Quadrado
  | '3/2'      // Formato fotográfico
  | '21/9'     // Cinemascope
  | 'auto';    // Mantém proporção original

export type ThumbnailVariant = 
  | 'default'   // Thumbnail padrão
  | 'compact'   // Versão compacta para listas
  | 'hero'      // Versão destacada/principal
  | 'card'      // Para uso em cards
  | 'minimal'   // Versão minimalista
  | 'preview';  // Para preview/hover

export type ThumbnailSize = 
  | 'xs'        // 64x36
  | 'sm'        // 96x54  
  | 'md'        // 192x108
  | 'lg'        // 320x180
  | 'xl'        // 480x270
  | '2xl'       // 640x360
  | 'full';     // Tamanho completo

export interface PlaceholderConfig {
  variant?: PlaceholderVariant;
  gradient?: GradientConfig;
  icon?: IconConfig;
  text?: string;
  animated?: boolean;
}

export type PlaceholderVariant = 
  | 'solid'     // Cor sólida
  | 'gradient'  // Gradiente suave
  | 'pattern'   // Padrão geométrico
  | 'blur'      // Efeito blur
  | 'skeleton'; // Loading skeleton

export interface GradientConfig {
  from: string;
  to: string;
  via?: string;
  direction?: 'horizontal' | 'vertical' | 'diagonal-tl' | 'diagonal-tr';
}

export interface IconConfig {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  animated?: boolean;
}

export interface OverlayConfig {
  variant?: OverlayVariant;
  opacity?: number;
  gradient?: boolean;
  content?: React.ReactNode;
}

export type OverlayVariant = 
  | 'none'      // Sem overlay
  | 'hover'     // Aparece no hover
  | 'always'    // Sempre visível
  | 'focus';    // Aparece no focus

export interface ThumbnailState {
  loading: boolean;
  error: boolean;
  loaded: boolean;
  retryCount: number;
}

export interface ThumbnailGenerationConfig {
  youtube: YouTubeThumbnailConfig;
  direct: DirectThumbnailConfig;
  fallback: FallbackThumbnailConfig;
}

export interface YouTubeThumbnailConfig {
  quality: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault';
  fallbackQualities: Array<YouTubeThumbnailConfig['quality']>;
  timeout: number;
}

export interface DirectThumbnailConfig {
  extractionMethod: 'canvas' | 'video-frame' | 'ffmpeg';
  timeOffset: number; // Tempo em segundos para extração
  quality: number;    // Qualidade JPEG (0-100)
  format: 'jpeg' | 'webp' | 'png';
  sizes: ThumbnailSize[];
  caching: boolean;
}

export interface FallbackThumbnailConfig {
  variant: PlaceholderVariant;
  gradient: GradientConfig;
  retryAttempts: number;
  retryDelay: number;
}

export interface ThumbnailPerformanceConfig {
  lazyLoading: LazyLoadingConfig;
  preloading: PreloadingConfig;
  caching: CachingConfig;
  compression: CompressionConfig;
}

export interface LazyLoadingConfig {
  enabled: boolean;
  threshold: number;     // Distância em pixels para começar carregamento
  rootMargin: string;    // Margin do IntersectionObserver
  triggerOnce: boolean;  // Carregar apenas uma vez
}

export interface PreloadingConfig {
  enabled: boolean;
  priorityCount: number; // Quantos thumbnails priorizar
  adjacentCount: number; // Quantos adjacentes precarregar
  strategy: 'viewport' | 'sequential' | 'smart';
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number;          // Time to live em segundos
  maxSize: number;      // Máximo de itens no cache
  storage: 'memory' | 'localStorage' | 'indexedDB';
}

export interface CompressionConfig {
  webp: {
    enabled: boolean;
    quality: number;
    fallback: boolean;
  };
  jpeg: {
    quality: number;
    progressive: boolean;
  };
  png: {
    enabled: boolean;
  };
}

// Hooks types
export interface UseThumbnailReturn {
  src: string | null;
  state: ThumbnailState;
  retry: () => void;
  preload: () => void;
}

export interface UseThumbnailGeneratorReturn {
  generateThumbnail: (video: DashboardVideo) => Promise<string>;
  extractVideoFrame: (videoElement: HTMLVideoElement, time?: number) => Promise<string>;
  getYouTubeThumbnail: (videoId: string, quality?: YouTubeThumbnailConfig['quality']) => string;
  isGenerating: boolean;
  error: string | null;
}

export interface ThumbnailMetrics {
  loadTime: number;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };
  format: string;
  quality: number;
}

// Animation types
export interface ThumbnailAnimationConfig {
  entrance: {
    type: 'fade' | 'scale' | 'slide' | 'blur';
    duration: number;
    delay?: number;
  };
  hover: {
    enabled: boolean;
    scale?: number;
    opacity?: number;
    duration: number;
  };
  loading: {
    type: 'skeleton' | 'pulse' | 'shimmer' | 'spinner';
    speed: 'slow' | 'normal' | 'fast';
  };
}

// Accessibility types
export interface ThumbnailAccessibilityConfig {
  altText: {
    template: string;
    includeType: boolean;
    includeDuration: boolean;
  };
  focusIndicator: {
    enabled: boolean;
    color: string;
    width: number;
  };
  highContrast: {
    enabled: boolean;
    threshold: number;
  };
}

// Error handling
export interface ThumbnailError {
  type: 'network' | 'format' | 'generation' | 'timeout' | 'quota';
  message: string;
  video: DashboardVideo;
  timestamp: number;
  recoverable: boolean;
  retryable: boolean;
}

// Context types
export interface ThumbnailProviderValue {
  config: ThumbnailPerformanceConfig;
  generateThumbnail: (video: DashboardVideo) => Promise<string>;
  cache: Map<string, string>;
  metrics: Map<string, ThumbnailMetrics>;
  errors: ThumbnailError[];
}

export interface ThumbnailProviderProps {
  children: React.ReactNode;
  config?: Partial<ThumbnailPerformanceConfig>;
}