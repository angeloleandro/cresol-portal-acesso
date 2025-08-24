import { useCallback, useRef, DependencyList } from 'react';

import { dequal } from 'dequal';




interface MemoizedOptions {
  /** Compara dependencies profundamente */
  deepCompare?: boolean;
  /** Throttle em ms */
  throttleMs?: number;
  /** Debounce em ms */
  debounceMs?: number;
  /** Executa no máximo N vezes */
  maxCalls?: number;
}

/**
 * useMemoizedCallback function
 * @todo Add proper documentation
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList,
  options: MemoizedOptions = {}
): T {
  const { deepCompare = false, throttleMs, debounceMs, maxCalls } = options;
  
  const callbackRef = useRef<T>(callback);
  const previousDepsRef = useRef<DependencyList>(deps);
  const lastCallTimeRef = useRef<number>(0);
  const callCountRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  // Atualiza callback se dependencies mudaram
  if (deepCompare) {
    if (!dequal(deps, previousDepsRef.current)) {
      callbackRef.current = callback;
      previousDepsRef.current = deps;
      callCountRef.current = 0; // Reset call count on deps change
    }
  } else {
    // Comparação shallow padrão
    const depsChanged = deps.some((dep, i) => dep !== previousDepsRef.current[i]);
    if (depsChanged) {
      callbackRef.current = callback;
      previousDepsRef.current = deps;
      callCountRef.current = 0;
    }
  }
  
  // Retorna callback com controles aplicados
  const memoizedCallback = useCallback((...args: Parameters<T>) => {
    // Verifica limite de chamadas
    if (maxCalls && callCountRef.current >= maxCalls) {
      // Callback reached max calls limit
      return;
    }
    
    // Implementa throttle
    if (throttleMs) {
      const now = Date.now();
      if (now - lastCallTimeRef.current < throttleMs) {
        return;
      }
      lastCallTimeRef.current = now;
    }
    
    // Implementa debounce
    if (debounceMs) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      return new Promise((resolve) => {
        timeoutRef.current = setTimeout(() => {
          callCountRef.current++;
          const result = callbackRef.current(...args);
          resolve(result);
        }, debounceMs);
      });
    }
    
    // Execução normal
    callCountRef.current++;
    return callbackRef.current(...args);
  }, [maxCalls, throttleMs, debounceMs]);
  
  return memoizedCallback as T;
}

/**
 * Hook para criar handlers de eventos otimizados
 */
/**
 * useEventHandler function
 * @todo Add proper documentation
 */
export function useEventHandler<T extends (...args: any[]) => void>(
  handler: T,
  deps: DependencyList = []
): T {
  const handlerRef = useRef<T>(handler);
  
  // Atualiza ref quando handler muda
  handlerRef.current = handler;
  
  // Retorna função estável que sempre chama a versão mais recente
  const stableHandler = useCallback((...args: Parameters<T>) => {
    return handlerRef.current(...args);
  }, []);
  
  return stableHandler as T;
}

/**
 * Hook para criar múltiplos callbacks memoizados de uma vez
 */
/**
 * useMemoizedCallbacks function
 * @todo Add proper documentation
 */
export function useMemoizedCallbacks<T extends Record<string, (...args: any[]) => any>>(
  callbacks: T,
  deps: DependencyList = []
): T {
  const callbacksRef = useRef<T>(callbacks);
  const memoizedRef = useRef<T>({} as T);
  
  // Atualiza refs
  callbacksRef.current = callbacks;
  
  // Cria versões memoizadas apenas uma vez
  if (Object.keys(memoizedRef.current).length === 0) {
    for (const key in callbacks) {
      memoizedRef.current[key] = ((...args: any[]) => {
        return callbacksRef.current[key](...args);
      }) as T[typeof key];
    }
  }
  
  return useCallback(() => memoizedRef.current, [])();
}