/**
 * ImagePreview Configuration and Utilities
 * Default configurations and helper functions
 */

import { ImagePreviewConfig } from './ImagePreview.types';

/**
 * Default configuration for ImagePreview components
 */
export const defaultConfig: ImagePreviewConfig = {
  // Image quality settings
  quality: 90, // High quality for modal images
  thumbnailQuality: 75, // Balanced quality/performance for thumbnails
  
  // Performance settings
  enableBlurPlaceholder: true,
  animationDuration: 300,
  keyboardShortcuts: true,
  
  // Grid layout defaults
  defaultColumns: {
    xs: 2,  // Mobile
    sm: 3,  // Small tablets
    md: 4,  // Tablets
    lg: 5,  // Desktop
    xl: 6   // Large desktop
  }
};

/**
 * Responsive breakpoints for grid columns
 */
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
} as const;

/**
 * Aspect ratio configurations
 */
export const aspectRatios = {
  '1:1': {
    className: 'aspect-square',
    ratio: 1,
    description: 'Quadrado - ideal para avatares e ícones'
  },
  '4:3': {
    className: 'aspect-[4/3]',
    ratio: 4/3,
    description: 'Paisagem padrão - ideal para fotos gerais'
  },
  '16:9': {
    className: 'aspect-video',
    ratio: 16/9,
    description: 'Widescreen - ideal para banners e mídia'
  },
  'auto': {
    className: '',
    ratio: null,
    description: 'Automático - preserva proporção original'
  }
} as const;

/**
 * Animation presets for different performance scenarios
 */
export const animationPresets = {
  // High-end devices with good performance
  premium: {
    duration: 400,
    easing: [0.25, 0.46, 0.45, 0.94],
    enableSpring: true,
    enableBlur: true
  },
  
  // Standard configuration for most devices
  standard: {
    duration: 300,
    easing: [0.4, 0, 0.2, 1],
    enableSpring: false,
    enableBlur: true
  },
  
  // Reduced motion for accessibility or low-end devices
  reduced: {
    duration: 200,
    easing: [0.4, 0, 0.2, 1],
    enableSpring: false,
    enableBlur: false
  },
  
  // No animations for users with motion sensitivity
  none: {
    duration: 0,
    easing: [0, 0, 1, 1],
    enableSpring: false,
    enableBlur: false
  }
} as const;

/**
 * Theme configurations
 */
export const themes = {
  default: {
    backdrop: 'rgba(0, 0, 0, 0.7)',
    modal: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '0.375rem', // 6px
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    focusRing: 'rgba(245, 130, 32, 0.2)' // Primary color with opacity
  },
  
  dark: {
    backdrop: 'rgba(0, 0, 0, 0.9)',
    modal: '#1f2937',
    overlay: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '0.375rem',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    focusRing: 'rgba(245, 130, 32, 0.3)'
  },
  
  minimal: {
    backdrop: 'rgba(0, 0, 0, 0.5)',
    modal: '#ffffff',
    overlay: 'transparent',
    borderRadius: '0',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    focusRing: 'rgba(245, 130, 32, 0.2)'
  }
} as const;

/**
 * File size formatting utility
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

/**
 * Get optimal grid columns based on screen width
 */
export function getOptimalColumns(width: number) {
  if (width < breakpoints.sm) return defaultConfig.defaultColumns.xs;
  if (width < breakpoints.md) return defaultConfig.defaultColumns.sm;
  if (width < breakpoints.lg) return defaultConfig.defaultColumns.md;
  if (width < breakpoints.xl) return defaultConfig.defaultColumns.lg;
  return defaultConfig.defaultColumns.xl;
}

/**
 * Get image dimensions for optimal loading
 */
export function getImageDimensions(
  aspectRatio: string,
  containerWidth: number,
  maxHeight: number = 800
): { width: number; height: number } {
  let ratio: number;
  
  switch (aspectRatio) {
    case '1:1':
      ratio = 1;
      break;
    case '4:3':
      ratio = 4/3;
      break;
    case '16:9':
      ratio = 16/9;
      break;
    default:
      ratio = 4/3; // fallback
  }
  
  const width = containerWidth;
  const height = Math.min(containerWidth / ratio, maxHeight);
  
  return { width, height };
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurPlaceholder(
  width: number = 8, 
  height: number = 6,
  color: string = '#f3f4f6'
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    // Fallback base64 blur placeholder
    return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
  }
  
  canvas.width = width;
  canvas.height = height;
  
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

/**
 * Detect user's motion preference
 */
export function getMotionPreference(): keyof typeof animationPresets {
  if (typeof window === 'undefined') return 'standard';
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.matches) return 'reduced';
  
  // Detect device performance (rough estimation)
  const connection = (navigator as any).connection;
  if (connection && connection.effectiveType === '4g') {
    return 'premium';
  }
  
  return 'standard';
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Get optimal image quality based on connection speed
 */
export function getOptimalQuality(): { grid: number; modal: number } {
  if (typeof navigator === 'undefined') {
    return { grid: 75, modal: 90 };
  }
  
  const connection = (navigator as any).connection;
  
  if (!connection) {
    return { grid: 75, modal: 90 };
  }
  
  switch (connection.effectiveType) {
    case 'slow-2g':
      return { grid: 50, modal: 70 };
    case '2g':
      return { grid: 60, modal: 75 };
    case '3g':
      return { grid: 70, modal: 85 };
    case '4g':
    default:
      return { grid: 80, modal: 95 };
  }
}

/**
 * Preload image utility
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Get responsive sizes attribute for images
 */
export function getResponsiveSizes(
  context: 'grid' | 'modal' | 'thumbnail',
  columns?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
): string {
  switch (context) {
    case 'modal':
      return '90vw';
      
    case 'thumbnail':
      return '(max-width: 640px) 25vw, (max-width: 768px) 20vw, 15vw';
      
    case 'grid':
    default:
      if (!columns) {
        return '(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw';
      }
      
      const xs = 100 / (columns.xs || 2);
      const sm = 100 / (columns.sm || 3);
      const md = 100 / (columns.md || 4);
      const lg = 100 / (columns.lg || 5);
      
      return `(max-width: 640px) ${xs}vw, (max-width: 768px) ${sm}vw, (max-width: 1024px) ${md}vw, ${lg}vw`;
  }
}

/**
 * Keyboard shortcuts configuration
 */
export const keyboardShortcuts = {
  close: ['Escape'],
  next: ['ArrowRight', 'KeyL', 'KeyJ'],
  previous: ['ArrowLeft', 'KeyH', 'KeyK'],
  zoom: ['Space'],
  info: ['KeyI'],
  download: ['KeyD']
} as const;

/**
 * Accessibility labels
 */
export const a11yLabels = {
  modal: 'Preview de imagem',
  close: 'Fechar preview',
  next: 'Próxima imagem',
  previous: 'Imagem anterior',
  zoom: 'Ampliar imagem',
  download: 'Baixar imagem',
  counter: (current: number, total: number) => `Imagem ${current} de ${total}`,
  loading: 'Carregando imagem...',
  error: 'Erro ao carregar imagem'
} as const;

/**
 * Performance monitoring
 */
export class ImagePreviewPerformance {
  private static metrics: Record<string, number> = {};
  
  static startTimer(key: string): void {
    this.metrics[key] = performance.now();
  }
  
  static endTimer(key: string): number {
    const start = this.metrics[key];
    if (!start) return 0;
    
    const duration = performance.now() - start;
    delete this.metrics[key];
    return duration;
  }
  
  static logMetric(operation: string, duration: number): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ImagePreview] ${operation}: ${duration.toFixed(2)}ms`);
    }
  }
}

export default defaultConfig;