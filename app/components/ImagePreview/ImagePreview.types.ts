/**
 * ImagePreview Component Types
 * Type definitions for the image preview modal system
 */

// Generic image interface for flexible usage
export interface BaseImage {
  id: string;
  url: string;
  title: string;
  alt?: string;
}

// Helper function to convert BaseImage to GalleryImage
export function baseImageToGalleryImage(baseImage: BaseImage): GalleryImage {
  return {
    id: baseImage.id,
    title: baseImage.title || null,
    image_url: baseImage.url,
    is_active: true,
    order_index: 0,
    alt_text: baseImage.alt
  };
}

// Full gallery image with admin properties
export interface GalleryImage {
  id: string;
  title: string | null;
  image_url: string;
  is_active: boolean;
  order_index: number;
  created_at?: string;
  file_size?: number;
  mime_type?: string;
  alt_text?: string;
}

export interface ImagePreviewProps {
  /** Array of images to preview */
  images: GalleryImage[];
  /** Current selected image index */
  currentIndex: number;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
  /** Navigate to specific image callback */
  onImageChange?: (index: number) => void;
  /** Show/hide navigation controls */
  showNavigation?: boolean;
  /** Show/hide image information overlay */
  showInfo?: boolean;
  /** Auto-close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Enable keyboard navigation */
  enableKeyboard?: boolean;
  /** Custom image quality for modal */
  quality?: number;
}

export interface ImageGridProps {
  /** Array of images to display */
  images: GalleryImage[];
  /** Click handler for image selection */
  onImageClick?: (image: GalleryImage, index: number) => void;
  /** Grid layout columns */
  columns?: {
    xs?: number; // mobile
    sm?: number; // small tablets
    md?: number; // tablets
    lg?: number; // desktop
    xl?: number; // large desktop
  };
  /** Image aspect ratio */
  aspectRatio?: '1:1' | '4:3' | '16:9' | 'auto';
  /** Loading state */
  loading?: boolean;
  /** Empty state configuration */
  emptyState?: {
    title?: string;
    description?: string;
    icon?: string;
  };
  /** Enable lazy loading */
  lazyLoading?: boolean;
  /** Image quality for grid thumbnails */
  thumbnailQuality?: number;
  /** Layout type */
  layout?: 'grid' | 'masonry';
  /** Additional CSS classes */
  className?: string;
}

export interface ImagePreviewWithGridProps {
  /** Array of images to display */
  images: GalleryImage[];
  /** Grid layout columns */
  columns?: {
    xs?: number; // mobile
    sm?: number; // small tablets
    md?: number; // tablets
    lg?: number; // desktop
    xl?: number; // large desktop
  };
  /** Image aspect ratio */
  aspectRatio?: '1:1' | '4:3' | '16:9' | 'auto';
  /** Loading state */
  loading?: boolean;
  /** Empty state configuration */
  emptyState?: {
    title?: string;
    description?: string;
    icon?: string;
  };
  /** Enable lazy loading */
  lazyLoading?: boolean;
  /** Image quality for grid thumbnails */
  thumbnailQuality?: number;
  /** Show navigation controls in modal */
  showNavigation?: boolean;
  /** Show image information in modal */
  showInfo?: boolean;
  /** Enable keyboard navigation in modal */
  enableKeyboard?: boolean;
  /** Image quality for modal */
  modalQuality?: number;
  /** Layout type */
  layout?: 'grid' | 'masonry';
}

export interface ImageCardProps {
  /** Image data */
  image: GalleryImage;
  /** Click handler */
  onClick: () => void;
  /** Image aspect ratio */
  aspectRatio?: '1:1' | '4:3' | '16:9' | 'auto';
  /** Show overlay on hover */
  showOverlay?: boolean;
  /** Enable lazy loading */
  lazyLoading?: boolean;
  /** Image quality */
  quality?: number;
  /** Loading state */
  loading?: boolean;
}

export interface ImageModalProps {
  /** Current image */
  image: GalleryImage | null;
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Navigation handlers */
  onNext?: () => void;
  onPrevious?: () => void;
  /** Show navigation buttons */
  showNavigation?: boolean;
  /** Show image information */
  showInfo?: boolean;
  /** Current image index for display */
  currentIndex?: number;
  /** Total images count */
  totalImages?: number;
}

export interface ImageInfoProps {
  /** Image data */
  image: GalleryImage;
  /** Current index */
  currentIndex?: number;
  /** Total images */
  totalImages?: number;
}

export interface ImageLoadingState {
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: boolean;
  /** Error message */
  errorMessage?: string;
  /** Retry function */
  retry?: () => void;
}

export interface ImagePreviewConfig {
  /** Default image quality */
  quality: number;
  /** Default thumbnail quality */
  thumbnailQuality: number;
  /** Enable blur placeholder */
  enableBlurPlaceholder: boolean;
  /** Animation duration in ms */
  animationDuration: number;
  /** Enable keyboard shortcuts */
  keyboardShortcuts: boolean;
  /** Default grid columns */
  defaultColumns: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export interface ImagePreviewHookReturn {
  /** Current selected image */
  currentImage: GalleryImage | null;
  /** Current index */
  currentIndex: number;
  /** Modal open state */
  isOpen: boolean;
  /** Open modal with specific image */
  openModal: (image: GalleryImage, index: number) => void;
  /** Close modal */
  closeModal: () => void;
  /** Navigate to next image */
  nextImage: () => void;
  /** Navigate to previous image */
  previousImage: () => void;
  /** Navigate to specific image */
  goToImage: (index: number) => void;
  /** Check if navigation is available */
  canNavigate: {
    next: boolean;
    previous: boolean;
  };
}

export type ImageAspectRatio = '1:1' | '4:3' | '16:9' | 'auto';

export type ImagePreviewSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ImagePreviewTheme {
  /** Background colors */
  backdrop: string;
  modal: string;
  overlay: string;
  /** Border radius */
  borderRadius: string;
  /** Animation easing */
  easing: string;
  /** Focus ring colors */
  focusRing: string;
}