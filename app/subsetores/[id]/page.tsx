'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { supabase } from '@/lib/supabase';

import Breadcrumb from '../../components/Breadcrumb';
import { Icon } from '../../components/icons';
import Navbar from '../../components/Navbar';
import SubsectorTeam from '../../components/SubsectorTeam';

interface Subsector {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  sectors: {
    id: string;
    name: string;
    description?: string;
  } | {
    id: string;
    name: string;
    description?: string;
  }[];
}

interface SubsectorNews {
  id: string;
  title: string;
  summary: string;
  created_at: string;
  is_published?: boolean;
}

interface SubsectorEvent {
  id: string;
  title: string;
  description: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_published?: boolean;
}

interface SubsectorMessage {
  id: string;
  title: string;
  content: string;
  created_at: string;
  is_published?: boolean;
}

interface ErrorState {
  hasError: boolean;
  message: string;
}

export default function SubsectorDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const subsectorId = params?.id as string;
  
  const [subsector, setSubsector] = useState<Subsector | null>(null);
  const [news, setNews] = useState<SubsectorNews[]>([]);
  const [events, setEvents] = useState<SubsectorEvent[]>([]);
  const [messages, setMessages] = useState<SubsectorMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '' });
  const [_isAdmin, _setIsAdmin] = useState(false);

  const fetchSubsector = useCallback(async () => {
    const { data, error } = await supabase
      .from('subsectors')
      .select(`
        id,
        name,
        description,
        created_at,
        sectors (
          id,
          name,
          description
        )
      `)
      .eq('id', subsectorId)
      .single();

    if (error) {
      throw new Error(`Falha ao buscar informações do sub-setor: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Sub-setor não encontrado');
    }
    
    setSubsector(data);
  }, [subsectorId]);

  const fetchNews = useCallback(async () => {
    // SEMPRE filtrar apenas conteúdo publicado em páginas públicas
    const { data, error } = await supabase
      .from('subsector_news')
      .select('id, title, summary, created_at, is_published')
      .eq('subsector_id', subsectorId)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      throw new Error(`Falha ao buscar notícias: ${error.message}`);
    }
    
    setNews(data || []);
  }, [subsectorId]);

  const fetchEvents = useCallback(async () => {
    // SEMPRE filtrar apenas conteúdo publicado em páginas públicas
    const { data, error } = await supabase
      .from('subsector_events')
      .select('id, title, description, location, start_date, end_date, is_published')
      .eq('subsector_id', subsectorId)
      .eq('is_published', true)
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(3);

    if (error) {
      throw new Error(`Falha ao buscar eventos: ${error.message}`);
    }
    
    setEvents(data || []);
  }, [subsectorId]);

  const fetchMessages = useCallback(async () => {
    // SEMPRE filtrar apenas conteúdo publicado em páginas públicas
    const { data, error } = await supabase
      .from('subsector_messages')
      .select('id, title, content, created_at, is_published')
      .eq('subsector_id', subsectorId)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      throw new Error(`Falha ao buscar mensagens: ${error.message}`);
    }
    
    setMessages(data || []);
  }, [subsectorId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!subsectorId) return;
      
      try {
        setError({ hasError: false, message: '' });
        
        // Verificar se o usuário é admin
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userData.user.id)
            .single();
          
          const userIsAdmin = profileData?.role === 'admin' || profileData?.role === 'sector_admin';
          _setIsAdmin(userIsAdmin);
          
          // Página pública sempre mostra apenas conteúdo publicado
        }
        
        await Promise.all([
          fetchSubsector(),
          fetchNews(),
          fetchEvents(),
          fetchMessages()
        ]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados';
        setError({ 
          hasError: true, 
          message: `Erro ao carregar dados do sub-setor: ${errorMessage}` 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subsectorId, fetchSubsector, fetchNews, fetchEvents, fetchMessages]);

  const reloadData = () => {
    setLoading(true);
    setError({ hasError: false, message: '' });
    // Recriar a mesma lógica do useEffect
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchSubsector(),
          fetchNews(),
          fetchEvents(),
          fetchMessages()
        ]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados';
        setError({ 
          hasError: true, 
          message: `Erro ao carregar dados do sub-setor: ${errorMessage}` 
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  const getSectorName = (sectors: Subsector['sectors']) => {
    return Array.isArray(sectors) ? sectors[0]?.name || 'Setor não especificado' : sectors?.name || 'Setor não especificado';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cresol-gray-light/30">
        <Navbar />
        <UnifiedLoadingSpinner message={LOADING_MESSAGES.subsectors} size="large" />
      </div>
    );
  }

  if (error.hasError) {
    return (
      <div className="min-h-screen bg-cresol-gray-light/30">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <Icon name="triangle-alert" className="h-12 w-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Erro ao Carregar Sub-setor
              </h2>
              <p className="text-red-700 mb-4">{error.message}</p>
              <div className="space-y-2">
                <button
                  onClick={reloadData}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  aria-label="Tentar carregar novamente"
                >
                  Tentar Novamente
                </button>
                <Link
                  href="/home"
                  className="block w-full text-red-600 hover:text-red-700 underline"
                  aria-label="Voltar para a página inicial"
                >
                  Voltar para Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!subsector) {
    return (
      <div className="min-h-screen bg-cresol-gray-light/30">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <Icon name="triangle-alert" className="h-12 w-12 text-yellow-500 mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                Sub-setor Não Encontrado
              </h2>
              <p className="text-yellow-700 mb-4">
                O sub-setor solicitado não foi encontrado ou não existe.
              </p>
              <Link
                href="/home"
                className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                aria-label="Voltar para a página inicial"
              >
                Voltar para Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cresol-gray-light/30">
      <Navbar />
      
      {/* Header do Sub-setor */}
      <header className="bg-white border-b border-cresol-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-cresol-gray-dark">
                {subsector.name}
              </h1>
              <p className="text-sm text-cresol-gray" aria-label={`Setor: ${getSectorName(subsector.sectors)}`}>
                {getSectorName(subsector.sectors)}
              </p>
            </div>
          </div>
          
          {subsector.description && (
            <p className="text-cresol-gray mt-2" id="subsector-description">
              {subsector.description}
            </p>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors mr-4"
            title="Voltar"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          
          <div className="flex-1">
            <Breadcrumb 
              items={[
                { label: 'Home', href: '/home', icon: 'house' },
                { label: 'Setores', href: '/setores' },
                { label: getSectorName(subsector.sectors), href: `/setores/${Array.isArray(subsector.sectors) ? subsector.sectors[0]?.id : subsector.sectors?.id}` }
              ]} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Notícias Recentes */}
            <section 
              className="bg-white rounded-md  border border-cresol-gray-light"
              aria-labelledby="recent-news-heading"
            >
              <div className="p-6 border-b border-cresol-gray-light">
                <div className="flex justify-between items-center">
                  <h2 id="recent-news-heading" className="text-xl font-semibold text-cresol-gray-dark">
                    Notícias Recentes
                  </h2>
                  
                </div>
              </div>
              <div className="p-6">
                {news.length === 0 ? (
                  <div className="text-center py-8" role="status">
                    <p className="text-cresol-gray">
                      Nenhuma notícia publicada ainda.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4" role="list" aria-label="Lista de notícias recentes">
                    {news.map((article, index) => (
                      <article 
                        key={article.id}
                        className="border-b border-cresol-gray-light last:border-b-0 pb-4 last:pb-0"
                        role="listitem"
                        aria-labelledby={`news-title-${index}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 
                            id={`news-title-${index}`}
                            className="font-semibold text-cresol-gray-dark"
                          >
                            {article.title}
                          </h3>
                          {article.is_published === false && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-yellow-100 text-yellow-800 ml-2">
                              Rascunho
                            </span>
                          )}
                        </div>
                        <p className="text-cresol-gray text-sm mb-2">
                          {article.summary}
                        </p>
                        <div className="flex items-center text-xs text-cresol-gray">
                          <Icon name="clock" className="h-3 w-3 mr-1" aria-hidden="true" />
                          <time dateTime={article.created_at}>
                            {new Date(article.created_at).toLocaleDateString('pt-BR')}
                          </time>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Mensagens Recentes */}
            <section 
              className="bg-white rounded-md border border-cresol-gray-light"
              aria-labelledby="recent-messages-heading"
            >
              <div className="p-6 border-b border-cresol-gray-light">
                <div className="flex justify-between items-center">
                  <h2 id="recent-messages-heading" className="text-xl font-semibold text-cresol-gray-dark">
                    Mensagens Recentes
                  </h2>
                  
                </div>
              </div>
              <div className="p-6">
                {messages.length === 0 ? (
                  <div className="text-center py-8" role="status">
                    <p className="text-cresol-gray">
                      Nenhuma mensagem publicada ainda.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4" role="list" aria-label="Lista de mensagens recentes">
                    {messages.map((message, index) => (
                      <article 
                        key={message.id}
                        className="border-b border-cresol-gray-light last:border-b-0 pb-4 last:pb-0"
                        role="listitem"
                        aria-labelledby={`message-title-${index}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 
                            id={`message-title-${index}`}
                            className="font-semibold text-cresol-gray-dark"
                          >
                            {message.title}
                          </h3>
                          {message.is_published === false && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-yellow-100 text-yellow-800 ml-2">
                              Rascunho
                            </span>
                          )}
                        </div>
                        <p className="text-cresol-gray text-sm mb-2">
                          {message.content}
                        </p>
                        <div className="flex items-center text-xs text-cresol-gray">
                          <Icon name="clock" className="h-3 w-3 mr-1" aria-hidden="true" />
                          <time dateTime={message.created_at}>
                            {new Date(message.created_at).toLocaleDateString('pt-BR')}
                          </time>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6" role="complementary" aria-label="Informações adicionais">
            
            {/* Equipe do Sub-setor */}
            <SubsectorTeam 
              subsectorId={subsector.id}
              subsectorName={subsector.name}
              showFullPage={true}
              maxMembers={6}
            />

            {/* Próximos Eventos */}
            <section 
              className="bg-white rounded-lg border border-cresol-gray-light"
              aria-labelledby="upcoming-events-heading"
            >
              <div className="p-4 border-b border-cresol-gray-light">
                <h3 id="upcoming-events-heading" className="font-semibold text-cresol-gray-dark flex items-center">
                  <Icon name="calendar" className="h-4 w-4 mr-2" aria-hidden="true" />
                  Próximos Eventos
                </h3>
              </div>
              <div className="p-4">
                {events.length === 0 ? (
                  <div className="text-center py-6" role="status">
                    <p className="text-cresol-gray text-sm">
                      Nenhum evento programado.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3" role="list" aria-label="Lista de próximos eventos">
                    {events.map((event, index) => (
                      <article 
                        key={event.id}
                        className="border border-cresol-gray-light rounded-md p-3"
                        role="listitem"
                        aria-labelledby={`event-title-${index}`}
                      >
                        <div className="mb-2">
                          <h4 
                            id={`event-title-${index}`}
                            className="font-medium text-cresol-gray-dark text-sm leading-tight"
                          >
                            {event.title}
                          </h4>
                          {event.is_published === false && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                              Rascunho
                            </span>
                          )}
                        </div>
                        <p className="text-cresol-gray text-xs mb-2 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="space-y-1 text-xs text-cresol-gray">
                          <div className="flex items-center">
                            <Icon name="clock" className="h-3 w-3 mr-1" aria-hidden="true" />
                            <time dateTime={event.start_date}>
                              {new Date(event.start_date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </time>
                          </div>
                          {event.location && (
                            <div className="flex items-center">
                              <Icon name="map" className="h-3 w-3 mr-1" aria-hidden="true" />
                              <span aria-label={`Local: ${event.location}`} className="text-xs truncate">
                                {event.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Informações Adicionais */}
            <section 
              className="bg-white rounded-lg border border-cresol-gray-light p-4"
              aria-labelledby="additional-info-heading"
            >
              <h3 id="additional-info-heading" className="font-semibold text-cresol-gray-dark mb-3">
                Informações
              </h3>
              <dl className="space-y-2 text-sm text-cresol-gray">
                <div>
                  <dt className="font-medium inline">Setor:</dt>
                  <dd className="inline ml-1">{getSectorName(subsector.sectors)}</dd>
                </div>
                <div>
                  <dt className="font-medium inline">Criado em:</dt>
                  <dd className="inline ml-1">
                    <time dateTime={subsector.created_at}>
                      {new Date(subsector.created_at).toLocaleDateString('pt-BR')}
                    </time>
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}