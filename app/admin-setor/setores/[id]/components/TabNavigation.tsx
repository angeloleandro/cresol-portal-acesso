// Componente de navegação por abas

'use client';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  draftCounts: {
    news: number;
    events: number;
    messages: number;
    documents: number;
    videos: number;
    images: number;
  };
}

export function TabNavigation({ activeTab, onTabChange, draftCounts }: TabNavigationProps) {
  const tabs = [
    { id: 'news', label: 'Notícias', draftCount: draftCounts.news },
    { id: 'events', label: 'Eventos', draftCount: draftCounts.events },
    { id: 'messages', label: 'Mensagens', draftCount: draftCounts.messages },
    { id: 'documents', label: 'Documentos', draftCount: draftCounts.documents },
    { id: 'videos', label: 'Vídeos', draftCount: draftCounts.videos },
    { id: 'images', label: 'Imagens', draftCount: draftCounts.images },
    { id: 'groups', label: 'Grupos', draftCount: 0 },
    { id: 'subsectors', label: 'Subsetores', draftCount: 0 },
    { id: 'team', label: 'Equipe', draftCount: 0 },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              ${activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <span>{tab.label}</span>
            {tab.draftCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-yellow-800 bg-yellow-100 rounded-full">
                {tab.draftCount}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}