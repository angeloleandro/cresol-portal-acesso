'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useState, useCallback } from 'react';

export interface NewsEvent {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  description?: string;
  is_published?: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at?: string;
  sector_id?: string;
  subsector_id?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
}

interface UseRealtimeNewsOptions {
  tableName: 'sector_news' | 'sector_events' | 'subsector_news' | 'subsector_events';
  entityId?: string;
  entityType?: 'sector' | 'subsector';
  includeUnpublished?: boolean;
  onInsert?: (payload: NewsEvent) => void;
  onUpdate?: (payload: NewsEvent) => void;
  onDelete?: (payload: { id: string }) => void;
}

/**
 * useRealtimeNews function
 * @todo Add proper documentation
 */
export function useRealtimeNews({
  tableName,
  entityId,
  entityType,
  includeUnpublished = false,
  onInsert,
  onUpdate,
  onDelete
}: UseRealtimeNewsOptions) {
  const [data, setData] = useState<NewsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const supabase = createClientComponentClient();

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(tableName).select('*');

      // Add entity filter if provided
      if (entityId && entityType) {
        const columnName = entityType === 'sector' ? 'sector_id' : 'subsector_id';
        query = query.eq(columnName, entityId);
      }

      // Filter by published status if not including unpublished
      if (!includeUnpublished) {
        // Handle both column names for compatibility
        if (tableName.includes('news')) {
          query = query.or('is_published.eq.true,published.eq.true');
        } else if (tableName.includes('events')) {
          query = query.or('is_published.eq.true,published.eq.true');
        }
      }

      // Add ordering
      const orderColumn = tableName.includes('events') ? 'start_date' : 'created_at';
      query = query.order(orderColumn, { ascending: false });

      const { data: fetchedData, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setData(fetchedData || []);
      }
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [tableName, entityId, entityType, includeUnpublished, supabase]);

  // Setup realtime subscription
  useEffect(() => {
    fetchData();

    // Create filter for realtime subscription
    let filter = '';
    if (entityId && entityType) {
      const columnName = entityType === 'sector' ? 'sector_id' : 'subsector_id';
      filter = `${columnName}=eq.${entityId}`;
    }

    // Setup realtime subscription
    const subscriptionChannel = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: tableName,
          filter: filter || undefined
        },
        (payload: any) => {
          const rawItem = payload.new as any;
          // Map legacy fields to new fields for compatibility
          const newItem: NewsEvent = {
            ...rawItem,
            is_published: rawItem.is_published ?? rawItem.published,
            is_featured: rawItem.is_featured ?? rawItem.featured
          };
          
          // Check if should include based on published status
          const isPublished = newItem.is_published;
          if (!includeUnpublished && !isPublished) return;
          
          setData(prev => [newItem, ...prev]);
          onInsert?.(newItem);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: tableName,
          filter: filter || undefined
        },
        (payload: any) => {
          const rawItem = payload.new as any;
          // Map legacy fields to new fields for compatibility
          const updatedItem: NewsEvent = {
            ...rawItem,
            is_published: rawItem.is_published ?? rawItem.published,
            is_featured: rawItem.is_featured ?? rawItem.featured
          };
          
          // Check if should include based on published status
          const isPublished = updatedItem.is_published;
          
          setData(prev => {
            // If not including unpublished and item is unpublished, remove it
            if (!includeUnpublished && !isPublished) {
              return prev.filter(item => item.id !== updatedItem.id);
            }
            
            // Otherwise update the item
            return prev.map(item => 
              item.id === updatedItem.id ? updatedItem : item
            );
          });
          onUpdate?.(updatedItem);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: tableName,
          filter: filter || undefined
        },
        (payload: any) => {
          const deletedItem = payload.old as { id: string };
          
          setData(prev => prev.filter(item => item.id !== deletedItem.id));
          onDelete?.(deletedItem);
        }
      )
      .subscribe();

    setChannel(subscriptionChannel);

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionChannel) {
        supabase.removeChannel(subscriptionChannel);
      }
    };
  }, [tableName, entityId, entityType, includeUnpublished, supabase, fetchData, onInsert, onUpdate, onDelete]);

  // Refresh data manually
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Toggle published status
  const togglePublished = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ 
          is_published: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (err) {
      throw err;
    }
  }, [tableName, supabase]);

  // Toggle featured status (for items that support it)
  const toggleFeatured = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ 
          is_featured: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (err) {
      throw err;
    }
  }, [tableName, supabase]);

  return {
    data,
    loading,
    error,
    refresh,
    togglePublished,
    toggleFeatured,
    isConnected: channel?.state === 'joined'
  };
}