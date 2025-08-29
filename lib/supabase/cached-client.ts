import { createClient } from './client';
import { supabaseCache } from '../supabase-cache';


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
   * Inclui notícias gerais (que vão direto para home) e notícias de setor com show_on_homepage=true
   */
  async getFeaturedNews(limit = 4, options?: QueryOptions) {
    const key = `news:featured:${limit}`;
    
    return supabaseCache.get(
      key,
      async () => {
        // Buscar notícias gerais e notícias de setor em paralelo
        // Usar limite maior para ter mais opções e garantir que todas tenham imagem
        const fetchLimit = limit * 2;
        
        const [generalNewsResult, sectorNewsResult] = await Promise.all([
          // Notícias gerais (todas vão para a home quando publicadas) - APENAS COM IMAGEM
          supabase
            .from('general_news')
            .select('id, title, summary, image_url, created_at, priority')
            .eq('is_published', true)
            .not('image_url', 'is', null) // OBRIGATÓRIO: apenas com imagem
            .neq('image_url', '') // E não vazia
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(fetchLimit),
          
          // Notícias de setor (apenas as marcadas para homepage) - APENAS COM IMAGEM
          supabase
            .from('sector_news')
            .select('id, title, summary, image_url, created_at, sector_id, is_featured, show_on_homepage')
            .eq('is_published', true)
            .eq('show_on_homepage', true) // IMPORTANTE: apenas notícias marcadas para homepage
            .not('image_url', 'is', null) // OBRIGATÓRIO: apenas com imagem
            .neq('image_url', '') // E não vazia
            .order('is_featured', { ascending: false }) // Ordena por destaque primeiro
            .order('created_at', { ascending: false })
            .limit(fetchLimit)
        ]);
        
        if (generalNewsResult.error) throw generalNewsResult.error;
        if (sectorNewsResult.error) throw sectorNewsResult.error;
        
        // Processar notícias gerais (adicionar tipo e prioridade alta)
        const generalNews = (generalNewsResult.data || []).map(news => ({
          ...news,
          type: 'general' as const,
          is_featured: true, // Notícias gerais são sempre em destaque
          sector_id: null
        }));
        
        // Processar notícias de setor (todas já têm show_on_homepage=true)
        const sectorNews = (sectorNewsResult.data || []).map(news => ({
          ...news,
          type: 'sector' as const,
          priority: 0, // Setor não tem priority
          show_on_homepage: true // Confirmando que está na homepage
        }));
        
        // Separar notícias de setor por destaque dentro do setor
        const featuredSector = sectorNews.filter(n => n.is_featured);
        const regularSector = sectorNews.filter(n => !n.is_featured);
        
        // Combinar resultados priorizando:
        // 1. Notícias gerais (sempre em destaque, ordenadas por priority e data)
        // 2. Notícias de setor destacadas (is_featured=true)
        // 3. Notícias de setor na homepage mas sem destaque
        const combinedNews = [
          ...generalNews,
          ...featuredSector,
          ...regularSector
        ];
        
        // Ordenar o resultado final por prioridade e data
        const sortedNews = combinedNews.sort((a, b) => {
          // Primeiro por is_featured (geral e setor em destaque)
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          
          // Depois por priority (apenas para notícias gerais)
          if (a.type === 'general' && b.type === 'general') {
            if (a.priority !== b.priority) return (b.priority || 0) - (a.priority || 0);
          }
          
          // Por último por data de criação
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        // Garantir que retorna exatamente o limite solicitado (default: 4)
        const finalNews = sortedNews.slice(0, limit);
        
        return finalNews;
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
  news: () => {
    // Invalidar cache de notícias (setor, subsetor e geral)
    supabaseCache.invalidateTable('news');
    // Invalidar cache específico de notícias em destaque
    supabaseCache.invalidatePattern('news:featured:*');
  },
  generalNews: () => {
    // Invalidar cache específico para notícias gerais
    supabaseCache.invalidatePattern('news:featured:*');
  },
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