/**
 * VideoGallery Type Definitions
 * Enterprise-grade TypeScript interfaces for video gallery system
 */

export interface DashboardVideo {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  is_active: boolean;
  order_index: number;
  upload_type: 'youtube' | 'vimeo' | 'direct';
  file_path?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  original_filename?: string | null;
  processing_status?: string;
  upload_progress?: number;
  created_at?: string;
}

export interface VideoGalleryProps {
  limit?: number;
  className?: string;
  showHeader?: boolean;
  showSeeAll?: boolean;
  virtualizeAt?: number;
}

export interface VideoCardProps {
  video: DashboardVideo;
  onClick: (video: DashboardVideo) => void;
  index?: number;
  priority?: boolean;
  className?: string;
}

export interface VideoModalProps {
  isOpen: boolean;
  video: DashboardVideo | null;
  onClose: () => void;
}

export interface VideoPlayerProps {
  video: DashboardVideo;
  autoplay?: boolean;
  controls?: boolean;
  className?: string;
}

export interface GridLayoutConfig {
  name: string;
  gridClass: string;
  containerClass?: string;
  maxVideos?: number;
}

export type GridLayoutType = 
  | 'single-centered' 
  | 'dual-columns' 
  | 'asymmetric-3' 
  | 'responsive-grid';

export interface VideoGalleryState {
  videos: DashboardVideo[];
  loading: boolean;
  error: string | null;
  selectedVideo: DashboardVideo | null;
  modalOpen: boolean;
  videoError: string | null;
  videoUrl: string | null;
  urlLoading: boolean;
}

export interface VideoGalleryActions {
  setVideos: (videos: DashboardVideo[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  openModal: (video: DashboardVideo) => void;
  closeModal: () => void;
  setVideoError: (error: string | null) => void;
  setVideoUrl: (url: string | null) => void;
  setUrlLoading: (loading: boolean) => void;
}

// Animation variants types
export interface AnimationVariants {
  hidden: {
    opacity: number;
    y?: number;
    scale?: number;
  };
  visible: (index?: number) => {
    opacity: number;
    y?: number;
    scale?: number;
    transition: {
      delay?: number;
      duration: number;
      ease: string | number[];
    };
  };
  hover?: {
    y?: number;
    scale?: number;
    transition: {
      duration: number;
      ease: string;
    };
  };
  tap?: {
    scale?: number;
    transition: {
      duration: number;
    };
  };
}

export interface ModalAnimationVariants {
  backdrop: {
    hidden: { opacity: number };
    visible: { 
      opacity: number;
      transition: { duration: number };
    };
    exit: { 
      opacity: number;
      transition: { duration: number; delay?: number };
    };
  };
  modal: {
    hidden: { 
      opacity: number;
      scale: number;
      y: number;
    };
    visible: { 
      opacity: number;
      scale: number;
      y: number;
      transition: {
        duration: number;
        ease: string | number[];
      };
    };
    exit: { 
      opacity: number;
      scale: number;
      y: number;
      transition: { duration: number };
    };
  };
}

// Accessibility interfaces
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  role?: string;
  tabIndex?: number;
}

export interface KeyboardNavigationConfig {
  selectedIndex: number;
  totalItems: number;
  onSelect: (index: number) => void;
  onAction: (video: DashboardVideo) => void;
  onEscape?: () => void;
}

// Performance optimization types
export interface VirtualizationConfig {
  threshold: number;
  estimateSize: () => number;
  overscan: number;
  enableVirtualization: boolean;
}

export interface LazyLoadingConfig {
  rootMargin: string;
  threshold: number;
  triggerOnce: boolean;
}

// Error handling types
export interface VideoError {
  type: 'loading' | 'playback' | 'network' | 'format';
  message: string;
  recoverable: boolean;
  retryAction?: () => void;
}

// Design tokens interface
export interface VideoSystemTokens {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    neutral: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}