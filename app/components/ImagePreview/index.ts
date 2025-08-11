/**
 * ImagePreview Component System - Main Export
 * Complete image preview solution with grid, modal, and all features
 */

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
  getResponsiveModalVariants,
  presets
} from './ImagePreview.animations';

// Configuration and utilities
export {
  defaultConfig,
  breakpoints,
  aspectRatios,
  animationPresets,
  themes,
  formatFileSize,
  getOptimalColumns,
  getImageDimensions,
  generateBlurPlaceholder,
  getMotionPreference,
  isTouchDevice,
  getOptimalQuality,
  preloadImage,
  getResponsiveSizes,
  keyboardShortcuts,
  a11yLabels,
  ImagePreviewPerformance
} from './ImagePreview.config';

/**
 * Quick Setup Components
 * Pre-configured components for common use cases
 */

// Gallery with 4:3 aspect ratio and standard columns  
// export const ImageGallery = ImagePreviewWithGrid;

// Pre-configured component exports are available in separate files
// Import from specific component files for pre-configured versions

/**
 * Usage Examples and Quick Start
 * 
 * Basic Gallery:
 * ```tsx
 * import { ImagePreviewWithGrid } from '@/components/ImagePreview';
 * 
 * <ImagePreviewWithGrid 
 *   images={galleryImages}
 *   columns={{ xs: 2, sm: 3, md: 4, lg: 5 }}
 *   aspectRatio="4:3"
 * />
 * ```
 * 
 * Modal Only:
 * ```tsx
 * import { ImagePreviewModal } from '@/components/ImagePreview';
 * 
 * <ImagePreviewModal
 *   image={selectedImage}
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   showNavigation={true}
 *   showInfo={true}
 * />
 * ```
 * 
 * Grid Only:
 * ```tsx
 * import { ImagePreviewGrid } from '@/components/ImagePreview';
 * 
 * <ImagePreviewGrid
 *   images={galleryImages}
 *   onImageClick={(image, index) => handleImageClick(image, index)}
 *   layout="masonry"
 * />
 * ```
 * 
 * Custom Hook:
 * ```tsx
 * import { useImagePreview } from '@/components/ImagePreview';
 * 
 * const {
 *   currentImage,
 *   currentIndex,
 *   isOpen,
 *   openModal,
 *   closeModal,
 *   nextImage,
 *   previousImage
 * } = useImagePreview(images);
 * ```
 */