'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import EventCalendar from '../components/EventCalendar';
import Navbar from '../components/Navbar';
import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';

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
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'sector'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [sectors, setSectors] = useState<any[]>([]);

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
    // Aplicar filtros sempre que algum filtro mudar
    applyFilters();
  }, [events, searchTerm, filterType, sectorFilter, sortBy, sortOrder, showFeaturedOnly]);

  useEffect(() => {
    fetchSectors();
  }, []);

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

  const fetchSectors = async () => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Erro ao buscar setores:', error);
        return;
      }

      setSectors(data || []);
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
    }
  };

  // Filtrar e ordenar eventos com base nos critérios
  const applyFilters = () => {
    const now = new Date();
    let filtered = [...events];

    // Filtrar por tipo (todos, próximos, passados)
    if (filterType === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.start_date) >= now);
    } else if (filterType === 'past') {
      filtered = filtered.filter(event => new Date(event.start_date) < now);
    }

    // Filtrar por setor
    if (sectorFilter !== 'all') {
      filtered = filtered.filter(event => event.sector_id === sectorFilter);
    }

    // Filtrar por eventos em destaque
    if (showFeaturedOnly) {
      filtered = filtered.filter(event => event.is_featured);
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

    // Ordenar eventos
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'sector':
          comparison = (a.sector_name || '').localeCompare(b.sector_name || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs className="mb-6" />
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
              {/* Barra de Filtros Avançados */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Busca */}
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar eventos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                
                  {/* Filtro por Período */}
                  <div className="flex border border-gray-300 rounded-md overflow-hidden">
                    <button
                      className={`px-4 py-2 text-sm font-medium ${filterType === 'upcoming' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => setFilterType('upcoming')}
                    >
                      Próximos
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium ${filterType === 'past' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => setFilterType('past')}
                    >
                      Anteriores
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium ${filterType === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => setFilterType('all')}
                    >
                      Todos
                    </button>
                  </div>

                  {/* Filtro por Setor */}
                  <select
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Todos os setores</option>
                    {sectors.map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name}
                      </option>
                    ))}
                  </select>

                  {/* Ordenação */}
                  <div className="flex space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="date">Data</option>
                      <option value="title">Título</option>
                      <option value="sector">Setor</option>
                    </select>
                    
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      title={`Ordenar ${sortOrder === 'asc' ? 'decrescente' : 'crescente'}`}
                    >
                      <svg className={`h-4 w-4 text-gray-600 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Segunda linha de filtros */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showFeaturedOnly}
                        onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Apenas eventos em destaque</span>
                    </label>
                    
                    <div className="text-sm text-gray-600">
                      {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterType('upcoming');
                        setSectorFilter('all');
                        setSortBy('date');
                        setSortOrder('asc');
                        setShowFeaturedOnly(false);
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Limpar filtros
                    </button>
                    
                    {filteredEvents.length > 0 && (
                      <button
                        onClick={() => {
                          const csvContent = [
                            ['Título', 'Descrição', 'Local', 'Data Início', 'Data Fim', 'Setor'],
                            ...filteredEvents.map(event => [
                              event.title,
                              event.description,
                              event.location,
                              formatDate(event.start_date),
                              event.end_date ? formatDate(event.end_date) : '',
                              event.sector_name || ''
                            ])
                          ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const link = document.createElement('a');
                          link.href = URL.createObjectURL(blob);
                          link.download = `eventos_${new Date().toISOString().split('T')[0]}.csv`;
                          link.click();
                        }}
                        className="px-3 py-1 text-sm text-white bg-primary hover:bg-primary-dark rounded-md border"
                      >
                        Exportar CSV
                      </button>
                    )}
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
                    <div 
                      key={event.id} 
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            Evento
                          </span>
                            {event.is_featured && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                ⭐ Destaque
                              </span>
                            )}
                          </div>
                          {event.sector_name && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {event.sector_name}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-primary cursor-pointer">
                          <Link href={`/eventos/${event.id}`}>
                            {event.title}
                          </Link>
                        </h3>
                        
                        <div className="text-sm text-gray-600 mb-3 space-y-2">
                          <div className="flex items-center">
                            <svg className="h-4 w-4 mr-2 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatEventPeriod(event.start_date, event.end_date)}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="h-4 w-4 mr-2 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{event.location}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4 text-sm line-clamp-2 leading-relaxed">{event.description}</p>
                        
                        {/* Ações do evento */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <Link 
                            href={`/eventos/${event.id}`}
                            className="text-primary text-sm font-medium hover:text-primary-dark transition-colors"
                          >
                          Ver detalhes →
                          </Link>
                          
                          <div className="flex items-center space-x-2">
                            {/* Botão para adicionar ao calendário */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                const startDate = new Date(event.start_date);
                                const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 60 * 60 * 1000);
                                
                                const formatCalendarDate = (date: Date) => {
                                  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                                };

                                const details = encodeURIComponent(event.description);
                                const location = encodeURIComponent(event.location);
                                const title = encodeURIComponent(event.title);
                                
                                const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}&details=${details}&location=${location}`;
                                
                                window.open(googleCalendarUrl, '_blank');
                              }}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                              title="Adicionar ao Google Calendar"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </button>
                            
                            {/* Botão de compartilhar */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                if (navigator.share) {
                                  navigator.share({
                                    title: event.title,
                                    text: event.description,
                                    url: `${window.location.origin}/eventos/${event.id}`
                                  });
                                } else {
                                  // Fallback para copiar URL
                                  navigator.clipboard.writeText(`${window.location.origin}/eventos/${event.id}`);
                                  // Feedback visual (opcional)
                                  const button = e.currentTarget;
                                  const originalText = button.title;
                                  button.title = 'Link copiado!';
                                  setTimeout(() => {
                                    button.title = originalText;
                                  }, 2000);
                                }
                              }}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                              title="Compartilhar evento"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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
      <Footer />
    </div>
  );
} 