// Collection Hooks - Portal Cresol
// Custom hooks para gerenciamento de estado das coleções

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Collection, 
  CollectionItem, 
  CollectionFilters, 
  CollectionStats,
  UseCollectionsState,
  UseCollectionItemsState 
} from '@/lib/types/collections';
import { COLLECTION_CONFIG, PERFORMANCE_CONFIG } from '@/lib/constants/collections';
import { performanceHelpers } from '@/lib/utils/collections';

// Hook principal para gerenciar coleções
export function useCollections(initialFilters?: Partial<CollectionFilters>) {
  const [state, setState] = useState<UseCollectionsState>({
    collections: [],
    loading: false,
    error: null,
    filters: {
      search: '',
      type: 'all',
      status: 'all',
      sort_by: 'order_index',
      sort_order: 'asc',
      page: 1,
      limit: COLLECTION_CONFIG.DEFAULT_PAGE_SIZE,
      ...initialFilters,
    },
    stats: null,
    hasMore: false,
  });

  // Fetch collections from API
  const fetchCollections = useCallback(async (filters?: Partial<CollectionFilters>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const queryParams = new URLSearchParams();
      const currentFilters = { ...state.filters, ...filters };
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'all') {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/collections?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar coleções');
      }
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        collections: data.collections,
        hasMore: data.has_more,
        loading: false,
        filters: currentFilters,
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      }));
    }
  }, [state.filters]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/collections/stats');
      if (response.ok) {
        const stats = await response.json();
        setState(prev => ({ ...prev, stats }));
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  }, []);

  // Debounced search
  const debouncedFetchCollections = useMemo(
    () => performanceHelpers.debounce(fetchCollections, PERFORMANCE_CONFIG.SEARCH_DEBOUNCE_MS),
    [fetchCollections]
  );

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<CollectionFilters>) => {
    const updatedFilters = { ...state.filters, ...newFilters, page: 1 };
    debouncedFetchCollections(updatedFilters);
  }, [state.filters, debouncedFetchCollections]);

  // Load more (pagination)
  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      fetchCollections({ page: state.filters.page + 1 });
    }
  }, [state.loading, state.hasMore, state.filters.page, fetchCollections]);

  // Refresh collections
  const refresh = useCallback(() => {
    fetchCollections();
    fetchStats();
  }, [fetchCollections, fetchStats]);

  // CRUD Operations
  const createCollection = useCallback(async (data: any) => {
    try {
      const response = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar coleção');
      }

      await refresh();
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [refresh]);

  const updateCollection = useCallback(async (id: string, data: any) => {
    try {
      const response = await fetch(`/api/admin/collections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar coleção');
      }

      await refresh();
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [refresh]);

  const deleteCollection = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/collections/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao excluir coleção');
      }

      await refresh();
    } catch (error) {
      throw error;
    }
  }, [refresh]);

  const toggleCollectionStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      await updateCollection(id, { is_active: isActive });
    } catch (error) {
      throw error;
    }
  }, [updateCollection]);

  // Use ref to track initial load to preserve intended behavior
  const isInitialLoadRef = useRef(true);
  
  // Initial load - using ref pattern to avoid adding functions to deps
  useEffect(() => {
    if (isInitialLoadRef.current) {
      fetchCollections();
      fetchStats();
      isInitialLoadRef.current = false;
    }
  }, [fetchCollections, fetchStats]);

  return {
    ...state,
    actions: {
      updateFilters,
      loadMore,
      refresh,
      createCollection,
      updateCollection,
      deleteCollection,
      toggleCollectionStatus,
    },
  };
}

// Hook para gerenciar itens de uma coleção específica
export function useCollectionItems(collectionId: string | null) {
  const [state, setState] = useState<UseCollectionItemsState>({
    items: [],
    loading: false,
    error: null,
    collection: null,
    hasMore: false,
  });

  // Fetch collection items
  const fetchItems = useCallback(async () => {
    if (!collectionId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`/api/collections/${collectionId}/items`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar itens da coleção');
      }
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        items: data.items,
        collection: data.collection,
        loading: false,
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      }));
    }
  }, [collectionId]);

  // Add item to collection
  const addItem = useCallback(async (itemId: string, itemType: 'image' | 'video') => {
    if (!collectionId) return;

    try {
      const response = await fetch(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, item_type: itemType }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao adicionar item');
      }

      await fetchItems();
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [collectionId, fetchItems]);

  // Remove item from collection
  const removeItem = useCallback(async (itemId: string) => {
    if (!collectionId) return;

    try {
      const response = await fetch(`/api/collections/${collectionId}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao remover item');
      }

      await fetchItems();
    } catch (error) {
      throw error;
    }
  }, [collectionId, fetchItems]);

  // Reorder items
  const reorderItems = useCallback(async (itemIds: string[]) => {
    if (!collectionId) return;

    try {
      const response = await fetch(`/api/collections/${collectionId}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_ids: itemIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao reordenar itens');
      }

      await fetchItems();
    } catch (error) {
      throw error;
    }
  }, [collectionId, fetchItems]);

  // Load items when collectionId changes
  useEffect(() => {
    fetchItems();
  }, [collectionId, fetchItems]);

  return {
    ...state,
    actions: {
      refresh: fetchItems,
      addItem,
      removeItem,
      reorderItems,
    },
  };
}

// Hook para upload de arquivos
export function useCollectionUpload() {
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    progress: 0,
    error: null as string | null,
  });

  const uploadCoverImage = useCallback(async (file: File) => {
    setUploadState({ isUploading: true, progress: 0, error: null });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/collections/upload/cover', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro no upload');
      }

      const result = await response.json();
      setUploadState({ isUploading: false, progress: 100, error: null });
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no upload';
      setUploadState({ isUploading: false, progress: 0, error: errorMessage });
      throw error;
    }
  }, []);

  return {
    ...uploadState,
    uploadCoverImage,
  };
}