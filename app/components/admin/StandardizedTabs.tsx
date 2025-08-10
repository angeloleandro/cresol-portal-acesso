'use client';

import { ReactNode } from 'react';
import { Icon } from '../icons';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

interface StandardizedTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  children?: ReactNode;
  className?: string;
}

/**
 * Componente de tabs padronizado seguindo o design system
 * 
 * Features:
 * - Underline ativa em laranja Cresol
 * - Ícones opcionais
 * - Contadores (badges) opcionais
 * - Estados hover consistentes
 * - Transições suaves
 * - Layout responsivo
 */
export default function StandardizedTabs({
  tabs,
  activeTab,
  onChange,
  children,
  className = ''
}: StandardizedTabsProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors inline-flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon && (
                <Icon name={tab.icon as any} className="h-4 w-4" />
              )}
              
              <span>{tab.label}</span>
              
              {typeof tab.count === 'number' && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  activeTab === tab.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      
      {children}
    </div>
  );
}