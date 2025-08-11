'use client';

import React, { forwardRef, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Button,
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

  // Size mapping for HeroUI
  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'sm';
      case 'lg': return 'lg';
      default: return 'md';
    }
  };

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
      key: option.value,
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
      isGroup: true,
      isGroupHeader: true
    });
    
    // Add group options
    groupOptions.forEach((option) => {
      menuItems.push({
        key: option.value,
        option,
        isGroup: true,
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
            content: `min-w-[200px] max-h-[${maxHeight}px] bg-white border border-default-200 rounded-md shadow-lg overflow-y-auto scrollbar-branded`,
          }}
        >
          <DropdownTrigger>
            <Button
              variant="bordered"
              size={getButtonSize()}
              className={`
                h-auto justify-start font-normal
                ${fullWidth ? 'w-full' : 'min-w-[200px]'}
                ${isInvalid ? 'border-danger' : 'border-default-300'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${variant === 'filled' ? 'bg-default-100' : ''}
                ${variant === 'underline' ? 'rounded-none border-t-0 border-l-0 border-r-0' : ''}
              `}
              disabled={disabled || isLoading}
              endContent={
                <div className="flex items-center gap-1">
                  {/* Clear Button */}
                  {clearable && selectedOption && !isLoading && (
                    <button
                      type="button"
                      className="text-default-400 hover:text-default-600 transition-colors"
                      onClick={handleClear}
                      aria-label="Limpar seleção"
                    >
                      <Icon name="X" className="h-4 w-4" />
                    </button>
                  )}
                  
                  {/* Loading Spinner */}
                  {isLoading && (
                    <Spinner size="sm" />
                  )}
                  
                  {/* Dropdown Arrow */}
                  {!isLoading && (
                    <Icon 
                      name={isOpen ? "chevron-up" : "chevron-down"} 
                      className="h-4 w-4 transition-transform text-default-400" 
                    />
                  )}
                </div>
              }
            >
              <span className="text-left truncate">
                {isLoading ? (
                  <span className="text-default-500">{loadingText}</span>
                ) : selectedOption ? (
                  <span className="text-default-900">
                    {selectedOption.label}
                    {selectedOption.description && (
                      <span className="text-default-500 text-sm ml-2">
                        {selectedOption.description}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-default-400">{placeholder}</span>
                )}
              </span>
            </Button>
          </DropdownTrigger>

          <DropdownMenu
            aria-label={props['aria-label'] || 'Selecionar opção'}
            className="p-1 max-h-[70vh] overflow-y-auto scrollbar-branded"
            disabledKeys={options.filter(opt => opt.disabled).map(opt => opt.value)}
            itemClasses={{
              base: [
                "rounded-md",
                "text-default-700",
                "transition-colors",
                "data-[hover=true]:bg-primary",
                "data-[hover=true]:text-white",
                "data-[selectable=true]:focus:bg-primary", 
                "data-[selectable=true]:focus:text-white",
              ],
            }}
          >
            {/* Search Input */}
            {searchable && filteredOptions.length > 0 ? (
              <DropdownItem
                key="search"
                className="p-0 mb-1"
                isReadOnly
                textValue="search"
              >
                <div className="flex items-center gap-2 p-2 border-b border-default-200">
                  <Icon name="search" className="h-4 w-4 text-default-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="flex-1 outline-none text-sm bg-transparent"
                    autoComplete="off"
                  />
                </div>
              </DropdownItem>
            ) : null}
            
            {/* Options or Empty State */}
            {filteredOptions.length === 0 ? (
              <DropdownItem key="empty" isReadOnly textValue="empty">
                <div className="flex flex-col items-center justify-center py-4 text-default-400">
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
                    className={option.value === value ? 'bg-primary/10' : ''}
                    onPress={() => handleOptionSelect(option)}
                    textValue={option.label}
                  >
                    <div className="flex flex-col">
                      <span className="truncate">{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-default-400 truncate">
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
                      className="font-medium text-xs text-default-500 px-2 py-1 cursor-default"
                      isReadOnly
                      textValue={groupName}
                    >
                      {groupName}
                    </DropdownItem>
                    
                    {/* Group Options */}
                    {groupOptions.map((option) => (
                      <DropdownItem
                        key={option.value}
                        className={`ml-2 ${option.value === value ? 'bg-primary/10' : ''}`}
                        onPress={() => handleOptionSelect(option)}
                        textValue={option.label}
                      >
                        <div className="flex flex-col">
                          <span className="truncate">{option.label}</span>
                          {option.description && (
                            <span className="text-xs text-default-400 truncate">
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