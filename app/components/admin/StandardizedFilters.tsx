'use client';

import { ReactNode } from 'react';

import { ChakraSelect, ChakraSelectOption } from '@/app/components/forms';
import { CRESOL_UI_CONFIG, CRESOL_SPACING_SYSTEM } from '@/lib/design-tokens';

interface Filter {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: 'search' | 'select';
  placeholder?: string;
  options?: ChakraSelectOption[];
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

export default function StandardizedFilters({
  filters,
  stats,
  children,
  className = ''
}: StandardizedFiltersProps) {
  return (
    <div className={`${CRESOL_UI_CONFIG.card.base} ${CRESOL_SPACING_SYSTEM.card.standard} ${CRESOL_SPACING_SYSTEM.config.margin.xl} ${className}`}>
      <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-between ${CRESOL_SPACING_SYSTEM.config.gap.lg}`}>
        {/* Filtros */}
        <div className={`flex flex-col sm:flex-row ${CRESOL_SPACING_SYSTEM.config.gap.md} flex-1`}>
          {filters.map((filter) => (
            <div key={filter.id} className="flex-1 min-w-0">
              <label className={CRESOL_UI_CONFIG.input.label.default}>
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
                    className={`${CRESOL_UI_CONFIG.input.base} ${CRESOL_UI_CONFIG.input.variants.outline.classes} ${CRESOL_UI_CONFIG.input.variants.outline.states.default} ${CRESOL_UI_CONFIG.input.sizes.md.classes}`}
                  />
                </div>
              ) : (
                <ChakraSelect
                  options={filter.options || []}
                  value={filter.value}
                  onChange={(value) => filter.onChange(value as string)}
                  placeholder={filter.placeholder}
                  size="md"
                  variant="outline"
                  fullWidth
                />
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