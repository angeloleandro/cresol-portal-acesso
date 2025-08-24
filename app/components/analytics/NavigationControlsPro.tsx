'use client';

import { ReactNode, useState, useEffect, memo, useCallback, useMemo } from 'react';

import { Icon } from '@/app/components/icons/Icon';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
  disabled?: boolean;
  icon?: string;
}

interface NavigationControlsProProps {
  /** Tab options for navigation */
  tabs?: FilterOption[];
  /** Currently active tab */
  activeTab?: string;
  /** Tab change handler */
  onTabChange?: (value: string) => void;
  /** Filter options */
  filters?: {
    label: string;
    options: FilterOption[];
    value?: string[];
    multiple?: boolean;
    searchable?: boolean;
  }[];
  /** Filter change handler */
  onFilterChange?: (filterId: string, values: string | string[]) => void;
  /** Period/time range selector */
  periods?: FilterOption[];
  /** Active period */
  activePeriod?: string;
  /** Period change handler */
  onPeriodChange?: (period: string) => void;
  /** Search functionality */
  searchEnabled?: boolean;
  /** Search value */
  searchValue?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  /** Sort options */
  sortOptions?: FilterOption[];
  /** Active sort */
  activeSort?: string;
  /** Sort change handler */
  onSortChange?: (sort: string) => void;
  /** View modes (grid, list, etc.) */
  viewModes?: FilterOption[];
  /** Active view mode */
  activeViewMode?: string;
  /** View mode change handler */
  onViewModeChange?: (mode: string) => void;
  /** Refresh functionality */
  onRefresh?: () => void;
  /** Export functionality */
  onExport?: () => void;
  /** Additional actions */
  extraActions?: ReactNode;
  /** Professional styling variant */
  variant?: 'default' | 'minimal' | 'bordered' | 'glass' | 'elevated';
  /** Size configuration */
  size?: 'sm' | 'md' | 'lg';
  /** Cresol brand color */
  brandColor?: 'orange' | 'green' | 'blue' | 'purple' | 'gray';
  /** Responsive behavior */
  responsive?: boolean;
  /** Loading state */
  isLoading?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    padding: 'p-3',
    text: 'text-sm',
    button: 'px-3 py-1.5 text-xs',
    input: 'px-3 py-1.5 text-sm',
    icon: 'h-4 w-4',
    spacing: 'space-x-2'
  },
  md: {
    padding: 'p-4',
    text: 'text-base',
    button: 'px-4 py-2 text-sm',
    input: 'px-4 py-2 text-sm',
    icon: 'h-5 w-5',
    spacing: 'space-x-3'
  },
  lg: {
    padding: 'p-6',
    text: 'text-lg',
    button: 'px-6 py-3 text-base',
    input: 'px-6 py-3 text-base',
    icon: 'h-6 w-6',
    spacing: 'space-x-4'
  }
};

const NavigationControlsPro = memo(function NavigationControlsPro({
  tabs = [],
  activeTab,
  onTabChange,
  filters = [],
  onFilterChange,
  periods = [],
  activePeriod,
  onPeriodChange,
  searchEnabled = false,
  searchValue = '',
  searchPlaceholder = 'Pesquisar...',
  onSearchChange,
  sortOptions = [],
  activeSort,
  onSortChange,
  viewModes = [],
  activeViewMode,
  onViewModeChange,
  onRefresh,
  onExport,
  extraActions,
  variant = 'default',
  size = 'md',
  brandColor = 'orange',
  responsive = true,
  isLoading = false,
  className = ''
}: NavigationControlsProProps) {
  const [searchInputValue, setSearchInputValue] = useState(searchValue);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Memoized handlers para evitar re-renders desnecessários
  const handleSearchFocus = useCallback(() => setIsSearchFocused(true), []);
  const handleSearchBlur = useCallback(() => setIsSearchFocused(false), []);
  const handleCloseDropdown = useCallback(() => setOpenDropdown(null), []);
  
  const handleSearchChange = useCallback((value: string) => {
    setSearchInputValue(value);
    onSearchChange?.(value);
  }, [onSearchChange]);
  
  const handleSearchClear = useCallback(() => {
    setSearchInputValue('');
    onSearchChange?.('');
  }, [onSearchChange]);

  useEffect(() => {
    setSearchInputValue(searchValue);
  }, [searchValue]);

  // Memoized configuration
  const sizeStyles = useMemo(() => sizeConfig[size], [size]);

  // Memoized variant styles with Cresol brand integration
  const styles = useMemo(() => {
    const brandColors = {
      orange: {
        primary: 'border-orange-200 bg-orange-50',
        accent: 'text-orange-600 bg-orange-500',
        hover: 'hover:border-orange-300 hover:bg-orange-100',
        active: 'bg-orange-500 text-white border-orange-500',
        focus: 'focus:ring-orange-200 focus:border-orange-400'
      },
      green: {
        primary: 'border-emerald-200 bg-emerald-50',
        accent: 'text-emerald-600 bg-emerald-500',
        hover: 'hover:border-emerald-300 hover:bg-emerald-100',
        active: 'bg-emerald-500 text-white border-emerald-500',
        focus: 'focus:ring-emerald-200 focus:border-emerald-400'
      },
      blue: {
        primary: 'border-blue-200 bg-blue-50',
        accent: 'text-blue-600 bg-blue-500',
        hover: 'hover:border-blue-300 hover:bg-blue-100',
        active: 'bg-blue-500 text-white border-blue-500',
        focus: 'focus:ring-blue-200 focus:border-blue-400'
      },
      purple: {
        primary: 'border-purple-200 bg-purple-50',
        accent: 'text-purple-600 bg-purple-500',
        hover: 'hover:border-purple-300 hover:bg-purple-100',
        active: 'bg-purple-500 text-white border-purple-500',
        focus: 'focus:ring-purple-200 focus:border-purple-400'
      },
      gray: {
        primary: 'border-gray-200 bg-gray-50',
        accent: 'text-gray-600 bg-gray-500',
        hover: 'hover:border-gray-300 hover:bg-gray-100',
        active: 'bg-gray-500 text-white border-gray-500',
        focus: 'focus:ring-gray-200 focus:border-gray-400'
      }
    };

    const colors = brandColors[brandColor];

    switch (variant) {
      case 'minimal':
        return {
          container: 'bg-transparent border-0',
          section: 'bg-transparent',
          colors
        };
      case 'bordered':
        return {
          container: `bg-white border-2 ${colors.primary.split(' ')[0]} rounded-md`,
          section: 'bg-transparent',
          colors
        };
      case 'glass':
        return {
          container: 'bg-white/80 backdrop-blur-md border border-white/20 rounded-md shadow-lg',
          section: 'bg-white/50',
          colors
        };
      case 'elevated':
        return {
          container: 'bg-white border border-gray-200 rounded-md shadow-lg',
          section: 'bg-gray-50/50',
          colors
        };
      case 'default':
      default:
        return {
          container: 'bg-white border border-gray-200 rounded-md shadow-sm',
          section: 'bg-gray-50/30',
          colors
        };
    }
  }, [variant, brandColor]);

  // Memoized Professional Tab Component
  const TabButton = memo(function TabButton({ option, isActive }: { option: FilterOption; isActive: boolean }) {
    return (
    <button
      onClick={() => onTabChange?.(option.value)}
      className={`
        ${sizeStyles.button} rounded-lg font-medium transition-all duration-200
        flex items-center space-x-2 relative overflow-hidden
        ${isActive 
          ? `${styles.colors.active} shadow-md transform scale-105` 
          : `bg-white border border-gray-200 text-gray-600 ${styles.colors.hover}`
        }
        ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        focus:outline-none focus:ring-2 ${styles.colors.focus} focus:ring-opacity-50
      `}
      disabled={option.disabled}
    >
      {option.icon && <Icon name={option.icon as any} className={sizeStyles.icon} />}
      <span>{option.label}</span>
      {option.count !== undefined && (
        <span className={`
          px-2 py-0.5 rounded-full text-xs font-semibold
          ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}
        `}>
          {option.count}
        </span>
      )}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30"></div>
      )}
    </button>
    );
  });

  // Enhanced Dropdown Component
  const Dropdown = ({ 
    label, 
    options, 
    value, 
    multiple = false, 
    searchable = false,
    onChange 
  }: { 
    label: string; 
    options: FilterOption[]; 
    value?: string | string[]; 
    multiple?: boolean;
    searchable?: boolean;
    onChange?: (val: string | string[]) => void;
  }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredOptions = searchable 
      ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
      : options;

    const isOpen = openDropdown === label;
    const currentValue = Array.isArray(value) ? value : value ? [value] : [];

    return (
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(isOpen ? null : label)}
          className={`
            ${sizeStyles.button} bg-white border border-gray-200 rounded-lg
            flex items-center justify-between min-w-[120px]
            ${styles.colors.hover} transition-all duration-200
            focus:outline-none focus:ring-2 ${styles.colors.focus} focus:ring-opacity-50
          `}
        >
          <span className="truncate">{label}</span>
          <Icon 
            name={isOpen ? "chevron-up" : "chevron-down"} 
            className={`${sizeStyles.icon} ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {isOpen && (
          <div className={`
            absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg
            z-50 min-w-[200px] max-w-[300px] max-h-[300px] overflow-hidden
          `}>
            {searchable && (
              <div className="p-3 border-b border-gray-100">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Pesquisar ${label.toLowerCase()}...`}
                  className={`
                    w-full ${sizeStyles.input} border border-gray-200 rounded-lg
                    focus:outline-none focus:ring-2 ${styles.colors.focus} focus:ring-opacity-50
                  `}
                />
              </div>
            )}
            
            <div className="max-h-[200px] overflow-y-auto">
              {filteredOptions.map((option) => {
                const isSelected = currentValue.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      if (multiple) {
                        const newValue = isSelected 
                          ? currentValue.filter(v => v !== option.value)
                          : [...currentValue, option.value];
                        onChange?.(newValue);
                      } else {
                        onChange?.(option.value);
                        setOpenDropdown(null);
                      }
                    }}
                    className={`
                      w-full px-4 py-2 text-left flex items-center justify-between
                      ${isSelected 
                        ? `${styles.colors.primary} ${styles.colors.accent.split(' ')[0]}` 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                      transition-colors duration-150
                    `}
                    disabled={option.disabled}
                  >
                    <div className="flex items-center space-x-2">
                      {option.icon && <Icon name={option.icon as any} className={sizeStyles.icon} />}
                      <span>{option.label}</span>
                    </div>
                    {option.count !== undefined && (
                      <span className="text-xs text-gray-500">{option.count}</span>
                    )}
                    {multiple && isSelected && (
                      <Icon name="check" className={`${sizeStyles.icon} ${styles.colors.accent.split(' ')[0]}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Professional Search Component
  const SearchInput = () => (
    <div className="relative flex-1 max-w-md">
      <input
        type="text"
        value={searchInputValue}
        onChange={(e) => {
          setSearchInputValue(e.target.value);
          onSearchChange?.(e.target.value);
        }}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
        placeholder={searchPlaceholder}
        className={`
          w-full ${sizeStyles.input} pl-10 pr-4 
          bg-white border border-gray-200 rounded-lg
          transition-all duration-200
          ${isSearchFocused 
            ? `border-${brandColor}-400 ring-2 ring-${brandColor}-200 ring-opacity-50` 
            : 'focus:border-gray-400'
          }
          focus:outline-none
        `}
      />
      <Icon 
        name="search" 
        className={`
          absolute left-3 top-1/2 transform -translate-y-1/2 ${sizeStyles.icon}
          ${isSearchFocused ? styles.colors.accent.split(' ')[0] : 'text-gray-400'}
          transition-colors duration-200
        `} 
      />
      {searchInputValue && (
        <button
          onClick={() => {
            setSearchInputValue('');
            onSearchChange?.('');
          }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Icon name="x" className={sizeStyles.icon} />
        </button>
      )}
    </div>
  );

  // Action Button Component
  const ActionButton = ({ icon, onClick: onActionClick, tooltip }: { icon: string; onClick?: () => void; tooltip: string }) => (
    <button
      onClick={onActionClick}
      className={`
        ${sizeStyles.button} rounded-lg bg-white border border-gray-200 text-gray-600
        hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300
        transition-all duration-200 hover:scale-105
        focus:outline-none focus:ring-2 ${styles.colors.focus} focus:ring-opacity-50
        flex items-center space-x-2
      `}
      title={tooltip}
      disabled={isLoading}
    >
      <Icon name={icon as any} className={`${sizeStyles.icon} ${isLoading ? 'animate-spin' : ''}`} />
    </button>
  );

  if (isLoading) {
    return (
      <div className={`${styles.container} ${sizeStyles.padding} ${className}`}>
        <div className="animate-pulse flex items-center justify-between">
          <div className="flex space-x-3">
            <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${sizeStyles.padding} ${className}`}>
      {/* Main Navigation Row */}
      <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4`}>
        
        {/* Left Section - Tabs and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Tabs */}
          {tabs.length > 0 && (
            <div className={`flex items-center ${sizeStyles.spacing} bg-gray-50 rounded-lg p-1`}>
              {tabs.map((tab) => (
                <TabButton 
                  key={tab.value} 
                  option={tab} 
                  isActive={activeTab === tab.value} 
                />
              ))}
            </div>
          )}

          {/* Period Selector */}
          {periods.length > 0 && (
            <Dropdown
              label="Período"
              options={periods}
              value={activePeriod}
              onChange={(val) => onPeriodChange?.(val as string)}
            />
          )}

          {/* Additional Filters */}
          {filters.map((filter, index) => (
            <Dropdown
              key={index}
              label={filter.label}
              options={filter.options}
              value={filter.value}
              multiple={filter.multiple}
              searchable={filter.searchable}
              onChange={(val) => onFilterChange?.(filter.label, val)}
            />
          ))}

          {/* Sort Options */}
          {sortOptions.length > 0 && (
            <Dropdown
              label="Ordenar"
              options={sortOptions}
              value={activeSort}
              onChange={(val) => onSortChange?.(val as string)}
            />
          )}
        </div>

        {/* Right Section - Search and Actions */}
        <div className="flex items-center gap-3">
          
          {/* Search */}
          {searchEnabled && <SearchInput />}

          {/* View Mode Toggle */}
          {viewModes.length > 0 && (
            <div className="flex bg-gray-50 rounded-lg p-1">
              {viewModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => onViewModeChange?.(mode.value)}
                  className={`
                    px-3 py-1.5 rounded-md transition-all duration-200
                    ${activeViewMode === mode.value 
                      ? styles.colors.active 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                    }
                  `}
                  title={mode.label}
                >
                  <Icon name={mode.icon as any} className={sizeStyles.icon} />
                </button>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <ActionButton 
                icon="refresh" 
                onClick={onRefresh} 
                tooltip="Atualizar dados"
              />
            )}
            
            {onExport && (
              <ActionButton 
                icon="download" 
                onClick={onExport} 
                tooltip="Exportar dados"
              />
            )}
          </div>

          {/* Extra Actions */}
          {extraActions && (
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-3">
              {extraActions}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={handleCloseDropdown}
        />
      )}
    </div>
  );
});

NavigationControlsPro.displayName = 'NavigationControlsPro';

export default NavigationControlsPro;