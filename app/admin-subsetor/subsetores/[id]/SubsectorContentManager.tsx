// Hook principal para gerenciar conteúdo do subsetor

import { useState, useCallback, useEffect } from 'react';

import { useSupabaseClient } from '@/hooks/useSupabaseClient';

import type { 
  SubsectorNews, 
  SubsectorEvent, 
  SubsectorDocument, 
  SubsectorVideo,
  SubsectorImage,
  SubsectorMessage
} from './types/subsector.types';

export function useSubsectorContentManager(subsectorId: string) {
  const supabase = useSupabaseClient();
  
  // Estados para cada tipo de conteúdo
  const [news, setNews] = useState<SubsectorNews[]>([]);
  const [events, setEvents] = useState<SubsectorEvent[]>([]);
  const [messages, setMessages] = useState<SubsectorMessage[]>([]);
  const [documents, setDocuments] = useState<SubsectorDocument[]>([]);
  const [videos, setVideos] = useState<SubsectorVideo[]>([]);
  const [images, setImages] = useState<SubsectorImage[]>([]);
  
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
      // Buscar todas as notícias de uma só vez com ordenação
      const { data: allNews, error } = await supabase
        .from('subsector_news')
        .select('*')
        .eq('subsector_id', subsectorId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (allNews) {
        // Contar rascunhos in-memory
        const totalDrafts = allNews.filter(n => !n.is_published).length;
        setTotalDraftNewsCount(totalDrafts);
        
        // Aplicar filtro de publicação in-memory
        const filteredNews = showDraftNews 
          ? allNews 
          : allNews.filter(n => n.is_published);
        
        setNews(filteredNews);
      } else {
        setNews([]);
        setTotalDraftNewsCount(0);
      }
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    }
  }, [subsectorId, supabase, showDraftNews]);

  // Fetch Events
  const fetchEvents = useCallback(async () => {
    try {
      // Buscar todos os eventos de uma só vez com ordenação
      const { data: allEvents, error } = await supabase
        .from('subsector_events')
        .select('*')
        .eq('subsector_id', subsectorId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      
      if (allEvents) {
        // Contar rascunhos in-memory
        const totalDrafts = allEvents.filter(e => !e.is_published).length;
        setTotalDraftEventsCount(totalDrafts);
        
        // Aplicar filtro de publicação in-memory
        const filteredEvents = showDraftEvents
          ? allEvents
          : allEvents.filter(e => e.is_published);
        
        setEvents(filteredEvents);
      } else {
        setEvents([]);
        setTotalDraftEventsCount(0);
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    }
  }, [subsectorId, supabase, showDraftEvents]);

  // Fetch Messages
  const fetchMessages = useCallback(async () => {
    try {
      // Buscar todas as mensagens de uma só vez com ordenação
      const { data: allMessages, error } = await supabase
        .from('subsector_messages')
        .select('*')
        .eq('subsector_id', subsectorId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (allMessages) {
        // Contar rascunhos in-memory
        const totalDrafts = allMessages.filter(m => !m.is_published).length;
        setTotalDraftMessagesCount(totalDrafts);
        
        // Aplicar filtro de publicação in-memory
        const filteredMessages = showDraftMessages
          ? allMessages
          : allMessages.filter(m => m.is_published);
        
        setMessages(filteredMessages);
      } else {
        setMessages([]);
        setTotalDraftMessagesCount(0);
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  }, [subsectorId, supabase, showDraftMessages]);

  // Fetch Documents
  const fetchDocuments = useCallback(async () => {
    try {
      // Buscar todos os documentos de uma só vez com ordenação
      const { data: allDocuments, error } = await supabase
        .from('subsector_documents')
        .select('*')
        .eq('subsector_id', subsectorId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (allDocuments) {
        // Contar rascunhos in-memory
        const totalDrafts = allDocuments.filter(d => !d.is_published).length;
        setTotalDraftDocumentsCount(totalDrafts);
        
        // Aplicar filtro de publicação in-memory
        const filteredDocuments = showDraftDocuments
          ? allDocuments
          : allDocuments.filter(d => d.is_published);
        
        setDocuments(filteredDocuments);
      } else {
        setDocuments([]);
        setTotalDraftDocumentsCount(0);
      }
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    }
  }, [subsectorId, supabase, showDraftDocuments]);

  // Fetch Videos
  const fetchVideos = useCallback(async () => {
    try {
      // Buscar todos os vídeos de uma só vez com ordenação
      const { data: allVideos, error } = await supabase
        .from('subsector_videos')
        .select('*')
        .eq('subsector_id', subsectorId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (allVideos) {
        // Contar rascunhos in-memory
        const totalDrafts = allVideos.filter(v => !v.is_published).length;
        setTotalDraftVideosCount(totalDrafts);
        
        // Aplicar filtro de publicação in-memory
        const filteredVideos = showDraftVideos
          ? allVideos
          : allVideos.filter(v => v.is_published);
        
        setVideos(filteredVideos);
      } else {
        setVideos([]);
        setTotalDraftVideosCount(0);
      }
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
    }
  }, [subsectorId, supabase, showDraftVideos]);

  // Fetch Images
  const fetchImages = useCallback(async () => {
    try {
      // Buscar todas as imagens de uma só vez com ordenação
      const { data: allImages, error } = await supabase
        .from('subsector_images')
        .select('*')
        .eq('subsector_id', subsectorId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (allImages) {
        // Contar rascunhos in-memory
        const totalDrafts = allImages.filter(i => !i.is_published).length;
        setTotalDraftImagesCount(totalDrafts);
        
        // Aplicar filtro de publicação in-memory
        const filteredImages = showDraftImages
          ? allImages
          : allImages.filter(i => i.is_published);
        
        setImages(filteredImages);
      } else {
        setImages([]);
        setTotalDraftImagesCount(0);
      }
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
    }
  }, [subsectorId, supabase, showDraftImages]);

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
      const response = await fetch(`/api/admin/subsector-content?type=subsector_news&id=${id}`, {
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
      const response = await fetch(`/api/admin/subsector-content?type=subsector_events&id=${id}`, {
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
      const response = await fetch(`/api/admin/subsector-content?type=subsector_messages&id=${id}`, {
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
      const response = await fetch(`/api/admin/subsector-content?type=subsector_documents&id=${id}`, {
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
      const response = await fetch(`/api/admin/subsector-content?type=subsector_videos&id=${id}`, {
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
      const response = await fetch(`/api/admin/subsector-content?type=subsector_images&id=${id}`, {
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