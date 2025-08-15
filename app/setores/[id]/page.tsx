'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import OptimizedImage from '@/app/components/OptimizedImage';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navbar from '../../components/Navbar';
import SubsectorTeam from '../../components/SubsectorTeam';
import Breadcrumb from '../../components/Breadcrumb';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

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
  const [activeTab, setActiveTab] = useState('news');
  const [showDrafts, setShowDrafts] = useState(true); // Mostrar rascunhos por padrão para admins
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
    // Construir query base
    let query = supabase
      .from('sector_news')
      .select('*')
      .eq('sector_id', sectorId);
    
    // Aplicar filtro de publicação baseado em isAdmin e showDrafts
    if (!isAdmin || !showDrafts) {
      query = query.eq('is_published', true);
    }
    
    // Executar query com ordenação
    const { data, error } = await query
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[SetorDetalhes] Erro ao buscar notícias:', error.message || error);
      return;
    }
    
    setNews(data || []);
  }, [sectorId, isAdmin, showDrafts]);

  const fetchEvents = useCallback(async () => {
    // Construir query base
    let query = supabase
      .from('sector_events')
      .select('*')
      .eq('sector_id', sectorId);
    
    // Aplicar filtro de publicação baseado em isAdmin e showDrafts
    if (!isAdmin || !showDrafts) {
      query = query.eq('is_published', true);
    }
    
    // Executar query com ordenação
    const { data, error } = await query
      .order('start_date', { ascending: true });
    
    if (error) {
      console.error('[SetorDetalhes] Erro ao buscar eventos:', error.message || error);
      return;
    }
    
    setEvents(data || []);
  }, [sectorId, isAdmin, showDrafts]);

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

      await Promise.all([
        fetchSector(),
        fetchSubsectors(),
        fetchNews(),
        fetchEvents()
      ]);
      
      setLoading(false);
    };

    checkUser();
  }, [sectorId, router, fetchSector, fetchSubsectors, fetchNews, fetchEvents]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors mr-4"
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
          </button>
          
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

        <div className="mb-8">          
          <h1 className="text-3xl font-bold text-primary mb-2">{sector.name}</h1>
          <p className="text-cresol-gray mb-6">{sector.description || 'Sem descrição'}</p>
          
          {/* Abas */}
          <div className="border-b border-cresol-gray-light mt-6">
            <nav className="-mb-px flex space-x-8" role="tablist">
              <button
                onClick={() => setActiveTab('news')}
                className={`${
                  activeTab === 'news'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-cresol-gray hover:text-cresol-gray-dark hover:border-cresol-gray-light'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                aria-selected={activeTab === 'news'}
                role="tab"
                aria-controls="news-panel"
                id="news-tab"
              >
                Notícias
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`${
                  activeTab === 'events'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-cresol-gray hover:text-cresol-gray-dark hover:border-cresol-gray-light'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                aria-selected={activeTab === 'events'}
                role="tab"
                aria-controls="events-panel"
                id="events-tab"
              >
                Eventos
              </button>
              <button
                onClick={() => setActiveTab('subsectors')}
                className={`${
                  activeTab === 'subsectors'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-cresol-gray hover:text-cresol-gray-dark hover:border-cresol-gray-light'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                aria-selected={activeTab === 'subsectors'}
                role="tab"
                aria-controls="subsectors-panel"
                id="subsectors-tab"
              >
                Sub-setores ({subsectors.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo da aba de Notícias */}
        {activeTab === 'news' && (
          <div id="news-panel" role="tabpanel" aria-labelledby="news-tab">
            {/* Toggle para mostrar/ocultar rascunhos - apenas para admins */}
            {isAdmin && (
              <div className="mb-4 flex justify-end">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDrafts}
                    onChange={(e) => setShowDrafts(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-cresol-gray">
                    Mostrar rascunhos
                  </span>
                  <span className="ml-2 text-xs text-cresol-gray-light">
                    ({news.filter(n => !n.is_published).length} rascunhos)
                  </span>
                </label>
              </div>
            )}
            
            {news.length === 0 ? (
              <div className="bg-white rounded-lg  border border-cresol-gray-light p-8 text-center">
                <p className="text-cresol-gray">
                  {isAdmin && showDrafts 
                    ? 'Nenhuma notícia cadastrada para este setor.'
                    : 'Nenhuma notícia publicada para este setor.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {news.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-lg  border border-cresol-gray-light overflow-hidden max-w-4xl mx-auto"
                  >
                    {item.image_url && (
                      <div className="relative w-full h-64">
                        <OptimizedImage
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="border-b border-cresol-gray-light object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-cresol-gray">
                          {formatDate(item.created_at)}
                        </span>
                        <div className="flex gap-2">
                          {!item.is_published && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-yellow-100 text-yellow-800">
                              Rascunho
                            </span>
                          )}
                          {item.is_featured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-primary/10 text-primary">
                              Destaque
                            </span>
                          )}
                        </div>
                      </div>
                      <h2 className="text-xl font-semibold text-cresol-gray mb-2">{item.title}</h2>
                      <p className="text-cresol-gray mb-4">{item.summary}</p>
                      
                      {item.content && (
                        <div className="mt-4 pt-4 border-t border-cresol-gray-light">
                          <div className="prose prose-sm max-w-none prose-headings:text-cresol-gray prose-p:text-cresol-gray">
                            <p>{item.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conteúdo da aba de Eventos */}
        {activeTab === 'events' && (
          <div id="events-panel" role="tabpanel" aria-labelledby="events-tab">
            {/* Toggle para mostrar/ocultar rascunhos - apenas para admins */}
            {isAdmin && (
              <div className="mb-4 flex justify-end">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDrafts}
                    onChange={(e) => setShowDrafts(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-cresol-gray">
                    Mostrar rascunhos
                  </span>
                  <span className="ml-2 text-xs text-cresol-gray-light">
                    ({events.filter(e => !e.is_published).length} rascunhos)
                  </span>
                </label>
              </div>
            )}
            
            {events.length === 0 ? (
              <div className="bg-white rounded-lg  border border-cresol-gray-light p-8 text-center">
                <p className="text-cresol-gray">
                  {isAdmin && showDrafts 
                    ? 'Nenhum evento cadastrado para este setor.'
                    : 'Nenhum evento publicado para este setor.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {events.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white rounded-lg  border border-cresol-gray-light p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <h2 className="text-xl font-semibold text-cresol-gray">{item.title}</h2>
                      <div className="flex gap-2 mt-2 md:mt-0">
                        {!item.is_published && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-yellow-100 text-yellow-800">
                            Rascunho
                          </span>
                        )}
                        {item.is_featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-primary/10 text-primary">
                            Destaque
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center mb-4 text-sm text-cresol-gray">
                      <div className="flex items-center mb-2 md:mb-0 md:mr-6">
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(item.start_date)}</span>
                      </div>
                      
                      {item.end_date && (
                        <div className="flex items-center mb-2 md:mb-0 md:mr-6">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Até {formatDate(item.end_date)}</span>
                        </div>
                      )}
                      
                      {item.location && (
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-cresol-gray">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conteúdo da aba de Sub-setores */}
        {activeTab === 'subsectors' && (
          <div id="subsectors-panel" role="tabpanel" aria-labelledby="subsectors-tab">
            {subsectors.length === 0 ? (
              <div className="bg-white rounded-lg  border border-cresol-gray-light p-8 text-center">
                <p className="text-cresol-gray">Nenhum sub-setor cadastrado para este setor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {subsectors.map((subsector) => (
                  <Link 
                    href={`/subsetores/${subsector.id}`} 
                    key={subsector.id}
                    className="block group"
                    aria-label={`Acessar sub-setor ${subsector.name}`}
                  >
                    <div 
                      className="bg-white rounded-lg border-2 border-cresol-gray-light overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-cresol-primary/10 hover:border-cresol-primary hover:-translate-y-1 cursor-pointer"
                    >
                      <div className="p-6 border-b border-cresol-gray-light">
                        <h3 className="text-xl font-semibold text-cresol-gray-dark mb-2 group-hover:text-cresol-primary transition-colors duration-200">
                          {subsector.name}
                        </h3>
                        {subsector.description && (
                          <p className="text-cresol-gray text-sm">
                            {subsector.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <SubsectorTeam 
                          subsectorId={subsector.id}
                          subsectorName={subsector.name}
                          showFullPage={true}
                          maxMembers={4}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 