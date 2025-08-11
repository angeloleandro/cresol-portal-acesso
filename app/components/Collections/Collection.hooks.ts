// Collection Hooks - Portal Cresol
// Simplified hooks following portal patterns with proper auth

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Collection, 
  CollectionItem, 
  CollectionFilters, 
  CollectionStats
} from '@/lib/types/collections';
import { COLLECTION_CONFIG } from '@/lib/constants/collections';

// Hook principal para gerenciar coleções - Pattern com auth
export function useCollections(initialFilters?: Partial<CollectionFilters>) {
  const supabase = createClientComponentClient();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [hasMore, setHasMore] = useState(false);
  
  const [filters, setFilters] = useState<CollectionFilters>({
    search: '',
    type: 'all',
    status: 'all',
    sort_by: 'order_index',
    sort_order: 'asc',
    page: 1,
    limit: COLLECTION_CONFIG.DEFAULT_PAGE_SIZE,
    ...initialFilters,
  });

  // Fetch collections via API with auth headers
  const fetchCollections = useCallback(async (newFilters?: Partial<CollectionFilters>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get auth session for headers
      const { data: { session } } = await supabase.auth.getSession();
      
      const currentFilters = { ...filters, ...newFilters };
      const searchParams = new URLSearchParams();
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== 'all') {
          searchParams.append(key, value.toString());
        }
      });
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(`/api/collections?${searchParams}`, {
        headers,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar coleções');
      }
      
      const data = await response.json();
      setCollections(data.collections || []);
      setHasMore(data.has_more || false);
      setFilters(currentFilters);
      
    } catch (error) {
      console.error('Erro ao buscar coleções:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, [filters, supabase]);

  // Fetch stats via API with auth
  const fetchStats = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch('/api/admin/collections/stats', {
        headers,
        credentials: 'include',
      });
      
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (error) {
      console.info('Stats indisponíveis');
    }
  }, [supabase]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<CollectionFilters>) => {
    fetchCollections({ ...newFilters, page: 1 });
  }, [fetchCollections]);

  // Refresh collections
  const refresh = useCallback(async () => {
    await fetchCollections();
    fetchStats();
  }, [fetchCollections, fetchStats]);

  // CRUD Operations - With auth
  const createCollection = useCallback(async (data: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await fetch('/api/collections', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar coleção');
    }

    await refresh();
    return response.json();
  }, [refresh, supabase]);

  const updateCollection = useCallback(async (id: string, data: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`/api/collections/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar coleção');
    }

    await refresh();
    return response.json();
  }, [refresh, supabase]);

  const deleteCollection = useCallback(async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`/api/collections/${id}`, { 
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao excluir coleção');
    }

    await refresh();
  }, [refresh, supabase]);

  const toggleCollectionStatus = useCallback(async (id: string, isActive: boolean) => {
    await updateCollection(id, { is_active: isActive });
  }, [updateCollection]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchCollections({ ...filters, page: filters.page + 1 });
    }
  }, [loading, hasMore, filters, fetchCollections]);

  // Initial load
  useEffect(() => {
    fetchCollections();
    fetchStats();
  }, [fetchCollections, fetchStats]);

  return {
    collections,
    loading,
    error,
    stats,
    filters,
    hasMore,
    actions: {
      updateFilters,
      refresh,
      createCollection,
      updateCollection,
      deleteCollection,
      toggleCollectionStatus,
      loadMore,
    },
  };
}

// Hook para gerenciar itens de uma coleção with auth
export function useCollectionItems(collectionId: string | null) {
  const supabase = createClientComponentClient();
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);

  // Fetch collection items with auth
  const fetchItems = useCallback(async () => {
    if (!collectionId) return;

    setLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(`/api/collections/${collectionId}/items`, {
        headers,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar itens da coleção');
      }
      
      const data = await response.json();
      setItems(data.items || []);
      setCollection(data.collection);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [collectionId, supabase]);

  // CRUD Operations with auth
  const addItem = useCallback(async (itemId: string, itemType: 'image' | 'video') => {
    if (!collectionId) return;

    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`/api/collections/${collectionId}/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ item_id: itemId, item_type: itemType }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao adicionar item');
    }

    await fetchItems();
    return response.json();
  }, [collectionId, fetchItems, supabase]);

  const removeItem = useCallback(async (itemId: string) => {
    if (!collectionId) return;

    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`/api/collections/${collectionId}/items/${itemId}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao remover item');
    }

    await fetchItems();
  }, [collectionId, fetchItems, supabase]);

  // Load items when collectionId changes
  useEffect(() => {
    fetchItems();
  }, [collectionId, fetchItems]);

  return {
    items,
    loading,
    error,
    collection,
    actions: {
      refresh: fetchItems,
      addItem,
      removeItem,
    },
  };
}

// Hook para upload - With auth
export function useCollectionUpload() {
  const supabase = createClientComponentClient();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadCoverImage = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const formData = new FormData();
      formData.append('file', file);

      const headers: HeadersInit = {};
      
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/collections/upload/cover', {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro no upload');
      }

      return response.json();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no upload';
      setError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [supabase]);

  return {
    isUploading,
    error,
    uploadCoverImage,
  };
}