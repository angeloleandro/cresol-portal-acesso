'use client';

import { useState, useRef, useEffect } from 'react';

import { Icon } from '@/app/components/icons/Icon';

interface MultiSelectOption {
  id: string;
  label: string;
  value: string;
  meta?: any; // Additional metadata
}

interface MultiSelectDropdownProps {
  label: string;
  placeholder?: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  searchable?: boolean;
  loading?: boolean;
  error?: string;
  maxHeight?: string;
  showSelectAll?: boolean;
  disabled?: boolean;
}

export default function MultiSelectDropdown({
  label,
  placeholder = 'Selecione...',
  options,
  selectedValues,
  onChange,
  searchable = true,
  loading = false,
  error,
  maxHeight = '300px',
  showSelectAll = true,
  disabled = false
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle select all
  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map(opt => opt.value));
    }
  };

  // Handle individual selection
  const handleToggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  // Get display text
  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const selected = options.find(opt => opt.value === selectedValues[0]);
      return selected?.label || placeholder;
    }
    return `${selectedValues.length} selecionados`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Label */}
      <label className="block text-sm font-medium text-cresol-gray mb-1">
        {label}
      </label>

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={`
          w-full px-3 py-2 text-left border rounded-md
          flex items-center justify-between
          transition-all duration-200
          ${disabled || loading 
            ? 'bg-gray-100 cursor-not-allowed opacity-60' 
            : 'bg-white hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer'
          }
          ${error ? 'border-red-500' : 'border-cresol-gray-light'}
          ${isOpen ? 'ring-2 ring-primary/20 border-primary' : ''}
        `}
      >
        <span className={`truncate ${selectedValues.length === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
          {loading ? 'Carregando...' : getDisplayText()}
        </span>
        <Icon 
          name={isOpen ? 'chevron-up' : 'chevron-down'} 
          className="w-4 h-4 text-gray-400"
        />
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}

      {/* Dropdown Menu */}
      {isOpen && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-cresol-gray-light rounded-md shadow-lg">
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-cresol-gray-light">
              <div className="relative">
                <Icon 
                  name="search" 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar..."
                  className="w-full pl-8 pr-2 py-1 text-sm border border-cresol-gray-light rounded focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Select All Option */}
          {showSelectAll && filteredOptions.length > 0 && (
            <div className="border-b border-cresol-gray-light">
              <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.length === options.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Selecionar todos
                </span>
              </label>
            </div>
          )}

          {/* Options List */}
          <div 
            className="overflow-y-auto"
            style={{ maxHeight }}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                Nenhuma opção encontrada
              </div>
            ) : (
              filteredOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => handleToggleOption(option.value)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 truncate">
                    {option.label}
                  </span>
                </label>
              ))
            )}
          </div>

          {/* Footer with count */}
          {filteredOptions.length > 0 && (
            <div className="px-3 py-2 border-t border-cresol-gray-light bg-gray-50">
              <p className="text-xs text-gray-600">
                {selectedValues.length} de {options.length} selecionados
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}