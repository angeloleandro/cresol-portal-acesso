'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

import { useAlert } from '@/app/components/alerts';
import { supabase } from '@/lib/supabase';

interface UseAdminDataOptions {
  endpoint: string;
  initialFilters?: Record<string, any>;
  initialPagination?: {
    currentPage: number;
    limit: number;
  };
  debounceMs?: number;
}

interface AdminDataState<T> {
  data: T[];
  loading: boolean;
  stats: any;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
  filters: Record<string, any>;
}

// [DEBUG-GLOBAL] Tracker global para instâncias de hook
const globalHookInstanceTracker = new Map<string, {
  instanceId: string;
  renderCount: number;
  createdAt: string;
  lastRenderAt: string;
  isActive: boolean;
  stackTrace: string;
}>();

let hookInstanceCounter = 0;

/**
 * useAdminData function
 * @todo Add proper documentation
 */
export function useAdminData<T>({
  endpoint,
  initialFilters = {},
  initialPagination = { currentPage: 1, limit: 20 },
  debounceMs = 300
}: UseAdminDataOptions) {
  const alert = useAlert();
  
  // [DEBUG-INSTANCE] Rastreamento de instância único do hook
  const instanceIdRef = useRef<string | null>(null);
  const renderCountRef = useRef(0);
  const prevDependenciesRef = useRef<any>({});
  const isFirstRenderRef = useRef(true);
  
  // Inicializar ID da instância apenas na primeira renderização
  if (instanceIdRef.current === null) {
    hookInstanceCounter++;
    instanceIdRef.current = `hook-${endpoint}-${hookInstanceCounter}-${Date.now()}`;
    
    const stackTrace = new Error().stack || '';
    const callerInfo = stackTrace.split('\n').slice(1, 6).join('\n');
    
    // Detectar se há instâncias ativas anteriores
    const activeInstances = Array.from(globalHookInstanceTracker.values()).filter(i => i.isActive && i.instanceId !== instanceIdRef.current);
    const _hasActiveInstances = activeInstances.length > 0;
    
    globalHookInstanceTracker.set(instanceIdRef.current, {
      instanceId: instanceIdRef.current,
      renderCount: 0,
      createdAt: new Date().toISOString(),
      lastRenderAt: new Date().toISOString(),
      isActive: true,
      stackTrace: callerInfo
    });

    // Debug logging removed for production
  }
  
  // Atualizar contador de renderização
  renderCountRef.current++;
  
  const instanceInfo = globalHookInstanceTracker.get(instanceIdRef.current);
  if (instanceInfo) {
    instanceInfo.renderCount = renderCountRef.current;
    instanceInfo.lastRenderAt = new Date().toISOString();
  }

  // Debug render logging removed for production
  
  // [DEBUG-DEPENDENCIES] Rastreamento de mudanças de dependências
  const currentDependencies = {
    endpoint,
    initialFilters: JSON.stringify(initialFilters),
    initialPagination: JSON.stringify(initialPagination),
    debounceMs,
    alert: alert ? 'present' : 'missing'
  };
  
  const dependencyChanges: string[] = [];
  Object.entries(currentDependencies).forEach(([key, currentValue]) => {
    const prevValue = prevDependenciesRef.current[key];
    if (prevValue !== currentValue) {
      dependencyChanges.push(`${key}: ${prevValue} → ${currentValue}`);
    }
  });
  
  // Debug dependency logging removed for production
  
  prevDependenciesRef.current = currentDependencies;
  
  // [DEBUG-STATE] Rastreamento avançado de estado
  const stateCreationIdRef = useRef<string | null>(null);
  const prevStateRef = useRef<AdminDataState<T> | null>(null);
  
  const [state, setState] = useState<AdminDataState<T>>(() => {
    const initialState = {
      data: [],
      loading: true,
      stats: null,
      pagination: {
        currentPage: initialPagination.currentPage,
        totalPages: 1,
        totalCount: 0,
        limit: initialPagination.limit
      },
      filters: initialFilters
    };
    
    stateCreationIdRef.current = `state-${instanceIdRef.current}-${Date.now()}`;

    // Debug initial state logging removed for production
    
    return initialState;
  });

  // Detectar mudanças de estado
  const _stateHasChanged = prevStateRef.current !== null && (
    JSON.stringify(prevStateRef.current) !== JSON.stringify(state)
  );
  
  // Debug state change logging removed for production
  
  prevStateRef.current = state;

  // Ref para controlar requisições simultâneas
  const loadingRef = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs para acessar valores atuais sem causar recriações dos callbacks
  const stateRef = useRef(state);
  stateRef.current = state;
  
  // Ref para loadData estável
  const loadDataRef = useRef<((forceLoading?: boolean) => Promise<void>) | null>(null);
  
  // [DEBUG-REFS] Rastreamento de referências
  const _refsInfo = {
    loadingRef: loadingRef.current,
    debounceRef: !!debounceRef.current,
    instanceId: instanceIdRef.current,
    stateCreationId: stateCreationIdRef.current
  };
  
  // Debug refs logging removed for production

  // [DEBUG-CALLBACK] Rastreamento de recriação de callbacks
  const callbackCreationTracker = useRef<{
    loadData: string | null;
    updateFilters: string | null;
    updatePagination: string | null;
    reload: string | null;
  }>({
    loadData: null,
    updateFilters: null,
    updatePagination: null,
    reload: null
  });
  
  const callCounterRef = useRef(0);

  const loadData = useCallback(async (forceLoading = false) => {
    // [DEBUG-CALLBACK] Log da recriação do callback
    const newCallbackId = `loadData-${instanceIdRef.current}-${Date.now()}`;
    const _wasRecreated = callbackCreationTracker.current.loadData !== newCallbackId;
    
    // Debug callback logging removed for production
    
    callbackCreationTracker.current.loadData = newCallbackId;
    
    // [DEBUG-FUNCTION] Log entrada da função loadData
    callCounterRef.current++;
    const _callId = `${endpoint}-${callCounterRef.current}`;

    // Debug function entry logging removed for production
    
    // Evitar múltiplas requisições simultâneas
    if (loadingRef.current) {

      return;
    }
    
    try {

      loadingRef.current = true;
      
      // Só mostrar loading se for a primeira carga ou forçado
      const currentState = stateRef.current;
      if (currentState.data.length === 0 || forceLoading) {
        setState(prev => ({ ...prev, loading: true }));
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert.showError('Sessão expirada', 'Faça login novamente');
        return;
      }

      // Construir parâmetros da query
      const queryParams = new URLSearchParams();
      
      // Adicionar parâmetros obrigatórios
      queryParams.set('page', currentState.pagination.currentPage.toString());
      queryParams.set('limit', currentState.pagination.limit.toString());
      queryParams.set('order_by', 'created_at');
      queryParams.set('order_direction', 'desc');

      // Adicionar filtros apenas se tiverem valores válidos
      Object.entries(currentState.filters).forEach(([key, value]) => {
        if (value !== '' && value !== 'all' && value !== undefined && value !== null) {
          queryParams.set(key, value.toString());
        }
      });

      const apiUrl = `/api/admin/${endpoint}?${queryParams}`;
      
      // Debug API request logging removed for production

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Debug API error logging removed for production
        throw new Error(errorData.error || `Erro ao carregar dados de ${endpoint}`);
      }

      const result = await response.json();
      
      // Debug API success logging removed for production
      
      if (result.success) {
        const newData = result.data[endpoint] || result.data.news || result.data.events || result.data.messages || result.data.documents || [];
        
        // Debug state update logging removed for production
        
        setState(prev => ({
          ...prev,
          data: newData,
          stats: result.data.stats || null,
          pagination: {
            currentPage: result.data.pagination?.currentPage || 1,
            totalPages: result.data.pagination?.totalPages || 1,
            totalCount: result.data.pagination?.totalCount || 0,
            limit: prev.pagination.limit
          },
          loading: false
        }));
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      // Debug error logging removed for production - error is handled by alert
      alert.showError('Erro', error.message || `Erro ao carregar dados de ${endpoint}`);
      setState(prev => ({ ...prev, loading: false }));
    } finally {
      // Debug finally logging removed for production
      loadingRef.current = false;
    }
  }, [endpoint, alert]);

  // Atualizar a ref para ter acesso estável ao loadData
  loadDataRef.current = loadData;

  // Atualizar filtros com debounce para busca
  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    // [DEBUG-CALLBACK] Log da recriação do callback updateFilters
    const newCallbackId = `updateFilters-${instanceIdRef.current}-${Date.now()}`;
    
    // Debug updateFilters callback logging removed for production
    callbackCreationTracker.current.updateFilters = newCallbackId;
    
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      pagination: { ...prev.pagination, currentPage: 1 } // Reset para primeira página
    }));

    // Debounce apenas para campo search
    if (newFilters.search !== undefined) {
      // Debug debounce logging removed for production
      
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        // Debug timeout logging removed for production
        if (loadDataRef.current) {
          loadDataRef.current(false);
        }
      }, debounceMs);
    } else {
      // Debug immediate call logging removed for production
      // Para outros filtros, carregar imediatamente
      if (loadDataRef.current) {
        loadDataRef.current(false);
      }
    }
  }, [debounceMs]);

  // Atualizar paginação
  const updatePagination = useCallback((newPagination: Partial<{ currentPage: number; limit: number }>) => {
    // [DEBUG-CALLBACK] Log da recriação do callback updatePagination
    const newCallbackId = `updatePagination-${instanceIdRef.current}-${Date.now()}`;
    
    // Debug updatePagination callback logging removed for production
    callbackCreationTracker.current.updatePagination = newCallbackId;
    
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, ...newPagination }
    }));
  }, []);

  // [DEBUG-USEEFFECT] Rastreamento avançado de useEffects
  const useEffectTracker = useRef<{
    paginationEffect: { executionCount: number; lastDependencies: any };
    cleanupEffect: { executionCount: number; lastDependencies: any };
  }>({
    paginationEffect: { executionCount: 0, lastDependencies: null },
    cleanupEffect: { executionCount: 0, lastDependencies: null }
  });

  // Recarregar dados quando paginação mudar (exceto quando vem de updateFilters)
  useEffect(() => {
    useEffectTracker.current.paginationEffect.executionCount++;
    const _executionId = `pagination-effect-${instanceIdRef.current}-${useEffectTracker.current.paginationEffect.executionCount}`;
    
    const currentDependencies = {
      'state.pagination.currentPage': state.pagination.currentPage,
      endpoint
    };
    
    const dependencyChanges: string[] = [];
    if (useEffectTracker.current.paginationEffect.lastDependencies) {
      Object.entries(currentDependencies).forEach(([key, current]) => {
        const prev = useEffectTracker.current.paginationEffect.lastDependencies[key];
        if (prev !== current) {
          dependencyChanges.push(`${key}: changed`);
        }
      });
    }

    // Debug pagination effect logging removed for production
    
    useEffectTracker.current.paginationEffect.lastDependencies = currentDependencies;
    
    if (debounceRef.current) {
      // Debug debounce skip logging removed for production
      return; // Não executar se houver debounce ativo
    }
    
    // Debug loadData call logging removed for production
    if (loadDataRef.current) {
      loadDataRef.current(false);
    }
  }, [state.pagination.currentPage, endpoint]);

  // Cleanup do debounce
  useEffect(() => {
    useEffectTracker.current.cleanupEffect.executionCount++;
    const _executionId = `cleanup-effect-${instanceIdRef.current}-${useEffectTracker.current.cleanupEffect.executionCount}`;

    // Debug cleanup mount logging removed for production
    
    return () => {
      // Debug cleanup logging removed for production
      
      // Marcar instância como inativa no tracker global
      const instanceInfo = globalHookInstanceTracker.get(instanceIdRef.current!);
      if (instanceInfo) {
        instanceInfo.isActive = false;
        // Debug inactive instance logging removed for production
      }
      
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const reload = useCallback(() => {
    // [DEBUG-CALLBACK] Log da recriação do callback reload
    const newCallbackId = `reload-${instanceIdRef.current}-${Date.now()}`;
    
    // Debug reload callback logging removed for production
    callbackCreationTracker.current.reload = newCallbackId;
    
    // Debug reload entry logging removed for production
    if (loadDataRef.current) {
      loadDataRef.current(true);
    }
  }, []);

  // [DEBUG-RENDER] Marcar fim da primeira renderização
  if (isFirstRenderRef.current) {
    isFirstRenderRef.current = false;
  }

  // Debug hook return logging removed for production

  return {
    ...state,
    updateFilters,
    updatePagination,
    reload,
    isLoading: loadingRef.current
  };
}