import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import {
  UseThumbnailReturn,
  UseThumbnailGeneratorReturn,
  ThumbnailState,
  LazyLoadingConfig,
  ThumbnailMetrics,
  YouTubeThumbnailConfig
} from './VideoThumbnail.types';
import {
  getThumbnailUrl,
  generateDirectThumbnail,
  getYouTubeThumbnailUrls,
  extractYouTubeVideoId,
  validateThumbnailUrl,
  preloadImage,
  calculateThumbnailMetrics,
  generateThumbnailCacheKey
} from './VideoThumbnail.utils';
import { DashboardVideo } from '../VideoGallery/VideoGallery.types';

/**
 * Hook para gerenciar estado e carregamento de thumbnail individual
 */
/**
 * useThumbnail function
 * @todo Add proper documentation
 */
export function useThumbnail(
  video: DashboardVideo,
  config?: {
    priority?: boolean;
    retryAttempts?: number;
    retryDelay?: number;
    onLoad?: () => void;
    onError?: (error: Error) => void;
  }
): UseThumbnailReturn {
  const [state, setState] = useState<ThumbnailState>({
    loading: false,
    error: false,
    loaded: false,
    retryCount: 0
  });

  const [src, setSrc] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const maxRetries = config?.retryAttempts ?? 3;
  const retryDelay = config?.retryDelay ?? 1000;

  // Função para limpar recursos
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Função principal para carregar thumbnail
  const loadThumbnail = useCallback(async () => {
    cleanup();
    
    setState(prev => ({
      ...prev,
      loading: true,
      error: false
    }));

    const loadStartTime = Date.now();
    abortControllerRef.current = new AbortController();

    try {
      let thumbnailUrl = getThumbnailUrl(video);

      // Se não tem thumbnail, tenta gerar para vídeos do YouTube
      if (!thumbnailUrl && video.upload_type === 'youtube') {
        const videoId = extractYouTubeVideoId(video.video_url);
        if (videoId) {
          const thumbnailOptions = getYouTubeThumbnailUrls(videoId);
          
          // Tenta as diferentes qualidades até encontrar uma válida
          for (const option of thumbnailOptions) {
            try {
              const isValid = await validateThumbnailUrl(option.url);
              if (isValid) {
                thumbnailUrl = option.url;
                break;
              }
            } catch {
              continue;
            }
          }
        }
      }

      // Se ainda não tem thumbnail para upload direto, tenta gerar
      if (!thumbnailUrl && video.upload_type === 'direct' && video.video_url) {
        try {
          thumbnailUrl = await generateDirectThumbnail(video.video_url, {
            extractionMethod: 'canvas',
            timeOffset: 1,
            quality: 80,
            format: 'jpeg',
            sizes: ['md'],
            caching: true
          });
        } catch {
          // Falha na geração, usar placeholder
        }
      }

      if (thumbnailUrl && !abortControllerRef.current.signal.aborted) {
        // Preload da imagem para validar
        await preloadImage(thumbnailUrl);
        
        setSrc(thumbnailUrl);
        setState(prev => ({
          ...prev,
          loading: false,
          loaded: true,
          error: false,
          retryCount: 0
        }));

        config?.onLoad?.();
      } else {
        throw new Error('No valid thumbnail found');
      }

    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setState(prev => {
        const newRetryCount = prev.retryCount + 1;
        return {
          ...prev,
          loading: false,
          error: true,
          retryCount: newRetryCount
        };
      });

      config?.onError?.(error as Error);

      // Tenta novamente se não excedeu limite
      if (state.retryCount < maxRetries) {
        retryTimeoutRef.current = setTimeout(() => {
          loadThumbnail();
        }, retryDelay * (state.retryCount + 1));
      }
    }
  }, [video, state.retryCount, maxRetries, retryDelay, config, cleanup]);

  // Função manual de retry
  const retry = useCallback(() => {
    setState(prev => ({ ...prev, retryCount: 0 }));
    loadThumbnail();
  }, [loadThumbnail]);

  // Função de preload
  const preload = useCallback(() => {
    if (!state.loading && !state.loaded) {
      loadThumbnail();
    }
  }, [loadThumbnail, state.loading, state.loaded]);

  // Carrega thumbnail automaticamente se priority
  useEffect(() => {
    if (config?.priority && !state.loaded && !state.loading) {
      loadThumbnail();
    }
  }, [config?.priority, loadThumbnail, state.loaded, state.loading]);

  // Cleanup no unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    src,
    state,
    retry,
    preload
  };
}

/**
 * Hook para lazy loading de thumbnails
 */
/**
 * useThumbnailLazyLoading function
 * @todo Add proper documentation
 */
export function useThumbnailLazyLoading(
  elementRef: React.RefObject<HTMLElement>,
  config: LazyLoadingConfig = {
    enabled: true,
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true
  }
) {
  const [inView, setInView] = useState(!config.enabled);
  const [hasTriggered, setHasTriggered] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!config.enabled || !elementRef.current) {
      return;
    }

    if (config.triggerOnce && hasTriggered) {
      return;
    }

    const element = elementRef.current;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        
        if (isIntersecting) {
          setInView(true);
          setHasTriggered(true);
          
          if (config.triggerOnce) {
            observerRef.current?.unobserve(element);
          }
        } else if (!config.triggerOnce) {
          setInView(false);
        }
      },
      {
        threshold: config.threshold,
        rootMargin: config.rootMargin
      }
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.unobserve(element);
      observerRef.current?.disconnect();
    };
  }, [config, elementRef, hasTriggered]);

  return {
    inView,
    hasTriggered
  };
}

/**
 * Hook para geração de thumbnails
 */
/**
 * useThumbnailGenerator function
 * @todo Add proper documentation
 */
export function useThumbnailGenerator(): UseThumbnailGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateThumbnail = useCallback(async (video: DashboardVideo): Promise<string> => {
    setIsGenerating(true);
    setError(null);

    try {
      if (video.upload_type === 'youtube') {
        const videoId = extractYouTubeVideoId(video.video_url);
        if (!videoId) {
          throw new Error('Invalid YouTube URL');
        }

        const thumbnailOptions = getYouTubeThumbnailUrls(videoId);
        
        for (const option of thumbnailOptions) {
          const isValid = await validateThumbnailUrl(option.url);
          if (isValid) {
            return option.url;
          }
        }
        
        throw new Error('No valid YouTube thumbnail found');
      }

      if (video.upload_type === 'direct' && video.video_url) {
        return await generateDirectThumbnail(video.video_url, {
          extractionMethod: 'canvas',
          timeOffset: 1,
          quality: 80,
          format: 'jpeg',
          sizes: ['md'],
          caching: true
        });
      }

      throw new Error('Unsupported video type for thumbnail generation');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Thumbnail generation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const extractVideoFrame = useCallback(async (
    videoElement: HTMLVideoElement,
    time = 1
  ): Promise<string> => {
    setIsGenerating(true);
    setError(null);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      return new Promise((resolve, reject) => {
        const handleSeeked = () => {
          try {
            ctx.drawImage(videoElement, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            resolve(dataUrl);
          } catch (err) {
            reject(err);
          } finally {
            videoElement.removeEventListener('seeked', handleSeeked);
          }
        };

        videoElement.addEventListener('seeked', handleSeeked);
        videoElement.currentTime = time;
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Frame extraction failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const getYouTubeThumbnail = useCallback((
    videoId: string,
    quality: YouTubeThumbnailConfig['quality'] = 'hqdefault'
  ): string => {
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
  }, []);

  return {
    generateThumbnail,
    extractVideoFrame,
    getYouTubeThumbnail,
    isGenerating,
    error
  };
}

/**
 * Hook para cache de thumbnails
 */
/**
 * useThumbnailCache function
 * @todo Add proper documentation
 */
export function useThumbnailCache(maxSize = 50, ttl = 3600000) { // 1 hora TTL
  const cacheRef = useRef(new Map<string, {
    data: string;
    timestamp: number;
    metrics?: ThumbnailMetrics;
  }>());

  const get = useCallback((key: string): string | null => {
    const cache = cacheRef.current;
    const item = cache.get(key);
    
    if (!item) {
      return null;
    }

    // Verifica se expirou
    if (Date.now() - item.timestamp > ttl) {
      cache.delete(key);
      return null;
    }

    return item.data;
  }, [ttl]);

  const set = useCallback((
    key: string, 
    data: string, 
    metrics?: ThumbnailMetrics
  ) => {
    const cache = cacheRef.current;
    
    // Remove itens expirados
    for (const [cacheKey, item] of Array.from(cache.entries())) {
      if (Date.now() - item.timestamp > ttl) {
        cache.delete(cacheKey);
      }
    }

    // Remove itens mais antigos se excedeu limite
    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }

    cache.set(key, {
      data,
      timestamp: Date.now(),
      metrics
    });
  }, [maxSize, ttl]);

  const remove = useCallback((key: string) => {
    cacheRef.current.delete(key);
  }, []);

  const clear = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const size = useMemo(() => cacheRef.current.size, []);

  const getMetrics = useCallback((key: string) => {
    return cacheRef.current.get(key)?.metrics || null;
  }, []);

  return {
    get,
    set,
    remove,
    clear,
    size,
    getMetrics
  };
}

/**
 * Hook para precarregamento inteligente de thumbnails
 */
/**
 * useThumbnailPreloading function
 * @todo Add proper documentation
 */
export function useThumbnailPreloading(
  videos: DashboardVideo[],
  config: {
    priorityCount?: number;
    adjacentCount?: number;
    strategy?: 'viewport' | 'sequential' | 'smart';
  } = {}
) {
  const {
    priorityCount = 4,
    adjacentCount = 2,
    strategy = 'smart'
  } = config;

  const [preloadedUrls, setPreloadedUrls] = useState<Set<string>>(new Set());
  const preloadQueueRef = useRef<string[]>([]);

  const preloadThumbnail = useCallback(async (url: string) => {
    if (preloadedUrls.has(url)) {
      return;
    }

    try {
      await preloadImage(url);
      setPreloadedUrls(prev => new Set(prev).add(url));
    } catch {
      // Falha silenciosa no preload
    }
  }, [preloadedUrls]);

  const preloadVideos = useCallback(async (videosToPreload: DashboardVideo[]) => {
    const urls: string[] = [];

    for (const video of videosToPreload) {
      const thumbnailUrl = getThumbnailUrl(video);
      if (thumbnailUrl && !preloadedUrls.has(thumbnailUrl)) {
        urls.push(thumbnailUrl);
      }
    }

    // Preload em batch com limite de concorrência
    const batchSize = 3;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(url => preloadThumbnail(url))
      );
    }
  }, [preloadThumbnail, preloadedUrls]);

  // Preload automático baseado na estratégia
  useEffect(() => {
    if (!videos.length) {
      return;
    }

    switch (strategy) {
      case 'sequential':
        const sequentialVideos = videos.slice(0, priorityCount);
        preloadVideos(sequentialVideos);
        break;

      case 'viewport':
        // Implementaria lógica de viewport aqui
        const viewportVideos = videos.slice(0, priorityCount);
        preloadVideos(viewportVideos);
        break;

      case 'smart':
      default:
        // Estratégia inteligente: prioriza vídeos ativos e recentes
        const smartVideos = videos
          .filter(v => v.is_active)
          .sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, priorityCount);
        preloadVideos(smartVideos);
        break;
    }
  }, [videos, strategy, priorityCount, preloadVideos]);

  return {
    preloadedUrls,
    preloadThumbnail,
    preloadVideos
  };
}