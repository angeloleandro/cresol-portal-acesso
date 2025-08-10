'use client';

import { ReactNode, useState, useEffect, Fragment } from 'react';
import { Tab, Menu, Combobox, Transition } from '@headlessui/react';
import { Icon } from '@/app/components/icons/Icon';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
  disabled?: boolean;
  icon?: string;
  description?: string;
}

interface AccessibleNavigationProps {
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
  /** Search functionality */
  searchEnabled?: boolean;
  /** Search value */
  searchValue?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
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
  /** Loading state */
  isLoading?: boolean;
  /** WCAG 2.1 AA Accessibility Props */
  ariaLabel?: string;
  skipLinkTarget?: string;
  landmarkRole?: string;
  className?: string;
}

const sizeConfig = {
  sm: {
    padding: 'p-3',
    text: 'text-sm',
    button: 'px-3 py-1.5 text-xs min-h-[32px]',
    input: 'px-3 py-1.5 text-sm min-h-[32px]',
    icon: 'h-4 w-4',
    spacing: 'space-x-2',
    focusRing: 'focus:ring-1 focus:ring-offset-1',
  },
  md: {
    padding: 'p-4',
    text: 'text-base',
    button: 'px-4 py-2 text-sm min-h-[44px]',
    input: 'px-4 py-2 text-sm min-h-[44px]',
    icon: 'h-5 w-5',
    spacing: 'space-x-3',
    focusRing: 'focus:ring-2 focus:ring-offset-2',
  },
  lg: {
    padding: 'p-6',
    text: 'text-lg',
    button: 'px-6 py-3 text-base min-h-[48px]',
    input: 'px-6 py-3 text-base min-h-[48px]',
    icon: 'h-6 w-6',
    spacing: 'space-x-4',
    focusRing: 'focus:ring-2 focus:ring-offset-2',
  }
};

export default function AccessibleNavigation({
  tabs = [],
  activeTab,
  onTabChange,
  filters = [],
  onFilterChange,
  searchEnabled = false,
  searchValue = '',
  searchPlaceholder = 'Pesquisar...',
  onSearchChange,
  viewModes = [],
  activeViewMode,
  onViewModeChange,
  onRefresh,
  onExport,
  extraActions,
  variant = 'default',
  size = 'md',
  brandColor = 'orange',
  isLoading = false,
  ariaLabel = 'Navegação e controles do dashboard',
  skipLinkTarget,
  landmarkRole = 'navigation',
  className = ''
}: AccessibleNavigationProps) {
  const [searchInputValue, setSearchInputValue] = useState(searchValue);
  const [comboboxQuery, setComboboxQuery] = useState('');

  useEffect(() => {
    setSearchInputValue(searchValue);
  }, [searchValue]);

  const sizeStyles = sizeConfig[size];

  // Enhanced variant styles with Cresol brand integration
  const getVariantStyles = () => {
    const brandColors = {
      orange: {
        primary: 'border-orange-200 bg-orange-50',
        accent: 'text-orange-600 bg-orange-500',
        hover: 'hover:border-orange-300 hover:bg-orange-100',
        active: 'bg-orange-500 text-white border-orange-500 shadow-md',
        focus: 'focus:ring-orange-200 focus:border-orange-400'
      },
      green: {
        primary: 'border-emerald-200 bg-emerald-50',
        accent: 'text-emerald-600 bg-emerald-500',
        hover: 'hover:border-emerald-300 hover:bg-emerald-100',
        active: 'bg-emerald-500 text-white border-emerald-500 shadow-md',
        focus: 'focus:ring-emerald-200 focus:border-emerald-400'
      },
      blue: {
        primary: 'border-blue-200 bg-blue-50',
        accent: 'text-blue-600 bg-blue-500',
        hover: 'hover:border-blue-300 hover:bg-blue-100',
        active: 'bg-blue-500 text-white border-blue-500 shadow-md',
        focus: 'focus:ring-blue-200 focus:border-blue-400'
      },
      purple: {
        primary: 'border-purple-200 bg-purple-50',
        accent: 'text-purple-600 bg-purple-500',
        hover: 'hover:border-purple-300 hover:bg-purple-100',
        active: 'bg-purple-500 text-white border-purple-500 shadow-md',
        focus: 'focus:ring-purple-200 focus:border-purple-400'
      },
      gray: {
        primary: 'border-gray-200 bg-gray-50',
        accent: 'text-gray-600 bg-gray-500',
        hover: 'hover:border-gray-300 hover:bg-gray-100',
        active: 'bg-gray-500 text-white border-gray-500 shadow-md',
        focus: 'focus:ring-gray-200 focus:border-gray-400'
      }
    };

    const colors = brandColors[brandColor];

    switch (variant) {
      case 'minimal':
        return {
          container: 'bg-transparent border-0',
          colors
        };
      case 'bordered':
        return {
          container: `bg-white border-2 ${colors.primary.split(' ')[0]} rounded-md shadow-sm`,
          colors
        };
      case 'glass':
        return {
          container: 'bg-white/80 backdrop-blur-md border border-white/20 rounded-md shadow-lg',
          colors
        };
      case 'elevated':
        return {
          container: 'bg-white border border-gray-200 rounded-md shadow-lg',
          colors
        };
      case 'default':
      default:
        return {
          container: 'bg-white border border-gray-200 rounded-md shadow-sm',
          colors
        };
    }
  };

  const styles = getVariantStyles();

  // Accessible Tab Component with HeadlessUI
  const AccessibleTabs = () => {
    if (tabs.length === 0) return null;

    const currentTabIndex = tabs.findIndex(tab => tab.value === activeTab);

    return (
      <Tab.Group 
        selectedIndex={currentTabIndex >= 0 ? currentTabIndex : 0}
        onChange={(index) => onTabChange?.(tabs[index].value)}
        as="div"
        className="flex-shrink-0"
      >
        <Tab.List 
          className={`
            flex ${sizeStyles.spacing} bg-gray-50 rounded-lg p-1 border border-gray-200
          `}
          aria-label="Seções do dashboard"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              disabled={tab.disabled}
              className={({ selected }) => `
                ${sizeStyles.button} rounded-lg font-medium transition-all duration-200
                flex items-center space-x-2 relative overflow-hidden
                ${selected 
                  ? `${styles.colors.active} transform scale-105` 
                  : `bg-white border border-gray-200 text-gray-600 ${styles.colors.hover}`
                }
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                ${sizeStyles.focusRing} ${styles.colors.focus} focus:outline-none focus:ring-opacity-50
                min-w-0 whitespace-nowrap
              `}
            >
              {({ selected, focus }) => (
                <>
                  {tab.icon && (
                    <Icon 
                      name={tab.icon as any} 
                      className={sizeStyles.icon} 
                      aria-hidden="true"
                    />
                  )}
                  <span className="truncate">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span 
                      className={`
                        px-2 py-0.5 rounded-full text-xs font-semibold
                        ${selected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}
                      `}
                      aria-label={`${tab.count} itens`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {selected && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30"></div>
                  )}
                </>
              )}
            </Tab>
          ))}
        </Tab.List>
      </Tab.Group>
    );
  };

  // Accessible Menu Dropdown with HeadlessUI
  const AccessibleDropdown = ({ 
    label, 
    options, 
    value, 
    multiple = false, 
    onChange 
  }: { 
    label: string; 
    options: FilterOption[]; 
    value?: string | string[]; 
    multiple?: boolean;
    onChange?: (val: string | string[]) => void;
  }) => {
    const currentValue = Array.isArray(value) ? value : value ? [value] : [];

    return (
      <Menu as="div" className="relative">
        <Menu.Button
          className={`
            ${sizeStyles.button} bg-white border border-gray-200 rounded-lg
            flex items-center justify-between min-w-[120px]
            ${styles.colors.hover} transition-all duration-200
            ${sizeStyles.focusRing} ${styles.colors.focus} focus:outline-none focus:ring-opacity-50
          `}
          aria-haspopup="true"
        >
          {({ open }) => (
            <>
              <span className="truncate">{label}</span>
              <Icon 
                name="chevron-down"
                className={`${sizeStyles.icon} ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </>
          )}
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items 
            className={`
              absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg
              z-50 min-w-[200px] max-w-[300px] max-h-[300px] overflow-y-auto
              ${sizeStyles.focusRing} focus:outline-none
            `}
            aria-labelledby={`${label.replace(/\s+/g, '-').toLowerCase()}-menu-button`}
          >
            {options.map((option) => {
              const isSelected = currentValue.includes(option.value);
              return (
                <Menu.Item key={option.value} disabled={option.disabled}>
                  {({ active, disabled }) => (
                    <button
                      onClick={() => {
                        if (multiple) {
                          const newValue = isSelected 
                            ? currentValue.filter(v => v !== option.value)
                            : [...currentValue, option.value];
                          onChange?.(newValue);
                        } else {
                          onChange?.(option.value);
                        }
                      }}
                      className={`
                        w-full px-4 py-2 text-left flex items-center justify-between
                        ${active || isSelected 
                          ? `${styles.colors.primary} ${styles.colors.accent.split(' ')[0]}` 
                          : 'text-gray-700'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                        transition-colors duration-150 focus:outline-none focus:bg-gray-50
                      `}
                      disabled={disabled}
                    >
                      <div className="flex items-center space-x-2">
                        {option.icon && (
                          <Icon 
                            name={option.icon as any} 
                            className={sizeStyles.icon}
                            aria-hidden="true" 
                          />
                        )}
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          {option.description && (
                            <span className="text-xs text-gray-500 mt-1">
                              {option.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {option.count !== undefined && (
                          <span className="text-xs text-gray-500" aria-label={`${option.count} itens`}>
                            {option.count}
                          </span>
                        )}
                        {multiple && isSelected && (
                          <Icon 
                            name="check" 
                            className={`${sizeStyles.icon} ${styles.colors.accent.split(' ')[0]}`}
                            aria-hidden="true" 
                          />
                        )}
                      </div>
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </Menu.Items>
        </Transition>
      </Menu>
    );
  };

  // Accessible Search with Combobox
  const AccessibleSearch = () => {
    if (!searchEnabled) return null;

    // Mock search suggestions - could be dynamic
    const searchSuggestions = [
      'Dashboard geral',
      'Métricas de performance',
      'Análise de vendas',
      'Relatórios mensais'
    ].filter(suggestion => 
      suggestion.toLowerCase().includes(comboboxQuery.toLowerCase())
    );

    return (
      <Combobox 
        value={searchInputValue} 
        onChange={(value) => {
          setSearchInputValue(value || '');
          onSearchChange?.(value || '');
        }}
        as="div"
        className="relative flex-1 max-w-md"
      >
        <div className="relative">
          <Combobox.Input
            onChange={(e) => {
              setComboboxQuery(e.target.value);
              setSearchInputValue(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            placeholder={searchPlaceholder}
            className={`
              w-full ${sizeStyles.input} pl-10 pr-4 
              bg-white border border-gray-200 rounded-lg
              transition-all duration-200
              ${sizeStyles.focusRing} ${styles.colors.focus} focus:outline-none focus:ring-opacity-50
              placeholder-gray-400
            `}
            aria-label="Campo de pesquisa"
            aria-describedby="search-description"
          />
          <Icon 
            name="search" 
            className={`
              absolute left-3 top-1/2 transform -translate-y-1/2 ${sizeStyles.icon}
              text-gray-400 transition-colors duration-200
            `} 
            aria-hidden="true"
          />
          
          {searchInputValue && (
            <button
              onClick={() => {
                setSearchInputValue('');
                setComboboxQuery('');
                onSearchChange?.('');
              }}
              className={`
                absolute right-3 top-1/2 transform -translate-y-1/2 
                text-gray-400 hover:text-gray-600 transition-colors duration-200
                ${sizeStyles.focusRing} focus:outline-none focus:ring-gray-200 focus:ring-opacity-50
                rounded-full p-1
              `}
              aria-label="Limpar pesquisa"
              type="button"
            >
              <Icon name="x" className={sizeStyles.icon} />
            </button>
          )}
        </div>

        {searchSuggestions.length > 0 && comboboxQuery && (
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Options 
              className="
                absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 
                rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto
              "
              aria-label="Sugestões de pesquisa"
            >
              {searchSuggestions.map((suggestion) => (
                <Combobox.Option
                  key={suggestion}
                  value={suggestion}
                  className={({ active }) => `
                    px-4 py-2 cursor-pointer transition-colors duration-150
                    ${active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'}
                  `}
                >
                  {({ selected, active }) => (
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name="search" 
                        className={`${sizeStyles.icon} text-gray-400`}
                        aria-hidden="true"
                      />
                      <span className={selected ? 'font-semibold' : ''}>
                        {suggestion}
                      </span>
                      {selected && (
                        <Icon 
                          name="check" 
                          className={`${sizeStyles.icon} text-orange-600`}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Transition>
        )}
        
        <div id="search-description" className="sr-only">
          Digite para pesquisar no dashboard. Use as setas para navegar pelas sugestões.
        </div>
      </Combobox>
    );
  };

  // Action Button Component
  const ActionButton = ({ 
    icon, 
    onClick: onActionClick, 
    tooltip, 
    disabled = false 
  }: { 
    icon: string; 
    onClick?: () => void; 
    tooltip: string;
    disabled?: boolean;
  }) => (
    <button
      onClick={onActionClick}
      disabled={disabled || isLoading}
      className={`
        ${sizeStyles.button} rounded-lg bg-white border border-gray-200 text-gray-600
        hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300
        transition-all duration-200 hover:scale-105
        ${sizeStyles.focusRing} ${styles.colors.focus} focus:outline-none focus:ring-opacity-50
        flex items-center justify-center
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={tooltip}
      aria-label={tooltip}
    >
      <Icon 
        name={icon as any} 
        className={`${sizeStyles.icon} ${isLoading ? 'animate-spin' : ''}`}
        aria-hidden="true" 
      />
    </button>
  );

  if (isLoading) {
    return (
      <div 
        className={`${styles.container} ${sizeStyles.padding} ${className}`}
        role="status"
        aria-label="Carregando controles de navegação"
      >
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
    <>
      {/* Skip link for keyboard users */}
      {skipLinkTarget && (
        <a 
          href={skipLinkTarget}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                     bg-orange-600 text-white px-4 py-2 rounded-lg z-50 
                     focus:outline-none focus:ring-2 focus:ring-orange-200"
        >
          Pular para conteúdo principal
        </a>
      )}

      <div 
        className={`${styles.container} ${sizeStyles.padding} ${className}`}
        role={landmarkRole}
        aria-label={ariaLabel}
      >
        {/* Main Navigation Row */}
        <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4`}>
          
          {/* Left Section - Tabs and Filters */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Accessible Tabs */}
            <AccessibleTabs />

            {/* Additional Filters */}
            {filters.map((filter, index) => (
              <AccessibleDropdown
                key={index}
                label={filter.label}
                options={filter.options}
                value={filter.value}
                multiple={filter.multiple}
                onChange={(val) => onFilterChange?.(filter.label, val)}
              />
            ))}
          </div>

          {/* Right Section - Search and Actions */}
          <div className="flex items-center gap-3">
            
            {/* Accessible Search */}
            <AccessibleSearch />

            {/* View Mode Toggle */}
            {viewModes.length > 0 && (
              <div 
                className="flex bg-gray-50 rounded-lg p-1 border border-gray-200"
                role="group"
                aria-label="Modos de visualização"
              >
                {viewModes.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => onViewModeChange?.(mode.value)}
                    className={`
                      px-3 py-1.5 rounded-md transition-all duration-200 min-h-[44px] min-w-[44px]
                      ${activeViewMode === mode.value 
                        ? styles.colors.active 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                      }
                      ${sizeStyles.focusRing} focus:outline-none focus:ring-gray-200 focus:ring-opacity-50
                    `}
                    title={mode.label}
                    aria-label={mode.label}
                    aria-pressed={activeViewMode === mode.value}
                  >
                    <Icon 
                      name={mode.icon as any} 
                      className={sizeStyles.icon}
                      aria-hidden="true" 
                    />
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
      </div>
    </>
  );
}