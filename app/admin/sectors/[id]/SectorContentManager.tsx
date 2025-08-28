// Componente unificado para gerenciar conteúdo do setor com lógica limpa
import { useState, useCallback, useEffect, useRef } from 'react';

import type { 
  SectorNews, 
  SectorEvent, 
  SectorDocument, 
  SectorVideo, 
  SectorImage,
  SectorMessage
} from './types/sector.types';

interface UseSectorContentReturn {
  // Estados
  news: SectorNews[];
  events: SectorEvent[];
  messages: SectorMessage[];
  documents: SectorDocument[];
  videos: SectorVideo[];
  images: SectorImage[];
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

/**
 * useSectorContent function
 * @todo Add proper documentation
 */
export function useSectorContent(sectorId: string | undefined): UseSectorContentReturn {

  const [news, setNews] = useState<SectorNews[]>([]);
  const [events, setEvents] = useState<SectorEvent[]>([]);
  const [messages, setMessages] = useState<SectorMessage[]>([]);
  const [documents, setDocuments] = useState<SectorDocument[]>([]);
  const [videos, setVideos] = useState<SectorVideo[]>([]);
  const [images, setImages] = useState<SectorImage[]>([]);
  const [showDrafts, setShowDrafts] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDraftNewsCount, setTotalDraftNewsCount] = useState(0);
  const [totalDraftEventsCount, setTotalDraftEventsCount] = useState(0);
  const [totalDraftMessagesCount, setTotalDraftMessagesCount] = useState(0);
  const [totalDraftDocumentsCount, setTotalDraftDocumentsCount] = useState(0);
  const [totalDraftVideosCount, setTotalDraftVideosCount] = useState(0);
  const [totalDraftImagesCount, setTotalDraftImagesCount] = useState(0);
  
  const isRefreshingRef = useRef(false);

  const fetchContent = useCallback(async () => {
    if (!sectorId || isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const batchParams = new URLSearchParams({
        sectorId: sectorId,
        includeUnpublished: showDrafts.toString()
      });
      
      const batchResponse = await fetch(`/api/admin/sector-content-batch?${batchParams.toString()}`);
      
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

    } catch (err) {
      console.error('Erro ao buscar conteúdo:', err);
      setError('Erro ao carregar conteúdo do setor');
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false;
    }
  }, [sectorId, showDrafts]);

  // Carrega conteúdo quando o setor ou showDrafts mudam
  useEffect(() => {
    if (sectorId) {
      fetchContent();
    }
  }, [sectorId, showDrafts, fetchContent]);

  const toggleDrafts = useCallback(async () => {
    setShowDrafts(prev => !prev);
  }, []);

  const refreshContent = useCallback(async () => {
    await fetchContent();
  }, [fetchContent]);

  const deleteItem = useCallback(async (endpoint: string, id: string, itemType: string) => {
    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir ${itemType}`);
      }

      await refreshContent();
    } catch (err) {
      console.error(`Erro ao excluir ${itemType}:`, err);
      throw err;
    }
  }, [refreshContent]);

  const deleteNews = useCallback(async (id: string) => {
    await deleteItem(`/api/admin/sector-content?type=sector_news&id=${id}`, id, 'notícia');
  }, [deleteItem]);

  const deleteEvent = useCallback(async (id: string) => {
    await deleteItem(`/api/admin/sector-content?type=sector_events&id=${id}`, id, 'evento');
  }, [deleteItem]);

  const deleteMessage = useCallback(async (id: string) => {
    await deleteItem(`/api/admin/sector-content?type=sector_messages&id=${id}`, id, 'mensagem');
  }, [deleteItem]);

  const deleteDocument = useCallback(async (id: string) => {
    await deleteItem(`/api/admin/sector-content?type=sector_documents&id=${id}`, id, 'documento');
  }, [deleteItem]);

  const deleteVideo = useCallback(async (id: string) => {
    await deleteItem(`/api/admin/sector-content?type=sector_videos&id=${id}`, id, 'vídeo');
  }, [deleteItem]);

  const deleteImage = useCallback(async (id: string) => {
    await deleteItem(`/api/admin/sector-content?type=sector_images&id=${id}`, id, 'imagem');
  }, [deleteItem]);

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

export type { SectorNews, SectorEvent, SectorMessage, SectorDocument, SectorVideo, SectorImage };