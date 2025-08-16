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
  console.log('🚀🚀🚀 [HOOK] useSectorContent INICIALIZADO 🚀🚀🚀');
  console.log('🚀 [HOOK] sectorId recebido:', sectorId);
  console.log('🚀 [HOOK] Timestamp:', new Date().toISOString());
  
  const [news, setNews] = useState<SectorNews[]>([]);
  const [events, setEvents] = useState<SectorEvent[]>([]);
  const [showDrafts, setShowDrafts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDraftNewsCount, setTotalDraftNewsCount] = useState(0);
  const [totalDraftEventsCount, setTotalDraftEventsCount] = useState(0);
  
  console.log('🚀 [HOOK] Estados iniciais:');
  console.log('  news.length:', news.length);
  console.log('  events.length:', events.length);
  console.log('  showDrafts:', showDrafts);
  console.log('  totalDraftNewsCount:', totalDraftNewsCount);
  console.log('  totalDraftEventsCount:', totalDraftEventsCount);
  console.log('🚀🚀🚀 [HOOK] FIM DA INICIALIZAÇÃO 🚀🚀🚀');

  // Criar client uma vez para evitar warnings de dependência
  const supabase = useMemo(() => createClient(), []);

  // Função unificada para buscar conteúdo
  const fetchContent = useCallback(async (includesDrafts: boolean) => {
    if (!sectorId) {
      console.log('⚠️ sectorId não definido');
      return;
    }

    console.log('\n🗞️🗞️🗞️ [RASCUNHOS] INÍCIO DA BUSCA DE CONTEÚDO 🗞️🗞️🗞️');
    console.log(`🔄 [RASCUNHOS] Parâmetros de busca:`);
    console.log(`  sectorId: ${sectorId}`);
    console.log(`  includesDrafts: ${includesDrafts}`);
    console.log(`  showDrafts atual: ${showDrafts}`);
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('\n📊 [RASCUNHOS] ETAPA 1: CONTANDO RASCUNHOS TOTAIS...');
      
      // Buscar contadores de rascunhos (sempre buscar todos para mostrar o contador)
      const { data: allNews, error: allNewsError } = await supabase
        .from('sector_news')
        .select('is_published')
        .eq('sector_id', sectorId);
      
      if (allNewsError) {
        console.error('❌ [RASCUNHOS] Erro ao buscar todas as notícias:', allNewsError);
      } else {
        console.log(`📰 [RASCUNHOS] Total de registros em sector_news: ${allNews?.length || 0}`);
      }
      
      const { data: allEvents, error: allEventsError } = await supabase
        .from('sector_events')
        .select('is_published')
        .eq('sector_id', sectorId);
      
      if (allEventsError) {
        console.error('❌ [RASCUNHOS] Erro ao buscar todos os eventos:', allEventsError);
      } else {
        console.log(`📅 [RASCUNHOS] Total de registros em sector_events: ${allEvents?.length || 0}`);
      }

      // Contar rascunhos com logs detalhados
      console.log('\n🔢 [RASCUNHOS] ETAPA 2: ANÁLISE DE RASCUNHOS...');
      
      const newsAnalysis = {
        total: allNews?.length || 0,
        published: allNews?.filter(n => n.is_published === true).length || 0,
        drafts: allNews?.filter(n => n.is_published === false).length || 0,
        null_published: allNews?.filter(n => n.is_published === null).length || 0
      };
      
      const eventsAnalysis = {
        total: allEvents?.length || 0,
        published: allEvents?.filter(e => e.is_published === true).length || 0,
        drafts: allEvents?.filter(e => e.is_published === false).length || 0,
        null_published: allEvents?.filter(e => e.is_published === null).length || 0
      };
      
      console.log('📰 [RASCUNHOS] Análise detalhada de NOTÍCIAS:');
      console.log('  Total:', newsAnalysis.total);
      console.log('  Publicadas (is_published = true):', newsAnalysis.published);
      console.log('  Rascunhos (is_published = false):', newsAnalysis.drafts);
      console.log('  is_published = null:', newsAnalysis.null_published);
      
      console.log('📅 [RASCUNHOS] Análise detalhada de EVENTOS:');
      console.log('  Total:', eventsAnalysis.total);
      console.log('  Publicados (is_published = true):', eventsAnalysis.published);
      console.log('  Rascunhos (is_published = false):', eventsAnalysis.drafts);
      console.log('  is_published = null:', eventsAnalysis.null_published);
      
      const draftNewsCount = newsAnalysis.drafts;
      const draftEventsCount = eventsAnalysis.drafts;
      
      console.log(`🎯 [RASCUNHOS] Contadores finais - Notícias: ${draftNewsCount}, Eventos: ${draftEventsCount}`);
      console.log('🎯 [RASCUNHOS] Chamando setTotalDraftNewsCount com:', draftNewsCount);
      console.log('🎯 [RASCUNHOS] Chamando setTotalDraftEventsCount com:', draftEventsCount);
      
      setTotalDraftNewsCount(draftNewsCount);
      setTotalDraftEventsCount(draftEventsCount);

      console.log('\n🔍 [RASCUNHOS] ETAPA 3: BUSCANDO NOTÍCIAS COM FILTRO...');
      
      // Buscar notícias com filtro
      let newsQuery = supabase
        .from('sector_news')
        .select('*')
        .eq('sector_id', sectorId);
      
      console.log(`📰 [RASCUNHOS] Query base para notícias criada`);
      console.log(`📰 [RASCUNHOS] includesDrafts = ${includesDrafts}`);
      
      if (!includesDrafts) {
        console.log('📰 [RASCUNHOS] Aplicando filtro: .eq("is_published", true)');
        newsQuery = newsQuery.eq('is_published', true);
      } else {
        console.log('📰 [RASCUNHOS] SEM filtro de publicação - buscando TODOS (publicados + rascunhos)');
      }
      
      newsQuery = newsQuery.order('created_at', { ascending: false });
      
      console.log('📰 [RASCUNHOS] Executando query de notícias...');
      const { data: newsData, error: newsError } = await newsQuery;
      
      if (newsError) {
        console.error('❌ [RASCUNHOS] Erro ao buscar notícias:', newsError);
        throw newsError;
      }
      
      console.log(`📰 [RASCUNHOS] Resultado da query: ${newsData?.length || 0} notícias retornadas`);
      
      if (newsData && newsData.length > 0) {
        const resultAnalysis = {
          total: newsData.length,
          published: newsData.filter(n => n.is_published === true).length,
          drafts: newsData.filter(n => n.is_published === false).length,
          null_published: newsData.filter(n => n.is_published === null).length
        };
        console.log('📰 [RASCUNHOS] Análise dos resultados retornados:');
        console.log('  Total retornado:', resultAnalysis.total);
        console.log('  Publicadas:', resultAnalysis.published);
        console.log('  Rascunhos:', resultAnalysis.drafts);
        console.log('  is_published = null:', resultAnalysis.null_published);
        
        // Mostrar algumas amostras dos dados
        console.log('📰 [RASCUNHOS] Amostra dos primeiros 3 registros:');
        newsData.slice(0, 3).forEach((news, index) => {
          console.log(`  [${index + 1}] ID: ${news.id}, Title: "${news.title}", is_published: ${news.is_published}`);
        });
      } else {
        console.log('📰 [RASCUNHOS] Nenhuma notícia retornada pela query');
      }

      console.log('\n🔍 [RASCUNHOS] ETAPA 4: BUSCANDO EVENTOS COM FILTRO...');
      
      // Buscar eventos com filtro
      let eventsQuery = supabase
        .from('sector_events')
        .select('*')
        .eq('sector_id', sectorId);
      
      console.log(`📅 [RASCUNHOS] Query base para eventos criada`);
      console.log(`📅 [RASCUNHOS] includesDrafts = ${includesDrafts}`);
      
      if (!includesDrafts) {
        console.log('📅 [RASCUNHOS] Aplicando filtro: .eq("is_published", true)');
        eventsQuery = eventsQuery.eq('is_published', true);
      } else {
        console.log('📅 [RASCUNHOS] SEM filtro de publicação - buscando TODOS (publicados + rascunhos)');
      }
      
      eventsQuery = eventsQuery.order('start_date', { ascending: false });
      
      console.log('📅 [RASCUNHOS] Executando query de eventos...');
      const { data: eventsData, error: eventsError } = await eventsQuery;
      
      if (eventsError) {
        console.error('❌ [RASCUNHOS] Erro ao buscar eventos:', eventsError);
        throw eventsError;
      }
      
      console.log(`📅 [RASCUNHOS] Resultado da query: ${eventsData?.length || 0} eventos retornados`);
      
      if (eventsData && eventsData.length > 0) {
        const resultAnalysis = {
          total: eventsData.length,
          published: eventsData.filter(e => e.is_published === true).length,
          drafts: eventsData.filter(e => e.is_published === false).length,
          null_published: eventsData.filter(e => e.is_published === null).length
        };
        console.log('📅 [RASCUNHOS] Análise dos resultados retornados:');
        console.log('  Total retornado:', resultAnalysis.total);
        console.log('  Publicados:', resultAnalysis.published);
        console.log('  Rascunhos:', resultAnalysis.drafts);
        console.log('  is_published = null:', resultAnalysis.null_published);
        
        // Mostrar algumas amostras dos dados
        console.log('📅 [RASCUNHOS] Amostra dos primeiros 3 registros:');
        eventsData.slice(0, 3).forEach((event, index) => {
          console.log(`  [${index + 1}] ID: ${event.id}, Title: "${event.title}", is_published: ${event.is_published}`);
        });
      } else {
        console.log('📅 [RASCUNHOS] Nenhum evento retornado pela query');
      }

      console.log('\n✅ [RASCUNHOS] ETAPA 5: FINALIZANDO...');
      console.log(`✅ [RASCUNHOS] Conteúdo carregado - Notícias: ${newsData?.length || 0}, Eventos: ${eventsData?.length || 0}`);
      console.log(`✅ [RASCUNHOS] Estado showDrafts será: ${includesDrafts}`);
      
      setNews(newsData || []);
      setEvents(eventsData || []);
      
      console.log('🗞️🗞️🗞️ [RASCUNHOS] FIM DA BUSCA DE CONTEÚDO 🗞️🗞️🗞️\n');
      
    } catch (err: any) {
      console.error('\n💥💥💥 [RASCUNHOS] ERRO CRÍTICO:');
      console.error('  Tipo:', err.constructor?.name || 'Unknown');
      console.error('  Mensagem:', err.message);
      console.error('  Stack:', err.stack);
      console.error('🗞️🗞️🗞️ [RASCUNHOS] FIM COM ERRO 🗞️🗞️🗞️\n');
      
      setError(err.message || 'Erro ao carregar conteúdo');
    } finally {
      setIsLoading(false);
    }
  }, [sectorId, supabase, showDrafts]);

  // Toggle de rascunhos - ÚNICO ponto de controle
  const toggleDrafts = useCallback(async () => {
    const newShowDrafts = !showDrafts;
    
    console.log('\n🔄🔄🔄 [TOGGLE] ALTERNANDO EXIBIÇÃO DE RASCUNHOS 🔄🔄🔄');
    console.log(`🔄 [TOGGLE] Estado atual: showDrafts = ${showDrafts}`);
    console.log(`🔄 [TOGGLE] Novo estado: showDrafts = ${newShowDrafts}`);
    console.log(`🔄 [TOGGLE] Descrição: ${newShowDrafts ? 'MOSTRAR rascunhos' : 'OCULTAR rascunhos'}`);
    
    // Atualizar estado imediatamente para feedback visual
    setShowDrafts(newShowDrafts);
    console.log('✅ [TOGGLE] Estado atualizado no React');
    
    // Buscar conteúdo com novo filtro
    console.log('🔄 [TOGGLE] Chamando fetchContent com includesDrafts =', newShowDrafts);
    await fetchContent(newShowDrafts);
    console.log('🔄🔄🔄 [TOGGLE] FIM DO TOGGLE 🔄🔄🔄\n');
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

  // Carregar inicial - ÚNICO useEffect - SEM fetchContent como dependência para evitar loops
  useEffect(() => {
    console.log('\n🎬🎬🎬 [USEEFFECT] USEEFFECT EXECUTANDO 🎬🎬🎬');
    console.log(`🎬 [USEEFFECT] Timestamp: ${new Date().toISOString()}`);
    console.log(`🎬 [USEEFFECT] sectorId: ${sectorId}`);
    console.log(`🎬 [USEEFFECT] showDrafts: ${showDrafts}`);
    
    let mounted = true;

    const loadContent = async () => {
      console.log('🎬 [USEEFFECT] Entrando em loadContent...');
      console.log(`🎬 [USEEFFECT] Verificações - sectorId: ${!!sectorId}, mounted: ${mounted}`);
      
      if (sectorId && mounted) {
        console.log('\n🚀🚀🚀 [USEEFFECT] CARREGAMENTO INICIAL 🚀🚀🚀');
        console.log(`🚀 [USEEFFECT] sectorId: ${sectorId}`);
        console.log(`🚀 [USEEFFECT] showDrafts inicial: ${showDrafts}`);
        console.log(`🚀 [USEEFFECT] mounted: ${mounted}`);
        console.log('🚀 [USEEFFECT] Chamando fetchContent...');
        
        try {
          await fetchContent(showDrafts);
          console.log('✅ [USEEFFECT] fetchContent executado com sucesso');
        } catch (error) {
          console.error('❌ [USEEFFECT] Erro ao executar fetchContent:', error);
        }
        
        console.log('🚀🚀🚀 [USEEFFECT] FIM DO CARREGAMENTO INICIAL 🚀🚀🚀\n');
      } else {
        console.log('⚠️ [USEEFFECT] Carregamento ignorado:');
        console.log(`  sectorId: ${sectorId} (truthy: ${!!sectorId})`);
        console.log(`  mounted: ${mounted}`);
      }
    };

    loadContent();

    return () => {
      console.log('🎬 [USEEFFECT] Cleanup executado');
      mounted = false;
    };
  }, [sectorId, showDrafts, fetchContent]);

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