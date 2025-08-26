// Hook reutilizável para operações CRUD
// Centraliza handlers de criação, atualização e exclusão

import { useState, useCallback } from 'react';
import { useAlert } from '@/app/components/alerts';

interface CrudHandlerOptions {
  apiEndpoint: string;
  entityName?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface CrudHandlerReturn<T> {
  isLoading: boolean;
  error: string | null;
  handleCreate: (data: T) => Promise<boolean>;
  handleUpdate: (id: string, data: Partial<T>) => Promise<boolean>;
  handleDelete: (id: string) => Promise<boolean>;
  handleBulkDelete: (ids: string[]) => Promise<boolean>;
  clearError: () => void;
}

export function useCrudHandlers<T = any>(options: CrudHandlerOptions): CrudHandlerReturn<T> {
  const {
    apiEndpoint,
    entityName = 'item',
    onSuccess,
    onError
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError, showSuccess } = useAlert();

  const handleApiError = useCallback((err: any, action: string) => {
    const errorMessage = err.message || `Erro ao ${action} ${entityName}`;
    setError(errorMessage);
    showError(`Erro ao ${action}`, errorMessage);
    onError?.(err);
  }, [entityName, showError, onError]);

  const handleCreate = useCallback(async (data: T): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Erro ao criar');
      }

      showSuccess('Sucesso', `${entityName} criado com sucesso`);
      onSuccess?.();
      return true;
    } catch (err: any) {
      handleApiError(err, 'criar');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint, entityName, showSuccess, onSuccess, handleApiError]);

  const handleUpdate = useCallback(async (id: string, data: Partial<T>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Erro ao atualizar');
      }

      showSuccess('Sucesso', `${entityName} atualizado com sucesso`);
      onSuccess?.();
      return true;
    } catch (err: any) {
      handleApiError(err, 'atualizar');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint, entityName, showSuccess, onSuccess, handleApiError]);

  const handleDelete = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || responseData.message || 'Erro ao excluir');
      }

      showSuccess('Sucesso', `${entityName} excluído com sucesso`);
      onSuccess?.();
      return true;
    } catch (err: any) {
      handleApiError(err, 'excluir');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint, entityName, showSuccess, onSuccess, handleApiError]);

  const handleBulkDelete = useCallback(async (ids: string[]): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiEndpoint}/bulk-delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || responseData.message || 'Erro ao excluir');
      }

      showSuccess('Sucesso', `${ids.length} ${entityName}(s) excluído(s) com sucesso`);
      onSuccess?.();
      return true;
    } catch (err: any) {
      handleApiError(err, 'excluir');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint, entityName, showSuccess, onSuccess, handleApiError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleBulkDelete,
    clearError
  };
}

// Hook estendido com paginação
interface PaginatedCrudOptions extends CrudHandlerOptions {
  pageSize?: number;
}

interface PaginatedCrudReturn<T> extends CrudHandlerReturn<T> {
  currentPage: number;
  totalPages: number;
  items: T[];
  isLoadingItems: boolean;
  fetchItems: (page?: number) => Promise<void>;
  refreshItems: () => Promise<void>;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
}

export function usePaginatedCrudHandlers<T = any>(
  options: PaginatedCrudOptions
): PaginatedCrudReturn<T> {
  const { pageSize = 10, ...crudOptions } = options;
  const crud = useCrudHandlers<T>(crudOptions);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const fetchItems = useCallback(async (page = currentPage) => {
    setIsLoadingItems(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString()
      });

      const response = await fetch(`${options.apiEndpoint}?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar itens');
      }

      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Erro ao buscar itens:', err);
    } finally {
      setIsLoadingItems(false);
    }
  }, [currentPage, pageSize, options.apiEndpoint]);

  const refreshItems = useCallback(() => {
    return fetchItems(currentPage);
  }, [fetchItems, currentPage]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      fetchItems(currentPage + 1);
    }
  }, [currentPage, totalPages, fetchItems]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      fetchItems(currentPage - 1);
    }
  }, [currentPage, fetchItems]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchItems(page);
    }
  }, [totalPages, fetchItems]);

  return {
    ...crud,
    currentPage,
    totalPages,
    items,
    isLoadingItems,
    fetchItems,
    refreshItems,
    nextPage,
    previousPage,
    goToPage
  };
}