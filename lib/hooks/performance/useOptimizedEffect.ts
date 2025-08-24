import { useEffect, useRef, type DependencyList } from 'react';

import { dequal } from 'dequal';




interface OptimizedEffectOptions {
  /** Pula a execução do efeito se true */
  skip?: boolean;
  /** Compara dependencies profundamente */
  deepCompare?: boolean;
  /** Debounce em ms antes de executar o efeito */
  debounceMs?: number;
  /** Executa apenas uma vez, ignorando dependencies */
  runOnce?: boolean;
}

/**
 * useOptimizedEffect function
 * @todo Add proper documentation
 */
export function useOptimizedEffect(
  effect: () => void | (() => void),
  deps: DependencyList,
  options: OptimizedEffectOptions = {}
): void {
  const { skip = false, deepCompare = false, debounceMs = 0, runOnce = false } = options;
  
  const previousDepsRef = useRef<DependencyList>();
  const hasRunRef = useRef(false);
  const cleanupRef = useRef<(() => void) | void>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    // Se skip está ativo, não executa
    if (skip) return;
    
    // Se runOnce e já executou, não executa novamente
    if (runOnce && hasRunRef.current) return;
    
    // Comparação profunda de dependencies se habilitado
    if (deepCompare && previousDepsRef.current) {
      const depsChanged = !dequal(deps, previousDepsRef.current);
      if (!depsChanged) return;
    }
    
    // Limpa timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Função que executa o efeito
    const runEffect = () => {
      // Executa cleanup anterior se existir
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      
      // Executa o novo efeito e guarda cleanup
      cleanupRef.current = effect();
      
      // Marca como executado
      hasRunRef.current = true;
      
      // Atualiza deps anteriores
      previousDepsRef.current = deps;
    };
    
    // Se tem debounce, agenda execução
    if (debounceMs > 0) {
      timeoutRef.current = setTimeout(runEffect, debounceMs);
    } else {
      runEffect();
    }
    
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deepCompare ? [skip, runOnce, debounceMs] : [deps, skip, runOnce, debounceMs, effect]);
}

/**
 * Hook para efeitos assíncronos com controle de abort
 */
/**
 * useAsyncEffect function
 * @todo Add proper documentation
 */
export function useAsyncEffect(
  effect: (signal: AbortSignal) => Promise<void>,
  deps: DependencyList,
  options: OptimizedEffectOptions = {}
): void {
  useOptimizedEffect(
    () => {
      const controller = new AbortController();
      let mounted = true;
      
      const runAsync = async () => {
        try {
          if (mounted) {
            await effect(controller.signal);
          }
        } catch (error) {
          if (!controller.signal.aborted && mounted) {

          }
        }
      };
      
      runAsync();
      
      return () => {
        mounted = false;
        controller.abort();
      };
    },
    deps,
    options
  );
}