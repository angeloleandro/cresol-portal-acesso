import { createClient } from './client';
import { supabaseCache } from '../supabase-cache';
import { logger } from '../production-logger';

/**
 * Cliente Supabase com cache integrado
 * Fornece métodos otimizados para queries comuns
 */

const supabase = createClient();

interface QueryOptions {
  ttl?: number;
  staleWhileRevalidate?: boolean;
  forceRefresh?: boolean;
}

/**
 * Queries otimizadas com cache para tabelas principais
 */
export const cachedQueries = {
  /**
   * Busca banners ativos com cache de 10 minutos
   */
  async getBanners(options?: QueryOptions) {
    const key = 'banners:active';
    
    return supabaseCache.get(
      key,
      async () => {
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        
        if (error) throw error;
        return data;
      },
      { ttl: 10 * 60 * 1000, ...options } // 10 minutos
    );
  },
  
  /**
   * Busca notícias em destaque com cache de 5 minutos
   */
  async getFeaturedNews(limit = 4, options?: QueryOptions) {
    const key = `news:featured:${limit}`;
    
    return supabaseCache.get(
      key,
      async () => {
        const { data, error } = await supabase
          .from('sector_news')
          .select('id, title, summary, image_url, created_at, sector_id, is_featured')
          .eq('is_published', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(limit * 2);
        
        if (error) throw error;
        
        // Processar e retornar apenas o limite solicitado
        const featured = data?.filter(n => n.is_featured) || [];
        const regular = data?.filter(n => !n.is_featured) || [];
        
        return [...featured, ...regular].slice(0, limit);
      },
      { ttl: 5 * 60 * 1000, ...options } // 5 minutos
    );
  },
  
  /**
   * Busca eventos ativos com cache de 5 minutos
   */
  async getActiveEvents(limit = 5, options?: QueryOptions) {
    const key = `events:active:${limit}`;
    
    return supabaseCache.get(
      key,
      async () => {
        const now = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('sector_events')
          .select('*')
          .eq('is_published', true)
          .gte('end_date', now)
          .order('start_date', { ascending: true })
          .limit(limit);
        
        if (error) throw error;
        return data;
      },
      { ttl: 5 * 60 * 1000, ...options } // 5 minutos
    );
  },
  
  /**
   * Busca vídeos com cache de 15 minutos
   */
  async getVideos(limit = 6, options?: QueryOptions) {
    const key = `videos:latest:${limit}`;
    
    return supabaseCache.get(
      key,
      async () => {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        return data;
      },
      { ttl: 15 * 60 * 1000, ...options } // 15 minutos
    );
  },
  
  /**
   * Busca imagens da galeria com cache de 15 minutos
   */
  async getGalleryImages(limit = 8, options?: QueryOptions) {
    const key = `gallery:images:${limit}`;
    
    return supabaseCache.get(
      key,
      async () => {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        return data;
      },
      { ttl: 15 * 60 * 1000, ...options } // 15 minutos
    );
  },
  
  /**
   * Busca links de sistemas com cache de 30 minutos
   */
  async getSystemLinks(options?: QueryOptions) {
    const key = 'system:links:all';
    
    return supabaseCache.get(
      key,
      async () => {
        const { data, error } = await supabase
          .from('system_links')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        
        if (error) throw error;
        return data;
      },
      { ttl: 30 * 60 * 1000, ...options } // 30 minutos
    );
  },
  
  /**
   * Busca perfil do usuário com cache de 10 minutos
   */
  async getUserProfile(userId: string, options?: QueryOptions) {
    const key = `user:profile:${userId}`;
    
    return supabaseCache.get(
      key,
      async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        return data;
      },
      { ttl: 10 * 60 * 1000, ...options } // 10 minutos
    );
  },
  
  /**
   * Busca indicadores econômicos com cache de 1 hora
   */
  async getEconomicIndicators(options?: QueryOptions) {
    const key = 'economic:indicators:all';
    
    return supabaseCache.get(
      key,
      async () => {
        const { data, error } = await supabase
          .from('economic_indicators')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        return data;
      },
      { ttl: 60 * 60 * 1000, ...options } // 1 hora
    );
  }
};

/**
 * Métodos para invalidar cache quando dados são alterados
 */
export const cacheInvalidation = {
  banners: () => supabaseCache.invalidateTable('banners'),
  news: () => supabaseCache.invalidateTable('news'),
  events: () => supabaseCache.invalidateTable('events'),
  videos: () => supabaseCache.invalidateTable('videos'),
  gallery: () => supabaseCache.invalidateTable('gallery'),
  systemLinks: () => supabaseCache.invalidate('system:links:all'),
  userProfile: (userId: string) => supabaseCache.invalidate(`user:profile:${userId}`),
  economicIndicators: () => supabaseCache.invalidate('economic:indicators:all'),
  all: () => supabaseCache.clear()
};

// Exportar o cliente original para casos que não precisam de cache
export { supabase };

// Exportar estatísticas do cache para debugging
export const getCacheStats = () => supabaseCache.getStats();