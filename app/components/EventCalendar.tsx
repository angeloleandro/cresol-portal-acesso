'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

import { FormatDate } from '@/lib/utils/formatters';
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

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  hasEvents: boolean;
  events: EventItem[];
}

export default function EventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);

    try {
      // Buscar eventos do Supabase
      const { data, error } = await supabase
        .from('sector_events')
        .select('*, sectors(name)')
        .eq('is_published', true)
        .order('start_date', { ascending: true });

      if (error) {

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

      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Primeiro dia do mês
    const firstDayOfMonth = new Date(year, month, 1);
    // Último dia do mês
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Dia da semana do primeiro dia (0 = domingo, 1 = segunda, ...)
    let startDay = firstDayOfMonth.getDay();
    // No Brasil, a semana começa no domingo (0)
    startDay = startDay === 0 ? 6 : startDay - 1;
    
    const days: CalendarDay[] = [];
    
    // Adicionar dias do mês anterior para completar a primeira semana
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const eventsOnDay = events.filter(event => {
        const eventDate = new Date(event.start_date);
        return (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        );
      });
      
      days.push({
        date,
        isCurrentMonth: false,
        hasEvents: eventsOnDay.length > 0,
        events: eventsOnDay
      });
    }
    
    // Adicionar dias do mês atual
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i);
      const eventsOnDay = events.filter(event => {
        const eventDate = new Date(event.start_date);
        return (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        );
      });
      
      days.push({
        date,
        isCurrentMonth: true,
        hasEvents: eventsOnDay.length > 0,
        events: eventsOnDay
      });
    }
    
    // Adicionar dias do próximo mês para completar a última semana (até 42 dias no total - 6 semanas)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      const eventsOnDay = events.filter(event => {
        const eventDate = new Date(event.start_date);
        return (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        );
      });
      
      days.push({
        date,
        isCurrentMonth: false,
        hasEvents: eventsOnDay.length > 0,
        events: eventsOnDay
      });
    }
    
    setCalendarDays(days);
    
    // Selecionar o dia atual se estiver no mês atual ou o primeiro dia com eventos
    const today = new Date();
    if (today.getMonth() === month && today.getFullYear() === year) {
      const todayCalendarDay = days.find(day => 
        day.date.getDate() === today.getDate() && 
        day.date.getMonth() === today.getMonth() && 
        day.date.getFullYear() === today.getFullYear()
      );
      
      if (todayCalendarDay) {
        setSelectedDate(todayCalendarDay.date);
        setSelectedDayEvents(todayCalendarDay.events);
      } else {
        // Selecionar o primeiro dia com eventos
        const firstDayWithEvents = days.find(day => day.hasEvents && day.isCurrentMonth);
        if (firstDayWithEvents) {
          setSelectedDate(firstDayWithEvents.date);
          setSelectedDayEvents(firstDayWithEvents.events);
        } else {
          // Caso não haja dias com eventos, selecionar o primeiro dia do mês
          setSelectedDate(firstDayOfMonth);
          setSelectedDayEvents([]);
        }
      }
    } else {
      // Se não estiver no mês atual, selecionar o primeiro dia com eventos
      const firstDayWithEvents = days.find(day => day.hasEvents && day.isCurrentMonth);
      if (firstDayWithEvents) {
        setSelectedDate(firstDayWithEvents.date);
        setSelectedDayEvents(firstDayWithEvents.events);
      } else {
        // Caso não haja dias com eventos, selecionar o primeiro dia do mês
        setSelectedDate(firstDayOfMonth);
        setSelectedDayEvents([]);
      }
    }
  }, [currentDate, events]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (events.length > 0) {
      generateCalendarDays();
    }
  }, [currentDate, events, generateCalendarDays]);

  // Navegar para o mês anterior
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navegar para o próximo mês
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Selecionar um dia do calendário
  const selectDay = (day: CalendarDay) => {
    setSelectedDate(day.date);
    setSelectedDayEvents(day.events);
  };

  // Formatador de data

  // Formatador para período do evento (data início e fim)
  const formatEventPeriod = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate);
    
    // Se não houver data de término ou se for a mesma data, mostra apenas a data de início
    if (!endDate || new Date(endDate).toDateString() === start.toDateString()) {
      return `${FormatDate(startDate)}`;
    }
    
    // Se tiver data de término em dia diferente
    const end = new Date(endDate);
    return `${FormatDate(startDate)} - ${FormatDate(endDate)}`;
  };

  // Função para formatar o nome do mês
  const formatMonth = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
  };

  // Nomes dos dias da semana
  const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded-sm w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded-sm mb-4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x">
        {/* Calendário (3 colunas em telas grandes) */}
        <div className="lg:col-span-3 p-4">
          {/* Cabeçalho do calendário */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary">Calendário de Eventos</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={goToPreviousMonth}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg className="h-5 w-5 text-cresol-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-lg font-medium text-cresol-gray capitalize">{formatMonth(currentDate)}</span>
              <button 
                onClick={goToNextMonth}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg className="h-5 w-5 text-cresol-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Grade do calendário */}
          <div className="calendar-grid">
            {/* Dias da semana */}
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map((day, index) => (
                <div key={index} className="text-center font-medium text-cresol-gray py-2">
                  {day.substring(0, 3)}
                </div>
              ))}
            </div>
            
            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button 
                  key={index}
                  onClick={() => selectDay(day)}
                  className={`
                    relative h-12 sm:h-14 rounded-md flex flex-col items-center justify-center
                    ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                    ${selectedDate && day.date.toDateString() === selectedDate.toDateString() ? 'bg-primary/10 ring-1 ring-primary' : ''}
                    ${day.hasEvents ? 'font-medium' : ''}
                  `}
                >
                  <span>{day.date.getDate()}</span>
                  {day.hasEvents && (
                    <span className={`absolute w-2 h-2 rounded-full bottom-1 ${selectedDate && day.date.toDateString() === selectedDate.toDateString() ? 'bg-primary' : 'bg-primary/70'}`}></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Lista de eventos do dia selecionado (2 colunas em telas grandes) */}
        <div className="lg:col-span-2 p-4">
          {selectedDate && (
            <>
              <h3 className="text-lg font-medium text-primary mb-4">
                Eventos em {new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(selectedDate)}
              </h3>
              
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="h-12 w-12 mx-auto text-cresol-gray opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-cresol-gray">Nenhum evento nesta data</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {selectedDayEvents.map(event => (
                    <Link 
                      key={event.id} 
                      href={`/eventos/${event.id}`}
                      className="block bg-white border border-cresol-gray-light rounded-lg overflow-hidden hover:border-card-hover/60 transition-colors p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          {event.sector_name || 'Evento'}
                        </span>
                        {event.is_featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Destaque
                          </span>
                        )}
                      </div>
                      
                      <h4 className="text-lg font-semibold text-cresol-gray mb-2">{event.title}</h4>
                      
                      <div className="text-sm text-cresol-gray mb-3">
                        <div className="flex items-center mb-1">
                          <svg className="h-4 w-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                      
                      <div className="text-primary text-sm font-medium mt-auto text-right">
                        Ver detalhes →
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}