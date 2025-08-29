/**
 * Tipos unificados para o sistema de notícias
 * Suporta general_news e sector_news com interface padronizada
 */

// Tipos base das tabelas do banco
export interface GeneralNewsDB {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  priority: number; // 0-10
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SectorNewsDB {
  id: string;
  sector_id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  is_featured: boolean;        // Destaque visual APENAS dentro do setor
  show_on_homepage: boolean;   // Publicação na homepage geral do portal
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SubsectorNewsDB {
  id: string;
  subsector_id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  is_featured: boolean;        // Destaque visual APENAS dentro do subsetor
  show_on_homepage: boolean;   // Publicação na homepage geral do portal
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Tipos para identificação de origem
export type NewsSource = 'general' | 'sector';

export type NewsCategory = 
  | 'Notícias Gerais'
  | 'Setorial'
  | 'Todas';

// Interface unificada para exibição
export interface UnifiedNewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  
  // Campos padronizados para exibição
  category: NewsCategory;
  author: string;
  source: NewsSource;
  
  // Campos específicos preservados
  priority?: number; // Para general_news (controla homepage + importância)
  sector_id?: string; // Para sector_news
  is_featured?: boolean; // Para sector_news (destaque visual no setor)
  show_on_homepage?: boolean; // Para sector_news (publicação na homepage)
  
  // Campo calculado para ordenação
  sort_weight: number;
}

// Tipos para busca e filtros
export interface NewsFilters {
  category: NewsCategory;
  source?: NewsSource;
  limit?: number;
  offset?: number;
}

// Tipos para resposta da API
export interface UnifiedNewsResponse {
  news: UnifiedNewsItem[];
  categories: NewsCategory[];
  total: number;
  hasMore: boolean;
}

// Tipos para notícias relacionadas
export interface RelatedNewsOptions {
  newsId: string;
  source: NewsSource;
  sector_id?: string;
  limit?: number;
}

// Configuração de ordenação
export interface NewsSortConfig {
  priorityWeight: number;    // general_news.priority (0-10) para homepage
  featuredWeight: number;    // sector_news.is_featured para destaque no setor
  homepageWeight: number;    // sector_news.show_on_homepage para homepage
  dateWeight: number;        // Data de criação normalizada
}

// Tipos para loading states
export interface NewsLoadingState {
  general: boolean;
  sector: boolean;
  related: boolean;
}

// Tipo para erros específicos do sistema de notícias
export interface NewsError {
  source: NewsSource;
  message: string;
  details?: string;
}