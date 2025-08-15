// Componente de navegação por abas

import { TabType } from '../types/subsector.types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    events: number;
    news: number;
    systems: number;
  };
}

export function TabNavigation({ activeTab, onTabChange, counts }: TabNavigationProps) {
  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'events', label: 'Eventos', count: counts.events },
    { id: 'news', label: 'Notícias', count: counts.news },
    { id: 'systems', label: 'Sistemas', count: counts.systems },
    { id: 'groups', label: 'Grupos' },
    { id: 'messages', label: 'Mensagens' }
  ];

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex space-x-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 text-sm font-medium transition-all duration-200 relative ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} {tab.count !== undefined && `(${tab.count})`}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-sm"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}