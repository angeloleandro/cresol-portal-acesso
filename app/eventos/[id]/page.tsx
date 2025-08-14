'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import OptimizedImage from '@/app/components/OptimizedImage';
import { StandardizedButton } from '@/app/components/admin';
import { supabase } from '@/lib/supabase';
import Breadcrumb from '../../components/Breadcrumb';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

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

export default function EventoDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedEvents, setRelatedEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }
      setUser(data.user);

      try {
        // Buscar evento específico do Supabase
        const { data: eventData, error } = await supabase
          .from('sector_events')
          .select('*, sectors(name)')
          .eq('id', id)
          .eq('is_published', true)
          .single();
          
        if (error) {
          console.error('Erro ao buscar evento:', error);
          router.push('/eventos');
          return;
        } else {
          // Adicionar campos necessários
          const formattedEvent = {
            ...eventData,
            sector_name: eventData.sectors?.name
          };
          setEvent(formattedEvent);

          // Buscar eventos relacionados do mesmo setor
          const { data: relatedData, error: relatedError } = await supabase
            .from('sector_events')
            .select('*, sectors(name)')
            .eq('sector_id', eventData.sector_id)
            .eq('is_published', true)
            .neq('id', id)
            .order('start_date', { ascending: true })
            .limit(3);
            
          if (relatedError || !relatedData || relatedData.length === 0) {
            // Não há eventos relacionados disponíveis
            setRelatedEvents([]);
          } else {
            // Formatar eventos relacionados
            const formattedRelated = relatedData.map(item => ({
              ...item,
              sector_name: item.sectors?.name
            }));
            setRelatedEvents(formattedRelated);
          }
        }
      } catch (error) {
        console.error('Erro geral:', error);
        router.push('/eventos');
        return;
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router, id]);

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
      <UnifiedLoadingSpinner 
        fullScreen={true}
        size="large" 
        message={LOADING_MESSAGES.events} 
      />
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-cresol-gray text-xl">Evento não encontrado</p>
          <Link href="/eventos" className="mt-4 inline-block text-primary hover:underline">
            Voltar para todos os eventos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cresol-gray-light/30">
      {/* Header simples com botão de voltar */}
      <header className="bg-white border-b border-cresol-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
                          <Link href="/home" className="flex items-center">
              <div className="relative h-10 w-24 mr-3">
                <OptimizedImage 
                  src="/logo-horizontal-laranja.svg" 
                  alt="Logo Cresol" 
                  fill
                  sizes="(max-width: 768px) 100vw, 96px"
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl font-semibold text-cresol-gray">Portal Cresol</h1>
            </Link>
          </div>
          
          <Link 
            href="/eventos" 
            className="inline-flex items-center text-sm text-cresol-gray hover:text-primary"
          >
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para Eventos
          </Link>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Eventos', href: '/eventos' },
              { label: event.title }
            ]} 
          />
        </div>

        {/* Cabeçalho do evento */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              Evento
            </span>
            {event.sector_name && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200/60">
                {event.sector_name}
              </span>
            )}
            {event.is_featured && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Destaque
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-cresol-gray mb-4">{event.title}</h1>
          
          {/* Informações do evento */}
          <div className="bg-white rounded-lg border border-cresol-gray-light p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Data e Local */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-primary mb-2">Data e Horário</h3>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 mr-2 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-cresol-gray">{formatEventPeriod(event.start_date, event.end_date)}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-primary mb-2">Local</h3>
                  <div className="flex items-start">
                    <svg className="h-5 w-5 mr-2 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-cresol-gray">{event.location}</span>
                  </div>
                </div>
              </div>
              
              {/* Descrição */}
              <div>
                <h3 className="text-lg font-medium text-primary mb-2">Descrição</h3>
                <p className="text-cresol-gray whitespace-pre-line">{event.description}</p>
              </div>
            </div>
            
            {/* Botões de ação - poderiam ser adicionados aqui (inscrever-se, adicionar ao calendário, etc.) */}
            <div className="mt-8 flex flex-wrap gap-3">
              <StandardizedButton 
                variant="primary"
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                iconPosition="left"
              >
                Adicionar ao calendário
              </StandardizedButton>
              
              <StandardizedButton 
                variant="outline"
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                }
                iconPosition="left"
              >
                Compartilhar
              </StandardizedButton>
            </div>
          </div>
        </div>

        {/* Eventos relacionados */}
        {relatedEvents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary mb-4">Eventos relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedEvents.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/eventos/${item.id}`}
                  className="block bg-white rounded-lg border border-cresol-gray-light overflow-hidden hover:border-primary/30 transition-colors"
                >
                  <div className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-2">
                      Evento
                    </span>
                    <h3 className="text-base font-semibold text-cresol-gray mb-2 line-clamp-2">{item.title}</h3>
                    
                    <div className="text-sm text-cresol-gray mb-3">
                      <div className="flex items-center mb-1">
                        <svg className="h-4 w-4 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatEventPeriod(item.start_date, item.end_date)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{item.location}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-cresol-gray mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex justify-end items-center text-xs">
                      <span className="text-primary font-medium">
                        Ver detalhes →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 