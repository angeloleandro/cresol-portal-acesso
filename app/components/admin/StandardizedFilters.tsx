'use client';

import { ReactNode } from 'react';

interface Filter {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: 'search' | 'select';
  placeholder?: string;
  options?: Array<{ value: string; label: string; }>;
}

interface StandardizedFiltersProps {
  filters: Filter[];
  stats?: {
    total: number;
    filtered: number;
  };
  children?: ReactNode;
  className?: string;
}

/**
 * Componente de filtros padronizado seguindo o padrão da página /admin/users
 * 
 * Features:
 * - Layout flexível com suporte a múltiplos filtros
 * - Campo de busca com ícone de lupa
 * - Selects padronizados com estilos consistentes
 * - Estatísticas de contagem (total/filtrado)
 * - Responsividade para mobile
 * - Estados focus consistentes
 */
export default function StandardizedFilters({
  filters,
  stats,
  children,
  className = ''
}: StandardizedFiltersProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 mb-6 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {filters.map((filter) => (
            <div key={filter.id} className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filter.label}
              </label>
              
              {filter.type === 'search' ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg 
                      className="h-4 w-4 text-gray-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    placeholder={filter.placeholder || 'Buscar...'}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
              ) : (
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                >
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
          
          {children && (
            <div className="flex-shrink-0">
              {children}
            </div>
          )}
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="text-sm text-gray-600 text-center lg:text-right">
            <span className="font-medium">
              {stats.filtered !== stats.total ? (
                <>
                  {stats.filtered} de {stats.total} itens
                </>
              ) : (
                <>
                  {stats.total} {stats.total === 1 ? 'item' : 'itens'}
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}