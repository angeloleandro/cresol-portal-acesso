'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navbar from '../../components/Navbar';
import SubsectorTeam from '../../components/SubsectorTeam';

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

  const fetchSector = useCallback(async () => {
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .eq('id', sectorId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar setor:', error);
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
      console.error('Erro ao buscar sub-setores:', error);
      return;
    }
    
    setSubsectors(data || []);
  }, [sectorId]);

  const fetchNews = useCallback(async () => {
    const { data, error } = await supabase
      .from('sector_news')
      .select('*')
      .eq('sector_id', sectorId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar notícias:', error);
      return;
    }
    
    setNews(data || []);
  }, [sectorId]);

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from('sector_events')
      .select('*')
      .eq('sector_id', sectorId)
      .eq('is_published', true)
      .order('start_date', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar eventos:', error);
      return;
    }
    
    setEvents(data || []);
  }, [sectorId]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        router.replace('/login');
        return;
      }

      setUser(userData.user);

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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-cresol-gray">Carregando...</p>
        </div>
      </div>
    );
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
        <div className="mb-8">
          <Link 
            href="/setores" 
            className="inline-flex items-center text-sm text-cresol-gray hover:text-primary mb-4"
          >
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para Setores
          </Link>
          
          <h1 className="text-3xl font-bold text-primary mb-2">{sector.name}</h1>
          <p className="text-cresol-gray mb-6">{sector.description || 'Sem descrição'}</p>
          
          {/* Abas */}
          <div className="border-b border-cresol-gray-light mt-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('news')}
                className={`${
                  activeTab === 'news'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-cresol-gray hover:text-cresol-gray-dark hover:border-cresol-gray-light'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
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
              >
                Sub-setores ({subsectors.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo da aba de Notícias */}
        {activeTab === 'news' && (
          <div>
            {news.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-8 text-center">
                <p className="text-cresol-gray">Nenhuma notícia publicada para este setor.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {news.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-lg shadow-sm border border-cresol-gray-light overflow-hidden max-w-4xl mx-auto"
                  >
                    {item.image_url && (
                      <div className="relative w-full h-64">
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="border-b border-cresol-gray-light"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-cresol-gray">
                          {formatDate(item.created_at)}
                        </span>
                        {item.is_featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            Destaque
                          </span>
                        )}
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
          <div>
            {events.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-8 text-center">
                <p className="text-cresol-gray">Nenhum evento publicado para este setor.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {events.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <h2 className="text-xl font-semibold text-cresol-gray">{item.title}</h2>
                      {item.is_featured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-2 md:mt-0">
                          Destaque
                        </span>
                      )}
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
          <div>
            {subsectors.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-8 text-center">
                <p className="text-cresol-gray">Nenhum sub-setor cadastrado para este setor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {subsectors.map((subsector) => (
                  <div 
                    key={subsector.id}
                    className="bg-white rounded-lg shadow-sm border border-cresol-gray-light overflow-hidden"
                  >
                    <div className="p-6 border-b border-cresol-gray-light">
                      <h3 className="text-xl font-semibold text-cresol-gray-dark mb-2">
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
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 