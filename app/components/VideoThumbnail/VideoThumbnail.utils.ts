/**
 * VideoThumbnail Utilities
 * Comprehensive utilities for thumbnail generation, optimization, and management
 */

import { DashboardVideo } from '../VideoGallery/VideoGallery.types';
import { 
  YouTubeThumbnailConfig, 
  DirectThumbnailConfig, 
  ThumbnailSize, 
  AspectRatio,
  ThumbnailMetrics 
} from './VideoThumbnail.types';

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    // youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    // youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([^&\n?#]+)/,
    // youtube.com/embed/VIDEO_ID
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    // youtube.com/v/VIDEO_ID
    /(?:youtube\.com\/v\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generate YouTube thumbnail URL
 */
export function getYouTubeThumbnailUrl(
  videoId: string, 
  quality: YouTubeThumbnailConfig['quality'] = 'hqdefault'
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Get multiple YouTube thumbnail qualities for fallback
 */
export function getYouTubeThumbnailUrls(videoId: string): Array<{
  url: string;
  quality: YouTubeThumbnailConfig['quality'];
  size: { width: number; height: number };
}> {
  return [
    {
      url: getYouTubeThumbnailUrl(videoId, 'maxresdefault'),
      quality: 'maxresdefault' as const,
      size: { width: 1280, height: 720 }
    },
    {
      url: getYouTubeThumbnailUrl(videoId, 'sddefault'),
      quality: 'sddefault' as const,
      size: { width: 640, height: 480 }
    },
    {
      url: getYouTubeThumbnailUrl(videoId, 'hqdefault'),
      quality: 'hqdefault' as const,
      size: { width: 480, height: 360 }
    },
    {
      url: getYouTubeThumbnailUrl(videoId, 'mqdefault'),
      quality: 'mqdefault' as const,
      size: { width: 320, height: 180 }
    },
    {
      url: getYouTubeThumbnailUrl(videoId, 'default'),
      quality: 'default' as const,
      size: { width: 120, height: 90 }
    }
  ];
}

/**
 * Extract thumbnail from video element using canvas
 */
export async function extractVideoFrame(
  videoElement: HTMLVideoElement,
  timeOffset: number = 1,
  quality: number = 0.8,
  format: 'jpeg' | 'webp' | 'png' = 'jpeg'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    // Set canvas dimensions to video dimensions
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Seek to specified time
    const handleSeeked = () => {
      try {
        // Draw video frame to canvas
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const mimeType = `image/${format}`;
        const dataUrl = canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(new Error('Failed to read blob'));
              reader.readAsDataURL(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          mimeType,
          quality
        );
      } catch (error) {
        reject(error);
      } finally {
        videoElement.removeEventListener('seeked', handleSeeked);
      }
    };

    videoElement.addEventListener('seeked', handleSeeked);
    videoElement.currentTime = timeOffset;
  });
}

/**
 * Generate thumbnail for direct upload videos
 */
export async function generateDirectThumbnail(
  videoUrl: string,
  config: DirectThumbnailConfig
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.preload = 'metadata';

    const handleLoadedMetadata = async () => {
      try {
        const thumbnail = await extractVideoFrame(
          video,
          config.timeOffset,
          config.quality / 100,
          config.format
        );
        resolve(thumbnail);
      } catch (error) {
        reject(error);
      } finally {
        cleanup();
      }
    };

    const handleError = () => {
      reject(new Error('Failed to load video metadata'));
      cleanup();
    };

    const cleanup = () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
      video.src = '';
      video.load();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    video.src = videoUrl;
  });
}

/**
 * Get optimal thumbnail URL for video
 */
export function getThumbnailUrl(video: DashboardVideo): string | null {
  // Check if already has thumbnail URL
  if (video.thumbnail_url) {
    return video.thumbnail_url;
  }

  // Generate YouTube thumbnail if YouTube video
  if (video.upload_type === 'youtube') {
    const videoId = extractYouTubeVideoId(video.video_url);
    if (videoId) {
      return getYouTubeThumbnailUrl(videoId, 'hqdefault');
    }
  }

  // For direct uploads without thumbnail, return null
  // (will be handled by placeholder system)
  return null;
}

/**
 * Get thumbnail size configuration
 */
export function getThumbnailSizeConfig(size: ThumbnailSize): {
  width: number;
  height: number;
  className: string;
} {
  const configs = {
    'xs': { width: 64, height: 36, className: 'w-16 h-9' },
    'sm': { width: 96, height: 54, className: 'w-24 h-14' },
    'md': { width: 192, height: 108, className: 'w-48 h-27' },
    'lg': { width: 320, height: 180, className: 'w-80 h-45' },
    'xl': { width: 480, height: 270, className: 'w-120 h-68' },
    '2xl': { width: 640, height: 360, className: 'w-160 h-90' },
    'full': { width: 1280, height: 720, className: 'w-full h-full' },
  };

  return configs[size] || configs.md;
}

/**
 * Get aspect ratio CSS class
 */
export function getAspectRatioClass(aspectRatio: AspectRatio): string {
  const ratios = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    '3/2': 'aspect-[3/2]',
    '21/9': 'aspect-[21/9]',
    'auto': 'aspect-auto',
  };

  return ratios[aspectRatio] || ratios['16/9'];
}

/**
 * Calculate optimal sizes attribute for responsive images
 */
export function calculateOptimalSizes(
  size: ThumbnailSize,
  breakpoints?: { sm?: string; md?: string; lg?: string; xl?: string }
): string {
  const defaultBreakpoints = {
    sm: '100vw',
    md: '50vw',
    lg: '33vw',
    xl: '25vw',
  };

  const bp = { ...defaultBreakpoints, ...breakpoints };

  switch (size) {
    case 'xs':
    case 'sm':
      return `(max-width: 640px) ${bp.sm}, (max-width: 768px) ${bp.md}, 120px`;
    case 'md':
      return `(max-width: 640px) ${bp.sm}, (max-width: 1024px) ${bp.md}, 320px`;
    case 'lg':
      return `(max-width: 768px) ${bp.sm}, (max-width: 1024px) ${bp.md}, 480px`;
    case 'xl':
    case '2xl':
      return `(max-width: 768px) ${bp.sm}, (max-width: 1200px) ${bp.md}, 640px`;
    case 'full':
      return `(max-width: 768px) ${bp.sm}, (max-width: 1200px) ${bp.md}, ${bp.lg}`;
    default:
      return '320px';
  }
}

/**
 * Check if image format is supported
 */
export function isFormatSupported(format: string): boolean {
  const canvas = document.createElement('canvas');
  const supported = canvas.toDataURL(`image/${format}`).indexOf(`image/${format}`) === 5;
  return supported;
}

/**
 * Get WebP fallback URL
 */
export function getWebPFallback(originalUrl: string): string {
  // Implement WebP conversion logic here
  // For now, return original URL
  return originalUrl;
}

/**
 * Optimize thumbnail URL with parameters
 */
export function optimizeThumbnailUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}
): string {
  try {
    const urlObj = new URL(url);
    
    // Add optimization parameters
    if (options.width) {
      urlObj.searchParams.set('w', options.width.toString());
    }
    if (options.height) {
      urlObj.searchParams.set('h', options.height.toString());
    }
    if (options.quality) {
      urlObj.searchParams.set('q', options.quality.toString());
    }
    if (options.format) {
      urlObj.searchParams.set('f', options.format);
    }

    return urlObj.toString();
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}

/**
 * Calculate thumbnail metrics
 */
export function calculateThumbnailMetrics(
  imageData: string,
  loadStartTime: number
): ThumbnailMetrics {
  const loadTime = Date.now() - loadStartTime;
  
  // Estimate file size from base64 data
  let fileSize = 0;
  if (imageData.startsWith('data:')) {
    const base64Data = imageData.split(',')[1];
    if (base64Data) {
      fileSize = Math.round((base64Data.length * 3) / 4);
    }
  }

  return {
    loadTime,
    fileSize,
    dimensions: { width: 0, height: 0 }, // Default dimensions
    format: 'unknown', // Default format
    quality: 80 // Default quality
  };
}

/**
 * Generate cache key for thumbnail
 */
export function generateThumbnailCacheKey(
  video: DashboardVideo,
  options: {
    size?: ThumbnailSize;
    quality?: number;
    format?: string;
  } = {}
): string {
  const parts = [
    video.id,
    video.upload_type,
    options.size || 'default',
    options.quality || 'default',
    options.format || 'default'
  ];

  return parts.join('|');
}

/**
 * Validate thumbnail URL
 */
export async function validateThumbnailUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && !!contentType && contentType.startsWith('image/');
  } catch {
    return false;
  }
}

/**
 * Preload image for better UX
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
}

/**
 * Get gradient CSS for placeholder
 */
export function getPlaceholderGradient(
  from: string = '#F58220',
  to: string = '#005C46',
  direction: 'horizontal' | 'vertical' | 'diagonal-tl' | 'diagonal-tr' = 'diagonal-tl'
): string {
  const directions = {
    horizontal: 'to right',
    vertical: 'to bottom',
    'diagonal-tl': 'to bottom right',
    'diagonal-tr': 'to bottom left',
  };

  return `linear-gradient(${directions[direction]}, ${from}, ${to})`;
}