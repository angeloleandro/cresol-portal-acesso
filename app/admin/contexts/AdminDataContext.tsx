'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAdminAuth, useAdminData } from '@/app/admin/hooks';

// [DEBUG] Context tracking
let adminDataContextInstanceCount = 0;

interface AdminDataContextType<T> {
  // Auth data
  user: any;
  authLoading: boolean;
  
  // Data management
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
  updateFilters: (newFilters: Record<string, any>) => void;
  updatePagination: (newPagination: Partial<{ currentPage: number; limit: number }>) => void;
  reload: () => void;
  isLoading: boolean;
}

const AdminDataContext = createContext<AdminDataContextType<any> | null>(null);

interface AdminDataProviderProps<T> {
  children: ReactNode;
  endpoint: string;
  initialFilters?: Record<string, any>;
  initialPagination?: {
    currentPage: number;
    limit: number;
  };
  debounceMs?: number;
}

export function AdminDataProvider<T>({
  children,
  endpoint,
  initialFilters = {},
  initialPagination = { currentPage: 1, limit: 20 },
  debounceMs = 300
}: AdminDataProviderProps<T>) {
  adminDataContextInstanceCount++;
  const contextInstanceId = `admin-context-${endpoint}-${adminDataContextInstanceCount}-${Date.now()}`;
  
  console.log('[DEBUG-CONTEXT] =============== ADMIN CONTEXT CRIADO ===============');
  console.log('[DEBUG-CONTEXT] AdminDataProvider created:', {
    contextInstanceId,
    endpoint,
    instanceCount: adminDataContextInstanceCount,
    timestamp: new Date().toISOString()
  });

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

  console.log('[DEBUG-CONTEXT] AdminDataProvider value:', {
    contextInstanceId,
    endpoint,
    hasUser: !!user,
    dataLength: adminData.data.length,
    loading: adminData.loading,
    timestamp: new Date().toISOString()
  });

  return (
    <AdminDataContext.Provider value={contextValue}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminDataContext<T>(): AdminDataContextType<T> {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminDataContext must be used within an AdminDataProvider');
  }
  return context as AdminDataContextType<T>;
}