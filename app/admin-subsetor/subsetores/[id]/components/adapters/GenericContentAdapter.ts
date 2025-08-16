/**
 * Generic Content Adapter
 * Elimina duplicação entre newsAdapter e eventsAdapter
 * Fornece interface unificada para operações CRUD
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Tipo base para qualquer conteúdo
export interface BaseContentData {
  id?: string;
  title: string;
  is_published?: boolean;
  is_featured?: boolean;
  order_index?: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Tipos específicos estendem o tipo base
export interface NewsContentData extends BaseContentData {
  summary: string;
  content: string;
  image_url?: string;
  sector_id?: string;
  subsector_id?: string;
}

export interface EventContentData extends BaseContentData {
  description: string;
  location?: string;
  start_date: string;
  end_date?: string;
  sector_id?: string;
  subsector_id?: string;
}

// Tipo de configuração genérico
export interface GenericAdapterConfig {
  contentType: 'news' | 'events' | 'systems';
  entityType: 'sector' | 'subsector';
  entityId: string;
}

// Mapeamento de tipos para tabelas e colunas
const TABLE_MAPPING = {
  news: {
    sector: { table: 'sector_news', column: 'sector_id' },
    subsector: { table: 'subsector_news', column: 'subsector_id' }
  },
  events: {
    sector: { table: 'sector_events', column: 'sector_id' },
    subsector: { table: 'subsector_events', column: 'subsector_id' }
  },
  systems: {
    sector: { table: 'systems', column: 'sector_id' },
    subsector: { table: 'subsector_systems', column: 'subsector_id' }
  }
} as const;

// Adapter genérico
export class GenericContentAdapter<T extends BaseContentData> {
  private supabase = createClientComponentClient();
  private tableName: string;
  private entityColumn: string;
  private apiType: string;

  constructor(private config: GenericAdapterConfig) {
    const mapping = TABLE_MAPPING[config.contentType][config.entityType];
    this.tableName = mapping.table;
    this.entityColumn = mapping.column;
    this.apiType = `${config.entityType}_${config.contentType}`;
  }

  // Buscar todos os itens
  async fetchAll(includeUnpublished = true): Promise<T[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq(this.entityColumn, this.config.entityId);

    // Se não incluir não publicados, filtrar apenas publicados
    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }

    // Ordenação específica por tipo
    if (this.config.contentType === 'events') {
      query = query.order('start_date', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Criar item
  async create(itemData: Omit<T, 'id'>): Promise<T> {
    const response = await fetch('/api/admin/sector-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: this.apiType,
        data: {
          ...itemData,
          [this.entityColumn]: this.config.entityId,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Erro ao criar ${this.config.contentType}`);
    }

    return response.json();
  }

  // Atualizar item
  async update(id: string, itemData: Partial<T>): Promise<T> {
    const response = await fetch('/api/admin/sector-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: this.apiType,
        id,
        data: itemData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Erro ao atualizar ${this.config.contentType}`);
    }

    return response.json();
  }

  // Deletar item
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/admin/sector-content?type=${this.apiType}&id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Erro ao excluir ${this.config.contentType}`);
    }

    // Handle empty response bodies for 204 No Content or empty responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return;
    }

    // Try to consume JSON if present, but ignore parse errors for empty bodies
    try {
      await response.json();
    } catch {
      // Ignore JSON parse errors for empty responses
    }
  }

  // Toggle published status
  async togglePublished(id: string, is_published: boolean): Promise<T> {
    return this.update(id, { is_published } as Partial<T>);
  }

  // Toggle featured status
  async toggleFeatured(id: string, is_featured: boolean): Promise<T> {
    return this.update(id, { is_featured } as Partial<T>);
  }

  // Reordenar itens
  async reorder(items: Array<{ id: string; order_index: number }>): Promise<void> {
    const updates = items.map(item => 
      this.update(item.id, { order_index: item.order_index } as Partial<T>)
    );
    
    const results = await Promise.allSettled(updates);
    
    // Collect failures and their details
    const failures = results
      .map((result, index) => ({ result, item: items[index] }))
      .filter(({ result }) => result.status === 'rejected')
      .map(({ result, item }) => ({
        id: item.id,
        error: result.status === 'rejected' ? result.reason : 'Unknown error'
      }));
    
    // If there are failures, throw an aggregated error
    if (failures.length > 0) {
      console.error('Reorder failures:', failures);
      const failedIds = failures.map(f => f.id).join(', ');
      const errorMessages = failures.map(f => `${f.id}: ${f.error.message || f.error}`).join('; ');
      throw new Error(`Falha ao reordenar itens [${failedIds}]: ${errorMessages}`);
    }
  }

  // Buscar item específico
  async fetchById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Contar itens
  async count(onlyPublished = false): Promise<number> {
    let query = this.supabase
      .from(this.tableName)
      .select('id', { count: 'exact', head: true })
      .eq(this.entityColumn, this.config.entityId);

    if (onlyPublished) {
      query = query.eq('is_published', true);
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  }

  // Buscar estatísticas
  async getStats(): Promise<{ total: number; published: number; featured: number }> {
    const [total, published, featured] = await Promise.all([
      this.count(false),
      this.count(true),
      this.supabase
        .from(this.tableName)
        .select('id', { count: 'exact', head: true })
        .eq(this.entityColumn, this.config.entityId)
        .eq('is_featured', true)
        .then(({ count }) => count || 0)
    ]);

    return { total, published, featured };
  }

  // Getters para informações do adapter
  getTableName(): string {
    return this.tableName;
  }

  getEntityColumn(): string {
    return this.entityColumn;
  }

  getContentType(): string {
    return this.config.contentType;
  }

  getEntityType(): string {
    return this.config.entityType;
  }
}

// Factory function para criar adapters tipados
export function createContentAdapter<T extends BaseContentData>(
  config: GenericAdapterConfig
): GenericContentAdapter<T> {
  return new GenericContentAdapter<T>(config);
}

// Exports convenientes para tipos específicos
export const createNewsAdapter = (entityType: 'sector' | 'subsector', entityId: string) =>
  createContentAdapter<NewsContentData>({
    contentType: 'news',
    entityType,
    entityId
  });

export const createEventsAdapter = (entityType: 'sector' | 'subsector', entityId: string) =>
  createContentAdapter<EventContentData>({
    contentType: 'events',
    entityType,
    entityId
  });