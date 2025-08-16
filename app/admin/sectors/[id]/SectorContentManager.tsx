// Componente unificado para gerenciar conteúdo do setor com lógica limpa
import { useState, useCallback, useEffect } from 'react';

interface SectorNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  sector_id: string;
}

interface SectorEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_featured: boolean;
  is_published: boolean;
  event_date: string;
  created_at: string;
  updated_at: string;
  sector_id: string;
}

interface UseSectorContentReturn {
  // Estados
  news: SectorNews[];
  events: SectorEvent[];
  showDrafts: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Contadores
  totalDraftNewsCount: number;
  totalDraftEventsCount: number;
  
  // Ações
  toggleDrafts: () => Promise<void>;
  refreshContent: () => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export function useSectorContent(sectorId: string | undefined): UseSectorContentReturn {
  const [news, setNews] = useState<SectorNews[]>([]);
  const [events, setEvents] = useState<SectorEvent[]>([]);
  const [showDrafts, setShowDrafts] = useState(true); // Mostra rascunhos por padrão
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDraftNewsCount, setTotalDraftNewsCount] = useState(0);
  const [totalDraftEventsCount, setTotalDraftEventsCount] = useState(0);


  // Função unificada para buscar conteúdo via API
  const fetchContent = useCallback(async (includesDrafts: boolean) => {
    if (!sectorId) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Buscar notícias
      const newsParams = new URLSearchParams({
        type: 'sector_news',
        sectorId: sectorId,
        includeUnpublished: includesDrafts.toString()
      });
      
      const newsResponse = await fetch(`/api/admin/sector-content?${newsParams.toString()}`);
      
      if (!newsResponse.ok) {
        throw new Error(`Erro API notícias: ${newsResponse.status} ${newsResponse.statusText}`);
      }
      
      const newsResult = await newsResponse.json();
      
      // Buscar eventos
      const eventsParams = new URLSearchParams({
        type: 'sector_events',
        sectorId: sectorId,
        includeUnpublished: includesDrafts.toString()
      });
      
      const eventsResponse = await fetch(`/api/admin/sector-content?${eventsParams.toString()}`);
      
      if (!eventsResponse.ok) {
        throw new Error(`Erro API eventos: ${eventsResponse.status} ${eventsResponse.statusText}`);
      }
      
      const eventsResult = await eventsResponse.json();

      // Contar rascunhos totais
      const allNewsParams = new URLSearchParams({
        type: 'sector_news',
        sectorId: sectorId,
        includeUnpublished: 'true'
      });
      
      const allEventsParams = new URLSearchParams({
        type: 'sector_events',
        sectorId: sectorId,
        includeUnpublished: 'true'
      });
      
      const [allNewsResponse, allEventsResponse] = await Promise.all([
        fetch(`/api/admin/sector-content?${allNewsParams.toString()}`),
        fetch(`/api/admin/sector-content?${allEventsParams.toString()}`)
      ]);
      
      const allNewsResult = allNewsResponse.ok ? await allNewsResponse.json() : { data: [] };
      const allEventsResult = allEventsResponse.ok ? await allEventsResponse.json() : { data: [] };
      
      // Processar dados
      const newsData = newsResult.data || [];
      const eventsData = eventsResult.data || [];
      const allNewsData = allNewsResult.data || [];
      const allEventsData = allEventsResult.data || [];
      
      const newsAnalysis = {
        total: allNewsData.length,
        published: allNewsData.filter((n: any) => n.is_published === true).length,
        drafts: allNewsData.filter((n: any) => n.is_published === false).length,
        null_published: allNewsData.filter((n: any) => n.is_published === null || n.is_published === undefined).length
      };
      
      const eventsAnalysis = {
        total: allEventsData.length,
        published: allEventsData.filter((e: any) => e.is_published === true).length,
        drafts: allEventsData.filter((e: any) => e.is_published === false).length,
        null_published: allEventsData.filter((e: any) => e.is_published === null || e.is_published === undefined).length
      };
      
      const draftNewsCount = newsAnalysis.drafts;
      const draftEventsCount = eventsAnalysis.drafts;
      
      setTotalDraftNewsCount(draftNewsCount);
      setTotalDraftEventsCount(draftEventsCount);

      setNews(newsData);
      setEvents(eventsData);
      
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar conteúdo');
    } finally {
      setIsLoading(false);
    }
  }, [sectorId]);

  // Toggle de rascunhos
  const toggleDrafts = useCallback(async () => {
    const newShowDrafts = !showDrafts;
    
    setShowDrafts(newShowDrafts);
    await fetchContent(newShowDrafts);
  }, [showDrafts, fetchContent]);

  // Refresh forçado
  const refreshContent = useCallback(async () => {
    await fetchContent(showDrafts);
  }, [showDrafts, fetchContent]);

  // Deletar notícia via API
  const deleteNews = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/sector-content?type=sector_news&id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar notícia');
      }
      
      await refreshContent();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar notícia');
    }
  }, [refreshContent]);

  // Deletar evento via API
  const deleteEvent = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/sector-content?type=sector_events&id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar evento');
      }
      
      await refreshContent();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar evento');
    }
  }, [refreshContent]);

  // Carregar inicial
  useEffect(() => {
    let mounted = true;

    const loadContent = async () => {
      if (sectorId && mounted) {
        try {
          await fetchContent(true);
        } catch (error) {
          // Error handling is done in fetchContent
        }
      }
    };

    loadContent();

    return () => {
      mounted = false;
    };
  }, [sectorId, fetchContent]);

  return {
    news,
    events,
    showDrafts,
    isLoading,
    error,
    totalDraftNewsCount,
    totalDraftEventsCount,
    toggleDrafts,
    refreshContent,
    deleteNews,
    deleteEvent
  };
}

// Componente de botão toggle simplificado
interface ToggleDraftsButtonProps {
  showDrafts: boolean;
  draftCount: number;
  onToggle: () => Promise<void>;
  isLoading?: boolean;
  type?: 'news' | 'events';
}

export function ToggleDraftsButton({ 
  showDrafts, 
  draftCount, 
  onToggle, 
  isLoading = false,
  type = 'news' 
}: ToggleDraftsButtonProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleClick = async () => {
    if (isToggling || isLoading) return;
    
    setIsToggling(true);
    try {
      await onToggle();
    } finally {
      setIsToggling(false);
    }
  };

  const label = type === 'news' ? 'rascunho' : 'rascunho';
  const pluralLabel = type === 'news' ? 'rascunhos' : 'rascunhos';

  return (
    <button
      onClick={handleClick}
      disabled={isToggling || isLoading}
      className={`
        flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium
        transition-all duration-200
        ${isToggling || isLoading 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }
      `}
    >
      {isToggling ? (
        <>
          <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Carregando...</span>
        </>
      ) : (
        <>
          <span>{showDrafts ? 'Ocultar Rascunhos' : 'Mostrar Rascunhos'}</span>
          <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded font-medium">
            {draftCount} {draftCount === 1 ? label : pluralLabel}
          </span>
        </>
      )}
    </button>
  );
}