'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import OptimizedImage from '@/app/components/OptimizedImage';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navbar from '../../components/Navbar';
import SubsectorTeam from '../../components/SubsectorTeam';
import { Icon } from '../../components/icons';
import Breadcrumb from '../../components/Breadcrumb';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

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
}

interface SubsectorEvent {
  id: string;
  title: string;
  description: string;
  location?: string;
  start_date: string;
  end_date?: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '' });

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
    const { data, error } = await supabase
      .from('subsector_news')
      .select('id, title, summary, created_at')
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
    const { data, error } = await supabase
      .from('subsector_events')
      .select('id, title, description, location, start_date, end_date')
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

  useEffect(() => {
    const fetchData = async () => {
      if (!subsectorId) return;
      
      try {
        setError({ hasError: false, message: '' });
        await Promise.all([
          fetchSubsector(),
          fetchNews(),
          fetchEvents()
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
  }, [subsectorId, fetchSubsector, fetchNews, fetchEvents]);

  const reloadData = () => {
    setLoading(true);
    setError({ hasError: false, message: '' });
    // Recriar a mesma lógica do useEffect
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchSubsector(),
          fetchNews(),
          fetchEvents()
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
            <div className="bg-primary/5 rounded-lg p-4" role="region" aria-labelledby="subsector-description">
              <div className="flex items-start">
                <Icon name="building-2" className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <p className="text-cresol-gray" id="subsector-description">
                  {subsector.description}
                </p>
              </div>
            </div>
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
                { label: getSectorName(subsector.sectors), href: `/setores/${Array.isArray(subsector.sectors) ? subsector.sectors[0]?.id : subsector.sectors?.id}` },
                { label: subsector.name }
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
                <h2 id="recent-news-heading" className="text-xl font-semibold text-cresol-gray-dark">
                  Notícias Recentes
                </h2>
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
                        <h3 
                          id={`news-title-${index}`}
                          className="font-semibold text-cresol-gray-dark mb-2"
                        >
                          {article.title}
                        </h3>
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

            {/* Próximos Eventos */}
            <section 
              className="bg-white rounded-md  border border-cresol-gray-light"
              aria-labelledby="upcoming-events-heading"
            >
              <div className="p-6 border-b border-cresol-gray-light">
                <h2 id="upcoming-events-heading" className="text-xl font-semibold text-cresol-gray-dark">
                  Próximos Eventos
                </h2>
              </div>
              <div className="p-6">
                {events.length === 0 ? (
                  <div className="text-center py-8" role="status">
                    <p className="text-cresol-gray">
                      Nenhum evento programado.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4" role="list" aria-label="Lista de próximos eventos">
                    {events.map((event, index) => (
                      <article 
                        key={event.id}
                        className="border border-cresol-gray-light rounded-lg p-4"
                        role="listitem"
                        aria-labelledby={`event-title-${index}`}
                      >
                        <h3 
                          id={`event-title-${index}`}
                          className="font-semibold text-cresol-gray-dark mb-2"
                        >
                          {event.title}
                        </h3>
                        <p className="text-cresol-gray text-sm mb-3">
                          {event.description}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-cresol-gray">
                          <div className="flex items-center">
                            <Icon name="clock" className="h-3 w-3 mr-1" aria-hidden="true" />
                            <time dateTime={event.start_date}>
                              {new Date(event.start_date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </time>
                          </div>
                          {event.location && (
                            <div className="flex items-center">
                              <Icon name="map" className="h-3 w-3 mr-1" aria-hidden="true" />
                              <span aria-label={`Local: ${event.location}`}>
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