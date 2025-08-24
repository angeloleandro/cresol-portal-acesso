import React, { useRef, useMemo } from 'react';

import { dequal } from 'dequal';




/**
 * Mantém referência estável para objects/arrays usando deep comparison
 */
/**
 * useStableValue function
 * @todo Add proper documentation
 */
export function useStableValue<T>(value: T): T {
  const ref = useRef<T>(value);
  
  // Se o valor não mudou profundamente, retorna a referência anterior
  if (!dequal(value, ref.current)) {
    ref.current = value;
  }
  
  return ref.current;
}

/**
 * Hook para memoização profunda de valores computados
 */
/**
 * useDeepMemo function
 * @todo Add proper documentation
 */
export function useDeepMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>();
  
  if (!ref.current || !dequal(deps, ref.current.deps)) {
    ref.current = {
      deps,
      value: factory()
    };
  }
  
  return ref.current.value;
}

/**
 * Hook para criar props estáveis para componentes
 */
/**
 * useStableProps function
 * @todo Add proper documentation
 */
export function useStableProps<T extends Record<string, any>>(props: T): T {
  const propsRef = useRef<T>(props);
  const stablePropsRef = useRef<T>({} as T);
  
  // Verifica cada prop individualmente
  const hasChanges = Object.keys(props).some(key => {
    return !dequal(props[key], propsRef.current[key]);
  });
  
  if (hasChanges) {
    // Atualiza apenas as props que mudaram
    for (const key in props) {
      if (!dequal(props[key], propsRef.current[key])) {
        stablePropsRef.current[key] = props[key];
      }
    }
    propsRef.current = { ...props };
  }
  
  return stablePropsRef.current;
}

/**
 * Hook para criar arrays memoizados com comparação de itens
 */
/**
 * useStableArray function
 * @todo Add proper documentation
 */
export function useStableArray<T>(
  array: T[],
  compareBy?: (item: T) => any
): T[] {
  const ref = useRef<T[]>(array);
  
  const itemsEqual = useMemo(() => {
    if (array.length !== ref.current.length) return false;
    
    if (compareBy) {
      return array.every((item, index) => 
        dequal(compareBy(item), compareBy(ref.current[index]))
      );
    }
    
    return array.every((item, index) => 
      dequal(item, ref.current[index])
    );
  }, [array, compareBy]);
  
  if (!itemsEqual) {
    ref.current = array;
  }
  
  return ref.current;
}

/**
 * Hook para criar um objeto de estado estável
 */
/**
 * useStableState function
 * @todo Add proper documentation
 */
export function useStableState<T extends Record<string, any>>(
  initialState: T
): [T, (updates: Partial<T>) => void] {
  const [internalState, setInternalState] = React.useState(initialState);
  const stateRef = useRef(internalState);
  
  const setState = React.useCallback((updates: Partial<T>) => {
    const newState = { ...stateRef.current, ...updates };
    
    // Só atualiza se algo realmente mudou
    const hasChanges = Object.keys(updates).some(key => 
      !dequal(newState[key], stateRef.current[key])
    );
    
    if (hasChanges) {
      stateRef.current = newState;
      setInternalState(newState);
    }
  }, []);
  
  return [stateRef.current, setState];
}

/**
 * Hook para criar seletores memoizados de estado
 */
/**
 * useSelector function
 * @todo Add proper documentation
 */
export function useSelector<T, R>(
  state: T,
  selector: (state: T) => R,
  equalityFn: (a: R, b: R) => boolean = dequal
): R {
  const ref = useRef<R>();
  
  const selected = selector(state);
  
  if (!ref.current || !equalityFn(selected, ref.current)) {
    ref.current = selected;
  }
  
  return ref.current;
}