import { useEffect, useState, useCallback, useRef } from 'react';

import { supabase } from '@/lib/supabase';
import { 
  ResolveVideoUrl as resolveVideoUrl, 
  checkVideoUrlAccessibility 
} from '@/lib/video-utils';

import { 
  DashboardVideo, 
  VideoGalleryState, 
  KeyboardNavigationConfig,
  VideoError
} from './VideoGallery.types';

/**
 * Hook para gerenciar estado da galeria de vídeos
 */
/**
 * useVideoGallery function
 * @todo Add proper documentation
 */
export function useVideoGallery(limit?: number) {
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

  const fetchVideos = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase
        .from("dashboard_videos")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (error) throw error;

      // Filter and validate videos
      const validVideos: DashboardVideo[] = [];
      
      for (const video of data || []) {
        if (video.upload_type === 'youtube') {
          validVideos.push(video);
        } else if (video.upload_type === 'direct') {
          if (video.processing_status === 'ready' && video.upload_progress === 100) {
            try {
              const resolvedUrl = resolveVideoUrl(video);
              video.video_url = resolvedUrl;
              validVideos.push(video);
            } catch (error) {
              validVideos.push(video);
            }
          }
        }
      }
      
      setState(prev => ({ 
        ...prev, 
        videos: validVideos, 
        loading: false 
      }));
    } catch (error) {
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
      if (video.upload_type === 'direct' && video.file_path) {
        const resolvedUrl = resolveVideoUrl(video);
        const isAccessible = await checkVideoUrlAccessibility(resolvedUrl);
        
        if (isAccessible) {
          setState(prev => ({ ...prev, videoUrl: resolvedUrl, urlLoading: false }));
        } else {
          setState(prev => ({ 
            ...prev, 
            videoError: 'Vídeo temporariamente indisponível. Tente novamente mais tarde.',
            urlLoading: false
          }));
        }
      } else if (video.upload_type === 'youtube') {
        setState(prev => ({ ...prev, videoUrl: video.video_url, urlLoading: false }));
      } else {
        setState(prev => ({ 
          ...prev, 
          videoError: 'Tipo de vídeo não suportado',
          urlLoading: false
        }));
      }
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
    
    // Stop video playback
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  const handleVideoError = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      videoError: 'Erro ao carregar o vídeo. Tente novamente mais tarde.' 
    }));
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

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
    displayVideos: limit ? state.videos.slice(0, limit) : state.videos
  };
}

/**
 * Hook para navegação por teclado
 */
/**
 * useKeyboardNavigation function
 * @todo Add proper documentation
 */
export function useKeyboardNavigation(config: KeyboardNavigationConfig) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { selectedIndex, totalItems, onSelect, onAction, onEscape } = config;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = Math.min(selectedIndex + 1, totalItems - 1);
          onSelect(nextIndex);
          break;
          
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = Math.max(selectedIndex - 1, 0);
          onSelect(prevIndex);
          break;
          
        case 'Enter':
        case ' ':
          e.preventDefault();
          // Action will be handled by the component that provides the video
          break;
          
        case 'Escape':
          e.preventDefault();
          if (onEscape) {
            onEscape();
          }
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [config]);
}

/**
 * Hook para ESC key modal close
 */
/**
 * useEscapeKey function
 * @todo Add proper documentation
 */
export function useEscapeKey(callback: () => void, enabled: boolean = true) {
  const escListener = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") callback();
  }, [callback]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener("keydown", escListener);
      return () => document.removeEventListener("keydown", escListener);
    }
  }, [enabled, escListener]);
}

/**
 * Hook para intersection observer (lazy loading)
 */
/**
 * useInView function
 * @todo Add proper documentation
 */
export function useInView(options: IntersectionObserverInit = {}) {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting && !hasBeenInView) {
          setHasBeenInView(true);
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasBeenInView, options]);

  return { ref: elementRef, isInView, hasBeenInView };
}

/**
 * Hook para focus management em modais
 */
/**
 * useFocusManagement function
 * @todo Add proper documentation
 */
export function useFocusManagement(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement;
      
      // Focus container or first focusable element
      const container = containerRef.current;
      if (container) {
        const firstFocusable = container.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          container.focus();
        }
      }
    } else {
      // Restore focus when closing
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
      }
    }
  }, [isOpen]);

  return { containerRef };
}

/**
 * Hook para performance monitoring
 */
/**
 * usePerformanceMonitor function
 * @todo Add proper documentation
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0);
  const startTimeRef = useRef(performance.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;
    
    // Performance monitoring without logging
    
    startTimeRef.current = performance.now();
  });

  return {
    renderCount: renderCountRef.current,
    markRenderStart: () => {
      startTimeRef.current = performance.now();
    }
  };
}

/**
 * Hook para debounce de operações
 */
/**
 * useDebounce function
 * @todo Add proper documentation
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para preload de imagens
 */
/**
 * useImagePreload function
 * @todo Add proper documentation
 */
export function useImagePreload(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback((url: string) => {
    if (loadedImages.has(url) || loadingImages.has(url)) return;

    setLoadingImages(prev => new Set([...Array.from(prev), url]));

    const img = new Image();
    img.onload = () => {
      setLoadedImages(prev => new Set([...Array.from(prev), url]));
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(url);
        return newSet;
      });
    };
    img.onerror = () => {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(url);
        return newSet;
      });
    };
    img.src = url;
  }, [loadedImages, loadingImages]);

  useEffect(() => {
    urls.forEach(preloadImage);
  }, [urls, preloadImage]);

  return {
    loadedImages,
    loadingImages,
    isImageLoaded: (url: string) => loadedImages.has(url),
    isImageLoading: (url: string) => loadingImages.has(url),
  };
}