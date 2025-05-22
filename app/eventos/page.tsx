'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import EventCalendar from '../components/EventCalendar';

interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  sector_id: string;
  sector_name?: string;
}

export default function EventosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    // Definir o modo de visualização com base no parâmetro da URL
    const viewParam = searchParams.get('view');
    if (viewParam === 'calendar') {
      setViewMode('calendar');
    }
  }, [searchParams]);

  // Atualizar a URL quando o modo de visualização mudar
  const changeViewMode = (mode: 'list' | 'calendar') => {
    setViewMode(mode);
    
    // Atualizar URL sem recarregar a página
    const params = new URLSearchParams(searchParams.toString());
    if (mode === 'calendar') {
      params.set('view', 'calendar');
    } else {
      params.delete('view');
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
  };

  // Dados de exemplo (remover quando implementar a busca no Supabase)
  const sampleEvents = [
    {
      id: '1',
      title: 'Treinamento de Atendimento ao Associado',
      description: 'Treinamento para aprimorar as habilidades de atendimento e relacionamento com os associados.',
      location: 'Auditório Principal',
      start_date: '2025-06-15T13:00:00Z',
      end_date: '2025-06-15T17:00:00Z',
      is_featured: true,
      is_published: true,
      created_at: '2025-05-20T09:30:00Z',
      sector_id: '1',
      sector_name: 'Recursos Humanos'
    },
    {
      id: '2',
      title: 'Workshop de Crédito Rural',
      description: 'Workshop sobre as novas linhas de crédito rural disponíveis e como orientar os associados.',
      location: 'Sala de Treinamento 2',
      start_date: '2025-06-20T09:00:00Z',
      end_date: '2025-06-20T12:00:00Z',
      is_featured: true,
      is_published: true,
      created_at: '2025-05-19T14:15:00Z',
      sector_id: '2',
      sector_name: 'Crédito Rural'
    },
    {
      id: '3',
      title: 'Encontro de Líderes Regionais',
      description: 'Encontro para discutir estratégias de expansão e alinhamento de objetivos para o próximo semestre.',
      location: 'Centro de Convenções',
      start_date: '2025-07-05T08:30:00Z',
      end_date: '2025-07-05T18:00:00Z',
      is_featured: true,
      is_published: true,
      created_at: '2025-05-15T11:45:00Z',
      sector_id: '3',
      sector_name: 'Diretoria'
    },
    {
      id: '4',
      title: 'Palestra sobre Investimentos',
      description: 'Palestra sobre os produtos de investimento da Cresol e estratégias para orientar os associados.',
      location: 'Auditório Principal',
      start_date: '2025-06-25T15:00:00Z',
      end_date: '2025-06-25T17:00:00Z',
      is_featured: false,
      is_published: true,
      created_at: '2025-05-12T10:00:00Z',
      sector_id: '4',
      sector_name: 'Investimentos'
    },
    {
      id: '5',
      title: 'Seminário de Sustentabilidade',
      description: 'Seminário sobre práticas sustentáveis e iniciativas ESG da Cresol.',
      location: 'Centro de Eventos',
      start_date: '2025-04-10T09:00:00Z',
      end_date: '2025-04-10T18:00:00Z',
      is_featured: false,
      is_published: true,
      created_at: '2025-03-15T11:00:00Z',
      sector_id: '5',
      sector_name: 'Sustentabilidade'
    },
  ];

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }
      setUser(data.user);
      fetchEvents();
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    // Aplicar filtros sempre que events, searchTerm ou filterType mudarem
    applyFilters();
  }, [events, searchTerm, filterType]);

  const fetchEvents = async () => {
    setLoading(true);

    try {
      // Buscar eventos do Supabase
      const { data, error } = await supabase
        .from('sector_events')
        .select('*, sectors(name)')
        .eq('is_published', true)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar eventos:', error);
        // Usar dados de exemplo em caso de erro
        const formattedEvents = sampleEvents.map(event => ({
          ...event
        }));
        setEvents(formattedEvents);
      } else if (data && data.length > 0) {
        // Formatar dados do Supabase
        const formattedEvents = data.map(event => ({
          ...event,
          sector_name: event.sectors?.name
        }));
        setEvents(formattedEvents);
      } else {
        // Usar dados de exemplo se não houver dados no Supabase
        setEvents(sampleEvents);
      }
    } catch (error) {
      console.error('Erro geral:', error);
      setEvents(sampleEvents);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar eventos com base nos critérios
  const applyFilters = () => {
    const now = new Date();
    let filtered = [...events];

    // Filtrar por tipo (todos, próximos, passados)
    if (filterType === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.start_date) >= now);
    } else if (filterType === 'past') {
      filtered = filtered.filter(event => new Date(event.start_date) < now);
    }

    // Filtrar por termo de busca
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        event => 
          event.title.toLowerCase().includes(term) || 
          event.description.toLowerCase().includes(term) ||
          event.location.toLowerCase().includes(term) ||
          (event.sector_name && event.sector_name.toLowerCase().includes(term))
      );
    }

    // Ordenar eventos (próximos em ordem crescente de data, passados em ordem decrescente)
    if (filterType === 'past') {
      filtered.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
    } else {
      filtered.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    }

    setFilteredEvents(filtered);
  };

  // Formatador de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Formatador para período do evento (data início e fim)
  const formatEventPeriod = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate);
    
    // Se não houver data de término ou se for a mesma data, mostra apenas a data de início
    if (!endDate || new Date(endDate).toDateString() === start.toDateString()) {
      return `${formatDate(startDate)}`;
    }
    
    // Se tiver data de término em dia diferente
    const end = new Date(endDate);
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-cresol-gray">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cresol-gray-light/30">
      {/* Header simples com navegação */}
      <header className="bg-white border-b border-cresol-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
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
            </Link>
          </div>
          
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-cresol-gray hover:text-primary"
          >
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Voltar para Dashboard
          </Link>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cresol-gray mb-4">Eventos</h1>
          
          {/* Alternar entre Lista e Calendário */}
          <div className="flex border-b border-cresol-gray-light mb-6">
            <button
              onClick={() => changeViewMode('list')}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                viewMode === 'list' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-cresol-gray hover:text-primary hover:border-primary/30'
              }`}
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Lista
              </div>
            </button>
            <button
              onClick={() => changeViewMode('calendar')}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                viewMode === 'calendar' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-cresol-gray hover:text-primary hover:border-primary/30'
              }`}
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendário
              </div>
            </button>
          </div>
          
          {viewMode === 'list' && (
            <>
              {/* Filtros e Busca */}
              <div className="flex flex-col md:flex-row gap-4 mt-6">
                <div className="flex flex-1 max-w-md">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-cresol-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar eventos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-cresol-gray-light rounded-md leading-5 bg-white text-cresol-gray focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-cresol-gray">Filtrar:</span>
                  <div className="flex border border-cresol-gray-light rounded-md overflow-hidden">
                    <button
                      className={`px-4 py-2 text-sm ${filterType === 'upcoming' ? 'bg-primary text-white' : 'bg-white text-cresol-gray hover:bg-cresol-gray-light/20'}`}
                      onClick={() => setFilterType('upcoming')}
                    >
                      Próximos
                    </button>
                    <button
                      className={`px-4 py-2 text-sm ${filterType === 'past' ? 'bg-primary text-white' : 'bg-white text-cresol-gray hover:bg-cresol-gray-light/20'}`}
                      onClick={() => setFilterType('past')}
                    >
                      Anteriores
                    </button>
                    <button
                      className={`px-4 py-2 text-sm ${filterType === 'all' ? 'bg-primary text-white' : 'bg-white text-cresol-gray hover:bg-cresol-gray-light/20'}`}
                      onClick={() => setFilterType('all')}
                    >
                      Todos
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de eventos */}
              {filteredEvents.length === 0 ? (
                <div className="bg-white shadow-sm rounded-lg p-6 text-center mt-6">
                  <svg className="h-12 w-12 mx-auto text-cresol-gray opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-4 text-cresol-gray">Nenhum evento encontrado para os critérios selecionados.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {filteredEvents.map((event) => (
                    <Link 
                      key={event.id} 
                      href={`/eventos/${event.id}`}
                      className="bg-white rounded-lg shadow-sm border border-cresol-gray-light overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            Evento
                          </span>
                          {event.sector_name && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {event.sector_name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-cresol-gray mb-3">{event.title}</h3>
                        
                        <div className="text-sm text-cresol-gray mb-3">
                          <div className="flex items-center mb-2">
                            <svg className="h-4 w-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatEventPeriod(event.start_date, event.end_date)}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="h-4 w-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{event.location}</span>
                          </div>
                        </div>
                        
                        <p className="text-cresol-gray mb-4 line-clamp-3">{event.description}</p>
                        
                        <div className="text-primary text-sm font-medium">
                          Ver detalhes →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {viewMode === 'calendar' && (
            <div className="mt-6">
              <EventCalendar />
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 