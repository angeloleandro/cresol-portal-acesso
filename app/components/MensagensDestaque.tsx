'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import UnifiedLoadingSpinner from './ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

interface MessageItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  sector_id?: string;
  subsector_id?: string;
  sector_name?: string;
  subsector_name?: string;
}

interface MensagensDestaqueProps {
  compact?: boolean;
  limit?: number;
}

export default function MensagensDestaque({ compact = false, limit = 4 }: MensagensDestaqueProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      
      try {
        // Buscar mensagens de setores
        const { data: sectorMessages, error: sectorError } = await supabase
          .from('sector_messages')
          .select(`
            id,
            title,
            content,
            created_at,
            sector_id,
            sectors (name)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        // Buscar mensagens de subsetores
        const { data: subsectorMessages, error: subsectorError } = await supabase
          .from('subsector_messages')
          .select(`
            id,
            title,
            content,
            created_at,
            subsector_id,
            subsectors (name)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        // Combinar e formatar mensagens
        let allMessages: MessageItem[] = [];
        
        if (sectorMessages && !sectorError) {
          const formattedSectorMessages = sectorMessages.map((msg: any) => ({
            ...msg,
            sector_name: msg.sectors?.name,
            type: 'sector'
          }));
          allMessages = [...allMessages, ...formattedSectorMessages];
        }

        if (subsectorMessages && !subsectorError) {
          const formattedSubsectorMessages = subsectorMessages.map((msg: any) => ({
            ...msg,
            subsector_name: msg.subsectors?.name,
            type: 'subsector'
          }));
          allMessages = [...allMessages, ...formattedSubsectorMessages];
        }

        // Ordenar por data e limitar
        allMessages.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setMessages(allMessages.slice(0, limit));
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [limit]);

  // Formatador de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="card">
        <UnifiedLoadingSpinner message="Carregando mensagens..." />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="card p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="heading-4 text-title">Mensagens</h2>
          </div>
          <Link 
            href="/mensagens" 
            className="text-sm font-medium transition-colors flex items-center hover:bg-primary/10 px-3 py-1.5 rounded-md text-primary"
          >
            Ver todas
            <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {messages.length === 0 ? (
          <div className="text-center py-4">
            <p className="body-text-small text-muted">Nenhuma mensagem disponível</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <Link
                key={message.id}
                href={`/mensagens/${message.id}`}
                className="block py-2.5 border-b border-cresol-gray-light/30 last:border-b-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
              >
                <div className="flex flex-col">
                  <h3 className="body-text-bold text-title line-clamp-1">{message.title}</h3>
                  <p className="body-text-small text-muted line-clamp-2 mt-1">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted">
                      {formatDate(message.created_at)}
                    </span>
                    {(message.sector_name || message.subsector_name) && (
                      <span className="text-xs text-primary">
                        {message.sector_name || message.subsector_name}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="heading-3 text-title">Mensagens Importantes</h2>
          <p className="body-text-small text-muted mt-1">Comunicados e avisos da administração</p>
        </div>
        <Link 
          href="/mensagens" 
          className="text-sm font-medium transition-colors flex items-center hover:bg-primary/10 px-3 py-1.5 rounded-md text-primary"
        >
          Ver todas
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      {messages.length === 0 ? (
        <div className="p-8 text-center">
          <p className="body-text text-muted">Nenhuma mensagem disponível no momento</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Link
              key={message.id}
              href={`/mensagens/${message.id}`}
              className="block bg-white border border-gray-200/60 hover:border-gray-200 rounded-md transition-colors duration-150 p-4"
            >
              <div className="flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Mensagem
                  </span>
                  <span className="text-xs text-muted">
                    {formatDate(message.created_at)}
                  </span>
                </div>
                
                <h3 className="heading-4 text-title mb-2 leading-tight">{message.title}</h3>
                
                <p className="body-text-small text-body mb-3 line-clamp-2">{message.content}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted">
                    {message.sector_name || message.subsector_name || 'Administração'}
                  </span>
                  <span className="text-sm font-medium text-primary">
                    Ler mensagem →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}