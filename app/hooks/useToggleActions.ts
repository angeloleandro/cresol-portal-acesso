/**
 * Hook para centralizar ações de toggle (published, featured, etc)
 * Elimina duplicação de lógica entre componentes
 */

import { useState, useCallback } from 'react';
import { GenericContentAdapter, BaseContentData } from '@/app/admin-subsetor/subsetores/[id]/components/adapters/GenericContentAdapter';

interface UseToggleActionsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useToggleActions<T extends BaseContentData>(
  adapter: GenericContentAdapter<T>,
  options?: UseToggleActionsOptions
) {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  /**
   * Toggle published status
   */
  const togglePublished = useCallback(async (
    id: string, 
    currentStatus: boolean
  ): Promise<boolean> => {
    setLoading(prev => ({ ...prev, [`published-${id}`]: true }));
    setError(null);

    try {
      await adapter.togglePublished(id, !currentStatus);
      options?.onSuccess?.();
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      options?.onError?.(error);
      console.error('Erro ao alterar status de publicação:', error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, [`published-${id}`]: false }));
    }
  }, [adapter, options]);

  /**
   * Toggle featured status
   */
  const toggleFeatured = useCallback(async (
    id: string, 
    currentStatus: boolean
  ): Promise<boolean> => {
    setLoading(prev => ({ ...prev, [`featured-${id}`]: true }));
    setError(null);

    try {
      await adapter.toggleFeatured(id, !currentStatus);
      options?.onSuccess?.();
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      options?.onError?.(error);
      console.error('Erro ao alterar destaque:', error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, [`featured-${id}`]: false }));
    }
  }, [adapter, options]);

  /**
   * Toggle genérico para qualquer campo booleano
   */
  const toggleField = useCallback(async (
    id: string,
    fieldName: keyof T,
    currentValue: boolean
  ): Promise<boolean> => {
    setLoading(prev => ({ ...prev, [`${String(fieldName)}-${id}`]: true }));
    setError(null);

    try {
      await adapter.update(id, { [fieldName]: !currentValue } as Partial<T>);
      options?.onSuccess?.();
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      options?.onError?.(error);
      console.error(`Erro ao alterar ${String(fieldName)}:`, error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, [`${String(fieldName)}-${id}`]: false }));
    }
  }, [adapter, options]);

  /**
   * Batch toggle - altera múltiplos items de uma vez
   */
  const batchToggle = useCallback(async (
    items: Array<{ id: string; field: keyof T; value: boolean }>
  ): Promise<boolean> => {
    setLoading(prev => ({ ...prev, batch: true }));
    setError(null);

    try {
      const updates = items.map(item =>
        adapter.update(item.id, { [item.field]: item.value } as Partial<T>)
      );
      
      const results = await Promise.allSettled(updates);
      
      // Separate successes from failures
      const successes = results
        .map((result, index) => ({ result, item: items[index] }))
        .filter(({ result }) => result.status === 'fulfilled');
      
      const failures = results
        .map((result, index) => ({ result, item: items[index] }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ result, item }) => ({
          id: item.id,
          error: result.status === 'rejected' ? result.reason : 'Unknown error'
        }));

      // Handle results
      if (failures.length > 0) {
        const failedIds = failures.map(f => f.id).join(', ');
        const errorMessages = failures.map(f => `${f.id}: ${f.error.message || f.error}`).join('; ');
        const aggregatedError = new Error(`Falha ao alterar itens [${failedIds}]: ${errorMessages}`);
        
        setError(aggregatedError.message);
        options?.onError?.(aggregatedError);
        console.error('Erro ao alterar múltiplos items:', failures);
        
        // Call onSuccess only if there were some successes
        if (successes.length > 0) {
          options?.onSuccess?.();
        }
        
        return false;
      } else {
        // All succeeded
        setError(null);
        options?.onSuccess?.();
        return true;
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      options?.onError?.(error);
      console.error('Erro ao alterar múltiplos items:', error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, batch: false }));
    }
  }, [adapter, options]);

  /**
   * Toggle com confirmação
   */
  const toggleWithConfirmation = useCallback(async (
    id: string,
    fieldName: keyof T,
    currentValue: boolean,
    confirmMessage: string
  ): Promise<boolean> => {
    if (!window.confirm(confirmMessage)) {
      return false;
    }

    return toggleField(id, fieldName, currentValue);
  }, [toggleField]);

  /**
   * Helpers para verificar estado de loading
   */
  const isToggling = useCallback((type: 'published' | 'featured', id: string): boolean => {
    return loading[`${type}-${id}`] || false;
  }, [loading]);

  const isAnyToggling = useCallback((): boolean => {
    return Object.values(loading).some(value => value);
  }, [loading]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Ações principais
    togglePublished,
    toggleFeatured,
    toggleField,
    batchToggle,
    toggleWithConfirmation,
    
    // Estado
    loading,
    error,
    isToggling,
    isAnyToggling,
    
    // Utilities
    clearError
  };
}