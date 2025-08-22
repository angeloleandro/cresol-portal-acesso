// Componente unificado para gerenciar conteúdo do subsetor com lógica limpa
import { useState, useCallback, useEffect, useRef } from 'react';


interface SubsectorNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  subsector_id: string;
}

interface SubsectorEvent {
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
  subsector_id: string;
}

interface SubsectorMessage {
  id: string;
  title: string;
  content: string;
  group_id: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  subsector_id: string;
}

interface SubsectorDocument {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  subsector_id: string;
}

interface SubsectorContentProps {
  // Dados
  news: SubsectorNews[];
  events: SubsectorEvent[];
  messages: SubsectorMessage[];
  documents: SubsectorDocument[];
  showDrafts: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Contadores
  totalDraftNewsCount: number;
  totalDraftEventsCount: number;
  totalDraftMessagesCount: number;
  totalDraftDocumentsCount: number;
  
  // Ações
  toggleDrafts: () => Promise<void>;
  refreshContent: () => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

export function useSubsectorContent(subsectorId: string | null): SubsectorContentProps {
  const [news, setNews] = useState<SubsectorNews[]>([]);
  const [events, setEvents] = useState<SubsectorEvent[]>([]);
  const [messages, setMessages] = useState<SubsectorMessage[]>([]);
  const [documents, setDocuments] = useState<SubsectorDocument[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDraftNewsCount, setTotalDraftNewsCount] = useState(0);
  const [totalDraftEventsCount, setTotalDraftEventsCount] = useState(0);
  const [totalDraftMessagesCount, setTotalDraftMessagesCount] = useState(0);
  const [totalDraftDocumentsCount, setTotalDraftDocumentsCount] = useState(0);
  
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  // Função para buscar todo o conteúdo em batch
  const fetchContent = useCallback(async () => {
    if (!subsectorId || loadingRef.current) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const batchParams = new URLSearchParams({
        subsectorId: subsectorId,
        includeUnpublished: showDrafts.toString()
      });
      
      const batchResponse = await fetch(`/api/admin/subsector-content-batch?${batchParams.toString()}`);
      
      if (!batchResponse.ok) {
        throw new Error(`Erro API batch: ${batchResponse.status}`);
      }
      
      const batchResult = await batchResponse.json();
      
      if (!batchResult.success) {
        throw new Error(batchResult.error || 'Erro na API batch');
      }
      
      const { 
        news: newsData, 
        events: eventsData, 
        messages: messagesData, 
        documents: documentsData, 
        draftNewsCount, 
        draftEventsCount, 
        draftMessagesCount, 
        draftDocumentsCount 
      } = batchResult.data;
      
      if (mountedRef.current) {
        setNews(newsData || []);
        setEvents(eventsData || []);
        setMessages(messagesData || []);
        setDocuments(documentsData || []);
        setTotalDraftNewsCount(draftNewsCount || 0);
        setTotalDraftEventsCount(draftEventsCount || 0);
        setTotalDraftMessagesCount(draftMessagesCount || 0);
        setTotalDraftDocumentsCount(draftDocumentsCount || 0);
      }
      
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || 'Erro ao carregar conteúdo');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        loadingRef.current = false;
      }
    }
  }, [subsectorId, showDrafts]);

  // Carregar conteúdo quando subsectorId ou showDrafts mudar
  useEffect(() => {
    if (subsectorId) {
      fetchContent();
    }
  }, [fetchContent, subsectorId]);

  const refreshContent = useCallback(async () => {
    if (!subsectorId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const batchParams = new URLSearchParams({
        subsectorId: subsectorId,
        includeUnpublished: showDrafts.toString()
      });
      
      const batchResponse = await fetch(`/api/admin/subsector-content-batch?${batchParams.toString()}`);
      
      if (!batchResponse.ok) {
        throw new Error(`Erro API batch refresh: ${batchResponse.status}`);
      }
      
      const batchResult = await batchResponse.json();
      
      if (!batchResult.success) {
        throw new Error(batchResult.error || 'Erro na API batch refresh');
      }
      
      const { news: newsData, events: eventsData, messages: messagesData, documents: documentsData, draftNewsCount, draftEventsCount, draftMessagesCount, draftDocumentsCount } = batchResult.data;
      
      if (mountedRef.current) {
        setNews(newsData);
        setEvents(eventsData);
        setMessages(messagesData || []);
        setDocuments(documentsData || []);
        setTotalDraftNewsCount(draftNewsCount);
        setTotalDraftEventsCount(draftEventsCount);
        setTotalDraftMessagesCount(draftMessagesCount || 0);
        setTotalDraftDocumentsCount(draftDocumentsCount || 0);
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
  }, [subsectorId, showDrafts]);

  const toggleDrafts = useCallback(async () => {
    setShowDrafts(prev => !prev);
  }, []);

  const deleteNews = useCallback(async (id: string) => {
    if (!subsectorId) return;
    
    try {
      const response = await fetch(`/api/admin/subsector-content?type=news&id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar notícia');
      }

      await refreshContent();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar notícia');
      throw err;
    }
  }, [subsectorId, refreshContent]);

  const deleteEvent = useCallback(async (id: string) => {
    if (!subsectorId) return;
    
    try {
      const response = await fetch(`/api/admin/subsector-content?type=event&id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar evento');
      }

      await refreshContent();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar evento');
      throw err;
    }
  }, [subsectorId, refreshContent]);

  const deleteMessage = useCallback(async (id: string) => {
    if (!subsectorId) return;
    
    try {
      const response = await fetch(`/api/admin/subsector-content?type=message&id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar mensagem');
      }

      await refreshContent();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar mensagem');
      throw err;
    }
  }, [subsectorId, refreshContent]);

  const deleteDocument = useCallback(async (id: string) => {
    if (!subsectorId) return;
    
    try {
      const response = await fetch(`/api/admin/subsector-content?type=document&id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar documento');
      }

      await refreshContent();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar documento');
      throw err;
    }
  }, [subsectorId, refreshContent]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    news,
    events,
    messages,
    documents,
    showDrafts,
    isLoading,
    error,
    totalDraftNewsCount,
    totalDraftEventsCount,
    totalDraftMessagesCount,
    totalDraftDocumentsCount,
    toggleDrafts,
    refreshContent,
    deleteNews,
    deleteEvent,
    deleteMessage,
    deleteDocument
  };
}

// Export dos tipos também para uso em outros componentes
export type { SubsectorNews, SubsectorEvent, SubsectorMessage, SubsectorDocument };