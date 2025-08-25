// Hook principal para gerenciar conteúdo do setor

import { useCallback, useEffect, useState } from 'react';

import { useSupabaseClient } from '@/hooks/useSupabaseClient';

import type { 
  SectorDocument, 
  SectorEvent, 
  SectorImage, 
  SectorMessage, 
  SectorNews, 
  SectorVideo 
} from './types/sector.types';

export function useSectorContentManager(sectorId: string) {
  const supabase = useSupabaseClient();
  
  // Estados para cada tipo de conteúdo
  const [news, setNews] = useState<SectorNews[]>([]);
  const [events, setEvents] = useState<SectorEvent[]>([]);
  const [messages, setMessages] = useState<SectorMessage[]>([]);
  const [documents, setDocuments] = useState<SectorDocument[]>([]);
  const [videos, setVideos] = useState<SectorVideo[]>([]);
  const [images, setImages] = useState<SectorImage[]>([]);
  
  // Estados para controle de rascunhos por tipo
  const [showDraftNews, setShowDraftNews] = useState(false);
  const [showDraftEvents, setShowDraftEvents] = useState(false);
  const [showDraftMessages, setShowDraftMessages] = useState(false);
  const [showDraftDocuments, setShowDraftDocuments] = useState(false);
  const [showDraftVideos, setShowDraftVideos] = useState(false);
  const [showDraftImages, setShowDraftImages] = useState(false);
  
  // Contadores de rascunhos
  const [totalDraftNewsCount, setTotalDraftNewsCount] = useState(0);
  const [totalDraftEventsCount, setTotalDraftEventsCount] = useState(0);
  const [totalDraftMessagesCount, setTotalDraftMessagesCount] = useState(0);
  const [totalDraftDocumentsCount, setTotalDraftDocumentsCount] = useState(0);
  const [totalDraftVideosCount, setTotalDraftVideosCount] = useState(0);
  const [totalDraftImagesCount, setTotalDraftImagesCount] = useState(0);

  // Fetch News
  const fetchNews = useCallback(async () => {
    try {
      // Primeiro, buscar TODAS as notícias para contar os rascunhos
      const { data: allNews } = await supabase
        .from('sector_news')
        .select('*')
        .eq('sector_id', sectorId);
      
      if (allNews) {
        const totalDrafts = allNews.filter(n => !n.is_published).length;
        setTotalDraftNewsCount(totalDrafts);
      }
      
      // Construir query base
      let query = supabase
        .from('sector_news')
        .select('*')
        .eq('sector_id', sectorId);
      
      // Aplicar filtro de publicação
      if (!showDraftNews) {
        query = query.eq('is_published', true);
      }
      
      // Executar query com ordenação
      const { data, error } = await query
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    }
  }, [sectorId, supabase, showDraftNews]);

  // Fetch Events
  const fetchEvents = useCallback(async () => {
    try {
      // Primeiro, buscar TODOS os eventos para contar os rascunhos
      const { data: allEvents } = await supabase
        .from('sector_events')
        .select('*')
        .eq('sector_id', sectorId);
      
      if (allEvents) {
        const totalDrafts = allEvents.filter(e => !e.is_published).length;
        setTotalDraftEventsCount(totalDrafts);
      }
      
      // Construir query base
      let query = supabase
        .from('sector_events')
        .select('*')
        .eq('sector_id', sectorId);
      
      // Aplicar filtro de publicação
      if (!showDraftEvents) {
        query = query.eq('is_published', true);
      }
      
      // Executar query com ordenação
      const { data, error } = await query
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    }
  }, [sectorId, supabase, showDraftEvents]);

  // Fetch Messages
  const fetchMessages = useCallback(async () => {
    try {
      // Primeiro, buscar TODAS as mensagens para contar os rascunhos
      const { data: allMessages } = await supabase
        .from('sector_messages')
        .select('*')
        .eq('sector_id', sectorId);
      
      if (allMessages) {
        const totalDrafts = allMessages.filter(m => !m.is_published).length;
        setTotalDraftMessagesCount(totalDrafts);
      }
      
      // Construir query base
      let query = supabase
        .from('sector_messages')
        .select('*')
        .eq('sector_id', sectorId);
      
      // Aplicar filtro de publicação
      if (!showDraftMessages) {
        query = query.eq('is_published', true);
      }
      
      // Executar query com ordenação
      const { data, error } = await query
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  }, [sectorId, supabase, showDraftMessages]);

  // Fetch Documents
  const fetchDocuments = useCallback(async () => {
    try {
      // Primeiro, buscar TODOS os documentos para contar os rascunhos
      const { data: allDocuments } = await supabase
        .from('sector_documents')
        .select('*')
        .eq('sector_id', sectorId);
      
      if (allDocuments) {
        const totalDrafts = allDocuments.filter(d => !d.is_published).length;
        setTotalDraftDocumentsCount(totalDrafts);
      }
      
      // Construir query base
      let query = supabase
        .from('sector_documents')
        .select('*')
        .eq('sector_id', sectorId);
      
      // Aplicar filtro de publicação
      if (!showDraftDocuments) {
        query = query.eq('is_published', true);
      }
      
      // Executar query com ordenação
      const { data, error } = await query
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    }
  }, [sectorId, supabase, showDraftDocuments]);

  // Fetch Videos
  const fetchVideos = useCallback(async () => {
    try {
      // Primeiro, buscar TODOS os vídeos para contar os rascunhos
      const { data: allVideos } = await supabase
        .from('sector_videos')
        .select('*')
        .eq('sector_id', sectorId);
      
      if (allVideos) {
        const totalDrafts = allVideos.filter(v => !v.is_published).length;
        setTotalDraftVideosCount(totalDrafts);
      }
      
      // Construir query base
      let query = supabase
        .from('sector_videos')
        .select('*')
        .eq('sector_id', sectorId);
      
      // Aplicar filtro de publicação
      if (!showDraftVideos) {
        query = query.eq('is_published', true);
      }
      
      // Executar query com ordenação
      const { data, error } = await query
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
    }
  }, [sectorId, supabase, showDraftVideos]);

  // Fetch Images
  const fetchImages = useCallback(async () => {
    try {
      // Primeiro, buscar TODAS as imagens para contar os rascunhos
      const { data: allImages } = await supabase
        .from('sector_images')
        .select('*')
        .eq('sector_id', sectorId);
      
      if (allImages) {
        const totalDrafts = allImages.filter(i => !i.is_published).length;
        setTotalDraftImagesCount(totalDrafts);
      }
      
      // Construir query base
      let query = supabase
        .from('sector_images')
        .select('*')
        .eq('sector_id', sectorId);
      
      // Aplicar filtro de publicação
      if (!showDraftImages) {
        query = query.eq('is_published', true);
      }
      
      // Executar query com ordenação
      const { data, error } = await query
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
    }
  }, [sectorId, supabase, showDraftImages]);

  // Toggle drafts visibility por tipo
  const toggleDraftNews = useCallback(async () => {
    setShowDraftNews(prev => !prev);
  }, []);

  const toggleDraftEvents = useCallback(async () => {
    setShowDraftEvents(prev => !prev);
  }, []);

  const toggleDraftMessages = useCallback(async () => {
    setShowDraftMessages(prev => !prev);
  }, []);

  const toggleDraftDocuments = useCallback(async () => {
    setShowDraftDocuments(prev => !prev);
  }, []);

  const toggleDraftVideos = useCallback(async () => {
    setShowDraftVideos(prev => !prev);
  }, []);

  const toggleDraftImages = useCallback(async () => {
    setShowDraftImages(prev => !prev);
  }, []);

  // Refresh functions por tipo
  const refreshNews = useCallback(async () => {
    await fetchNews();
  }, [fetchNews]);

  const refreshEvents = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  const refreshMessages = useCallback(async () => {
    await fetchMessages();
  }, [fetchMessages]);

  const refreshDocuments = useCallback(async () => {
    await fetchDocuments();
  }, [fetchDocuments]);

  const refreshVideos = useCallback(async () => {
    await fetchVideos();
  }, [fetchVideos]);

  const refreshImages = useCallback(async () => {
    await fetchImages();
  }, [fetchImages]);

  // Delete functions
  const deleteNews = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/sector-content?type=sector_news&id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir notícia');
      }
      
      await fetchNews();
    } catch (error) {
      console.error('Erro ao excluir notícia:', error);
      throw error;
    }
  }, [fetchNews]);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/sector-content?type=sector_events&id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir evento');
      }
      
      await fetchEvents();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      throw error;
    }
  }, [fetchEvents]);

  const deleteMessage = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/sector-content?type=sector_messages&id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir mensagem');
      }
      
      await fetchMessages();
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
      throw error;
    }
  }, [fetchMessages]);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/sector-content?type=sector_documents&id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir documento');
      }
      
      await fetchDocuments();
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      throw error;
    }
  }, [fetchDocuments]);

  const deleteVideo = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/sector-content?type=sector_videos&id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir vídeo');
      }
      
      await fetchVideos();
    } catch (error) {
      console.error('Erro ao excluir vídeo:', error);
      throw error;
    }
  }, [fetchVideos]);

  const deleteImage = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/sector-content?type=sector_images&id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir imagem');
      }
      
      await fetchImages();
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
      throw error;
    }
  }, [fetchImages]);

  // Carregar dados quando o estado de rascunhos mudar
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return {
    // Conteúdo
    news,
    events,
    messages,
    documents,
    videos,
    images,
    // Estados de rascunhos
    showDraftNews,
    showDraftEvents,
    showDraftMessages,
    showDraftDocuments,
    showDraftVideos,
    showDraftImages,
    // Contadores de rascunhos
    totalDraftNewsCount,
    totalDraftEventsCount,
    totalDraftMessagesCount,
    totalDraftDocumentsCount,
    totalDraftVideosCount,
    totalDraftImagesCount,
    // Toggle de rascunhos
    toggleDraftNews,
    toggleDraftEvents,
    toggleDraftMessages,
    toggleDraftDocuments,
    toggleDraftVideos,
    toggleDraftImages,
    // Refresh functions
    refreshNews,
    refreshEvents,
    refreshMessages,
    refreshDocuments,
    refreshVideos,
    refreshImages,
    // Delete functions
    deleteNews,
    deleteEvent,
    deleteMessage,
    deleteDocument,
    deleteVideo,
    deleteImage
  };
}