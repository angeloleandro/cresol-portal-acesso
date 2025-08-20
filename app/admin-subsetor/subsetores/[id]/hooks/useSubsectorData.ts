// Hook para gerenciamento de dados do subsetor

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { Subsector, SubsectorEvent, SubsectorNews, System, User, WorkLocation } from '../types/subsector.types';

interface UseSubsectorDataReturn {
  subsector: Subsector | null;
  events: SubsectorEvent[];
  news: SubsectorNews[];
  messages: any[];
  systems: System[];
  users: User[];
  workLocations: WorkLocation[];
  loading: boolean;
  error: string | null;
  showDrafts: boolean;
  totalDraftEventsCount: number;
  totalDraftNewsCount: number;
  totalDraftMessagesCount: number;
  setShowDrafts: (show: boolean) => void;
  fetchEvents: () => Promise<void>;
  fetchNews: () => Promise<void>;
  fetchMessages: () => Promise<void>;
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
  const [messages, setMessages] = useState<any[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDrafts, setShowDrafts] = useState(true);
  const [totalDraftEventsCount, setTotalDraftEventsCount] = useState(0);
  const [totalDraftNewsCount, setTotalDraftNewsCount] = useState(0);
  const [totalDraftMessagesCount, setTotalDraftMessagesCount] = useState(0);

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
    try {
      const { data: allEvents, error } = await supabase
        .from('subsector_events')
        .select('id, title, description, location, start_date, end_date, is_published, is_featured, created_at, updated_at, subsector_id')
        .eq('subsector_id', subsectorId)
        .order('start_date', { ascending: false });

      if (error) {
        throw error;
      }
      
      if (allEvents) {
        // Calcular total de rascunhos
        const totalDrafts = allEvents.filter(e => !e.is_published).length;
        setTotalDraftEventsCount(totalDrafts);
        
        // Aplicar filtro de publicação baseado em showDrafts
        const filteredEvents = showDrafts 
          ? allEvents 
          : allEvents.filter(e => e.is_published);
        
        setEvents(filteredEvents);
      } else {
        setEvents([]);
        setTotalDraftEventsCount(0);
      }
    } catch (error) {
      setEvents([]);
      setTotalDraftEventsCount(0);
    }
  }, [subsectorId, supabase, showDrafts]);

  const fetchNews = useCallback(async () => {
    try {
      const { data: allNews, error } = await supabase
        .from('subsector_news')
        .select('id, title, summary, content, image_url, is_published, is_featured, created_at, updated_at, subsector_id')
        .eq('subsector_id', subsectorId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      if (allNews) {
        // Calcular total de rascunhos
        const totalDrafts = allNews.filter(n => !n.is_published).length;
        setTotalDraftNewsCount(totalDrafts);
        
        // Aplicar filtro de publicação baseado em showDrafts
        const filteredNews = showDrafts 
          ? allNews 
          : allNews.filter(n => n.is_published);
        
        setNews(filteredNews);
      } else {
        setNews([]);
        setTotalDraftNewsCount(0);
      }
    } catch (error) {
      setNews([]);
      setTotalDraftNewsCount(0);
    }
  }, [subsectorId, supabase, showDrafts]);

  const fetchMessages = useCallback(async () => {
    try {
      const { data: allMessages, error } = await supabase
        .from('subsector_messages')
        .select('id, title, content, is_published, created_at')
        .eq('subsector_id', subsectorId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      if (allMessages) {
        // Calcular total de rascunhos
        const totalDrafts = allMessages.filter(m => !m.is_published).length;
        setTotalDraftMessagesCount(totalDrafts);
        
        // Aplicar filtro de publicação baseado em showDrafts
        const filteredMessages = showDrafts 
          ? allMessages 
          : allMessages.filter(m => m.is_published);
        
        setMessages(filteredMessages);
      } else {
        setMessages([]);
        setTotalDraftMessagesCount(0);
      }
    } catch (error) {
      setMessages([]);
      setTotalDraftMessagesCount(0);
    }
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
      fetchMessages(),
      fetchSystems(),
      fetchUsers(),
      fetchWorkLocations()
    ]);
    
    setLoading(false);
  }, [fetchSubsector, fetchEvents, fetchNews, fetchMessages, fetchSystems, fetchUsers, fetchWorkLocations]);

  useEffect(() => {
    if (subsectorId) {
      refreshData();
    }
  }, [subsectorId, refreshData]);

  return {
    subsector,
    events,
    news,
    messages,
    systems,
    users,
    workLocations,
    loading,
    error,
    showDrafts,
    totalDraftEventsCount,
    totalDraftNewsCount,
    totalDraftMessagesCount,
    setShowDrafts,
    fetchEvents,
    fetchNews,
    fetchMessages,
    fetchSystems,
    fetchUsers,
    fetchWorkLocations,
    refreshData
  };
}