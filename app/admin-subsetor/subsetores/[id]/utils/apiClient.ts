// Cliente API centralizado para operações do subsetor

import { SubsectorEvent, SubsectorNews, Group, Message } from '../types/subsector.types';

// Payloads para criação/atualização
export interface SubsectorEventPayload extends Omit<SubsectorEvent, 'id'> {
  subsector_id: string;
}

export interface SubsectorNewsPayload extends Omit<SubsectorNews, 'id' | 'created_at'> {
  subsector_id: string;
}

/**
 * Classe de erro customizada para a API
 */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Wrapper para requisições fetch com tratamento de erro
 */
async function fetchWithErrorHandling(url: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new ApiError(response.status, error.error || 'Erro na requisição');
  }
  
  return response;
}

/**
 * API Client para gerenciamento de conteúdo do setor
 */
export const sectorContentApi = {
  /**
   * Cria um novo item de conteúdo (evento ou notícia)
   */
  async create<T extends 'subsector_events' | 'subsector_news'>(
    type: T,
    data: T extends 'subsector_events' ? SubsectorEventPayload : SubsectorNewsPayload
  ) {
    const response = await fetchWithErrorHandling('/api/admin/sector-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    });
    return response.json();
  },

  /**
   * Atualiza um item de conteúdo existente
   */
  async update<T extends 'subsector_events' | 'subsector_news'>(
    type: T,
    id: string,
    data: T extends 'subsector_events' ? Partial<SubsectorEventPayload> : Partial<SubsectorNewsPayload>
  ) {
    const response = await fetchWithErrorHandling('/api/admin/sector-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id, data })
    });
    return response.json();
  },

  /**
   * Exclui um item de conteúdo
   */
  async delete(type: 'subsector_events' | 'subsector_news', id: string) {
    const response = await fetchWithErrorHandling('/api/admin/sector-content', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id })
    });
    return response.json();
  }
};

/**
 * API Client para gerenciamento de grupos de mensagens
 */
export const groupsApi = {
  /**
   * Busca todos os grupos por subsetor
   */
  async fetchAll(subsectorId?: string): Promise<{ groups: Group[]; success: boolean }> {
    const url = subsectorId ? `/api/admin/message-groups?subsector_id=${subsectorId}` : '/api/admin/message-groups';
    const response = await fetchWithErrorHandling(url);
    return response.json();
  },

  /**
   * Cria um novo grupo de mensagem
   */
  async create(groupData: {
    name: string;
    description?: string;
    color_theme?: string;
    subsector_id: string;
  }) {
    // Importar createClient aqui para evitar problemas de dependência
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    
    // Obter sessão para autenticação
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetchWithErrorHandling('/api/admin/message-groups', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(groupData)
    });
    return response.json();
  },

  /**
   * Atualiza um grupo existente
   */
  async update(groupId: string, groupData: Partial<Group>) {
    // Importar createClient aqui para evitar problemas de dependência
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    
    // Obter sessão para autenticação
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetchWithErrorHandling('/api/admin/message-groups', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ id: groupId, ...groupData })
    });
    return response.json();
  },

  /**
   * Exclui um grupo
   */
  async delete(groupId: string) {
    // Importar createClient aqui para evitar problemas de dependência
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    
    // Obter sessão para autenticação
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetchWithErrorHandling(`/api/admin/message-groups?id=${groupId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    return response.json();
  }
};

/**
 * API Client para envio de mensagens
 */
export const messagesApi = {
  /**
   * Envia uma mensagem seguindo formato da API
   */
  async send(messageData: {
    title: string;
    content: string; 
    type: string;
    group_id: string;
    expire_at: string;
    links: any[];
  }) {
    // Importar createClient aqui para evitar problemas de dependência
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    
    // Obter sessão para autenticação
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetchWithErrorHandling('/api/notifications/send', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(messageData)
    });

    const result = await response.json();
    
    return result;
  }
};