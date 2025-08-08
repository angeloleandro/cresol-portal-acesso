/**
 * VideoGallery Module Exports
 * Enterprise-grade video gallery system
 */

// Main Components
export { VideoGalleryRoot as default } from './VideoGallery.Root';
export { VideoGalleryRoot } from './VideoGallery.Root';
export { CompactVideoGallery } from './VideoGallery.Root';

// Sub-components
export { VideoGalleryGrid, GridSystem, useGridLayout } from './VideoGallery.Grid';
import { GridSystem } from './VideoGallery.Grid';
import { DashboardVideo } from '../../types/video';
export { 
  EnhancedVideoCard, 
  AdminVideoCard,
  SkeletonVideoCard, 
  EmptyVideoCard,
  CompactVideoCard 
} from './VideoGallery.Card';
export { VideoModal, CompactVideoModal } from './VideoGallery.Modal';
export { VideoPlayer } from './VideoGallery.Player';
export { 
  VideoGalleryHeader, 
  CompactVideoGalleryHeader,
  AdvancedVideoGalleryHeader,
  VideoGalleryStatsHeader 
} from './VideoGallery.Header';
export { 
  VideoGalleryLoadingState,
  SkeletonVideoCard as VideoGallerySkeletonCard,
  VideoGalleryHeaderSkeleton,
  VideoModalLoadingState,
  ProgressiveLoading 
} from './VideoGallery.LoadingState';
export { 
  VideoGalleryEmptyState,
  CompactEmptyState,
  InlineEmptyState,
  ErrorRecoveryEmptyState 
} from './VideoGallery.EmptyState';

// Hooks
export {
  useVideoGallery,
  useKeyboardNavigation,
  useEscapeKey,
  useInView,
  useFocusManagement,
  usePerformanceMonitor,
  useDebounce,
  useImagePreload
} from './VideoGallery.hooks';

// Types
export type {
  DashboardVideo,
  VideoGalleryProps,
  VideoCardProps,
  VideoModalProps,
  VideoPlayerProps,
  GridLayoutType,
  GridLayoutConfig,
  VideoGalleryState,
  VideoGalleryActions,
  AnimationVariants,
  ModalAnimationVariants,
  AccessibilityProps,
  KeyboardNavigationConfig,
  VirtualizationConfig,
  LazyLoadingConfig,
  VideoError,
  VideoSystemTokens
} from './VideoGallery.types';
export type { AdminVideoCardProps } from './VideoGallery.Card';

// Animations
export {
  cardAnimations,
  modalAnimations,
  containerAnimations,
  headerAnimations,
  loadingAnimations,
  thumbnailAnimations,
  playButtonAnimations,
  badgeAnimations,
  errorAnimations,
  successAnimations,
  scrollAnimations,
  transitions,
  easingCurves,
  pageTransitions,
  animationPresets,
  createSlideAnimation,
  createStaggerAnimation,
  createScaleAnimation
} from './VideoGallery.animations';

// Constants and Utilities
export const VIDEO_GALLERY_CONFIG = {
  DEFAULT_LIMIT: 4,
  VIRTUALIZATION_THRESHOLD: 20,
  PRELOAD_THRESHOLD: 4,
  ANIMATION_DURATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  GRID_LAYOUTS: {
    SINGLE: 'single-centered',
    DUAL: 'dual-columns', 
    ASYMMETRIC: 'asymmetric-3',
    RESPONSIVE: 'responsive-grid'
  } as const
};

// Utility functions
export const videoGalleryUtils = {
  /**
   * Determine optimal grid layout based on video count
   */
  getOptimalLayout: (count: number, limit?: number) => {
    return GridSystem.getGridLayout(count, limit);
  },

  /**
   * Calculate performance score based on metrics
   */
  calculatePerformanceScore: (metrics: {
    renderTime: number;
    videoCount: number;
    errorCount: number;
  }) => {
    const { renderTime, videoCount, errorCount } = metrics;
    let score = 100;
    
    // Penalize slow renders
    if (renderTime > 16) score -= Math.min(30, (renderTime - 16) * 2);
    
    // Penalize errors
    score -= errorCount * 10;
    
    // Bonus for handling many videos efficiently
    if (videoCount > 10 && renderTime < 50) score += 10;
    
    return Math.max(0, Math.min(100, score));
  },

  /**
   * Generate accessibility attributes
   */
  getAccessibilityProps: (video: DashboardVideo, index: number) => ({
    'aria-label': `Vídeo ${index + 1}: ${video.title}`,
    'aria-describedby': `video-${video.id}-description`,
    'role': 'button',
    'tabIndex': 0
  }),

  /**
   * Determine if video should use priority loading
   */
  shouldPrioritize: (index: number, limit: number = 4) => {
    return index < Math.min(4, limit);
  },

  /**
   * Format video metadata for display
   */
  formatVideoMeta: (video: DashboardVideo) => {
    const meta = [];
    
    if (video.upload_type) {
      meta.push(video.upload_type === 'youtube' ? 'YouTube' : 'Upload direto');
    }
    
    if (video.file_size) {
      const sizes = ['B', 'KB', 'MB', 'GB'];
      let size = video.file_size;
      let sizeIndex = 0;
      
      while (size >= 1024 && sizeIndex < sizes.length - 1) {
        size /= 1024;
        sizeIndex++;
      }
      
      meta.push(`${size.toFixed(1)} ${sizes[sizeIndex]}`);
    }
    
    if (video.created_at) {
      try {
        const date = new Date(video.created_at);
        meta.push(date.toLocaleDateString('pt-BR'));
      } catch {
        // Ignore invalid dates
      }
    }
    
    return meta.join(' • ');
  }
};

/**
 * VideoGallery Context Provider (optional)
 */
import { createContext, useContext } from 'react';

interface VideoGalleryContextValue {
  enableAnimations: boolean;
  enableVirtualization: boolean;
  performanceMode: 'low' | 'normal' | 'high';
  errorReporting: (error: Error, context: string) => void;
}

const VideoGalleryContext = createContext<VideoGalleryContextValue | null>(null);

export const useVideoGalleryContext = () => {
  const context = useContext(VideoGalleryContext);
  if (!context) {
    // Return defaults if no provider
    return {
      enableAnimations: true,
      enableVirtualization: false,
      performanceMode: 'normal' as const,
      errorReporting: (error: Error, context: string) => {
        console.error(`VideoGallery Error [${context}]:`, error);
      }
    };
  }
  return context;
};

export const VideoGalleryProvider = VideoGalleryContext.Provider;