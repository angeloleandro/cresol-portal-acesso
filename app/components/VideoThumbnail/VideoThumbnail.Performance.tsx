/**
 * VideoThumbnail Performance Components
 * Advanced performance optimizations for thumbnail system
 */

"use client";

import { 
  useState, 
  useEffect, 
  useCallback, 
  useRef, 
  useMemo,
  createContext,
  useContext,
  ReactNode 
} from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { 
  ThumbnailPerformanceConfig,
  ThumbnailProviderValue,
  ThumbnailProviderProps,
  ThumbnailMetrics,
  ThumbnailError
} from './VideoThumbnail.types';
import { DashboardVideo } from '../VideoGallery/VideoGallery.types';
import { 
  generateThumbnailCacheKey,
  isFormatSupported,
  preloadImage,
  calculateThumbnailMetrics
} from './VideoThumbnail.utils';
import { useThumbnailCache } from './VideoThumbnail.hooks';

// Default performance configuration
const defaultPerformanceConfig: ThumbnailPerformanceConfig = {
  lazyLoading: {
    enabled: true,
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true
  },
  preloading: {
    enabled: true,
    priorityCount: 6,
    adjacentCount: 3,
    strategy: 'smart'
  },
  caching: {
    enabled: true,
    ttl: 3600000, // 1 hour
    maxSize: 100,
    storage: 'memory'
  },
  compression: {
    webp: {
      enabled: true,
      quality: 80,
      fallback: true
    },
    jpeg: {
      quality: 85,
      progressive: true
    },
    png: {
      enabled: false
    }
  }
};

// Performance Context
const ThumbnailPerformanceContext = createContext<ThumbnailProviderValue | null>(null);

/**
 * Performance Provider Component
 */
export function ThumbnailPerformanceProvider({
  children,
  config = {}
}: ThumbnailProviderProps) {
  const finalConfig = useMemo(() => ({
    ...defaultPerformanceConfig,
    ...config,
    lazyLoading: { ...defaultPerformanceConfig.lazyLoading, ...config.lazyLoading },
    preloading: { ...defaultPerformanceConfig.preloading, ...config.preloading },
    caching: { ...defaultPerformanceConfig.caching, ...config.caching },
    compression: {
      ...defaultPerformanceConfig.compression,
      ...config.compression,
      webp: { ...defaultPerformanceConfig.compression.webp, ...config.compression?.webp },
      jpeg: { ...defaultPerformanceConfig.compression.jpeg, ...config.compression?.jpeg },
      png: { ...defaultPerformanceConfig.compression.png, ...config.compression?.png }
    }
  }), [config]);

  // Cache management
  const { get: getCache, set: setCache } = useThumbnailCache(
    finalConfig.caching.maxSize,
    finalConfig.caching.ttl
  );

  // Metrics tracking
  const metricsRef = useRef(new Map<string, ThumbnailMetrics>());
  const errorsRef = useRef<ThumbnailError[]>([]);

  // WebP support detection
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (finalConfig.compression.webp.enabled) {
      setWebpSupported(isFormatSupported('webp'));
    }
  }, [finalConfig.compression.webp.enabled]);

  // Generate optimized thumbnail
  const generateThumbnail = useCallback(async (video: DashboardVideo): Promise<string> => {
    const startTime = Date.now();
    const cacheKey = generateThumbnailCacheKey(video, {
      format: webpSupported ? 'webp' : 'jpeg',
      quality: webpSupported ? finalConfig.compression.webp.quality : finalConfig.compression.jpeg.quality
    });

    // Check cache first
    if (finalConfig.caching.enabled) {
      const cached = getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Generate or fetch thumbnail URL
      let thumbnailUrl = video.thumbnail_url;

      // For YouTube videos, construct optimal URL
      if (!thumbnailUrl && video.upload_type === 'youtube') {
        const videoId = extractVideoId(video.video_url);
        if (videoId) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      }

      if (!thumbnailUrl) {
        throw new Error('No thumbnail URL available');
      }

      // Apply optimizations if supported
      const optimizedUrl = optimizeThumbnailUrl(thumbnailUrl, {
        webp: webpSupported ? finalConfig.compression.webp.enabled : undefined,
        quality: webpSupported ? finalConfig.compression.webp.quality : finalConfig.compression.jpeg.quality,
        progressive: finalConfig.compression.jpeg.progressive
      });

      // Cache the result
      if (finalConfig.caching.enabled) {
        const partialMetrics = calculateThumbnailMetrics(optimizedUrl, startTime);
        setCache(cacheKey, optimizedUrl); // metrics are optional in cache
        if (partialMetrics.loadTime !== undefined && partialMetrics.fileSize !== undefined) {
          // Only store complete metrics
          const completeMetrics: ThumbnailMetrics = {
            loadTime: partialMetrics.loadTime,
            fileSize: partialMetrics.fileSize,
            dimensions: { width: 0, height: 0 }, // Default values
            format: finalConfig.compression.webp.enabled ? 'webp' : 'jpeg',
            quality: webpSupported ? finalConfig.compression.webp.quality : finalConfig.compression.jpeg.quality
          };
          metricsRef.current.set(cacheKey, completeMetrics);
        }
      }

      return optimizedUrl;

    } catch (error) {
      // Track error
      const thumbnailError: ThumbnailError = {
        type: 'generation',
        message: error instanceof Error ? error.message : 'Unknown error',
        video,
        timestamp: Date.now(),
        recoverable: true,
        retryable: true
      };
      errorsRef.current.push(thumbnailError);

      throw error;
    }
  }, [
    webpSupported,
    finalConfig.caching.enabled,
    finalConfig.compression,
    getCache,
    setCache
  ]);

  const contextValue: ThumbnailProviderValue = {
    config: finalConfig,
    generateThumbnail,
    cache: new Map(), // Simplified for context
    metrics: metricsRef.current,
    errors: errorsRef.current
  };

  return (
    <ThumbnailPerformanceContext.Provider value={contextValue}>
      {children}
    </ThumbnailPerformanceContext.Provider>
  );
}

/**
 * Hook to use performance context
 */
export function useThumbnailPerformance() {
  const context = useContext(ThumbnailPerformanceContext);
  if (!context) {
    throw new Error('useThumbnailPerformance must be used within ThumbnailPerformanceProvider');
  }
  return context;
}

/**
 * Progressive Image Loading Component
 */
interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function ProgressiveImage({
  src,
  alt,
  className,
  sizes,
  quality = 80,
  placeholder,
  onLoad,
  onError
}: ProgressiveImageProps) {
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageData, setImageData] = useState<{
    lowRes?: string;
    highRes?: string;
  }>({});

  const imgRef = useRef<HTMLImageElement>(null);

  // Generate low-res placeholder
  const lowResUrl = useMemo(() => {
    if (placeholder) return placeholder;
    
    // Generate low-quality version for progressive loading
    try {
      const url = new URL(src);
      url.searchParams.set('w', '40');
      url.searchParams.set('q', '20');
      url.searchParams.set('blur', '5');
      return url.toString();
    } catch {
      return src;
    }
  }, [src, placeholder]);

  // Load images progressively
  useEffect(() => {
    let cancelled = false;

    const loadImage = async () => {
      try {
        // First, load low-res version
        if (lowResUrl && lowResUrl !== src) {
          const lowResImg = new Image();
          lowResImg.onload = () => {
            if (!cancelled) {
              setImageData(prev => ({ ...prev, lowRes: lowResUrl }));
            }
          };
          lowResImg.src = lowResUrl;
        }

        // Then load high-res version
        const highResImg = new Image();
        highResImg.onload = () => {
          if (!cancelled) {
            setImageData(prev => ({ ...prev, highRes: src }));
            setLoadingState('loaded');
            onLoad?.();
          }
        };
        highResImg.onerror = () => {
          if (!cancelled) {
            setLoadingState('error');
            onError?.(new Error('Failed to load image'));
          }
        };
        highResImg.src = src;

      } catch (error) {
        if (!cancelled) {
          setLoadingState('error');
          onError?.(error as Error);
        }
      }
    };

    loadImage();

    return () => {
      cancelled = true;
    };
  }, [src, lowResUrl, onLoad, onError]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Low-res placeholder */}
      {imageData.lowRes && (
        <motion.img
          ref={imgRef}
          src={imageData.lowRes}
          alt={alt}
          className={clsx(
            'absolute inset-0 w-full h-full object-cover',
            'filter blur-sm scale-110',
            className
          )}
          sizes={sizes}
          initial={{ opacity: 0 }}
          animate={{ opacity: imageData.highRes ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* High-res image */}
      {imageData.highRes && (
        <motion.img
          src={imageData.highRes}
          alt={alt}
          className={clsx(
            'absolute inset-0 w-full h-full object-cover',
            className
          )}
          sizes={sizes}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Loading state */}
      {loadingState === 'loading' && !imageData.lowRes && (
        <div className="absolute inset-0 bg-neutral-200 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {loadingState === 'error' && (
        <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center text-neutral-400">
          <div className="text-center text-xs">
            <div className="w-6 h-6 mx-auto mb-1">⚠️</div>
            <div>Erro ao carregar</div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Batch Thumbnail Preloader
 */
interface BatchPreloaderProps {
  videos: DashboardVideo[];
  onProgress?: (loaded: number, total: number) => void;
  onComplete?: () => void;
  concurrency?: number;
}

export function useBatchThumbnailPreloader({
  videos,
  onProgress,
  onComplete,
  concurrency = 3
}: BatchPreloaderProps) {
  const [progress, setProgress] = useState({ loaded: 0, total: videos.length });
  const [isPreloading, setIsPreloading] = useState(false);
  const performance = useThumbnailPerformance();

  const preloadThumbnails = useCallback(async () => {
    if (isPreloading || !videos.length) return;

    setIsPreloading(true);
    setProgress({ loaded: 0, total: videos.length });

    const batches = [];
    for (let i = 0; i < videos.length; i += concurrency) {
      batches.push(videos.slice(i, i + concurrency));
    }

    let totalLoaded = 0;

    for (const batch of batches) {
      const promises = batch.map(async (video) => {
        try {
          await performance.generateThumbnail(video);
          totalLoaded++;
          setProgress({ loaded: totalLoaded, total: videos.length });
          onProgress?.(totalLoaded, videos.length);
        } catch (error) {
          // Handle error silently for preloading
          totalLoaded++;
          setProgress({ loaded: totalLoaded, total: videos.length });
          onProgress?.(totalLoaded, videos.length);
        }
      });

      await Promise.allSettled(promises);
    }

    setIsPreloading(false);
    onComplete?.();
  }, [videos, concurrency, isPreloading, performance, onProgress, onComplete]);

  useEffect(() => {
    if (performance.config.preloading.enabled && videos.length > 0) {
      // Auto-preload priority videos
      const priorityVideos = videos.slice(0, performance.config.preloading.priorityCount);
      if (priorityVideos.length > 0) {
        preloadThumbnails();
      }
    }
  }, [videos, performance.config.preloading, preloadThumbnails]);

  return {
    progress,
    isPreloading,
    preloadThumbnails
  };
}

/**
 * Thumbnail Performance Monitor
 */
interface PerformanceMonitorProps {
  children: ReactNode;
  onMetrics?: (metrics: {
    cacheHits: number;
    cacheMisses: number;
    averageLoadTime: number;
    errorRate: number;
  }) => void;
}

export function ThumbnailPerformanceMonitor({
  children,
  onMetrics
}: PerformanceMonitorProps) {
  const performance = useThumbnailPerformance();
  const metricsRef = useRef({
    cacheHits: 0,
    cacheMisses: 0,
    totalRequests: 0,
    totalLoadTime: 0,
    errors: 0
  });

  // Calculate and report metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = metricsRef.current;
      const averageLoadTime = metrics.totalRequests > 0 
        ? metrics.totalLoadTime / metrics.totalRequests 
        : 0;
      const errorRate = metrics.totalRequests > 0 
        ? metrics.errors / metrics.totalRequests 
        : 0;

      onMetrics?.({
        cacheHits: metrics.cacheHits,
        cacheMisses: metrics.cacheMisses,
        averageLoadTime,
        errorRate
      });
    }, 10000); // Report every 10 seconds

    return () => clearInterval(interval);
  }, [onMetrics]);

  return <>{children}</>;
}

/**
 * Utility functions
 */

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

function optimizeThumbnailUrl(
  url: string,
  options: {
    webp?: boolean;
    quality?: number;
    progressive?: boolean;
  }
): string {
  try {
    const urlObj = new URL(url);
    
    if (options.webp) {
      urlObj.searchParams.set('format', 'webp');
    }
    
    if (options.quality) {
      urlObj.searchParams.set('quality', options.quality.toString());
    }
    
    if (options.progressive) {
      urlObj.searchParams.set('progressive', 'true');
    }

    return urlObj.toString();
  } catch {
    return url;
  }
}

export {
  defaultPerformanceConfig,
  ThumbnailPerformanceContext
};