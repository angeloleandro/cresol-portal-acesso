// Componente unificado para gerenciar conteúdo do setor com lógica limpa
import { useState, useCallback, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

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
  const [showDrafts, setShowDrafts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDraftNewsCount, setTotalDraftNewsCount] = useState(0);
  const [totalDraftEventsCount, setTotalDraftEventsCount] = useState(0);

  // Criar client uma vez para evitar warnings de dependência
  const supabase = useMemo(() => createClient(), []);

  // Função unificada para buscar conteúdo
  const fetchContent = useCallback(async (includesDrafts: boolean) => {
    if (!sectorId) {
      console.log('⚠️ sectorId não definido');
      return;
    }

    console.log(`🔄 Buscando conteúdo - sectorId: ${sectorId}, includesDrafts: ${includesDrafts}`);
    setIsLoading(true);
    setError(null);

    try {
      // Buscar contadores de rascunhos (sempre buscar todos para mostrar o contador)
      const { data: allNews } = await supabase
        .from('sector_news')
        .select('is_published')
        .eq('sector_id', sectorId);
      
      const { data: allEvents } = await supabase
        .from('sector_events')
        .select('is_published')
        .eq('sector_id', sectorId);

      // Contar rascunhos
      const draftNewsCount = allNews?.filter(n => !n.is_published).length || 0;
      const draftEventsCount = allEvents?.filter(e => !e.is_published).length || 0;
      
      setTotalDraftNewsCount(draftNewsCount);
      setTotalDraftEventsCount(draftEventsCount);

      // Buscar notícias com filtro
      let newsQuery = supabase
        .from('sector_news')
        .select('*')
        .eq('sector_id', sectorId);
      
      if (!includesDrafts) {
        newsQuery = newsQuery.eq('is_published', true);
      }
      
      newsQuery = newsQuery.order('created_at', { ascending: false });
      
      const { data: newsData, error: newsError } = await newsQuery;
      
      if (newsError) {
        console.error('❌ Erro ao buscar notícias:', newsError);
        throw newsError;
      }

      // Buscar eventos com filtro
      let eventsQuery = supabase
        .from('sector_events')
        .select('*')
        .eq('sector_id', sectorId);
      
      if (!includesDrafts) {
        eventsQuery = eventsQuery.eq('is_published', true);
      }
      
      eventsQuery = eventsQuery.order('start_date', { ascending: false });
      
      const { data: eventsData, error: eventsError } = await eventsQuery;
      
      if (eventsError) {
        console.error('❌ Erro ao buscar eventos:', eventsError);
        throw eventsError;
      }

      console.log(`✅ Conteúdo carregado - Notícias: ${newsData?.length || 0}, Eventos: ${eventsData?.length || 0}`);
      
      // Análise de debug
      if (newsData && newsData.length > 0) {
        const analysis = {
          total: newsData.length,
          published: newsData.filter(n => n.is_published).length,
          drafts: newsData.filter(n => !n.is_published).length
        };
        console.log('📊 Análise de notícias:', analysis);
      }

      setNews(newsData || []);
      setEvents(eventsData || []);
    } catch (err: any) {
      console.error('❌ Erro ao buscar conteúdo:', err);
      setError(err.message || 'Erro ao carregar conteúdo');
    } finally {
      setIsLoading(false);
    }
  }, [sectorId, supabase]);

  // Toggle de rascunhos - ÚNICO ponto de controle
  const toggleDrafts = useCallback(async () => {
    const newShowDrafts = !showDrafts;
    console.log(`🔄 Toggle drafts: ${showDrafts} → ${newShowDrafts}`);
    
    // Atualizar estado imediatamente para feedback visual
    setShowDrafts(newShowDrafts);
    
    // Buscar conteúdo com novo filtro
    await fetchContent(newShowDrafts);
  }, [showDrafts, fetchContent]);

  // Refresh forçado
  const refreshContent = useCallback(async () => {
    console.log('🔄 Refresh forçado do conteúdo');
    await fetchContent(showDrafts);
  }, [showDrafts, fetchContent]);

  // Deletar notícia
  const deleteNews = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('sector_news')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('✅ Notícia deletada:', id);
      await refreshContent();
    } catch (err: any) {
      console.error('❌ Erro ao deletar notícia:', err);
      setError(err.message || 'Erro ao deletar notícia');
    }
  }, [refreshContent, supabase]);

  // Deletar evento
  const deleteEvent = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('sector_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('✅ Evento deletado:', id);
      await refreshContent();
    } catch (err: any) {
      console.error('❌ Erro ao deletar evento:', err);
      setError(err.message || 'Erro ao deletar evento');
    }
  }, [refreshContent, supabase]);

  // Carregar inicial - ÚNICO useEffect
  useEffect(() => {
    let mounted = true;

    const loadContent = async () => {
      if (sectorId && mounted) {
        await fetchContent(showDrafts);
      }
    };

    loadContent();

    return () => {
      mounted = false;
    };
  }, [sectorId, fetchContent, showDrafts]);

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