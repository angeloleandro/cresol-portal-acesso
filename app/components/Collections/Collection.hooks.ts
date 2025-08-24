// Collection Hooks - Portal Cresol - DEPRECATED
// ⚠️ ESTE ARQUIVO FOI DEPRECIADO - Use @/app/contexts/CollectionsContext em vez do useCollections
// Apenas useCollectionItems e useCollectionUpload ainda estão em uso

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState, useEffect, useCallback } from 'react';

import { COLLECTION_CONFIG } from '@/lib/constants/collections';
import { 
  Collection, 
  CollectionItem, 
  CollectionFilters, 
  CollectionStats
} from '@/lib/types/collections';

// ⚠️ useCollections foi MOVIDO para @/app/contexts/CollectionsContext 
// Este hook não deve mais ser usado - causava re-renders excessivos

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