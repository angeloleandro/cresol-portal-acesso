'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAlert } from '@/app/components/alerts';

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
    const hasActiveInstances = activeInstances.length > 0;
    
    globalHookInstanceTracker.set(instanceIdRef.current, {
      instanceId: instanceIdRef.current,
      renderCount: 0,
      createdAt: new Date().toISOString(),
      lastRenderAt: new Date().toISOString(),
      isActive: true,
      stackTrace: callerInfo
    });
    
    console.log('[DEBUG-LIFECYCLE] =============== NOVA INSTÂNCIA DE HOOK CRIADA ===============');
    console.log('[DEBUG-LIFECYCLE] Hook Instance Created:', {
      instanceId: instanceIdRef.current,
      endpoint,
      globalInstanceCount: globalHookInstanceTracker.size,
      hasActiveInstances,
      stackTrace: callerInfo,
      timestamp: new Date().toISOString(),
      WARNING: hasActiveInstances ? '🚨 MÚLTIPLAS INSTÂNCIAS ATIVAS - COMPONENTE SENDO RECRIADO!' : 'ℹ️ Primeira instância normal'
    });
    
    // Log de todas as instâncias ativas
    console.log('[DEBUG-LIFECYCLE] Todas as instâncias ativas:', {
      totalInstances: globalHookInstanceTracker.size,
      instances: Array.from(globalHookInstanceTracker.entries()).map(([key, value]) => ({
        instanceId: key,
        endpoint: key.split('-')[1],
        renderCount: value.renderCount,
        isActive: value.isActive,
        createdAt: value.createdAt
      }))
    });
  }
  
  // Atualizar contador de renderização
  renderCountRef.current++;
  
  const instanceInfo = globalHookInstanceTracker.get(instanceIdRef.current);
  if (instanceInfo) {
    instanceInfo.renderCount = renderCountRef.current;
    instanceInfo.lastRenderAt = new Date().toISOString();
  }
  
  console.log('[DEBUG-LIFECYCLE] =============== HOOK RENDER ===============');
  console.log('[DEBUG-LIFECYCLE] useAdminData - Render:', {
    instanceId: instanceIdRef.current,
    renderCount: renderCountRef.current,
    endpoint,
    isFirstRender: isFirstRenderRef.current,
    timestamp: new Date().toISOString()
  });
  
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
  
  if (dependencyChanges.length > 0 || isFirstRenderRef.current) {
    console.log('[DEBUG-DEPENDENCIES] Dependency changes detected:', {
      instanceId: instanceIdRef.current,
      renderCount: renderCountRef.current,
      isFirstRender: isFirstRenderRef.current,
      changes: dependencyChanges,
      allDependencies: currentDependencies,
      timestamp: new Date().toISOString()
    });
  }
  
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
    
    console.log('[DEBUG-STATE] =============== ESTADO INICIAL CRIADO ===============');
    console.log('[DEBUG-STATE] useState - Initial state created:', {
      instanceId: instanceIdRef.current,
      stateCreationId: stateCreationIdRef.current,
      renderCount: renderCountRef.current,
      initialState,
      timestamp: new Date().toISOString()
    });
    
    return initialState;
  });

  // Detectar mudanças de estado
  const stateHasChanged = prevStateRef.current !== null && (
    JSON.stringify(prevStateRef.current) !== JSON.stringify(state)
  );
  
  if (stateHasChanged || isFirstRenderRef.current) {
    console.log('[DEBUG-STATE] =============== MUDANÇA DE ESTADO DETECTADA ===============');
    console.log('[DEBUG-STATE] State change detected:', {
      instanceId: instanceIdRef.current,
      renderCount: renderCountRef.current,
      isFirstRender: isFirstRenderRef.current,
      previousState: prevStateRef.current,
      currentState: state,
      differences: prevStateRef.current ? {
        data: prevStateRef.current.data.length !== state.data.length,
        loading: prevStateRef.current.loading !== state.loading,
        pagination: JSON.stringify(prevStateRef.current.pagination) !== JSON.stringify(state.pagination),
        filters: JSON.stringify(prevStateRef.current.filters) !== JSON.stringify(state.filters)
      } : 'first_render',
      timestamp: new Date().toISOString()
    });
  }
  
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
  const refsInfo = {
    loadingRef: loadingRef.current,
    debounceRef: !!debounceRef.current,
    instanceId: instanceIdRef.current,
    stateCreationId: stateCreationIdRef.current
  };
  
  console.log('[DEBUG-REFS] Referencias do hook:', {
    ...refsInfo,
    renderCount: renderCountRef.current,
    endpoint,
    timestamp: new Date().toISOString()
  });

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
    const wasRecreated = callbackCreationTracker.current.loadData !== newCallbackId;
    
    if (callbackCreationTracker.current.loadData === null) {
      console.log('[DEBUG-CALLBACK] =============== LOADDATA CALLBACK CRIADO ===============');
      console.log('[DEBUG-CALLBACK] loadData callback created:', {
        instanceId: instanceIdRef.current,
        callbackId: newCallbackId,
        renderCount: renderCountRef.current,
        dependencies: {
          endpoint,
          'alert': alert ? 'present' : 'missing'
        },
        stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n'),
        timestamp: new Date().toISOString()
      });
    } else if (wasRecreated) {
      console.log('[DEBUG-CALLBACK] =============== LOADDATA CALLBACK RECRIADO ===============');
      console.log('[DEBUG-CALLBACK] loadData callback recreated:', {
        instanceId: instanceIdRef.current,
        oldCallbackId: callbackCreationTracker.current.loadData,
        newCallbackId,
        renderCount: renderCountRef.current,
        dependencies: {
          endpoint,
          'alert': alert ? 'present' : 'missing'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    callbackCreationTracker.current.loadData = newCallbackId;
    
    // [DEBUG-FUNCTION] Log entrada da função loadData
    callCounterRef.current++;
    const callId = `${endpoint}-${callCounterRef.current}`;
    
    console.log('[DEBUG-FUNCTION] =============== LOADDATA EXECUTADO ===============');
    console.log('[DEBUG-FUNCTION] loadData - Entry:', {
      instanceId: instanceIdRef.current,
      callbackId: newCallbackId,
      callId,
      endpoint,
      forceLoading,
      loadingRefCurrent: loadingRef.current,
      currentPage: state.pagination.currentPage,
      limit: state.pagination.limit,
      filters: state.filters,
      dataLength: state.data.length,
      stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n'),
      timestamp: new Date().toISOString()
    });
    
    // Evitar múltiplas requisições simultâneas
    if (loadingRef.current) {
      console.log('[DEBUG-FUNCTION] loadData - Blocked by loadingRef:', {
        callId,
        endpoint,
        loadingRefCurrent: loadingRef.current
      });
      return;
    }
    
    try {
      console.log('[DEBUG-FUNCTION] loadData - Setting loadingRef to true:', {
        callId,
        endpoint
      });
      loadingRef.current = true;
      
      // Só mostrar loading se for a primeira carga ou forçado
      const currentState = stateRef.current;
      if (currentState.data.length === 0 || forceLoading) {
        console.log('[DEBUG-STATE] loadData - Setting loading state to true:', {
          callId,
          endpoint,
          dataLength: currentState.data.length,
          forceLoading
        });
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
      
      console.log('[DEBUG-API] loadData - Making request:', {
        callId,
        endpoint,
        apiUrl,
        queryParams: Object.fromEntries(queryParams),
        timestamp: new Date().toISOString()
      });

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('[DEBUG-API] loadData - Response error:', {
          callId,
          endpoint,
          status: response.status,
          errorData,
          timestamp: new Date().toISOString()
        });
        throw new Error(errorData.error || `Erro ao carregar dados de ${endpoint}`);
      }

      const result = await response.json();
      
      console.log('[DEBUG-API] loadData - Response success:', {
        callId,
        endpoint,
        success: result.success,
        dataCount: result.data ? Object.keys(result.data).length : 0,
        resultStructure: Object.keys(result),
        timestamp: new Date().toISOString()
      });
      
      if (result.success) {
        const newData = result.data[endpoint] || result.data.news || result.data.events || result.data.messages || result.data.documents || [];
        
        console.log('[DEBUG-STATE] loadData - Updating state:', {
          callId,
          endpoint,
          newDataLength: newData.length,
          newPagination: result.data.pagination,
          previousDataLength: currentState.data.length,
          timestamp: new Date().toISOString()
        });
        
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
      console.error(`[DEBUG-ERROR] loadData - Error:`, {
        callId,
        endpoint,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      alert.showError('Erro', error.message || `Erro ao carregar dados de ${endpoint}`);
      setState(prev => ({ ...prev, loading: false }));
    } finally {
      console.log('[DEBUG-FUNCTION] loadData - Finally block:', {
        callId,
        endpoint,
        settingLoadingRefToFalse: true,
        timestamp: new Date().toISOString()
      });
      loadingRef.current = false;
    }
  }, [endpoint, alert, state.data.length, state.filters, state.pagination.currentPage, state.pagination.limit]);

  // Atualizar a ref para ter acesso estável ao loadData
  loadDataRef.current = loadData;

  // Atualizar filtros com debounce para busca
  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    // [DEBUG-CALLBACK] Log da recriação do callback updateFilters
    const newCallbackId = `updateFilters-${instanceIdRef.current}-${Date.now()}`;
    
    if (callbackCreationTracker.current.updateFilters === null) {
      console.log('[DEBUG-CALLBACK] updateFilters callback created:', {
        instanceId: instanceIdRef.current,
        callbackId: newCallbackId,
        renderCount: renderCountRef.current,
        dependencies: ['loadData', 'debounceMs', 'endpoint', 'state.filters'],
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('[DEBUG-CALLBACK] updateFilters callback recreated:', {
        instanceId: instanceIdRef.current,
        oldCallbackId: callbackCreationTracker.current.updateFilters,
        newCallbackId,
        renderCount: renderCountRef.current,
        timestamp: new Date().toISOString()
      });
    }
    
    callbackCreationTracker.current.updateFilters = newCallbackId;
    
    console.log('[DEBUG-FILTERS] updateFilters - Entry:', {
      instanceId: instanceIdRef.current,
      callbackId: newCallbackId,
      endpoint,
      newFilters,
      previousFilters: stateRef.current.filters,
      hasSearchFilter: newFilters.search !== undefined,
      timestamp: new Date().toISOString()
    });
    
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      pagination: { ...prev.pagination, currentPage: 1 } // Reset para primeira página
    }));

    // Debounce apenas para campo search
    if (newFilters.search !== undefined) {
      console.log('[DEBUG-FILTERS] updateFilters - Setting debounce for search:', {
        endpoint,
        searchValue: newFilters.search,
        debounceMs,
        timestamp: new Date().toISOString()
      });
      
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        console.log('[DEBUG-FILTERS] updateFilters - Debounce timeout triggered:', {
          endpoint,
          searchValue: newFilters.search,
          timestamp: new Date().toISOString()
        });
        if (loadDataRef.current) {
          loadDataRef.current(false);
        }
      }, debounceMs);
    } else {
      console.log('[DEBUG-FILTERS] updateFilters - Calling loadData immediately:', {
        endpoint,
        newFilters,
        timestamp: new Date().toISOString()
      });
      // Para outros filtros, carregar imediatamente
      if (loadDataRef.current) {
        loadDataRef.current(false);
      }
    }
  }, [debounceMs, endpoint]);

  // Atualizar paginação
  const updatePagination = useCallback((newPagination: Partial<{ currentPage: number; limit: number }>) => {
    // [DEBUG-CALLBACK] Log da recriação do callback updatePagination
    const newCallbackId = `updatePagination-${instanceIdRef.current}-${Date.now()}`;
    
    if (callbackCreationTracker.current.updatePagination === null) {
      console.log('[DEBUG-CALLBACK] updatePagination callback created:', {
        instanceId: instanceIdRef.current,
        callbackId: newCallbackId,
        renderCount: renderCountRef.current,
        dependencies: ['endpoint', 'state.pagination'],
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('[DEBUG-CALLBACK] updatePagination callback recreated:', {
        instanceId: instanceIdRef.current,
        oldCallbackId: callbackCreationTracker.current.updatePagination,
        newCallbackId,
        renderCount: renderCountRef.current,
        timestamp: new Date().toISOString()
      });
    }
    
    callbackCreationTracker.current.updatePagination = newCallbackId;
    
    console.log('[DEBUG-PAGINATION] updatePagination - Entry:', {
      instanceId: instanceIdRef.current,
      callbackId: newCallbackId,
      endpoint,
      newPagination,
      previousPagination: stateRef.current.pagination,
      timestamp: new Date().toISOString()
    });
    
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, ...newPagination }
    }));
  }, [endpoint]);

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
    const executionId = `pagination-effect-${instanceIdRef.current}-${useEffectTracker.current.paginationEffect.executionCount}`;
    
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
    
    console.log('[DEBUG-USEEFFECT] =============== PAGINATION EFFECT EXECUTADO ===============');
    console.log('[DEBUG-USEEFFECT] Pagination effect - Entry:', {
      instanceId: instanceIdRef.current,
      executionId,
      executionCount: useEffectTracker.current.paginationEffect.executionCount,
      renderCount: renderCountRef.current,
      endpoint,
      currentPage: state.pagination.currentPage,
      hasDebounce: !!debounceRef.current,
      dependencyChanges,
      currentDependencies,
      stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n'),
      timestamp: new Date().toISOString()
    });
    
    useEffectTracker.current.paginationEffect.lastDependencies = currentDependencies;
    
    if (debounceRef.current) {
      console.log('[DEBUG-USEEFFECT] Pagination effect - Skipped due to active debounce:', {
        endpoint,
        currentPage: state.pagination.currentPage,
        timestamp: new Date().toISOString()
      });
      return; // Não executar se houver debounce ativo
    }
    
    console.log('[DEBUG-USEEFFECT] Pagination effect - Calling loadData:', {
      endpoint,
      currentPage: state.pagination.currentPage,
      timestamp: new Date().toISOString()
    });
    if (loadDataRef.current) {
      loadDataRef.current(false);
    }
  }, [state.pagination.currentPage, endpoint]);

  // Cleanup do debounce
  useEffect(() => {
    useEffectTracker.current.cleanupEffect.executionCount++;
    const executionId = `cleanup-effect-${instanceIdRef.current}-${useEffectTracker.current.cleanupEffect.executionCount}`;
    
    console.log('[DEBUG-USEEFFECT] =============== CLEANUP EFFECT EXECUTADO ===============');
    console.log('[DEBUG-USEEFFECT] Cleanup effect - Mounted:', {
      instanceId: instanceIdRef.current,
      executionId,
      executionCount: useEffectTracker.current.cleanupEffect.executionCount,
      renderCount: renderCountRef.current,
      endpoint,
      timestamp: new Date().toISOString()
    });
    
    return () => {
      console.log('[DEBUG-USEEFFECT] =============== CLEANUP EFFECT CLEANUP ===============');
      console.log('[DEBUG-USEEFFECT] Cleanup effect - Cleanup:', {
        instanceId: instanceIdRef.current,
        executionId,
        endpoint,
        hasDebounce: !!debounceRef.current,
        timestamp: new Date().toISOString()
      });
      
      // Marcar instância como inativa no tracker global
      const instanceInfo = globalHookInstanceTracker.get(instanceIdRef.current!);
      if (instanceInfo) {
        instanceInfo.isActive = false;
        console.log('[DEBUG-LIFECYCLE] Instance marked as inactive:', {
          instanceId: instanceIdRef.current,
          totalActiveInstances: Array.from(globalHookInstanceTracker.values()).filter(i => i.isActive).length,
          timestamp: new Date().toISOString()
        });
      }
      
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [endpoint]);

  const reload = useCallback(() => {
    // [DEBUG-CALLBACK] Log da recriação do callback reload
    const newCallbackId = `reload-${instanceIdRef.current}-${Date.now()}`;
    
    if (callbackCreationTracker.current.reload === null) {
      console.log('[DEBUG-CALLBACK] reload callback created:', {
        instanceId: instanceIdRef.current,
        callbackId: newCallbackId,
        renderCount: renderCountRef.current,
        dependencies: ['loadData', 'endpoint', 'state.data.length', 'state.pagination.currentPage', 'state.filters', 'state.loading'],
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('[DEBUG-CALLBACK] reload callback recreated:', {
        instanceId: instanceIdRef.current,
        oldCallbackId: callbackCreationTracker.current.reload,
        newCallbackId,
        renderCount: renderCountRef.current,
        timestamp: new Date().toISOString()
      });
    }
    
    callbackCreationTracker.current.reload = newCallbackId;
    
    console.log('[DEBUG-RELOAD] reload - Entry:', {
      instanceId: instanceIdRef.current,
      callbackId: newCallbackId,
      endpoint,
      currentState: {
        dataLength: stateRef.current.data.length,
        currentPage: stateRef.current.pagination.currentPage,
        filters: stateRef.current.filters,
        loading: stateRef.current.loading
      },
      timestamp: new Date().toISOString()
    });
    if (loadDataRef.current) {
      loadDataRef.current(true);
    }
  }, [endpoint]);

  // [DEBUG-RENDER] Marcar fim da primeira renderização
  if (isFirstRenderRef.current) {
    isFirstRenderRef.current = false;
  }

  console.log('[DEBUG-HOOK] =============== HOOK RETURN ===============');
  console.log('[DEBUG-HOOK] useAdminData - Return:', {
    instanceId: instanceIdRef.current,
    endpoint,
    renderCount: renderCountRef.current,
    callCount: callCounterRef.current,
    currentState: {
      dataLength: state.data.length,
      loading: state.loading,
      currentPage: state.pagination.currentPage,
      totalPages: state.pagination.totalPages,
      filters: state.filters
    },
    loadingRef: loadingRef.current,
    callbackIds: {
      loadData: callbackCreationTracker.current.loadData,
      updateFilters: callbackCreationTracker.current.updateFilters,
      updatePagination: callbackCreationTracker.current.updatePagination,
      reload: callbackCreationTracker.current.reload
    },
    useEffectCounts: {
      paginationEffect: useEffectTracker.current.paginationEffect.executionCount,
      cleanupEffect: useEffectTracker.current.cleanupEffect.executionCount
    },
    globalInstances: {
      total: globalHookInstanceTracker.size,
      active: Array.from(globalHookInstanceTracker.values()).filter(i => i.isActive).length
    },
    timestamp: new Date().toISOString()
  });

  return {
    ...state,
    updateFilters,
    updatePagination,
    reload,
    isLoading: loadingRef.current
  };
}