'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

interface EntityDataOptions<T> {
  table: string;
  entityId?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  select?: string;
  cacheKey?: string;
  cacheDuration?: number;
}

interface DataState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

// Cache global para dados
const dataCache = new Map<string, { data: any; timestamp: number }>();
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useEntityData<T = any>(options: EntityDataOptions<T>) {
  const supabase = useMemo(() => createClient(), []);
  
  const {
    table,
    entityId,
    filters = {},
    orderBy,
    select = '*',
    cacheKey: customCacheKey,
    cacheDuration = DEFAULT_CACHE_DURATION
  } = options;

  const cacheKey = customCacheKey || `${table}-${entityId || 'all'}-${JSON.stringify(filters)}`;

  const [state, setState] = useState<DataState<T>>(() => {
    // Verificar cache
    const cached = dataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return {
        data: cached.data,
        isLoading: false,
        error: null
      };
    }
    
    return {
      data: null,
      isLoading: true,
      error: null
    };
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      let query = supabase.from(table).select(select);

      // Aplicar filtros
      if (entityId) {
        // Determinar a coluna de filtro baseada no tipo de entidade
        const filterColumn = table.includes('sector') && !table.includes('subsector') 
          ? 'sector_id'
          : table.includes('subsector')
          ? 'subsector_id'
          : 'entity_id';
        
        query = query.eq(filterColumn, entityId);
      }

      // Aplicar filtros adicionais
      Object.entries(filters).forEach(([column, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(column, value);
          } else {
            query = query.eq(column, value);
          }
        }
      });

      // Aplicar ordenação
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }

      const { data, error } = await query;

      if (error) {
        setState({
          data: null,
          isLoading: false,
          error: error.message
        });
        return;
      }

      // Atualizar cache
      dataCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      setState({
        data: data as T,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }, [supabase, table, entityId, filters, orderBy, select, cacheKey]);

  const invalidateCache = useCallback(() => {
    dataCache.delete(cacheKey);
  }, [cacheKey]);

  const refetch = useCallback(() => {
    invalidateCache();
    fetchData();
  }, [invalidateCache, fetchData]);

  useEffect(() => {
    // Só buscar se não temos dados em cache válido
    const cached = dataCache.get(cacheKey);
    if (!cached || Date.now() - cached.timestamp >= cacheDuration) {
      fetchData();
    }
  }, [fetchData, cacheKey, cacheDuration]);

  const createItem = useCallback(async (item: Partial<T>) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .insert(item)
        .select()
        .single();

      if (error) throw error;

      // Invalidar cache e refetch
      refetch();
      
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao criar item:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }, [supabase, table, refetch]);

  const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Invalidar cache e refetch
      refetch();
      
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }, [supabase, table, refetch]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Invalidar cache e refetch
      refetch();
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }, [supabase, table, refetch]);

  return {
    ...state,
    refetch,
    invalidateCache,
    createItem,
    updateItem,
    deleteItem
  };
}

// Hook especializado para contagens
export function useEntityCount(table: string, filters?: Record<string, any>) {
  const { data, isLoading, error, refetch } = useEntityData<{ count: number }[]>({
    table,
    filters,
    select: '*',
    cacheKey: `${table}-count-${JSON.stringify(filters)}`,
    cacheDuration: 2 * 60 * 1000 // Cache menor para contagens
  });

  const count = Array.isArray(data) ? data.length : 0;

  return {
    count,
    isLoading,
    error,
    refetch
  };
}