// Componente de navegação por abas - PADRONIZADO
// Baseado no padrão do setor para manter consistência

import { TabType } from '../types/subsector.types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  draftCounts?: {
    news?: number;
    events?: number;
    messages?: number;
    documents?: number;
    videos?: number;
    images?: number;
  };
}

/**
 * TabNavigation function
 * @todo Add proper documentation
 */
export function TabNavigation({ 
  activeTab, 
  onTabChange,
  draftCounts = {}
}: TabNavigationProps) {
  const tabs: Array<{
    id: TabType;
    label: string;
    draftCount?: number;
  }> = [
    { id: 'news', label: 'Notícias', draftCount: draftCounts.news },
    { id: 'events', label: 'Eventos', draftCount: draftCounts.events },
    { id: 'messages', label: 'Mensagens', draftCount: draftCounts.messages },
    { id: 'documents', label: 'Documentos', draftCount: draftCounts.documents },
    { id: 'videos', label: 'Vídeos', draftCount: draftCounts.videos },
    { id: 'images', label: 'Imagens', draftCount: draftCounts.images },
    { id: 'groups', label: 'Grupos' },
    { id: 'team', label: 'Equipe' }
  ];

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex space-x-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative py-4 text-sm font-medium transition-colors duration-200
                ${activeTab === tab.id 
                  ? 'text-primary' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <span className="flex items-center space-x-2">
                <span>{tab.label}</span>
                {tab.draftCount !== undefined && tab.draftCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {tab.draftCount} rascunho{tab.draftCount > 1 ? 's' : ''}
                  </span>
                )}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}