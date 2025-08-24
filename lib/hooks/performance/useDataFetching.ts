import { useEffect, useRef, useState, useCallback } from 'react';




interface FetchOptions<T> {
  /** Chave única para cache */
  key?: string;
  /** Tempo em ms que o dado é considerado fresh (não refetch) */
  staleTime?: number;
  /** Tempo em ms para manter em cache após componente desmontar */
  cacheTime?: number;
  /** Refetch automático em intervalo (ms) */
  refetchInterval?: number;
  /** Refetch quando window ganhar foco */
  refetchOnFocus?: boolean;
  /** Refetch quando reconectar */
  refetchOnReconnect?: boolean;
  /** Retry em caso de erro */
  retry?: number | ((failureCount: number) => boolean);
  /** Delay entre retries em ms */
  retryDelay?: number | ((failureCount: number) => number);
  /** Callback de sucesso */
  onSuccess?: (data: T) => void;
  /** Callback de erro */
  onError?: (error: Error) => void;
  /** Valor inicial */
  initialData?: T;
  /** Suspense mode */
  suspense?: boolean;
  /** Desabilita fetch automático */
  enabled?: boolean;
  /** Deduplica requests concorrentes */
  dedupe?: boolean;
}

interface FetchState<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (data: T | ((current: T | undefined) => T)) => void;
  refetch: () => Promise<void>;
}

// Cache global para compartilhar entre componentes
const globalCache = new Map<string, {
  data: any;
  error: Error | null;
  timestamp: number;
  promise?: Promise<any>;
}>();

// Listeners para invalidação de cache
const cacheListeners = new Map<string, Set<() => void>>();

/**
 * Hook principal para data fetching otimizado
 */
/**
 * useDataFetching function
 * @todo Add proper documentation
 */
export function useDataFetching<T>(
  fetcher: () => Promise<T>,
  options: FetchOptions<T> = {}
): FetchState<T> {
  const {
    key = JSON.stringify(fetcher.toString()),
    staleTime = 0,
    cacheTime = 5 * 60 * 1000, // 5 minutos
    refetchInterval,
    refetchOnFocus = false,
    refetchOnReconnect = true,
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    initialData,
    enabled = true,
    dedupe = true,
  } = options;

  const [state, setState] = useState<{
    data: T | undefined;
    error: Error | null;
    isLoading: boolean;
    isValidating: boolean;
  }>(() => {
    // Tenta buscar do cache
    const cached = globalCache.get(key);
    if (cached && Date.now() - cached.timestamp < staleTime) {
      return {
        data: cached.data,
        error: cached.error,
        isLoading: false,
        isValidating: false,
      };
    }
    
    return {
      data: initialData,
      error: null,
      isLoading: !initialData,
      isValidating: false,
    };
  });

  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const fetcherRef = useRef(fetcher);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Atualiza fetcher ref
  fetcherRef.current = fetcher;

  // Função de fetch com retry e deduplicação
  const fetchData = useCallback(async (isValidating = false) => {
    if (!enabled) return;

    const cacheKey = key;
    
    // Verifica cache fresh
    const cached = globalCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < staleTime) {
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          data: cached.data,
          error: cached.error,
          isLoading: false,
          isValidating: false,
        }));
      }
      return;
    }

    // Deduplicação - se já tem request em andamento, aguarda
    if (dedupe && cached?.promise) {
      try {
        const data = await cached.promise;
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            data,
            error: null,
            isLoading: false,
            isValidating: false,
          }));
        }
        return;
      } catch (error) {
        // Continua para fazer novo request
      }
    }

    if (mountedRef.current) {
      setState(prev => ({
        ...prev,
        isLoading: !isValidating && !prev.data,
        isValidating,
      }));
    }

    // Cria promise para deduplicação
    const fetchPromise = fetcherRef.current();
    
    // Armazena promise no cache para deduplicação
    globalCache.set(cacheKey, {
      data: cached?.data,
      error: cached?.error || null,
      timestamp: cached?.timestamp || Date.now(),
      promise: fetchPromise,
    });

    try {
      const data = await fetchPromise;
      
      // Atualiza cache
      globalCache.set(cacheKey, {
        data,
        error: null,
        timestamp: Date.now(),
      });

      // Notifica outros componentes usando o mesmo cache
      const listeners = cacheListeners.get(cacheKey);
      if (listeners) {
        listeners.forEach(listener => listener());
      }

      if (mountedRef.current) {
        setState({
          data,
          error: null,
          isLoading: false,
          isValidating: false,
        });
        
        onSuccess?.(data);
      }
      
      retryCountRef.current = 0;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // Implementa retry logic
      const shouldRetry = typeof retry === 'function' 
        ? retry(retryCountRef.current)
        : retryCountRef.current < retry;
        
      if (shouldRetry && mountedRef.current) {
        retryCountRef.current++;
        
        const delay = typeof retryDelay === 'function'
          ? retryDelay(retryCountRef.current)
          : retryDelay;
          
        setTimeout(() => {
          if (mountedRef.current) {
            fetchData(isValidating);
          }
        }, delay);
        
        return;
      }

      // Atualiza cache com erro
      globalCache.set(cacheKey, {
        data: cached?.data,
        error: err,
        timestamp: Date.now(),
      });

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          error: err,
          isLoading: false,
          isValidating: false,
        }));
        
        onError?.(err);
      }
      
      retryCountRef.current = 0;
    }
  }, [key, staleTime, enabled, dedupe, retry, retryDelay, onSuccess, onError]);

  // Mutate function para atualização otimista
  const mutate = useCallback((data: T | ((current: T | undefined) => T)) => {
    const newData = typeof data === 'function' 
      ? (data as (current: T | undefined) => T)(state.data)
      : data;
      
    // Atualização otimista
    setState(prev => ({
      ...prev,
      data: newData,
    }));
    
    // Atualiza cache
    globalCache.set(key, {
      data: newData,
      error: null,
      timestamp: Date.now(),
    });
    
    // Notifica outros componentes
    const listeners = cacheListeners.get(key);
    if (listeners) {
      listeners.forEach(listener => listener());
    }
  }, [key, state.data]);

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Setup inicial e listeners
  useEffect(() => {
    mountedRef.current = true;
    
    // Registra listener para invalidação de cache
    const listener = () => {
      const cached = globalCache.get(key);
      if (cached && mountedRef.current) {
        setState(prev => ({
          ...prev,
          data: cached.data,
          error: cached.error,
        }));
      }
    };
    
    if (!cacheListeners.has(key)) {
      cacheListeners.set(key, new Set());
    }
    cacheListeners.get(key)!.add(listener);
    
    // Fetch inicial
    if (enabled) {
      fetchData();
    }
    
    // Setup refetch interval
    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData(true);
      }, refetchInterval);
    }
    
    // Setup refetch on focus
    const handleFocus = () => {
      if (refetchOnFocus && mountedRef.current) {
        fetchData(true);
      }
    };
    
    // Setup refetch on reconnect
    const handleOnline = () => {
      if (refetchOnReconnect && mountedRef.current) {
        fetchData(true);
      }
    };
    
    if (refetchOnFocus) {
      window.addEventListener('focus', handleFocus);
    }
    
    if (refetchOnReconnect) {
      window.addEventListener('online', handleOnline);
    }
    
    // Cleanup
    return () => {
      mountedRef.current = false;
      
      // Remove listener
      const listeners = cacheListeners.get(key);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          cacheListeners.delete(key);
          
          // Limpa cache após cacheTime
          setTimeout(() => {
            if (!cacheListeners.has(key)) {
              globalCache.delete(key);
            }
          }, cacheTime);
        }
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (refetchOnFocus) {
        window.removeEventListener('focus', handleFocus);
      }
      
      if (refetchOnReconnect) {
        window.removeEventListener('online', handleOnline);
      }
    };
  }, [key, enabled, fetchData, refetchInterval, refetchOnFocus, refetchOnReconnect, cacheTime]);

  return {
    data: state.data,
    error: state.error,
    isLoading: state.isLoading,
    isValidating: state.isValidating,
    mutate,
    refetch,
  };
}

/**
 * Hook para prefetch de dados
 */
/**
 * usePrefetch function
 * @todo Add proper documentation
 */
export function usePrefetch<T>(
  key: string,
  fetcher: () => Promise<T>
): () => Promise<void> {
  return useCallback(async () => {
    if (!globalCache.has(key)) {
      try {
        const data = await fetcher();
        globalCache.set(key, {
          data,
          error: null,
          timestamp: Date.now(),
        });
      } catch (error) {

      }
    }
  }, [key, fetcher]);
}

/**
 * Invalida cache para forçar refetch
 */
/**
 * invalidateCache function
 * @todo Add proper documentation
 */
export function InvalidateCache(key?: string): void {
  if (key) {
    globalCache.delete(key);
    const listeners = cacheListeners.get(key);
    if (listeners) {
      listeners.forEach(listener => listener());
    }
  } else {
    // Invalida todo o cache
    globalCache.clear();
    cacheListeners.forEach(listeners => {
      listeners.forEach(listener => listener());
    });
  }
}