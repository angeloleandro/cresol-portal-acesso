'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navbar from '../../components/Navbar';
import SubsectorTeam from '../../components/SubsectorTeam';
import SectorTeam from '../../components/SectorTeam';
import { Icon } from '../../components/icons';
import Breadcrumb from '../../components/Breadcrumb';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import Button from '@/app/components/ui/Button';

interface Sector {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Subsector {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface SectorNews {
  id: string;
  sector_id: string;
  title: string;
  summary: string;
  content: string;
  image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface SectorEvent {
  id: string;
  sector_id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface SectorMessage {
  id: string;
  sector_id: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function SetorDetalhesPage() {
  const router = useRouter();
  const params = useParams();
  const sectorId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState<Sector | null>(null);
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [news, setNews] = useState<SectorNews[]>([]);
  const [events, setEvents] = useState<SectorEvent[]>([]);
  const [messages, setMessages] = useState<SectorMessage[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchSector = useCallback(async () => {
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .eq('id', sectorId)
      .single();
    
    if (error) {
      console.error('[SetorDetalhes] Erro ao buscar setor:', error.message || error);
      router.replace('/setores');
      return;
    }
    
    setSector(data);
  }, [sectorId, router]);

  const fetchSubsectors = useCallback(async () => {
    const { data, error } = await supabase
      .from('subsectors')
      .select('*')
      .eq('sector_id', sectorId)
      .order('name');
    
    if (error) {
      console.error('[SetorDetalhes] Erro ao buscar sub-setores:', error.message || error);
      return;
    }
    
    setSubsectors(data || []);
  }, [sectorId]);

  const fetchNews = useCallback(async () => {
    // SEMPRE filtrar apenas conteúdo publicado em páginas públicas
    const { data, error } = await supabase
      .from('sector_news')
      .select('*')
      .eq('sector_id', sectorId)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (error) {
      console.error('[SetorDetalhes] Erro ao buscar notícias:', error.message || error);
      return;
    }
    
    setNews(data || []);
  }, [sectorId]);

  const fetchEvents = useCallback(async () => {
    // SEMPRE filtrar apenas conteúdo publicado em páginas públicas
    const { data, error } = await supabase
      .from('sector_events')
      .select('*')
      .eq('sector_id', sectorId)
      .eq('is_published', true)
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(3);
    
    if (error) {
      console.error('[SetorDetalhes] Erro ao buscar eventos:', error.message || error);
      return;
    }
    
    setEvents(data || []);
  }, [sectorId]);

  const fetchMessages = useCallback(async () => {
    // SEMPRE filtrar apenas conteúdo publicado em páginas públicas
    const { data, error } = await supabase
      .from('sector_messages')
      .select('*')
      .eq('sector_id', sectorId)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (error) {
      console.error('[SetorDetalhes] Erro ao buscar mensagens:', error.message || error);
      return;
    }
    
    setMessages(data || []);
  }, [sectorId]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        router.replace('/login');
        return;
      }

      setUser(userData.user);
      
      // Verificar se o usuário é admin
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();
      
      const userIsAdmin = profileData?.role === 'admin' || profileData?.role === 'sector_admin';
      setIsAdmin(userIsAdmin);
      
      // Página pública sempre mostra apenas conteúdo publicado

      await Promise.all([
        fetchSector(),
        fetchSubsectors(),
        fetchNews(),
        fetchEvents(),
        fetchMessages()
      ]);
      
      setLoading(false);
    };

    checkUser();
  }, [sectorId, router, fetchSector, fetchSubsectors, fetchNews, fetchEvents, fetchMessages]);


  if (loading) {
    return <UnifiedLoadingSpinner fullScreen message={LOADING_MESSAGES.sectors} size="large" />;
  }

  if (!sector) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Setor não encontrado.</p>
          <Link href="/setores" className="mt-4 text-primary hover:underline block">
            Voltar para a lista de setores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cresol-gray-light/30">
      <Navbar />
      
      {/* Header do Setor */}
      <header className="bg-white border-b border-cresol-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-cresol-gray-dark">
                {sector.name}
              </h1>
            </div>
          </div>
          
          {sector.description && (
            <p className="text-cresol-gray mt-2">
              {sector.description}
            </p>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center mb-6">
          <Button
            variant="secondary"
            size="xs"
            onClick={() => router.back()}
            className="!p-2"
            title="Voltar"
            aria-label="Voltar à página anterior"
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
          </Button>
          
          <div className="flex-1">
            <Breadcrumb 
              items={[
                { label: 'Home', href: '/home', icon: 'house' },
                { label: 'Setores', href: '/setores' },
                { label: sector.name }
              ]} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            
            {/* Notícias Recentes */}
            <section 
              className="bg-white rounded-md border border-cresol-gray-light"
              aria-labelledby="recent-news-heading"
            >
              <div className="p-6 border-b border-cresol-gray-light">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Icon name="list" className="h-5 w-5 text-primary mr-2" aria-hidden="true" />
                    <h2 id="recent-news-heading" className="text-xl font-semibold text-cresol-gray-dark">
                      Notícias Recentes
                    </h2>
                  </div>
                  {news.length > 0 && (
                    <Link 
                      href={`/setores/${sectorId}/noticias`}
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Ver todas
                    </Link>
                  )}
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
                          {article.is_featured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-primary/10 text-primary ml-2">
                              Destaque
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

            {/* Próximos Eventos */}
            <section 
              className="bg-white rounded-md border border-cresol-gray-light"
              aria-labelledby="upcoming-events-heading"
            >
              <div className="p-6 border-b border-cresol-gray-light">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Icon name="calendar" className="h-5 w-5 text-primary mr-2" aria-hidden="true" />
                    <h2 id="upcoming-events-heading" className="text-xl font-semibold text-cresol-gray-dark">
                      Próximos Eventos
                    </h2>
                  </div>
                  {events.length > 0 && (
                    <Link 
                      href={`/setores/${sectorId}/eventos`}
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Ver todos
                    </Link>
                  )}
                </div>
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
                        <div className="flex items-start justify-between mb-2">
                          <h3 
                            id={`event-title-${index}`}
                            className="font-semibold text-cresol-gray-dark"
                          >
                            {event.title}
                          </h3>
                          {event.is_featured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-primary/10 text-primary ml-2">
                              Destaque
                            </span>
                          )}
                        </div>
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

            {/* Mensagens Recentes */}
            <section 
              className="bg-white rounded-md border border-cresol-gray-light"
              aria-labelledby="recent-messages-heading"
            >
              <div className="p-6 border-b border-cresol-gray-light">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Icon name="message-square" className="h-5 w-5 text-primary mr-2" aria-hidden="true" />
                    <h2 id="recent-messages-heading" className="text-xl font-semibold text-cresol-gray-dark">
                      Mensagens Recentes
                    </h2>
                  </div>
                  {messages.length > 0 && (
                    <Link 
                      href={`/setores/${sectorId}/mensagens`}
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Ver todas
                    </Link>
                  )}
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
                        </div>
                        <p className="text-cresol-gray text-sm mb-2 line-clamp-2">
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
          <aside className="lg:col-span-1 space-y-4 lg:space-y-6" role="complementary" aria-label="Informações adicionais">
            
            {/* Equipe do Setor */}
            <section className="bg-white rounded-lg border border-cresol-gray-light">
              <div className="p-4 border-b border-cresol-gray-light">
                <div className="flex items-center">
                  <Icon name="user-group" className="h-5 w-5 text-primary mr-2" aria-hidden="true" />
                  <h3 className="font-semibold text-cresol-gray-dark">
                    Equipe do Setor
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <SectorTeam 
                  sectorId={sectorId}
                  sectorName={sector?.name || ''}
                  showFullPage={false}
                  maxMembers={6}
                />
              </div>
            </section>

            {/* Sub-setores */}
            {subsectors.length > 0 && (
              <section 
                className="bg-white rounded-lg border border-cresol-gray-light"
                aria-labelledby="subsectors-heading"
              >
                <div className="p-4 border-b border-cresol-gray-light">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon name="building-2" className="h-5 w-5 text-primary mr-2" aria-hidden="true" />
                      <h3 id="subsectors-heading" className="font-semibold text-cresol-gray-dark">
                        Sub-setores ({subsectors.length})
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {subsectors.slice(0, 5).map((subsector) => (
                      <Link 
                        href={`/subsetores/${subsector.id}`} 
                        key={subsector.id}
                        className="block group"
                        aria-label={`Acessar sub-setor ${subsector.name}`}
                      >
                        <div className="flex items-center p-3 border border-cresol-gray-light rounded-lg hover:border-primary transition-colors group">
                          <div className="flex-1">
                            <h4 className="font-medium text-cresol-gray-dark group-hover:text-primary transition-colors text-sm">
                              {subsector.name}
                            </h4>
                            {subsector.description && (
                              <p className="text-xs text-cresol-gray mt-1 line-clamp-2">
                                {subsector.description}
                              </p>
                            )}
                          </div>
                          <Icon 
                            name="chevron-right" 
                            className="h-4 w-4 text-cresol-gray group-hover:text-primary transition-colors ml-2" 
                            aria-hidden="true" 
                          />
                        </div>
                      </Link>
                    ))}
                    {subsectors.length > 5 && (
                      <div className="pt-2 border-t border-cresol-gray-light">
                        <p className="text-xs text-cresol-gray text-center">
                          + {subsectors.length - 5} sub-setores adicionais
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Informações do Setor */}
            <section 
              className="bg-white rounded-lg border border-cresol-gray-light"
              aria-labelledby="sector-info-heading"
            >
              <div className="p-4 border-b border-cresol-gray-light">
                <div className="flex items-center">
                  <Icon name="info" className="h-5 w-5 text-primary mr-2" aria-hidden="true" />
                  <h3 id="sector-info-heading" className="font-semibold text-cresol-gray-dark">
                    Informações do Setor
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="font-medium text-cresol-gray-dark">Total de Sub-setores:</dt>
                    <dd className="text-cresol-gray mt-1">{subsectors.length}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-cresol-gray-dark">Criado em:</dt>
                    <dd className="text-cresol-gray mt-1">
                      <time dateTime={sector.created_at}>
                        {new Date(sector.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </time>
                    </dd>
                  </div>
                  {isAdmin && (
                    <div className="pt-3 border-t border-cresol-gray-light">
                      <Link
                        href={`/admin-setor/setores/${sectorId}`}
                        className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        <Icon name="pencil" className="h-4 w-4 mr-1" aria-hidden="true" />
                        Gerenciar Setor
                      </Link>
                    </div>
                  )}
                </dl>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
} 