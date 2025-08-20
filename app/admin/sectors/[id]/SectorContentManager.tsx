// Componente unificado para gerenciar conteúdo do setor com lógica limpa
import { useState, useCallback, useEffect, useRef } from 'react';
import { CONTENT_DEFAULTS } from '@/lib/constants/content-defaults';


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

interface SectorMessage {
  id: string;
  title: string;
  content: string;
  group_id: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  sector_id: string;
}

interface UseSectorContentReturn {
  // Estados
  news: SectorNews[];
  events: SectorEvent[];
  messages: SectorMessage[];
  showDrafts: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Contadores
  totalDraftNewsCount: number;
  totalDraftEventsCount: number;
  totalDraftMessagesCount: number;
  
  // Ações
  toggleDrafts: () => Promise<void>;
  refreshContent: () => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
}

export function useSectorContent(sectorId: string | undefined): UseSectorContentReturn {

  const [news, setNews] = useState<SectorNews[]>([]);
  const [events, setEvents] = useState<SectorEvent[]>([]);
  const [messages, setMessages] = useState<SectorMessage[]>([]);
  const [showDrafts, setShowDrafts] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDraftNewsCount, setTotalDraftNewsCount] = useState(0);
  const [totalDraftEventsCount, setTotalDraftEventsCount] = useState(0);
  const [totalDraftMessagesCount, setTotalDraftMessagesCount] = useState(0);
  
  const mountedRef = useRef(true);
  const fetchContent = useCallback(async (includesDrafts: boolean) => {
    if (!sectorId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const batchResponse = await fetch(`/api/admin/sector-content-batch?sectorId=${sectorId}&includeUnpublished=${includesDrafts}`);
      
      if (!batchResponse.ok) {
        throw new Error(`Erro API: ${batchResponse.status}`);
      }
      
      const batchResult = await batchResponse.json();
      
      if (!batchResult.success) {
        throw new Error(batchResult.error || 'Erro na API');
      }
      
      const { news: newsData, events: eventsData, messages: messagesData, draftNewsCount, draftEventsCount, draftMessagesCount } = batchResult.data;
      
      const newsToSet = newsData || [];
      const eventsToSet = eventsData || [];
      const messagesToSet = messagesData || [];
      
      if (!mountedRef.current) {
        return;
      }

      if (!Array.isArray(newsToSet) || !Array.isArray(eventsToSet)) {
        throw new Error('Formato de dados inválido');
      }

      setNews(newsToSet);
      setEvents(eventsToSet);
      setMessages(messagesToSet);
      setTotalDraftNewsCount(draftNewsCount);
      setTotalDraftEventsCount(draftEventsCount);
      setTotalDraftMessagesCount(draftMessagesCount || 0);
      
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar conteúdo');
    } finally {
      setIsLoading(false);
    }
  }, [sectorId]);

  const toggleDrafts = useCallback(async () => {
    if (!sectorId) return;
    
    const newShowDrafts = !showDrafts;
    setShowDrafts(newShowDrafts);
    
    setIsLoading(true);
    setError(null);
    
    try {
      const batchParams = new URLSearchParams({
        sectorId: sectorId,
        includeUnpublished: newShowDrafts.toString()
      });
      
      const batchResponse = await fetch(`/api/admin/sector-content-batch?${batchParams.toString()}`);
      
      if (!batchResponse.ok) {
        throw new Error(`Erro API batch toggle: ${batchResponse.status}`);
      }
      
      const batchResult = await batchResponse.json();
      
      if (!batchResult.success) {
        throw new Error(batchResult.error || 'Erro na API batch toggle');
      }
      
      const { news: newsData, events: eventsData, messages: messagesData } = batchResult.data;
      
      if (mountedRef.current) {
        setNews(newsData);
        setEvents(eventsData);
        setMessages(messagesData || []);
      }
      
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || 'Erro ao alternar rascunhos');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [showDrafts, sectorId]);

  const refreshContent = useCallback(async () => {
    if (!sectorId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const batchParams = new URLSearchParams({
        sectorId: sectorId,
        includeUnpublished: showDrafts.toString()
      });
      
      const batchResponse = await fetch(`/api/admin/sector-content-batch?${batchParams.toString()}`);
      
      if (!batchResponse.ok) {
        throw new Error(`Erro API batch refresh: ${batchResponse.status}`);
      }
      
      const batchResult = await batchResponse.json();
      
      if (!batchResult.success) {
        throw new Error(batchResult.error || 'Erro na API batch refresh');
      }
      
      const { news: newsData, events: eventsData, messages: messagesData, draftNewsCount, draftEventsCount, draftMessagesCount } = batchResult.data;
      
      if (mountedRef.current) {
        setNews(newsData);
        setEvents(eventsData);
        setMessages(messagesData || []);
        setTotalDraftNewsCount(draftNewsCount);
        setTotalDraftEventsCount(draftEventsCount);
        setTotalDraftMessagesCount(draftMessagesCount || 0);
      }
      
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || 'Erro ao atualizar conteúdo');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [showDrafts, sectorId]);

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
  
  // Deletar mensagem via API
  const deleteMessage = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/sector-content?type=sector_messages&id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar mensagem');
      }
      
      await refreshContent();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar mensagem');
    }
  }, [refreshContent]);

  useEffect(() => {
    if (!sectorId || sectorId === 'undefined') {
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch(`/api/admin/sector-content-batch?sectorId=${sectorId}&includeUnpublished=true`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setNews(data.data.news || []);
          setEvents(data.data.events || []);
          setMessages(data.data.messages || []);
          setTotalDraftNewsCount(data.data.draftNewsCount || 0);
          setTotalDraftEventsCount(data.data.draftEventsCount || 0);
          setTotalDraftMessagesCount(data.data.draftMessagesCount || 0);
        }
      } catch (err) {
        setError('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      mountedRef.current = false;
    };
  }, [sectorId]);

  // Filtrar dados baseado em showDrafts
  const filteredNews = showDrafts ? news : news.filter(n => n.is_published === true);
  const filteredEvents = showDrafts ? events : events.filter(e => e.is_published === true);
  const filteredMessages = showDrafts ? messages : messages.filter(m => m.is_published === true);

  return {
    news: filteredNews,
    events: filteredEvents,
    messages: filteredMessages,
    showDrafts,
    isLoading,
    error,
    totalDraftNewsCount,
    totalDraftEventsCount,
    totalDraftMessagesCount,
    toggleDrafts,
    refreshContent,
    deleteNews,
    deleteEvent,
    deleteMessage
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