'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user';
  full_name: string;
  email: string;
}

interface Subsector {
  id: string;
  name: string;
  description?: string;
  sector_id: string;
  sector_name?: string;
}

interface SubsectorEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  is_published: boolean;
  is_featured: boolean;
}

interface SubsectorNews {
  id: string;
  title: string;
  summary: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
}

interface System {
  id: string;
  name: string;
  description?: string;
  url: string;
  icon?: string;
}

export default function SubsectorManagePage() {
  const router = useRouter();
  const params = useParams();
  const subsectorId = params?.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [subsector, setSubsector] = useState<Subsector | null>(null);
  const [events, setEvents] = useState<SubsectorEvent[]>([]);
  const [news, setNews] = useState<SubsectorNews[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'news' | 'systems'>('events');

  // Estados para criação de novos itens
  const [showEventForm, setShowEventForm] = useState(false);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showSystemForm, setShowSystemForm] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }

      await fetchProfile(data.user.id);
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    if (profile && subsectorId) {
      fetchSubsectorData();
    }
  }, [profile, subsectorId]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, full_name, email')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        
        // Verificar se o usuário tem permissão para acessar esta página
        if (data.role !== 'subsector_admin' && data.role !== 'admin' && data.role !== 'sector_admin') {
          router.replace('/home');
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      setError('Erro ao carregar perfil do usuário');
    }
  };

  const fetchSubsectorData = async () => {
    try {
      // Buscar dados do sub-setor
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
        // O sectors pode vir como array ou objeto dependendo da query
        const sectorName = (subsectorData as any).sectors?.name || 
                          ((subsectorData as any).sectors && Array.isArray((subsectorData as any).sectors) 
                            ? (subsectorData as any).sectors[0]?.name 
                            : undefined);
                            
        setSubsector({
          ...subsectorData,
          sector_name: sectorName
        });
      }

      // Buscar eventos
      await fetchEvents();
      
      // Buscar notícias
      await fetchNews();
      
      // Buscar sistemas
      await fetchSystems();

    } catch (error) {
      console.error('Erro ao buscar dados do sub-setor:', error);
      setError('Erro ao carregar dados do sub-setor');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('subsector_events')
        .select('id, title, description, start_date, is_published, is_featured')
        .eq('subsector_id', subsectorId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    }
  };

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('subsector_news')
        .select('id, title, summary, is_published, is_featured, created_at')
        .eq('subsector_id', subsectorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    }
  };

  const fetchSystems = async () => {
    try {
      const { data, error } = await supabase
        .from('systems')
        .select('id, name, description, url, icon')
        .eq('subsector_id', subsectorId)
        .order('name');

      if (error) throw error;
      setSystems(data || []);
    } catch (error) {
      console.error('Erro ao buscar sistemas:', error);
    }
  };

  const toggleEventPublished = async (eventId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('subsector_events')
        .update({ is_published: !currentStatus })
        .eq('id', eventId);

      if (error) throw error;
      await fetchEvents();
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
    }
  };

  const toggleNewsPublished = async (newsId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('subsector_news')
        .update({ is_published: !currentStatus })
        .eq('id', newsId);

      if (error) throw error;
      await fetchNews();
    } catch (error) {
      console.error('Erro ao atualizar notícia:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-cresol-gray">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !subsector) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Sub-setor não encontrado'}</p>
          <button
            onClick={() => router.push('/admin-subsetor')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Voltar para Admin Sub-setores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-cresol-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center"
              type="button"
            >
              <div className="relative h-10 w-24 mr-3">
                <Image 
                  src="/logo-cresol.png" 
                  alt="Logo Cresol" 
                  fill
                  sizes="(max-width: 768px) 100vw, 96px"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <h1 className="text-xl font-semibold text-cresol-gray">Portal Cresol</h1>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin-subsetor')}
              className="inline-flex items-center text-sm text-cresol-gray hover:text-primary"
              type="button"
            >
              <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar para Admin Sub-setores
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho do sub-setor */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-primary">{subsector.name}</h2>
              <p className="text-cresol-gray mt-1">
                Setor: {subsector.sector_name}
              </p>
              {subsector.description && (
                <p className="text-cresol-gray mt-2">{subsector.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs de navegação */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('events')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Eventos ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'news'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notícias ({news.length})
            </button>
            <button
              onClick={() => setActiveTab('systems')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'systems'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sistemas ({systems.length})
            </button>
          </nav>
        </div>

        {/* Conteúdo das tabs */}
        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-cresol-gray">Eventos do Sub-setor</h3>
              <button
                onClick={() => setShowEventForm(true)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Novo Evento
              </button>
            </div>

            {events.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-6xl text-gray-300 mb-4">📅</div>
                <h4 className="text-lg font-semibold text-cresol-gray mb-2">
                  Nenhum evento encontrado
                </h4>
                <p className="text-cresol-gray">
                  Crie o primeiro evento para este sub-setor.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {events.map((event) => (
                        <tr key={event.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {event.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {event.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(event.start_date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              event.is_published 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {event.is_published ? 'Publicado' : 'Rascunho'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => toggleEventPublished(event.id, event.is_published)}
                              className={`px-3 py-1 rounded text-xs ${
                                event.is_published
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              {event.is_published ? 'Despublicar' : 'Publicar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'news' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-cresol-gray">Notícias do Sub-setor</h3>
              <button
                onClick={() => setShowNewsForm(true)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Nova Notícia
              </button>
            </div>

            {news.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-6xl text-gray-300 mb-4">📰</div>
                <h4 className="text-lg font-semibold text-cresol-gray mb-2">
                  Nenhuma notícia encontrada
                </h4>
                <p className="text-cresol-gray">
                  Crie a primeira notícia para este sub-setor.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {news.map((newsItem) => (
                        <tr key={newsItem.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {newsItem.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {newsItem.summary}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(newsItem.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              newsItem.is_published 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {newsItem.is_published ? 'Publicado' : 'Rascunho'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => toggleNewsPublished(newsItem.id, newsItem.is_published)}
                              className={`px-3 py-1 rounded text-xs ${
                                newsItem.is_published
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              {newsItem.is_published ? 'Despublicar' : 'Publicar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'systems' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-cresol-gray">Sistemas do Sub-setor</h3>
              <button
                onClick={() => setShowSystemForm(true)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Novo Sistema
              </button>
            </div>

            {systems.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-6xl text-gray-300 mb-4">🖥️</div>
                <h4 className="text-lg font-semibold text-cresol-gray mb-2">
                  Nenhum sistema encontrado
                </h4>
                <p className="text-cresol-gray">
                  Adicione o primeiro sistema para este sub-setor.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systems.map((system) => (
                  <div key={system.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-cresol-gray">
                        {system.name}
                      </h4>
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {system.icon ? (
                          <Image
                            src={system.icon}
                            alt={system.name}
                            width={24}
                            height={24}
                          />
                        ) : (
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    {system.description && (
                      <p className="text-sm text-gray-600 mb-4">{system.description}</p>
                    )}

                    <a
                      href={system.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-sm"
                    >
                      Acessar Sistema
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 