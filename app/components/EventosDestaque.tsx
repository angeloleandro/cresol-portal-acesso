'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import UnifiedLoadingSpinner from './ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

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
        
        // Se tiver dados, use-os
        if (eventsData && eventsData.length > 0) {
          setFeaturedEvents(eventsData);
        } else {
          setFeaturedEvents([]);
        }
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        setFeaturedEvents([]);
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
      <div className="card">
        <UnifiedLoadingSpinner message={LOADING_MESSAGES.events} />
      </div>
    );
  }

  // Se compact=true, mostrar versão compacta
  if (compact) {
    return (
      <>
        {featuredEvents.length === 0 ? (
          <div className="p-4 text-center">
            <p className="body-text text-muted">Nenhum evento programado disponível</p>
          </div>
        ) : (
          <div>
            {featuredEvents.map((event, index) => (
              <Link 
                key={event.id} 
                href={`/eventos/${event.id}`}
                className={`block py-2.5 ${index > 0 ? 'border-t border-cresol-gray-light/30' : ''}`}
              >
                <div className="flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="body-text-bold text-title">{event.title}</h3>
                    {event.is_featured && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Destaque
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-muted mb-1">
                    <svg className="h-3 w-3 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatEventPeriod(event.start_date, event.end_date)}</span>
                  </div>
                  
                  <div className="flex items-center text-xs text-muted">
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
    <div className="card">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="heading-3 text-title">Próximos Eventos</h2>
          <p className="body-text-small text-muted mt-1">Confira a agenda de atividades</p>
        </div>
        <Link 
          href="/eventos" 
          className="text-sm font-medium transition-colors flex items-center hover:bg-primary/10 px-3 py-1.5 rounded-md text-primary"
        >
          Ver todas
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      {featuredEvents.length === 0 ? (
        <div className="p-8 text-center">
          <p className="body-text text-muted">Nenhum evento programado disponível</p>
        </div>
      ) : (
        <div className="space-y-3">
          {featuredEvents.map((event) => (
            <Link 
              key={event.id} 
              href={`/eventos/${event.id}`}
                              className="block bg-white border border-gray-200/40 hover:border-gray-200/70 rounded-md transition-colors duration-150 p-3"
            >
              <div className="flex flex-col">
                <div className="flex justify-between items-start mb-1.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    Evento
                  </span>
                  {event.is_featured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Destaque
                    </span>
                  )}
                </div>
                
                <h3 className="heading-4 text-title mb-1.5 leading-tight">{event.title}</h3>
                
                <div className="body-text-small text-body mb-2">
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
                
                <p className="body-text-small text-body mb-3 line-clamp-2 leading-snug">{event.description}</p>
                
                <div className="text-sm font-medium mt-auto text-primary">
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