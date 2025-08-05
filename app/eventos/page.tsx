'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import EventCalendar from '../components/EventCalendar';
import Navbar from '../components/Navbar';
import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';
import { Icon } from '../components/icons/Icon';

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

function EventosPageContent() {
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

  const fetchEvents = useCallback(async () => {
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
        setEvents([]);
      } else {
        // Formatar dados do Supabase
        const formattedEvents = (data || []).map((event: any) => ({
          ...event,
          sector_name: event.sectors?.name
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Erro geral:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, [router, fetchEvents]);

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
  const applyFilters = useCallback(() => {
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
  }, [events, searchTerm, filterType, sectorFilter, sortBy, sortOrder, showFeaturedOnly]);

  useEffect(() => {
    // Aplicar filtros sempre que algum filtro mudar
    applyFilters();
  }, [events, searchTerm, filterType, sectorFilter, sortBy, sortOrder, showFeaturedOnly, applyFilters]);

  useEffect(() => {
    fetchSectors();
  }, []);

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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="body-text text-muted">Carregando eventos...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <Breadcrumbs className="mb-6" />
        <div className="card">
          {/* Alternar entre Lista e Calendário */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => changeViewMode('list')}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                viewMode === 'list' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted hover:text-primary hover:border-primary/30'
              }`}
            >
              <div className="flex items-center">
                <Icon name="list" className="h-5 w-5 mr-2" />
                Lista
              </div>
            </button>
            <button
              onClick={() => changeViewMode('calendar')}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                viewMode === 'calendar' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted hover:text-primary hover:border-primary/30'
              }`}
            >
              <div className="flex items-center">
                <Icon name="calendar" className="h-5 w-5 mr-2" />
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
                        <Icon name="search" className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar eventos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input w-full pl-10"
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
                    className="input"
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
                      className="input"
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
                      <Icon name="sort" className={`h-4 w-4 text-gray-600 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
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
                    
                    <div className="body-text-small text-muted">
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
                        className="btn-primary text-sm"
                      >
                        Exportar CSV
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Lista de eventos */}
              {filteredEvents.length === 0 ? (
                <div className="card text-center py-12">
                  <div className="max-w-md mx-auto">
                    <Icon name="calendar" className="mx-auto h-16 w-16 text-muted mb-4" />
                    <h3 className="heading-3 text-title mb-2">Nenhum evento encontrado</h3>
                    <p className="body-text text-muted">Nenhum evento encontrado para os critérios selecionados.</p>
                  </div>
                </div>
              ) : (
                <div className="grid-responsive mt-6">
                  {filteredEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className="card group"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex space-x-2">
                            <span className="badge-success">
                              {event.sector_name || 'Sem setor'}
                            </span>
                            {event.is_featured && (
                              <span className="badge-warning">
                                Em destaque
                              </span>
                            )}
                          </div>
                          
                          <Link
                            href={`/eventos/${event.id}`}
                            className="text-primary hover:text-primary-dark transition-colors"
                          >
                            <Icon name="external-link" className="h-4 w-4" />
                          </Link>
                        </div>
                        
                        <h3 className="heading-4 text-title mb-2 line-clamp-2">{event.title}</h3>
                        
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Icon name="clock" className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                            <span>{formatEventPeriod(event.start_date, event.end_date)}</span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Icon name="map" className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="body-text-small text-muted line-clamp-3 mb-4">
                          {event.description}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            {new Date(event.start_date) > new Date() ? 'Próximo evento' : 'Evento passado'}
                          </div>
                          
                          <Link
                            href={`/eventos/${event.id}`}
                            className="btn-primary text-sm inline-flex items-center gap-2"
                          >
                            Ver detalhes
                            <Icon name="arrow-left" className="h-4 w-4 rotate-180" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {viewMode === 'calendar' && (
            <EventCalendar />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function EventosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="body-text text-muted">Carregando eventos...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <EventosPageContent />
    </Suspense>
  );
} 