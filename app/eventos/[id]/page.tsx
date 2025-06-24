'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

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

  // Dados de exemplo (remover quando implementar a busca no Supabase)
  const sampleEvents = [
    {
      id: '1',
      title: 'Treinamento de Atendimento ao Associado',
      description: 'Treinamento para aprimorar as habilidades de atendimento e relacionamento com os associados. Durante o treinamento, serão abordados temas como comunicação eficaz, resolução de conflitos, conhecimento dos produtos e serviços, além de técnicas para identificar as necessidades dos associados e oferecer as melhores soluções financeiras. O evento é direcionado a todos os colaboradores que atuam no atendimento direto aos associados nas agências.',
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
      description: 'Workshop sobre as novas linhas de crédito rural disponíveis e como orientar os associados. Serão apresentadas as características principais de cada linha, documentação necessária, prazos e condições especiais. O evento contará com a participação de especialistas da área agrícola que discutirão casos práticos de análise de crédito rural.',
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
      description: 'Encontro para discutir estratégias de expansão e alinhamento de objetivos para o próximo semestre. O evento reunirá líderes de todas as regiões para compartilhar resultados, desafios e oportunidades identificadas em cada localidade. Haverá também workshops sobre liderança e gestão de equipes.',
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
      description: 'Palestra sobre os produtos de investimento da Cresol e estratégias para orientar os associados. Serão apresentadas análises de mercado, comparativos de rentabilidade e perfis de investidores. Ao final, haverá um momento para esclarecimento de dúvidas e networking entre os participantes.',
      location: 'Auditório Principal',
      start_date: '2025-06-25T15:00:00Z',
      end_date: '2025-06-25T17:00:00Z',
      is_featured: false,
      is_published: true,
      created_at: '2025-05-12T10:00:00Z',
      sector_id: '4',
      sector_name: 'Investimentos'
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
          // Tenta encontrar nos dados de exemplo
          const foundEvent = sampleEvents.find(item => item.id === id);
          if (!foundEvent) {
            router.push('/eventos');
            return;
          }
          setEvent(foundEvent);

          // Eventos relacionados dos exemplos (mesmo setor ou mesma categoria)
          const related = sampleEvents
            .filter(item => item.sector_id === foundEvent.sector_id && item.id !== id)
            .slice(0, 3);
          setRelatedEvents(related);
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
            // Usar exemplos se não encontrar relacionados
            const related = sampleEvents
              .filter(item => item.id !== id)
              .slice(0, 3);
            setRelatedEvents(related);
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-cresol-gray">Carregando...</p>
        </div>
      </div>
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
        {/* Cabeçalho do evento */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Evento
            </span>
            {event.sector_name && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
          <div className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-6 mb-8">
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
              <button className="btn-primary flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Adicionar ao calendário
              </button>
              
              <button className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/5 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Compartilhar
              </button>
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
                  className="block bg-white rounded-lg shadow-sm border border-cresol-gray-light overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
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