/**
 * Optimized VideoGallery Hooks
 * Memory-optimized hooks com cleanup automático e lazy loading
 */

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  resolveVideoUrl, 
  checkVideoUrlAccessibility 
} from '@/lib/video-utils';
import { 
  DashboardVideo, 
  VideoGalleryState, 
  KeyboardNavigationConfig
} from '@/app/components/VideoGallery/VideoGallery.types';

// Cache interface para vídeos
interface VideoCache {
  videos: DashboardVideo[];
  timestamp: number;
  expiresAt: number;
}

// Cache de vídeos com TTL
const videoCache: VideoCache | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Hook otimizado para gerenciar estado da galeria de vídeos
 * Implementa cache, cleanup e otimizações de memória
 */
export function useOptimizedVideoGallery(limit?: number) {
  const [state, setState] = useState<VideoGalleryState>({
    videos: [],
    loading: true,
    error: null,
    selectedVideo: null,
    modalOpen: false,
    videoError: null,
    videoUrl: null,
    urlLoading: false,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function para prevenir memory leaks
  const cleanup = useCallback(() => {
    // Abort ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Cleanup video resources
    if (videoRef.current) {
      const video = videoRef.current;
      video.pause();
      video.currentTime = 0;
      video.src = '';
      video.load();
    }

    // Clear any timeout
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }
  }, []);

  const fetchVideos = useCallback(async () => {
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase
        .from("dashboard_videos")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      // Check if request was aborted
      if (signal.aborted) return;

      if (error) throw error;

      // Filter and validate videos mais eficientemente
      const validVideos = (data || []).filter(video => {
        if (video.upload_type === 'youtube') return true;
        if (video.upload_type === 'direct') {
          return video.processing_status === 'ready' && video.upload_progress === 100;
        }
        return false;
      });
      
      setState(prev => ({ 
        ...prev, 
        videos: validVideos, 
        loading: false 
      }));

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Erro ao carregar vídeos',
        loading: false 
      }));
    }
  }, []);

  const openModal = useCallback(async (video: DashboardVideo) => {
    setState(prev => ({
      ...prev,
      selectedVideo: video,
      modalOpen: true,
      videoError: null,
      videoUrl: null,
      urlLoading: true
    }));
    
    try {
      let videoUrl = video.video_url;
      
      if (video.upload_type === 'direct' && video.file_path) {
        videoUrl = resolveVideoUrl(video);
        // Verificação assíncrona de acessibilidade (sem bloquear)
        checkVideoUrlAccessibility(videoUrl).catch(() => {
          // Se falhar, não fazer nada - o player vai lidar com o erro
        });
      }
      
      setState(prev => ({ 
        ...prev, 
        videoUrl, 
        urlLoading: false 
      }));
      
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        videoError: 'Erro ao carregar o vídeo. Tente novamente mais tarde.',
        urlLoading: false
      }));
    }
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      modalOpen: false,
      selectedVideo: null,
      videoError: null,
      videoUrl: null,
      urlLoading: false
    }));
    
    // Cleanup com delay para permitir animação de saída
    cleanupTimeoutRef.current = setTimeout(cleanup, 300);
  }, [cleanup]);

  const handleVideoError = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      videoError: 'Erro ao carregar o vídeo. Tente novamente mais tarde.' 
    }));
  }, []);

  // Memoized display videos para evitar re-cálculos
  const displayVideos = useMemo(() => {
    return limit ? state.videos.slice(0, limit) : state.videos;
  }, [state.videos, limit]);

  // Effect para carregar vídeos
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    ...state,
    actions: {
      openModal,
      closeModal,
      handleVideoError,
      refetch: fetchVideos
    },
    refs: {
      videoRef,
      iframeRef
    },
    displayVideos
  };
}

/**
 * Hook otimizado para ESC key modal close
 */
export function useOptimizedEscapeKey(callback: () => void, enabled: boolean = true) {
  const callbackRef = useRef(callback);
  const enabledRef = useRef(enabled);

  // Update refs to avoid recreating listener
  useEffect(() => {
    callbackRef.current = callback;
    enabledRef.current = enabled;
  });

  useEffect(() => {
    const escListener = (e: KeyboardEvent) => {
      if (e.key === "Escape" && enabledRef.current) {
        e.preventDefault();
        callbackRef.current();
      }
    };

    document.addEventListener("keydown", escListener, { passive: false });
    return () => document.removeEventListener("keydown", escListener);
  }, []); // Empty dependency array - listener never recreated
}

/**
 * Hook otimizado para focus management em modais
 */
export function useOptimizedFocusManagement(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const isOpenRef = useRef(isOpen);

  // Update ref to avoid stale closure
  useEffect(() => {
    isOpenRef.current = isOpen;
  });

  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement;
      
      // Focus container or first focusable element
      const container = containerRef.current;
      if (container) {
        // Delay para permitir que o modal seja renderizado
        setTimeout(() => {
          if (!isOpenRef.current) return; // Check if still open
          
          const firstFocusable = container.querySelector(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement;
          
          if (firstFocusable) {
            firstFocusable.focus();
          } else if (container.tabIndex >= 0) {
            container.focus();
          }
        }, 50);
      }
    }
    
    // Cleanup no retorno do effect
    return () => {
      if (!isOpen && previouslyFocusedElementRef.current) {
        // Delay para permitir animação de saída
        setTimeout(() => {
          if (previouslyFocusedElementRef.current && !isOpenRef.current) {
            previouslyFocusedElementRef.current.focus();
            previouslyFocusedElementRef.current = null;
          }
        }, 150);
      }
    };
  }, [isOpen]);

  return { containerRef };
}

/**
 * Hook otimizado para intersection observer com cleanup automático
 */
export function useOptimizedInView(options: IntersectionObserverInit = {}) {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Memoize options to prevent unnecessary observer recreation
  const memoizedOptions = useMemo(() => ({
    rootMargin: '200px',
    threshold: 0.1,
    ...options
  }), [options.rootMargin, options.threshold, options.root]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting && !hasBeenInView) {
          setHasBeenInView(true);
        }
      },
      memoizedOptions
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [hasBeenInView, memoizedOptions]);

  return { 
    ref: elementRef, 
    isInView, 
    hasBeenInView 
  };
}

/**
 * Hook otimizado para preload de imagens com resource management
 */
export function useOptimizedImagePreload(urls: string[], enabled = true) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const imageRefsRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const cleanup = useCallback(() => {
    // Cleanup image references
    imageRefsRef.current.forEach((img, url) => {
      img.onload = null;
      img.onerror = null;
      img.src = '';
    });
    imageRefsRef.current.clear();
  }, []);

  const preloadImage = useCallback((url: string) => {
    if (!enabled || loadedImages.has(url) || loadingImages.has(url)) return;

    setLoadingImages(prev => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });

    const img = new Image();
    imageRefsRef.current.set(url, img);
    
    img.onload = () => {
      setLoadedImages(prev => {
        const next = new Set(prev);
        next.add(url);
        return next;
      });
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(url);
        return newSet;
      });
      imageRefsRef.current.delete(url);
    };
    
    img.onerror = () => {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(url);
        return newSet;
      });
      imageRefsRef.current.delete(url);
    };
    
    img.src = url;
  }, [enabled, loadedImages, loadingImages]);

  useEffect(() => {
    if (enabled) {
      urls.forEach(preloadImage);
    }
    
    return cleanup;
  }, [urls, preloadImage, enabled, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    loadedImages,
    loadingImages,
    isImageLoaded: useCallback((url: string) => loadedImages.has(url), [loadedImages]),
    isImageLoading: useCallback((url: string) => loadingImages.has(url), [loadingImages]),
  };
}

/**
 * Hook para debounce otimizado
 */
export function useOptimizedDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedValue;
}