'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseMemoryManagementOptions {
  enableGarbageCollection?: boolean;
  cleanupInterval?: number;
  maxCacheSize?: number;
}

interface MemoryManager {
  addToCache: (key: string, value: any) => void;
  getFromCache: (key: string) => any;
  clearCache: () => void;
  cleanupResources: () => void;
}

export function useMemoryManagement(
  options: UseMemoryManagementOptions = {}
): MemoryManager {
  const {
    enableGarbageCollection = true,
    cleanupInterval = 30000, // 30 seconds
    maxCacheSize = 100
  } = options;

  const cacheRef = useRef<Map<string, any>>(new Map());
  const timersRef = useRef<Set<number>>(new Set());
  const eventListenersRef = useRef<Array<() => void>>([]);
  const observersRef = useRef<Set<IntersectionObserver | ResizeObserver | MutationObserver>>(new Set());

  // Cache management
  const addToCache = useCallback((key: string, value: any) => {
    const cache = cacheRef.current;
    
    // Remove oldest item if cache is full
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }
    
    cache.set(key, value);
  }, [maxCacheSize]);

  const getFromCache = useCallback((key: string) => {
    return cacheRef.current.get(key);
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Resource cleanup
  const cleanupResources = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach(timerId => {
      clearTimeout(timerId);
      clearInterval(timerId);
    });
    timersRef.current.clear();

    // Remove all event listeners
    eventListenersRef.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        // Silently handle cleanup errors
      }
    });
    eventListenersRef.current.length = 0;

    // Disconnect all observers
    observersRef.current.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        // Silently handle cleanup errors
      }
    });
    observersRef.current.clear();

    // Clear cache
    clearCache();

    // Force garbage collection if available (dev mode)
    if (enableGarbageCollection && typeof window !== 'undefined' && 'gc' in window) {
      try {
        (window as any).gc();
      } catch (error) {
        // Garbage collection not available
      }
    }
  }, [clearCache, enableGarbageCollection]);

  // Automatic cleanup interval
  useEffect(() => {
    if (!enableGarbageCollection) return;

    const interval = setInterval(() => {
      // Clean up expired cache entries
      const now = Date.now();
      const cache = cacheRef.current;
      
      Array.from(cache.entries()).forEach(([key, value]) => {
        if (value && typeof value === 'object' && value._timestamp) {
          // Remove entries older than 5 minutes
          if (now - value._timestamp > 300000) {
            cache.delete(key);
          }
        }
      });
    }, cleanupInterval);

    return () => clearInterval(interval);
  }, [enableGarbageCollection, cleanupInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanupResources;
  }, [cleanupResources]);

  return {
    addToCache,
    getFromCache,
    clearCache,
    cleanupResources
  };
}

// Hook for managing specific resource types
export function useResourceCleanup() {
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const observersRef = useRef<Set<IntersectionObserver | ResizeObserver>>(new Set());
  const controllersRef = useRef<Set<AbortController>>(new Set());

  const addTimer = useCallback((timer: NodeJS.Timeout) => {
    timersRef.current.add(timer);
    return timer;
  }, []);

  const addObserver = useCallback((observer: IntersectionObserver | ResizeObserver) => {
    observersRef.current.add(observer);
    return observer;
  }, []);

  const addController = useCallback((controller: AbortController) => {
    controllersRef.current.add(controller);
    return controller;
  }, []);

  const cleanup = useCallback(() => {
    // Clear timers
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();

    // Disconnect observers
    observersRef.current.forEach(observer => observer.disconnect());
    observersRef.current.clear();

    // Abort controllers
    controllersRef.current.forEach(controller => controller.abort());
    controllersRef.current.clear();
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    addTimer,
    addObserver,
    addController,
    cleanup
  };
}

export default useMemoryManagement;