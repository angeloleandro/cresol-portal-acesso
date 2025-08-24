// Componente unificado para gerenciar conteúdo do subsetor com lógica limpa
import { useState, useCallback, useEffect, useRef } from 'react';
import type { 
  SubsectorNews, 
  SubsectorEvent, 
  SubsectorDocument, 
  SubsectorVideo,
  SubsectorImage,
  SubsectorMessage
} from './types/subsector.types';

interface SubsectorContentProps {
  // Dados
  news: SubsectorNews[];
  events: SubsectorEvent[];
  messages: SubsectorMessage[];
  documents: SubsectorDocument[];
  videos: SubsectorVideo[];
  images: SubsectorImage[];
  showDrafts: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Contadores
  totalDraftNewsCount: number;
  totalDraftEventsCount: number;
  totalDraftMessagesCount: number;
  totalDraftDocumentsCount: number;
  totalDraftVideosCount: number;
  totalDraftImagesCount: number;
  
  // Ações
  toggleDrafts: () => Promise<void>;
  refreshContent: () => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
}

export function useSubsectorContent(subsectorId: string | null): SubsectorContentProps {
  const [news, setNews] = useState<SubsectorNews[]>([]);
  const [events, setEvents] = useState<SubsectorEvent[]>([]);
  const [messages, setMessages] = useState<SubsectorMessage[]>([]);
  const [documents, setDocuments] = useState<SubsectorDocument[]>([]);
  const [videos, setVideos] = useState<SubsectorVideo[]>([]);
  const [images, setImages] = useState<SubsectorImage[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDraftNewsCount, setTotalDraftNewsCount] = useState(0);
  const [totalDraftEventsCount, setTotalDraftEventsCount] = useState(0);
  const [totalDraftMessagesCount, setTotalDraftMessagesCount] = useState(0);
  const [totalDraftDocumentsCount, setTotalDraftDocumentsCount] = useState(0);
  const [totalDraftVideosCount, setTotalDraftVideosCount] = useState(0);
  const [totalDraftImagesCount, setTotalDraftImagesCount] = useState(0);
  
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
        videos: videosData,
        images: imagesData, 
        draftNewsCount, 
        draftEventsCount, 
        draftMessagesCount, 
        draftDocumentsCount,
        draftVideosCount,
        draftImagesCount 
      } = batchResult.data;
      
      if (mountedRef.current) {
        setNews(newsData || []);
        setEvents(eventsData || []);
        setMessages(messagesData || []);
        setDocuments(documentsData || []);
        setVideos(videosData || []);
        setImages(imagesData || []);
        setTotalDraftNewsCount(draftNewsCount || 0);
        setTotalDraftEventsCount(draftEventsCount || 0);
        setTotalDraftMessagesCount(draftMessagesCount || 0);
        setTotalDraftDocumentsCount(draftDocumentsCount || 0);
        setTotalDraftVideosCount(draftVideosCount || 0);
        setTotalDraftImagesCount(draftImagesCount || 0);
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
        videos: videosData,
        images: imagesData, 
        draftNewsCount, 
        draftEventsCount, 
        draftMessagesCount, 
        draftDocumentsCount,
        draftVideosCount,
        draftImagesCount 
      } = batchResult.data;
      
      if (mountedRef.current) {
        setNews(newsData || []);
        setEvents(eventsData || []);
        setMessages(messagesData || []);
        setDocuments(documentsData || []);
        setVideos(videosData || []);
        setImages(imagesData || []);
        setTotalDraftNewsCount(draftNewsCount || 0);
        setTotalDraftEventsCount(draftEventsCount || 0);
        setTotalDraftMessagesCount(draftMessagesCount || 0);
        setTotalDraftDocumentsCount(draftDocumentsCount || 0);
        setTotalDraftVideosCount(draftVideosCount || 0);
        setTotalDraftImagesCount(draftImagesCount || 0);
      }
      
    } catch (err: any) {
      console.error('Erro ao buscar conteúdo:', err);
      if (mountedRef.current) {
        setError(err.message || 'Erro ao carregar conteúdo');
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
    const response = await fetch(`/api/admin/subsectors/${subsectorId}/news/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao excluir notícia');
    }
    
    await refreshContent();
  }, [subsectorId, refreshContent]);

  const deleteEvent = useCallback(async (id: string) => {
    const response = await fetch(`/api/admin/subsectors/${subsectorId}/events/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao excluir evento');
    }
    
    await refreshContent();
  }, [subsectorId, refreshContent]);

  const deleteMessage = useCallback(async (id: string) => {
    const response = await fetch(`/api/admin/subsectors/${subsectorId}/messages/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao excluir mensagem');
    }
    
    await refreshContent();
  }, [subsectorId, refreshContent]);

  const deleteDocument = useCallback(async (id: string) => {
    const response = await fetch(`/api/admin/subsectors/${subsectorId}/documents/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao excluir documento');
    }
    
    await refreshContent();
  }, [subsectorId, refreshContent]);

  const deleteVideo = useCallback(async (id: string) => {
    const response = await fetch(`/api/admin/subsectors/${subsectorId}/videos/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao excluir vídeo');
    }
    
    await refreshContent();
  }, [subsectorId, refreshContent]);

  const deleteImage = useCallback(async (id: string) => {
    const response = await fetch(`/api/admin/subsectors/${subsectorId}/images/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao excluir imagem');
    }
    
    await refreshContent();
  }, [subsectorId, refreshContent]);

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
    videos,
    images,
    showDrafts,
    isLoading,
    error,
    totalDraftNewsCount,
    totalDraftEventsCount,
    totalDraftMessagesCount,
    totalDraftDocumentsCount,
    totalDraftVideosCount,
    totalDraftImagesCount,
    toggleDrafts,
    refreshContent,
    deleteNews,
    deleteEvent,
    deleteMessage,
    deleteDocument,
    deleteVideo,
    deleteImage,
  };
}

export type { SubsectorNews, SubsectorEvent, SubsectorMessage, SubsectorDocument, SubsectorVideo, SubsectorImage };