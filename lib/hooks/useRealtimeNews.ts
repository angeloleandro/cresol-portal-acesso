/**
 * Hook para subscription realtime de notícias e eventos
 * Otimizado para performance com filtros seletivos
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '../production-logger';

interface RealtimeNewsOptions {
  sectorId?: string;
  subsectorId?: string;
  onlyPublished?: boolean;
  includeEvents?: boolean;
  enableRealtime?: boolean;
}

interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  image_url?: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export function useRealtimeNews(options: RealtimeNewsOptions = {}) {
  const {
    sectorId,
    subsectorId,
    onlyPublished = true,
    includeEvents = false,
    enableRealtime = true
  } = options;

  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null);

  // Inicializar cliente Supabase
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('Missing Supabase environment variables');
      setError('Configuration error: Missing Supabase credentials');
      return;
    }
    
    supabaseRef.current = createBrowserClient(
      supabaseUrl,
      supabaseAnonKey
    );
  }, []);

  // Função para buscar notícias
  const fetchNews = useCallback(async () => {
    if (!supabaseRef.current) return;
    
    try {
      let query = supabaseRef.current
        .from(subsectorId ? 'subsector_news' : 'sector_news')
        .select('*');

      // Aplicar filtros
      if (subsectorId) {
        query = query.eq('subsector_id', subsectorId);
      } else if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      if (onlyPublished) {
        query = query.eq('is_published', true);
      }

      // Ordenar por data de criação (mais recentes primeiro)
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setNews(data || []);
    } catch (err: any) {
      logger.error('Erro ao buscar notícias', err);
      setError(err.message);
    }
  }, [sectorId, subsectorId, onlyPublished]);

  // Função para buscar eventos
  const fetchEvents = useCallback(async () => {
    if (!supabaseRef.current || !includeEvents) return;
    
    try {
      let query = supabaseRef.current
        .from(subsectorId ? 'subsector_events' : 'sector_events')
        .select('*');

      // Aplicar filtros
      if (subsectorId) {
        query = query.eq('subsector_id', subsectorId);
      } else if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      if (onlyPublished) {
        query = query.eq('is_published', true);
      }

      // Ordenar por data de início do evento
      query = query.order('start_date', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      logger.error('Erro ao buscar eventos', err);
      setError(err.message);
    }
  }, [sectorId, subsectorId, onlyPublished, includeEvents]);

  // Buscar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchNews(), fetchEvents()]);
      setLoading(false);
    };

    loadData();
  }, [fetchNews, fetchEvents]);

  // Configurar realtime subscriptions
  useEffect(() => {
    if (!supabaseRef.current || !enableRealtime) return;

    // Limpar subscription anterior
    if (channelRef.current) {
      supabaseRef.current.removeChannel(channelRef.current);
    }

    // Criar canal único para todas as subscriptions
    const channel = supabaseRef.current.channel('news-events-updates');

    // Subscription para notícias do setor
    if (sectorId && !subsectorId) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sector_news',
          filter: `sector_id=eq.${sectorId}`
        },
        (payload: any) => {
          logger.debug('Realtime update - sector_news', payload);
          
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as NewsItem;
            if (!onlyPublished || newItem.is_published) {
              setNews(prev => [newItem, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as NewsItem;
            setNews(prev => prev.map(item => 
              item.id === updatedItem.id ? updatedItem : item
            ).filter(item => !onlyPublished || item.is_published));
          } else if (payload.eventType === 'DELETE') {
            const deletedItem = payload.old as NewsItem;
            setNews(prev => prev.filter(item => item.id !== deletedItem.id));
          }
        }
      );

      // Subscription para eventos do setor
      if (includeEvents) {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'sector_events',
            filter: `sector_id=eq.${sectorId}`
          },
          (payload: any) => {
            logger.debug('Realtime update - sector_events', payload);
            
            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as EventItem;
              if (!onlyPublished || newItem.is_published) {
                setEvents(prev => [...prev, newItem].sort((a, b) => 
                  new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
                ));
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedItem = payload.new as EventItem;
              setEvents(prev => prev.map(item => 
                item.id === updatedItem.id ? updatedItem : item
              ).filter(item => !onlyPublished || item.is_published)
              .sort((a, b) => 
                new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
              ));
            } else if (payload.eventType === 'DELETE') {
              const deletedItem = payload.old as EventItem;
              setEvents(prev => prev.filter(item => item.id !== deletedItem.id));
            }
          }
        );
      }
    }

    // Subscription para notícias do subsetor
    if (subsectorId) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subsector_news',
          filter: `subsector_id=eq.${subsectorId}`
        },
        (payload: any) => {
          logger.debug('Realtime update - subsector_news', payload);
          
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as NewsItem;
            if (!onlyPublished || newItem.is_published) {
              setNews(prev => [newItem, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as NewsItem;
            setNews(prev => prev.map(item => 
              item.id === updatedItem.id ? updatedItem : item
            ).filter(item => !onlyPublished || item.is_published));
          } else if (payload.eventType === 'DELETE') {
            const deletedItem = payload.old as NewsItem;
            setNews(prev => prev.filter(item => item.id !== deletedItem.id));
          }
        }
      );

      // Subscription para eventos do subsetor
      if (includeEvents) {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subsector_events',
            filter: `subsector_id=eq.${subsectorId}`
          },
          (payload: any) => {
            logger.debug('Realtime update - subsector_events', payload);
            
            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as EventItem;
              if (!onlyPublished || newItem.is_published) {
                setEvents(prev => [...prev, newItem].sort((a, b) => 
                  new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
                ));
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedItem = payload.new as EventItem;
              setEvents(prev => prev.map(item => 
                item.id === updatedItem.id ? updatedItem : item
              ).filter(item => !onlyPublished || item.is_published)
              .sort((a, b) => 
                new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
              ));
            } else if (payload.eventType === 'DELETE') {
              const deletedItem = payload.old as EventItem;
              setEvents(prev => prev.filter(item => item.id !== deletedItem.id));
            }
          }
        );
      }
    }

    // Inscrever no canal
    channel.subscribe((status: any) => {
      logger.debug('Realtime subscription status', { status });
      if (status === 'SUBSCRIBED') {
        logger.debug('Realtime conectado para news/events');
      }
    });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current && supabaseRef.current) {
        logger.debug('Limpando subscription realtime');
        supabaseRef.current.removeChannel(channelRef.current);
      }
    };
  }, [sectorId, subsectorId, onlyPublished, includeEvents, enableRealtime]);

  // Função para refazer fetch manual
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchNews(), fetchEvents()]);
    setLoading(false);
  }, [fetchNews, fetchEvents]);

  return {
    news,
    events,
    loading,
    error,
    refresh,
    isConnected: channelRef.current !== null
  };
}

export default useRealtimeNews;