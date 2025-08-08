import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  size = 'md',
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-6 py-4 text-base';
      default:
        return 'px-4 py-3 text-sm';
    }
  };

  const getVariantClasses = (tab: Tab, isActive: boolean) => {
    const baseClasses = `
      ${getSizeClasses()}
      font-medium
      transition-all duration-200
      focus:outline-none
      focus:ring-2
      focus:ring-primary/20
      focus:ring-offset-2
      disabled:opacity-50
      disabled:cursor-not-allowed
    `;

    switch (variant) {
      case 'pills':
        return `${baseClasses} rounded-lg ${
          isActive
            ? 'bg-primary text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`;
      
      case 'default':
        return `${baseClasses} border-b-2 ${
          isActive
            ? 'border-primary text-primary bg-primary/5'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`;
      
      default: // underline
        return `${baseClasses} border-b-2 ${
          isActive
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
        }`;
    }
  };

  const containerClasses = variant === 'pills' 
    ? 'flex flex-wrap gap-2'
    : 'flex border-b border-gray-200';

  return (
    <nav className={`${containerClasses} ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onChange(tab.id)}
          disabled={tab.disabled}
          className={getVariantClasses(tab, activeTab === tab.id)}
        >
          <div className="flex items-center gap-2">
            {tab.icon && (
              <div className="w-4 h-4 flex items-center justify-center">
                {tab.icon}
              </div>
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </div>
        </button>
      ))}
    </nav>
  );
};