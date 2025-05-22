'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_featured: boolean;
  created_at: string;
}

interface EventosDestaqueProps {
  compact?: boolean;
  limit?: number;
}

export default function EventosDestaque({ compact = false, limit = 4 }: EventosDestaqueProps) {
  const [featuredEvents, setFeaturedEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      created_at: '2025-05-20T09:30:00Z',
    },
    {
      id: '2',
      title: 'Workshop de Crédito Rural',
      description: 'Workshop sobre as novas linhas de crédito rural disponíveis e como orientar os associados.',
      location: 'Sala de Treinamento 2',
      start_date: '2025-06-20T09:00:00Z',
      end_date: '2025-06-20T12:00:00Z',
      is_featured: true,
      created_at: '2025-05-19T14:15:00Z',
    },
    {
      id: '3',
      title: 'Encontro de Líderes Regionais',
      description: 'Encontro para discutir estratégias de expansão e alinhamento de objetivos para o próximo semestre.',
      location: 'Centro de Convenções',
      start_date: '2025-07-05T08:30:00Z',
      end_date: '2025-07-05T18:00:00Z',
      is_featured: true,
      created_at: '2025-05-15T11:45:00Z',
    },
    {
      id: '4',
      title: 'Palestra sobre Investimentos',
      description: 'Palestra sobre os produtos de investimento da Cresol e estratégias para orientar os associados.',
      location: 'Auditório Principal',
      start_date: '2025-06-25T15:00:00Z',
      end_date: '2025-06-25T17:00:00Z',
      is_featured: false,
      created_at: '2025-05-12T10:00:00Z',
    },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      
      try {
        console.log('Buscando eventos para o dashboard...');
        
        let eventsData;
        
        // Primeiro, tentar buscar eventos em destaque
        const { data: featuredData, error: featuredError } = await supabase
          .from('sector_events')
          .select('id, title, description, location, start_date, end_date, is_featured, created_at, sector_id')
          .eq('is_published', true)
          .eq('is_featured', true)
          .order('start_date', { ascending: true })
          .limit(limit);
          
        if (featuredError) {
          console.error('Erro ao buscar eventos em destaque:', featuredError);
          throw featuredError;
        }
        
        // Se não encontrou suficientes eventos em destaque, buscar os mais próximos
        if (!featuredData || featuredData.length < limit) {
          console.log(`Encontrados ${featuredData?.length || 0} eventos em destaque. Buscando mais eventos próximos...`);
          
          // Obter data atual para filtrar eventos futuros
          const today = new Date().toISOString();
          
          const numToFetch = limit - (featuredData?.length || 0);
          const { data: upcomingData, error: upcomingError } = await supabase
            .from('sector_events')
            .select('id, title, description, location, start_date, end_date, is_featured, created_at, sector_id')
            .eq('is_published', true)
            .eq('is_featured', false)
            .gte('start_date', today)  // Apenas eventos futuros
            .order('start_date', { ascending: true })
            .limit(numToFetch);
            
          if (upcomingError) {
            console.error('Erro ao buscar eventos próximos:', upcomingError);
            eventsData = featuredData || [];
          } else {
            // Combinar os eventos em destaque com os próximos
            eventsData = [...(featuredData || []), ...(upcomingData || [])];
          }
        } else {
          eventsData = featuredData;
        }
        
        console.log(`Total de eventos encontrados: ${eventsData?.length || 0}`);
        
        // Se tiver dados, use-os, caso contrário caia para os dados de exemplo
        if (eventsData && eventsData.length > 0) {
          setFeaturedEvents(eventsData);
        } else {
          setFeaturedEvents(sampleEvents.slice(0, limit));
        }
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        // Em caso de erro, use os dados de exemplo
        setFeaturedEvents(sampleEvents.slice(0, limit));
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [limit]);

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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded mb-4"></div>
      </div>
    );
  }

  // Se compact=true, mostrar versão compacta
  if (compact) {
    return (
      <>
        {featuredEvents.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-cresol-gray">Nenhum evento programado disponível</p>
          </div>
        ) : (
          <div>
            {featuredEvents.map((event, index) => (
              <Link 
                key={event.id} 
                href={`/eventos/${event.id}`}
                className={`block py-3 ${index > 0 ? 'border-t border-cresol-gray-light/30' : ''}`}
              >
                <div className="flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-cresol-gray">{event.title}</h3>
                    {event.is_featured && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Destaque
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-cresol-gray mb-1">
                    <svg className="h-3 w-3 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatEventPeriod(event.start_date, event.end_date)}</span>
                  </div>
                  
                  <div className="flex items-center text-xs text-cresol-gray">
                    <svg className="h-3 w-3 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </>
    );
  }

  // Versão normal (não compacta)
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-primary">Próximos Eventos</h2>
        <Link 
          href="/eventos" 
          className="text-sm text-primary hover:underline flex items-center"
        >
          Ver todos
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      {featuredEvents.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-cresol-gray">Nenhum evento programado disponível</p>
        </div>
      ) : (
        <div className="space-y-4">
          {featuredEvents.map((event) => (
            <Link 
              key={event.id} 
              href={`/eventos/${event.id}`}
              className="block bg-white border border-cresol-gray-light rounded-lg overflow-hidden hover:shadow-md transition-shadow p-4"
            >
              <div className="flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Evento
                  </span>
                  {event.is_featured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Destaque
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-cresol-gray mb-2">{event.title}</h3>
                
                <div className="text-sm text-cresol-gray mb-3">
                  <div className="flex items-center mb-1">
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
                
                <p className="text-cresol-gray mb-4 line-clamp-2">{event.description}</p>
                
                <div className="text-primary text-sm font-medium mt-auto">
                  Ver detalhes →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 