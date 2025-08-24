

// Main components
export {
  ImagePreview,
  ImagePreviewWithGrid,
  ImagePreviewGrid,
  ImagePreviewModal,
  default as ImagePreviewSystem
} from './ImagePreview';

// Grid components
export {
  ImageGrid,
  ImageCard,
  ImageMasonryGrid
} from './ImagePreview.Grid';

// Modal components
export {
  ImageModal
} from './ImagePreview.Modal';

// Hooks
export {
  useImagePreview,
  useKeyboardNavigation,
  useFocusManagement,
  useBodyScrollLock,
  useImageLoading,
  useLazyLoading,
  useSwipeNavigation,
  useImagePreloading,
  useResponsiveModal
} from './ImagePreview.hooks';

// Types
export type {
  GalleryImage,
  ImagePreviewProps,
  ImageGridProps,
  ImageCardProps,
  ImageModalProps,
  ImageInfoProps,
  ImageLoadingState,
  ImagePreviewConfig,
  ImagePreviewHookReturn,
  ImageAspectRatio,
  ImagePreviewSize,
  ImagePreviewTheme
} from './ImagePreview.types';

// Animations
export {
  easings,
  backdropVariants,
  modalVariants,
  mobileModalVariants,
  imageVariants,
  imageLoadingVariants,
  navButtonVariants,
  infoOverlayVariants,
  cardHoverVariants,
  overlayVariants,
  skeletonVariants,
  zoomVariants,
  slideVariants,
  gridContainerVariants,
  gridItemVariants,
  focusRingVariants,
  GetResponsiveModalVariants,
  presets
} from './ImagePreview.animations';

// Configuration and utilities
export {
  defaultConfig,
  breakpoints,
  aspectRatios,
  animationPresets,
  themes,
  FormatFileSize,
  GetOptimalColumns,
  GetImageDimensions,
  GenerateBlurPlaceholder,
  GetMotionPreference,
  IsTouchDevice,
  GetOptimalQuality,
  PreloadImage,
  GetResponsiveSizes,
  keyboardShortcuts,
  a11yLabels,
  ImagePreviewPerformance
} from './ImagePreview.config';

// Gallery with 4:3 aspect ratio and standard columns  
// export const ImageGallery = ImagePreviewWithGrid;

// Pre-configured component exports are available in separate files
// Import from specific component files for pre-configured versions

