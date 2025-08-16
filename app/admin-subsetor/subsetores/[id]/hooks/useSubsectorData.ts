// Hook para gerenciamento de dados do subsetor

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { Subsector, SubsectorEvent, SubsectorNews, System, User, WorkLocation } from '../types/subsector.types';

interface UseSubsectorDataReturn {
  subsector: Subsector | null;
  events: SubsectorEvent[];
  news: SubsectorNews[];
  systems: System[];
  users: User[];
  workLocations: WorkLocation[];
  loading: boolean;
  error: string | null;
  showDrafts: boolean;
  totalDraftEventsCount: number;
  totalDraftNewsCount: number;
  setShowDrafts: (show: boolean) => void;
  fetchEvents: () => Promise<void>;
  fetchNews: () => Promise<void>;
  fetchSystems: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchWorkLocations: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useSubsectorData(subsectorId: string): UseSubsectorDataReturn {
  const supabase = useSupabaseClient();
  
  const [subsector, setSubsector] = useState<Subsector | null>(null);
  const [events, setEvents] = useState<SubsectorEvent[]>([]);
  const [news, setNews] = useState<SubsectorNews[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDrafts, setShowDrafts] = useState(true);
  const [totalDraftEventsCount, setTotalDraftEventsCount] = useState(0);
  const [totalDraftNewsCount, setTotalDraftNewsCount] = useState(0);

  const fetchSubsector = useCallback(async () => {
    try {
      const { data: subsectorData, error: subsectorError } = await supabase
        .from('subsectors')
        .select(`
          id,
          name,
          description,
          sector_id,
          sectors!inner(name)
        `)
        .eq('id', subsectorId)
        .single();

      if (subsectorError) throw subsectorError;

      if (subsectorData) {
        const sectorName = (subsectorData as any).sectors?.name || 
                          ((subsectorData as any).sectors && Array.isArray((subsectorData as any).sectors) 
                            ? (subsectorData as any).sectors[0]?.name 
                            : undefined);
                            
        setSubsector({
          ...subsectorData,
          sector_name: sectorName
        });
      }
    } catch (err) {
      setError('Erro ao carregar dados do subsetor');
    }
  }, [subsectorId, supabase]);

  const fetchEvents = useCallback(async () => {
    console.log('\n📅📅📅 [EVENTS-HOOK] INÍCIO FETCHEVENTS 📅📅📅');
    console.log('📅 [EVENTS] Parâmetros:');
    console.log('  subsectorId:', subsectorId);
    console.log('  showDrafts:', showDrafts);
    
    try {
      // Buscar todos os eventos de uma vez apenas
      console.log('📅 [EVENTS] Executando query no Supabase...');
      const { data: allEvents, error } = await supabase
        .from('subsector_events')
        .select('id, title, description, start_date, is_published, is_featured')
        .eq('subsector_id', subsectorId)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('❌ [EVENTS] Erro na query:', error);
        throw error;
      }
      
      console.log('📅 [EVENTS] Query executada com sucesso');
      console.log('📅 [EVENTS] Total de registros retornados:', allEvents?.length || 0);
      
      if (allEvents) {
        // Análise detalhada dos eventos
        const eventsAnalysis = {
          total: allEvents.length,
          published: allEvents.filter(e => e.is_published === true).length,
          drafts: allEvents.filter(e => e.is_published === false).length,
          nullPublished: allEvents.filter(e => e.is_published === null).length
        };
        
        console.log('📅 [EVENTS] Análise dos eventos:');
        console.log('  Total:', eventsAnalysis.total);
        console.log('  Publicados (is_published = true):', eventsAnalysis.published);
        console.log('  Rascunhos (is_published = false):', eventsAnalysis.drafts);
        console.log('  is_published = null:', eventsAnalysis.nullPublished);
        
        // Calcular total de rascunhos
        const totalDrafts = allEvents.filter(e => !e.is_published).length;
        console.log('📅 [EVENTS] Total de rascunhos calculado:', totalDrafts);
        setTotalDraftEventsCount(totalDrafts);
        
        // Aplicar filtro de publicação baseado em showDrafts
        const filteredEvents = showDrafts 
          ? allEvents 
          : allEvents.filter(e => e.is_published);
        
        console.log('📅 [EVENTS] Eventos após filtro (showDrafts=' + showDrafts + '):', filteredEvents.length);
        console.log('📅 [EVENTS] Primeiros 3 eventos filtrados:');
        filteredEvents.slice(0, 3).forEach((event, index) => {
          console.log(`  [${index + 1}] ID: ${event.id}, Title: "${event.title}", Published: ${event.is_published}`);
        });
        
        setEvents(filteredEvents);
      } else {
        console.log('📅 [EVENTS] Nenhum evento retornado da query');
        setEvents([]);
        setTotalDraftEventsCount(0);
      }
    } catch (error) {
      console.error('❌ [EVENTS] Erro capturado:', error);
      setEvents([]);
      setTotalDraftEventsCount(0);
    }
    
    console.log('📅📅📅 [EVENTS-HOOK] FIM FETCHEVENTS 📅📅📅\n');
  }, [subsectorId, supabase, showDrafts]);

  const fetchNews = useCallback(async () => {
    console.log('\n📰📰📰 [NEWS-HOOK] INÍCIO FETCHNEWS 📰📰📰');
    console.log('📰 [NEWS] Parâmetros:');
    console.log('  subsectorId:', subsectorId);
    console.log('  showDrafts:', showDrafts);
    
    try {
      // Buscar todas as notícias de uma vez apenas
      console.log('📰 [NEWS] Executando query no Supabase...');
      const { data: allNews, error } = await supabase
        .from('subsector_news')
        .select('id, title, summary, is_published, is_featured, created_at')
        .eq('subsector_id', subsectorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [NEWS] Erro na query:', error);
        throw error;
      }
      
      console.log('📰 [NEWS] Query executada com sucesso');
      console.log('📰 [NEWS] Total de registros retornados:', allNews?.length || 0);
      
      if (allNews) {
        // Análise detalhada das notícias
        const newsAnalysis = {
          total: allNews.length,
          published: allNews.filter(n => n.is_published === true).length,
          drafts: allNews.filter(n => n.is_published === false).length,
          nullPublished: allNews.filter(n => n.is_published === null).length
        };
        
        console.log('📰 [NEWS] Análise das notícias:');
        console.log('  Total:', newsAnalysis.total);
        console.log('  Publicadas (is_published = true):', newsAnalysis.published);
        console.log('  Rascunhos (is_published = false):', newsAnalysis.drafts);
        console.log('  is_published = null:', newsAnalysis.nullPublished);
        
        // Calcular total de rascunhos
        const totalDrafts = allNews.filter(n => !n.is_published).length;
        console.log('📰 [NEWS] Total de rascunhos calculado:', totalDrafts);
        setTotalDraftNewsCount(totalDrafts);
        
        // Aplicar filtro de publicação baseado em showDrafts
        const filteredNews = showDrafts 
          ? allNews 
          : allNews.filter(n => n.is_published);
        
        console.log('📰 [NEWS] Notícias após filtro (showDrafts=' + showDrafts + '):', filteredNews.length);
        console.log('📰 [NEWS] Primeiras 3 notícias filtradas:');
        filteredNews.slice(0, 3).forEach((news, index) => {
          console.log(`  [${index + 1}] ID: ${news.id}, Title: "${news.title}", Published: ${news.is_published}`);
        });
        
        setNews(filteredNews);
      } else {
        console.log('📰 [NEWS] Nenhuma notícia retornada da query');
        setNews([]);
        setTotalDraftNewsCount(0);
      }
    } catch (error) {
      console.error('❌ [NEWS] Erro capturado:', error);
      setNews([]);
      setTotalDraftNewsCount(0);
    }
    
    console.log('📰📰📰 [NEWS-HOOK] FIM FETCHNEWS 📰📰📰\n');
  }, [subsectorId, supabase, showDrafts]);

  const fetchSystems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('systems')
        .select('id, name, description, url, icon')
        .eq('subsector_id', subsectorId)
        .order('name');

      if (error) throw error;
      setSystems(data || []);
    } catch (error) {
      // Error handled silently
    }
  }, [subsectorId, supabase]);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, work_location_id')
        .order('full_name');
        
      if (error) {
        return;
      }
      
      setUsers(data || []);
    } catch (error) {
      // Error handled silently
    }
  }, [supabase]);

  const fetchWorkLocations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('work_locations')
        .select('id, name')
        .order('name');

      if (error) {
        return;
      }

      setWorkLocations(data || []);
    } catch (error) {
      // Error handled silently
    }
  }, [supabase]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      fetchSubsector(),
      fetchEvents(),
      fetchNews(),
      fetchSystems(),
      fetchUsers(),
      fetchWorkLocations()
    ]);
    
    setLoading(false);
  }, [fetchSubsector, fetchEvents, fetchNews, fetchSystems, fetchUsers, fetchWorkLocations]);

  useEffect(() => {
    if (subsectorId) {
      refreshData();
    }
  }, [subsectorId, refreshData]);

  return {
    subsector,
    events,
    news,
    systems,
    users,
    workLocations,
    loading,
    error,
    showDrafts,
    totalDraftEventsCount,
    totalDraftNewsCount,
    setShowDrafts,
    fetchEvents,
    fetchNews,
    fetchSystems,
    fetchUsers,
    fetchWorkLocations,
    refreshData
  };
}