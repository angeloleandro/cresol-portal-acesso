/**
 * VideoThumbnail System - Main Export File
 * Comprehensive thumbnail system for video gallery
 */

// Main Components
export { default as VideoThumbnail } from './VideoThumbnail';
export {
  ThumbnailPlaceholder,
  LoadingThumbnailPlaceholder,
  ErrorThumbnailPlaceholder,
  CompactThumbnailPlaceholder
} from './VideoThumbnail.Placeholder';

// Performance Components
export {
  ThumbnailPerformanceProvider,
  ProgressiveImage,
  ThumbnailPerformanceMonitor,
  useThumbnailPerformance,
  useBatchThumbnailPreloader,
  defaultPerformanceConfig
} from './VideoThumbnail.Performance';

// Accessibility Components
export {
  AccessibleVideoThumbnail,
  VideoGallerySkipLinks,
  LiveRegion,
  NavigationInstructions,
  LoadingAnnouncement,
  useVideoThumbnailAccessibility,
  generateAccessibleAltText,
  defaultAccessibilityConfig
} from './VideoThumbnail.Accessibility';

// Advanced Features
export {
  AdvancedVideoThumbnail,
  MultiEffectThumbnail
} from './VideoThumbnail.Advanced';

// Hooks
export {
  useThumbnail,
  useThumbnailLazyLoading,
  useThumbnailGenerator,
  useThumbnailCache,
  useThumbnailPreloading
} from './VideoThumbnail.hooks';

// Utilities
export {
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
  getYouTubeThumbnailUrls,
  extractVideoFrame,
  generateDirectThumbnail,
  getThumbnailUrl,
  getThumbnailSizeConfig,
  getAspectRatioClass,
  calculateOptimalSizes,
  isFormatSupported,
  getWebPFallback,
  optimizeThumbnailUrl,
  calculateThumbnailMetrics,
  generateThumbnailCacheKey,
  validateThumbnailUrl,
  preloadImage,
  getPlaceholderGradient
} from './VideoThumbnail.utils';

// Types
export type {
  VideoThumbnailProps,
  BaseThumbnailProps,
  AspectRatio,
  ThumbnailVariant,
  ThumbnailSize,
  PlaceholderConfig,
  PlaceholderVariant,
  GradientConfig,
  IconConfig,
  OverlayConfig,
  OverlayVariant,
  ThumbnailState,
  ThumbnailGenerationConfig,
  YouTubeThumbnailConfig,
  DirectThumbnailConfig,
  FallbackThumbnailConfig,
  ThumbnailPerformanceConfig,
  LazyLoadingConfig,
  PreloadingConfig,
  CachingConfig,
  CompressionConfig,
  UseThumbnailReturn,
  UseThumbnailGeneratorReturn,
  ThumbnailMetrics,
  ThumbnailAnimationConfig,
  ThumbnailAccessibilityConfig,
  ThumbnailError,
  ThumbnailProviderValue,
  ThumbnailProviderProps
} from './VideoThumbnail.types';

// Advanced Types
export type {
  AdvancedHoverConfig,
  DurationOverlayConfig,
  AdvancedAspectRatioConfig,
  MultiEffectThumbnailProps
} from './VideoThumbnail.Advanced';