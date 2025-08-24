'use client';

// Collections Context Provider - Portal Cresol
// Solução centralizada para eliminar re-renders e duplicação de chamadas API

import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { COLLECTION_CONFIG } from '@/lib/constants/collections';
import { 
  Collection, 
  CollectionFilters, 
  CollectionStats,
  UseCollectionsState
} from '@/lib/types/collections';

// State interface
interface CollectionsContextState extends UseCollectionsState {
  sessionToken: string | null;
  lastFetch: number;
  cacheTimeout: number;
}

// Actions para reducer
type CollectionsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_COLLECTIONS'; payload: Collection[] }
  | { type: 'SET_STATS'; payload: CollectionStats | null }
  | { type: 'SET_FILTERS'; payload: CollectionFilters }
  | { type: 'SET_HAS_MORE'; payload: boolean }
  | { type: 'SET_SESSION_TOKEN'; payload: string | null }
  | { type: 'UPDATE_CACHE_TIMESTAMP' };

// Context interface
interface CollectionsContextValue {
  state: CollectionsContextState;
  actions: {
    fetchCollections: (newFilters?: Partial<CollectionFilters>) => Promise<void>;
    fetchStats: () => Promise<void>;
    updateFilters: (newFilters: Partial<CollectionFilters>) => void;
    refresh: () => Promise<void>;
    clearCache: () => void;
    createCollection: (data: any) => Promise<any>;
    updateCollection: (id: string, data: any) => Promise<any>;
    deleteCollection: (id: string) => Promise<void>;
    toggleCollectionStatus: (id: string, isActive: boolean) => Promise<void>;
    loadMore?: () => Promise<void>;
  };
}

// Reducer para gerenciar estado
function collectionsReducer(
  state: CollectionsContextState, 
  action: CollectionsAction
): CollectionsContextState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_COLLECTIONS':
      return { ...state, collections: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_HAS_MORE':
      return { ...state, hasMore: action.payload };
    case 'SET_SESSION_TOKEN':
      return { ...state, sessionToken: action.payload };
    case 'UPDATE_CACHE_TIMESTAMP':
      return { ...state, lastFetch: Date.now() };
    default:
      return state;
  }
}

// Estado inicial
const initialState: CollectionsContextState = {
  collections: [],
  loading: false,
  error: null,
  stats: null,
  hasMore: false,
  filters: {
    search: '',
    type: 'all',
    status: 'all',
    sort_by: 'order_index',
    sort_order: 'asc',
    page: 1,
    limit: COLLECTION_CONFIG.DEFAULT_PAGE_SIZE,
  },
  sessionToken: null,
  lastFetch: 0,
  cacheTimeout: 30000, // 30 segundos de cache
};

// Contexto
const CollectionsContext = createContext<CollectionsContextValue | null>(null);

// Provider Component
export function CollectionsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(collectionsReducer, initialState);
  const supabase = createClientComponentClient();

  // Cache inteligente - verifica se precisa fazer nova chamada
  const shouldRefetchCollections = useCallback((newFilters?: Partial<CollectionFilters>) => {
    const now = Date.now();
    const cacheExpired = now - state.lastFetch > state.cacheTimeout;
    const filtersChanged = newFilters && Object.keys(newFilters).some(
      key => newFilters[key as keyof CollectionFilters] !== state.filters[key as keyof CollectionFilters]
    );
    return cacheExpired || filtersChanged || state.collections.length === 0;
  }, [state.lastFetch, state.cacheTimeout, state.filters, state.collections.length]);

  // Função centralizada para obter headers com auth
  const getAuthHeaders = useCallback(async (): Promise<HeadersInit> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
        // Atualiza token no estado se mudou
        if (state.sessionToken !== session.access_token) {
          dispatch({ type: 'SET_SESSION_TOKEN', payload: session.access_token });
        }
      }
    } catch (error) {
      console.warn('Erro ao obter sessão:', error);
    }

    return headers;
  }, [supabase, state.sessionToken]);

  // Fetch collections otimizado com cache
  const fetchCollections = useCallback(async (newFilters?: Partial<CollectionFilters>) => {
    // Cache check - evita chamadas desnecessárias
    if (!shouldRefetchCollections(newFilters)) {
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const currentFilters = { ...state.filters, ...newFilters };
      const searchParams = new URLSearchParams();
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== 'all') {
          searchParams.append(key, value.toString());
        }
      });
      
      const headers = await getAuthHeaders();
      
      const response = await fetch(`/api/collections?${searchParams}`, {
        headers,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar coleções');
      }
      
      const data = await response.json();
      
      dispatch({ type: 'SET_COLLECTIONS', payload: data.collections || [] });
      dispatch({ type: 'SET_HAS_MORE', payload: data.has_more || false });
      dispatch({ type: 'SET_FILTERS', payload: currentFilters });
      dispatch({ type: 'UPDATE_CACHE_TIMESTAMP' });
      
    } catch (error) {
      console.error('Erro ao buscar coleções:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro desconhecido' });
      dispatch({ type: 'SET_COLLECTIONS', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.filters, getAuthHeaders, shouldRefetchCollections]);

  // Fetch stats otimizado com cache
  const fetchStats = useCallback(async () => {
    // Cache check para stats
    const now = Date.now();
    const statsExpired = now - state.lastFetch > state.cacheTimeout;
    if (!statsExpired && state.stats) {
      return;
    }

    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/admin/collections/stats', {
        headers,
        credentials: 'include',
      });
      
      if (response.ok) {
        const statsData = await response.json();
        dispatch({ type: 'SET_STATS', payload: statsData });
      }
    } catch (error) {
      // Stats não críticas para funcionalidade - erro silencioso
    }
  }, [getAuthHeaders, state.lastFetch, state.cacheTimeout, state.stats]);

  // Update filters com debounce implícito
  const updateFilters = useCallback((newFilters: Partial<CollectionFilters>) => {
    const updatedFilters = { ...newFilters, page: 1 };
    dispatch({ type: 'SET_FILTERS', payload: { ...state.filters, ...updatedFilters } });
    
    // Debounce para pesquisa
    if (newFilters.search !== undefined) {
      const timeoutId = setTimeout(() => {
        fetchCollections(updatedFilters);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      fetchCollections(updatedFilters);
    }
  }, [state.filters, fetchCollections]);

  // Refresh completo
  const refresh = useCallback(async () => {
    dispatch({ type: 'UPDATE_CACHE_TIMESTAMP' }); // Force cache invalidation
    await Promise.all([
      fetchCollections(),
      fetchStats()
    ]);
  }, [fetchCollections, fetchStats]);

  // Clear cache manual
  const clearCache = useCallback(() => {
    dispatch({ type: 'UPDATE_CACHE_TIMESTAMP' });
    dispatch({ type: 'SET_COLLECTIONS', payload: [] });
    dispatch({ type: 'SET_STATS', payload: null });
  }, []);

  // CRUD Operations
  const createCollection = useCallback(async (data: any) => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar coleção');
      }

      // Refresh data after successful creation
      await refresh();
      return response.json();
    } catch (error) {
      console.error('Erro ao criar coleção:', error);
      throw error;
    }
  }, [getAuthHeaders, refresh]);

  const updateCollection = useCallback(async (id: string, data: any) => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`/api/collections/${id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar coleção');
      }

      // Refresh data after successful update
      await refresh();
      return response.json();
    } catch (error) {
      console.error('Erro ao atualizar coleção:', error);
      throw error;
    }
  }, [getAuthHeaders, refresh]);

  const deleteCollection = useCallback(async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`/api/collections/${id}`, { 
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao excluir coleção');
      }

      // Refresh data after successful deletion
      await refresh();
    } catch (error) {
      console.error('Erro ao excluir coleção:', error);
      throw error;
    }
  }, [getAuthHeaders, refresh]);

  const toggleCollectionStatus = useCallback(async (id: string, isActive: boolean) => {
    await updateCollection(id, { is_active: isActive });
  }, [updateCollection]);

  // Load more collections (pagination)
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loading) return;
    
    const nextPage = state.filters.page + 1;
    const newFilters = { ...state.filters, page: nextPage };
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== 'all') {
          searchParams.append(key, value.toString());
        }
      });
      
      const headers = await getAuthHeaders();
      
      const response = await fetch(`/api/collections?${searchParams}`, {
        headers,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar mais coleções');
      }
      
      const data = await response.json();
      
      // Append new collections to existing ones
      dispatch({ type: 'SET_COLLECTIONS', payload: [...state.collections, ...(data.collections || [])] });
      dispatch({ type: 'SET_HAS_MORE', payload: data.has_more || false });
      dispatch({ type: 'SET_FILTERS', payload: newFilters });
      dispatch({ type: 'UPDATE_CACHE_TIMESTAMP' });
      
    } catch (error) {
      console.error('Erro ao carregar mais coleções:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro desconhecido' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.hasMore, state.loading, state.filters, state.collections, getAuthHeaders]);

  // Removido load inicial automático - collections serão buscadas apenas quando necessário
  // Isso evita chamadas desnecessárias nas páginas que não usam collections

  // Memoize do context value para evitar re-renders
  const contextValue = useMemo(() => ({
    state,
    actions: {
      fetchCollections,
      fetchStats,
      updateFilters,
      refresh,
      clearCache,
      createCollection,
      updateCollection,
      deleteCollection,
      toggleCollectionStatus,
      loadMore,
    },
  }), [
    state,
    fetchCollections,
    fetchStats,
    updateFilters,
    refresh,
    clearCache,
    createCollection,
    updateCollection,
    deleteCollection,
    toggleCollectionStatus,
    loadMore,
  ]);

  return (
    <CollectionsContext.Provider value={contextValue}>
      {children}
    </CollectionsContext.Provider>
  );
}

// Hook customizado para usar o contexto
export function useCollectionsContext() {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error('useCollectionsContext deve ser usado dentro de CollectionsProvider');
  }
  return context;
}

// Hook otimizado para componentes que só precisam de collections (backward compatibility)
export function useCollections(initialFilters?: Partial<CollectionFilters>) {
  const { state, actions } = useCollectionsContext();
  
  // Apply initial filters apenas uma vez
  useEffect(() => {
    if (initialFilters) {
      actions.updateFilters(initialFilters);
    }
  }, [actions, initialFilters]);

  return {
    collections: state.collections,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
    filters: state.filters,
    hasMore: state.hasMore,
    actions,
  };
}

// Hook otimizado para componentes que só precisam de stats
export function useCollectionsStats() {
  const { state, actions } = useCollectionsContext();
  
  return {
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    refresh: actions.fetchStats,
  };
}