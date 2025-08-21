'use client';

import { useEffect, useState, useCallback } from 'react';
import { cachedQueries, supabase } from '@/lib/supabase/cached-client';
import { logger } from '@/lib/production-logger';

interface ParallelFetchConfig {
  banners?: boolean;
  news?: boolean | number;
  events?: boolean | number;
  videos?: boolean | number;
  gallery?: boolean | number;
  systemLinks?: boolean;
  economicIndicators?: boolean;
  userProfile?: string;
}

interface ParallelFetchResult {
  banners?: any[];
  news?: any[];
  events?: any[];
  videos?: any[];
  gallery?: any[];
  systemLinks?: any[];
  economicIndicators?: any[];
  userProfile?: any;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook para carregamento paralelo de múltiplos dados
 * Reduz significativamente o tempo de carregamento fazendo todas as requisições simultaneamente
 */
export function useParallelDataFetch(config: ParallelFetchConfig): ParallelFetchResult {
  const [data, setData] = useState<ParallelFetchResult>({
    loading: true,
    error: null,
  });
  
  const fetchData = useCallback(async () => {
    const startTime = Date.now();
    logger.info('[ParallelFetch] Iniciando carregamento paralelo', { config });
    
    try {
      const promises: Promise<any>[] = [];
      const keys: string[] = [];
      
      // Constrói array de promises baseado na configuração
      if (config.banners) {
        promises.push(cachedQueries.getBanners());
        keys.push('banners');
      }
      
      if (config.news) {
        const limit = typeof config.news === 'number' ? config.news : 4;
        promises.push(cachedQueries.getFeaturedNews(limit));
        keys.push('news');
      }
      
      if (config.events) {
        const limit = typeof config.events === 'number' ? config.events : 5;
        promises.push(cachedQueries.getActiveEvents(limit));
        keys.push('events');
      }
      
      if (config.videos) {
        const limit = typeof config.videos === 'number' ? config.videos : 6;
        promises.push(cachedQueries.getVideos(limit));
        keys.push('videos');
      }
      
      if (config.gallery) {
        const limit = typeof config.gallery === 'number' ? config.gallery : 8;
        promises.push(cachedQueries.getGalleryImages(limit));
        keys.push('gallery');
      }
      
      if (config.systemLinks) {
        promises.push(cachedQueries.getSystemLinks());
        keys.push('systemLinks');
      }
      
      if (config.economicIndicators) {
        promises.push(cachedQueries.getEconomicIndicators());
        keys.push('economicIndicators');
      }
      
      if (config.userProfile) {
        promises.push(cachedQueries.getUserProfile(config.userProfile));
        keys.push('userProfile');
      }
      
      // Executa todas as promises em paralelo
      const results = await Promise.allSettled(promises);
      
      // Processa resultados
      const processedData: ParallelFetchResult = {
        loading: false,
        error: null,
      };
      
      results.forEach((result, index) => {
        const key = keys[index];
        if (result.status === 'fulfilled') {
          (processedData as any)[key] = result.value;
        } else {
          logger.error(`[ParallelFetch] Erro ao carregar ${key}`, result.reason);
          // Continua mesmo com erro parcial
          (processedData as any)[key] = [];
        }
      });
      
      const loadTime = Date.now() - startTime;
      logger.info('[ParallelFetch] Carregamento paralelo completo', { 
        loadTime: `${loadTime}ms`,
        successCount: results.filter(r => r.status === 'fulfilled').length,
        failureCount: results.filter(r => r.status === 'rejected').length,
      });
      
      setData(processedData);
    } catch (error) {
      logger.error('[ParallelFetch] Erro crítico no carregamento paralelo', error);
      setData({
        loading: false,
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      });
    }
  }, [config]);
  
  useEffect(() => {
    fetchData();
  }, []); // Executa apenas na montagem
  
  return data;
}

/**
 * Hook para página home que carrega todos os dados necessários em paralelo
 */
export function useHomePageData() {
  return useParallelDataFetch({
    banners: true,
    news: 4,
    events: 4,
    videos: 6,
    gallery: 8,
    systemLinks: true,
  });
}

/**
 * Hook para páginas de setor que carrega dados específicos
 */
export function useSectorPageData(sectorId: string) {
  const [sectorData, setSectorData] = useState<any>(null);
  const parallelData = useParallelDataFetch({
    news: 6,
    events: 6,
  });
  
  useEffect(() => {
    // Carrega dados específicos do setor
    const fetchSectorData = async () => {
      try {
        const { data, error } = await supabase
          .from('sectors')
          .select('*')
          .eq('id', sectorId)
          .single();
        
        if (error) throw error;
        setSectorData(data);
      } catch (error) {
        logger.error('[SectorPageData] Erro ao carregar dados do setor', error);
      }
    };
    
    fetchSectorData();
  }, [sectorId]);
  
  return {
    ...parallelData,
    sector: sectorData,
  };
}

/**
 * Hook para pré-carregar dados antes da navegação
 */
export function usePrefetchData(config: ParallelFetchConfig) {
  const prefetch = useCallback(() => {
    const promises: Promise<any>[] = [];
    
    if (config.banners) {
      promises.push(cachedQueries.getBanners({ forceRefresh: false }));
    }
    
    if (config.news) {
      const limit = typeof config.news === 'number' ? config.news : 4;
      promises.push(cachedQueries.getFeaturedNews(limit, { forceRefresh: false }));
    }
    
    if (config.events) {
      const limit = typeof config.events === 'number' ? config.events : 5;
      promises.push(cachedQueries.getActiveEvents(limit, { forceRefresh: false }));
    }
    
    // Executa prefetch sem aguardar resultado
    Promise.all(promises).catch(error => {
      logger.warn('[Prefetch] Erro no pré-carregamento', error);
    });
  }, [config]);
  
  return prefetch;
}