// Hook para gerenciar dados de mensagens/notificações
// CORREÇÃO SUPABASE: Uso consistente de authenticated client com fallback para admin
import { useState, useCallback, useEffect } from 'react';

import { CONTENT_DEFAULTS } from '@/lib/constants/content-defaults';
import { createClient } from '@/lib/supabase/client';

import { Message } from '../types/sector.types';

interface UseMessagesDataReturn {
  messages: Message[];
  totalDraftMessagesCount: number;
  showDrafts: boolean;
  isLoading: boolean;
  error: string | null;
  fetchMessages: () => Promise<void>;
  toggleDrafts: () => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
}

/**
 * useMessagesData function
 * @todo Add proper documentation
 */
export function useMessagesData(sectorId: string): UseMessagesDataReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showDrafts, setShowDrafts] = useState<boolean>(CONTENT_DEFAULTS.SHOW_DRAFTS_INITIAL);
  const [totalDraftMessagesCount, setTotalDraftMessagesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper para validar sectorId
  const isValidSectorId = useCallback((id: string | undefined): id is string => {
    return !!(id && id.trim().length > 0 && id !== 'undefined');
  }, []);

  // Resetar estados quando sectorId mudar para um válido ou inválido
  useEffect(() => {
    if (!isValidSectorId(sectorId)) {
      // Resetar tudo quando sectorId é inválido
      setMessages([]);
      setTotalDraftMessagesCount(0);
      setError(null);
      setIsLoading(false);
    }
  }, [sectorId, isValidSectorId, messages.length]);

  const fetchMessages = useCallback(async () => {
    if (!isValidSectorId(sectorId)) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const headers: HeadersInit = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      };
      
      const url = new URL('/api/notifications/messages', window.location.origin);
      url.searchParams.set('sectorId', sectorId);
      url.searchParams.set('includeUnpublished', showDrafts.toString());

      const response = await fetch(url.toString(), {
        headers,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar mensagens');
      }

      const data = await response.json();
      
      const filteredMessages = data.data || [];

      setMessages(filteredMessages);

      if (showDrafts) {
        const draftCount = filteredMessages.filter((msg: Message) => !msg.is_published).length;
        setTotalDraftMessagesCount(draftCount);
      } else {
        try {
          const draftUrl = new URL('/api/notifications/messages', window.location.origin);
          draftUrl.searchParams.set('sectorId', sectorId);
          draftUrl.searchParams.set('includeUnpublished', 'true');

          const draftResponse = await fetch(draftUrl.toString(), {
            headers,
            credentials: 'include'
          });
          
          if (draftResponse.ok) {
            const draftData = await draftResponse.json();
            const draftCount = draftData.data?.filter((msg: Message) => !msg.is_published).length || 0;
            setTotalDraftMessagesCount(draftCount);
          } else {
            setTotalDraftMessagesCount(0);
          }
        } catch (draftErr) {
          setTotalDraftMessagesCount(0);
        }
      }

    } catch (err: any) {
      setError(err.message || 'Erro desconhecido ao carregar mensagens');
      setMessages([]);
      setTotalDraftMessagesCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [sectorId, showDrafts, isValidSectorId]);

  const toggleDrafts = useCallback(async () => {
    setShowDrafts(prev => !prev);
    // fetchMessages será chamado automaticamente pelo useEffect no componente
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    if (!id) {
      throw new Error('ID da mensagem é obrigatório');
    }

    try {
      const supabase = createClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`/api/notifications/messages?id=${id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir mensagem');
      }

      await fetchMessages();

    } catch (err: any) {
      throw err;
    }
  }, [fetchMessages]);

  return {
    messages,
    totalDraftMessagesCount,
    showDrafts,
    isLoading,
    error,
    fetchMessages,
    toggleDrafts,
    deleteMessage
  };
}