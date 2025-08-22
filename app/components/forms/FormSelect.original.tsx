'use client';

import React, { forwardRef, useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Spinner 
} from '@nextui-org/react';
import { Icon } from '@/app/components/icons/Icon';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  group?: string;
}

export interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  variant?: 'outline' | 'filled' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  isInvalid?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  noOptionsText?: string;
  loadingText?: string;
  emptyText?: string;
  maxHeight?: number;
  onSearch?: (query: string) => void;
  placeholder?: string;
}

/**
 * FormSelect - Professional HeroUI-based select/dropdown component
 * 
 * Enterprise-grade select component standardized with Cresol navbar dropdown pattern:
 * - HeroUI/NextUI dropdown implementation for consistency
 * - Same API as original FormSelect for seamless migration
 * - Cresol design tokens and hover behaviors
 * - Advanced features: search, groups, loading, clear
 * - Full keyboard accessibility and WCAG 2.1 AA compliance
 * - Optimized hover behavior with debounce (300ms)
 * - React Hook Form compatible
 * 
 * @param options - Array of select options
 * @param variant - Visual style variant
 * @param size - Select size
 * @param isInvalid - Error state
 * @param isLoading - Loading state
 * @param searchable - Enable search functionality
 * @param clearable - Show clear button
 * @param placeholder - Placeholder text
 */
export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(({
  options = [],
  variant = 'outline',
  size = 'md',
  isInvalid = false,
  isLoading = false,
  fullWidth = true,
  searchable = false,
  clearable = false,
  onClear,
  noOptionsText = 'Nenhuma opção disponível',
  loadingText = 'Carregando...',
  emptyText = 'Nenhum resultado encontrado',
  maxHeight = 300,
  onSearch,
  className = '',
  value = '',
  disabled,
  placeholder = 'Selecione uma opção...',
  ...props
}, ref) => {
  // Destructure props for useCallback dependencies
  const { onChange, name } = props;
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Timeout refs for debounced hover behavior (following navbar pattern)
  const dropdownHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Generate unique field ID for accessibility
  const fieldId = useMemo(() => 
    props.id || `form-select-${Math.random().toString(36).substring(2, 9)}`, 
    [props.id]
  );
  
  // Cleanup hover timeouts on unmount (navbar pattern)
  useEffect(() => {
    return () => {
      if (dropdownHoverTimeoutRef.current) {
        clearTimeout(dropdownHoverTimeoutRef.current);
      }
    };
  }, []);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, searchable]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // Group options if they have group property
  const groupedOptions = useMemo(() => {
    const groups: { [key: string]: SelectOption[] } = {};
    const ungrouped: SelectOption[] = [];
    
    filteredOptions.forEach(option => {
      if (option.group) {
        if (!groups[option.group]) {
          groups[option.group] = [];
        }
        groups[option.group].push(option);
      } else {
        ungrouped.push(option);
      }
    });
    
    return { groups, ungrouped };
  }, [filteredOptions]);

  // Find selected option
  const selectedOption = useMemo(() => 
    options.find(option => option.value === value), 
    [options, value]
  );

  // Hover behavior handlers (navbar pattern)
  const handleDropdownMouseEnter = useCallback(() => {
    if (dropdownHoverTimeoutRef.current) {
      clearTimeout(dropdownHoverTimeoutRef.current);
      dropdownHoverTimeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const handleDropdownMouseLeave = useCallback(() => {
    if (dropdownHoverTimeoutRef.current) {
      clearTimeout(dropdownHoverTimeoutRef.current);
    }
    
    dropdownHoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setSearchQuery('');
    }, 300); // 300ms debounce (navbar pattern)
  }, []);

  // Handle option selection
  const handleOptionSelect = useCallback((option: SelectOption) => {
    if (option.disabled || isLoading) return;
    
    // Create synthetic change event for React Hook Form compatibility
    const syntheticEvent = {
      target: { value: option.value, name },
      currentTarget: { value: option.value, name }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    if (onChange) {
      onChange(syntheticEvent);
    }
    
    setIsOpen(false);
    setSearchQuery('');
  }, [isLoading, onChange, name]);

  // Handle search input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (onSearch) {
      onSearch(query);
    }
  }, [onSearch]);

  // Handle clear action
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onClear) {
      onClear();
    }
    
    // Create synthetic clear event
    const syntheticEvent = {
      target: { value: '', name },
      currentTarget: { value: '', name }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    if (onChange) {
      onChange(syntheticEvent);
    }
    
    setSearchQuery('');
  }, [onClear, onChange, name]);


  // Get container width classes
  const containerClasses = [
    'form-select-container',
    fullWidth ? 'w-full' : 'w-auto',
    className
  ].filter(Boolean).join(' ');

  // Prepare menu items (including grouped options)
  const menuItems = [];
  
  // Add ungrouped options
  groupedOptions.ungrouped.forEach((option) => {
    menuItems.push({
      option,
      isGroup: false
    });
  });
  
  // Add grouped options
  Object.entries(groupedOptions.groups).forEach(([groupName, groupOptions]) => {
    // Add group header
    menuItems.push({
      key: `group-${groupName}`,
      groupName,
      isGroupHeader: true
    });
    
    // Add group options
    groupOptions.forEach((option) => {
      menuItems.push({
        option,
        groupName
      });
    });
  });

  return (
    <div className={containerClasses}>
      {/* Hidden native select for form submission and accessibility fallback */}
      <select
        ref={ref}
        value={value}
        disabled={disabled || isLoading}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        name={props.name}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* HeroUI Dropdown */}
      <div 
        onMouseEnter={handleDropdownMouseEnter}
        onMouseLeave={handleDropdownMouseLeave}
      >
        <Dropdown 
          placement="bottom-start"
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          shouldFlip={true}
          shouldCloseOnBlur={true}
          classNames={{
            content: "min-w-[200px] bg-white border border-gray-200 rounded-md shadow-lg",
          }}
        >
          <DropdownTrigger>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              aria-label={props['aria-label'] || 'Selecionar opção'}
              className={`
                w-full px-3 py-2 text-left border
                flex items-center justify-between
                transition-all duration-200
                ${disabled || isLoading
                  ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                  : `${variant === 'filled' ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white'} hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer`
                }
                ${variant === 'underline' ? 'rounded-none border-t-0 border-l-0 border-r-0 border-b-2' : 'rounded-md'}
                ${isInvalid ? 'border-red-500' : 'border-gray-300'}
                ${isOpen ? 'ring-2 ring-primary/20 border-primary' : ''}
              `}
              style={{
                minHeight: size === 'sm' ? '2.25rem' : size === 'lg' ? '3rem' : '2.75rem',
                borderColor: isOpen ? '#F58220' : (isInvalid ? '#ef4444' : '#d1d5db'),
                borderWidth: '1px'
              }}
              onMouseEnter={(e) => {
                if (!disabled && !isLoading && !isOpen && !isInvalid) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#F58220';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled && !isLoading && !isOpen && !isInvalid) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#d1d5db';
                }
              }}
              disabled={disabled || isLoading}
            >
              {/* Text Content */}
              <span className={`truncate flex-1 ${
                selectedOption ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {isLoading ? (
                  loadingText
                ) : selectedOption ? (
                  <>
                    {selectedOption.label}
                    {selectedOption.description && (
                      <span className="text-gray-500 text-sm ml-2">
                        {selectedOption.description}
                      </span>
                    )}
                  </>
                ) : (
                  placeholder
                )}
              </span>

              {/* Icons Container */}
              <div className="flex items-center gap-1 ml-2">
                {/* Clear Button */}
                {clearable && selectedOption && !isLoading && (
                  <span
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear(e as any);
                    }}
                    aria-label="Limpar seleção"
                  >
                    <Icon name="X" className="h-4 w-4" />
                  </span>
                )}
                
                {/* Loading Spinner */}
                {isLoading && (
                  <Spinner size="sm" />
                )}
                
                {/* Dropdown Arrow */}
                {!isLoading && (
                  <Icon 
                    name={isOpen ? "chevron-up" : "chevron-down"} 
                    className="h-4 w-4 text-gray-400 transition-transform" 
                  />
                )}
              </div>
            </button>
          </DropdownTrigger>

          <DropdownMenu
            aria-label={props['aria-label'] || 'Selecionar opção'}
            className="p-1"
            disabledKeys={options.filter(opt => opt.disabled).map(opt => opt.value)}
            itemClasses={{
              base: [
                "rounded-md",
                "px-2",
                "py-1.5",
                "text-gray-700",
                "transition-colors",
                "duration-150",
                "cursor-pointer",
                "data-[hover=true]:bg-primary",
                "data-[hover=true]:text-white",
                "data-[selectable=true]:focus:bg-primary", 
                "data-[selectable=true]:focus:text-white",
                "data-[disabled=true]:opacity-50",
                "data-[disabled=true]:cursor-not-allowed"
              ],
            }}
          >
            {/* Search Input */}
            {searchable ? (
              <DropdownItem
                key="search"
                className="p-0 mb-1 hover:bg-transparent focus:bg-transparent data-[hover=true]:bg-transparent"
                isReadOnly
                textValue="search"
              >
                <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-white">
                  <Icon name="search" className="h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400 text-gray-700 focus:outline-none"
                    autoComplete="off"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </DropdownItem>
            ) : null}
            
            {/* Options or Empty State */}
            {filteredOptions.length === 0 ? (
              <DropdownItem 
                key="empty" 
                isReadOnly 
                textValue="empty"
                className="hover:bg-transparent focus:bg-transparent data-[hover=true]:bg-transparent cursor-default"
              >
                <div className="flex flex-col items-center justify-center py-4 text-gray-400">
                  <Icon name="search" className="h-6 w-6 mb-2" />
                  <span className="text-sm">
                    {searchQuery ? emptyText : noOptionsText}
                  </span>
                </div>
              </DropdownItem>
            ) : (
              <>
                {/* Ungrouped Options */}
                {groupedOptions.ungrouped.map((option) => (
                  <DropdownItem
                    key={option.value}
                    className={option.value === value ? 'bg-primary/10 text-primary font-medium' : ''}
                    onPress={() => handleOptionSelect(option)}
                    textValue={option.label}
                  >
                    <div className="flex flex-col">
                      <span className="truncate">{option.label}</span>
                      {option.description && (
                        <span className={`text-xs truncate ${
                          option.value === value ? 'text-primary/70' : 'text-gray-500'
                        }`}>
                          {option.description}
                        </span>
                      )}
                    </div>
                  </DropdownItem>
                ))}
                
                {/* Grouped Options */}
                {Object.entries(groupedOptions.groups).map(([groupName, groupOptions]) => (
                  <div key={groupName}>
                    {/* Group Header */}
                    <DropdownItem
                      key={`group-header-${groupName}`}
                      className="font-medium text-xs text-gray-500 px-2 py-1 cursor-default hover:bg-transparent focus:bg-transparent data-[hover=true]:bg-transparent"
                      isReadOnly
                      textValue={groupName}
                    >
                      {groupName}
                    </DropdownItem>
                    
                    {/* Group Options */}
                    {groupOptions.map((option) => (
                      <DropdownItem
                        key={option.value}
                        className={`ml-2 ${option.value === value ? 'bg-primary/10 text-primary font-medium' : ''}`}
                        onPress={() => handleOptionSelect(option)}
                        textValue={option.label}
                      >
                        <div className="flex flex-col">
                          <span className="truncate">{option.label}</span>
                          {option.description && (
                            <span className={`text-xs truncate ${
                              option.value === value ? 'text-primary/70' : 'text-gray-500'
                            }`}>
                              {option.description}
                            </span>
                          )}
                        </div>
                      </DropdownItem>
                    ))}
                  </div>
                ))}
              </>
            )}
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;