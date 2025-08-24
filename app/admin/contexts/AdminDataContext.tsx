'use client';

import React, { createContext, useContext, ReactNode } from 'react';

import { useAdminAuth, useAdminData, type AdminUser } from '@/app/admin/hooks';

// [DEBUG] Context tracking
let _adminDataContextInstanceCount = 0;

interface AdminStats {
  total: number;
  active: number;
  inactive: number;
  [key: string]: number;
}

interface AdminDataContextType<T> {
  // Auth data
  user: AdminUser | null;
  authLoading: boolean;
  
  // Data management
  data: T[];
  loading: boolean;
  stats: AdminStats;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
  filters: Record<string, unknown>;
  updateFilters: (newFilters: Record<string, unknown>) => void;
  updatePagination: (newPagination: Partial<{ currentPage: number; limit: number }>) => void;
  reload: () => void;
  isLoading: boolean;
}

const AdminDataContext = createContext<AdminDataContextType<unknown> | null>(null);

interface AdminDataProviderProps<_T> {
  children: ReactNode;
  endpoint: string;
  initialFilters?: Record<string, unknown>;
  initialPagination?: {
    currentPage: number;
    limit: number;
  };
  debounceMs?: number;
}

/**
 * AdminDataProvider function
 * @todo Add proper documentation
 */
export function AdminDataProvider<T>({
  children,
  endpoint,
  initialFilters = {},
  initialPagination = { currentPage: 1, limit: 20 },
  debounceMs = 300
}: AdminDataProviderProps<T>) {
  _adminDataContextInstanceCount++;

  // Usar hooks estáveis dentro do contexto
  const { user, loading: authLoading } = useAdminAuth();
  const adminData = useAdminData<T>({
    endpoint,
    initialFilters,
    initialPagination,
    debounceMs
  });

  const contextValue: AdminDataContextType<T> = {
    user,
    authLoading,
    ...adminData
  };

  return (
    <AdminDataContext.Provider value={contextValue}>
      {children}
    </AdminDataContext.Provider>
  );
}

/**
 * useAdminDataContext function
 * @todo Add proper documentation
 */
export function useAdminDataContext<T>(): AdminDataContextType<T> {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminDataContext must be used within an AdminDataProvider');
  }
  return context as AdminDataContextType<T>;
}