/**
 * Funções utilitárias para o sistema unificado de notícias
 * Gerencia busca, normalização e ordenação de general_news + sector_news
 */

import { createClient } from '@/lib/supabase/client';
import type { 
  GeneralNewsDB, 
  SectorNewsDB,
  SubsectorNewsDB,
  UnifiedNewsItem, 
  NewsSource, 
  NewsCategory,
  UnifiedNewsResponse,
  RelatedNewsOptions,
  NewsSortConfig,
  NewsLoadingState,
  NewsError
} from '@/types/news';

const supabase = createClient();

// Configuração padrão de ordenação
const DEFAULT_SORT_CONFIG: NewsSortConfig = {
  priorityWeight: 100,    // general_news.priority (0-10) * 100 = 0-1000  
  featuredWeight: 30,     // sector_news.is_featured * 30 = 0 ou 30 (destaque no setor)
  homepageWeight: 70,     // sector_news.show_on_homepage * 70 = 0 ou 70 (homepage)
  dateWeight: 1           // Timestamp em ms / 1000000 para normalizar
};

// Cache simples para evitar requisições desnecessárias
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Função utilitária para cache com expiração
 */
function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Normaliza um item de general_news para a interface unificada
 */
export function normalizeGeneralNews(item: GeneralNewsDB): UnifiedNewsItem {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    content: item.content,
    image_url: item.image_url,
    created_at: item.created_at,
    updated_at: item.updated_at,
    category: 'Notícias Gerais',
    author: 'Cresol',
    source: 'general',
    priority: item.priority,
    sort_weight: calculateSortWeight({
      priority: item.priority,
      created_at: item.created_at
    })
  };
}

/**
 * Normaliza um item de sector_news para a interface unificada
 */
export function normalizeSectorNews(item: SectorNewsDB): UnifiedNewsItem {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    content: item.content,
    image_url: item.image_url,
    created_at: item.created_at,
    updated_at: item.updated_at,
    category: 'Setorial',
    author: 'Cresol',
    source: 'sector',
    sector_id: item.sector_id,
    is_featured: item.is_featured,           // Destaque no setor
    show_on_homepage: item.show_on_homepage, // Publicação homepage
    sort_weight: calculateSortWeight({
      is_featured: item.is_featured,
      show_on_homepage: item.show_on_homepage,
      created_at: item.created_at
    })
  };
}

/**
 * Calcula peso para ordenação baseado em prioridade/destaque/homepage + data
 */
function calculateSortWeight(params: {
  priority?: number;
  is_featured?: boolean;
  show_on_homepage?: boolean;
  created_at: string;
}): number {
  const { priority, is_featured, show_on_homepage, created_at } = params;
  const config = DEFAULT_SORT_CONFIG;
  
  let weight = 0;
  
  // Peso da prioridade (general_news) - controla homepage + importância
  if (typeof priority === 'number') {
    weight += priority * config.priorityWeight;
  }
  
  // Peso do destaque no setor (sector_news)
  if (is_featured) {
    weight += config.featuredWeight;
  }
  
  // Peso da publicação na homepage (sector_news)
  if (show_on_homepage) {
    weight += config.homepageWeight;
  }
  
  // Peso da data (mais recente = maior peso)
  const dateMs = new Date(created_at).getTime();
  weight += (dateMs / 1000000) * config.dateWeight;
  
  return weight;
}

/**
 * Busca notícias gerais publicadas
 */
export async function fetchGeneralNews(): Promise<UnifiedNewsItem[]> {
  try {
    const { data, error } = await supabase
      .from('general_news')
      .select('id, title, summary, content, image_url, priority, is_published, created_by, created_at, updated_at')
      .eq('is_published', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50); // Limita para melhor performance

    if (error) {
      console.error('Erro ao buscar general_news:', error);
      return [];
    }

    return (data || []).map(normalizeGeneralNews);
  } catch (error) {
    console.error('Erro ao processar general_news:', error);
    return [];
  }
}

/**
 * Busca notícias setoriais publicadas
 */
export async function fetchSectorNews(): Promise<UnifiedNewsItem[]> {
  try {
    const { data, error } = await supabase
      .from('sector_news')
      .select('id, sector_id, title, summary, content, image_url, is_featured, show_on_homepage, is_published, created_by, created_at, updated_at')
      .eq('is_published', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50); // Limita para melhor performance

    if (error) {
      console.error('Erro ao buscar sector_news:', error);
      return [];
    }

    return (data || []).map(normalizeSectorNews);
  } catch (error) {
    console.error('Erro ao processar sector_news:', error);
    return [];
  }
}

/**
 * Busca unificada de todas as notícias (paralela) com cache
 */
export async function fetchUnifiedNews(): Promise<UnifiedNewsResponse> {
  const cacheKey = 'unified_news';
  
  // Verifica cache primeiro
  const cachedResult = getCachedData(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  try {
    // Busca paralela para melhor performance
    const [generalNewsResult, sectorNewsResult] = await Promise.allSettled([
      fetchGeneralNews(),
      fetchSectorNews()
    ]);

    // Processa resultados mesmo se uma das buscas falhar
    const generalNews = generalNewsResult.status === 'fulfilled' ? generalNewsResult.value : [];
    const sectorNews = sectorNewsResult.status === 'fulfilled' ? sectorNewsResult.value : [];

    // Log erros se houver
    if (generalNewsResult.status === 'rejected') {
      console.error('Erro ao buscar notícias gerais:', generalNewsResult.reason);
    }
    if (sectorNewsResult.status === 'rejected') {
      console.error('Erro ao buscar notícias setoriais:', sectorNewsResult.reason);
    }

    // Combina e ordena por peso
    const allNews = [...generalNews, ...sectorNews]
      .sort((a, b) => b.sort_weight - a.sort_weight);

    // Extrai categorias únicas
    const categories: NewsCategory[] = [
      'Todas',
      ...Array.from(new Set(allNews.map(item => item.category))) as NewsCategory[]
    ];

    const result: UnifiedNewsResponse = {
      news: allNews,
      categories,
      total: allNews.length,
      hasMore: false // Implementar paginação se necessário
    };

    // Armazena no cache
    setCachedData(cacheKey, result);
    
    return result;

  } catch (error) {
    console.error('Erro crítico na busca unificada:', error);
    return {
      news: [],
      categories: ['Todas'],
      total: 0,
      hasMore: false
    };
  }
}

/**
 * Detecta o tipo de notícia pelo ID (útil para página de detalhes)
 */
export async function detectNewsType(id: string): Promise<NewsSource | null> {
  try {
    // Verifica primeiro em general_news
    const { data: generalData } = await supabase
      .from('general_news')
      .select('id')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (generalData) return 'general';

    // Verifica em sector_news
    const { data: sectorData } = await supabase
      .from('sector_news')
      .select('id')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (sectorData) return 'sector';

    return null;
  } catch (error) {
    console.error('Erro ao detectar tipo de notícia:', error);
    return null;
  }
}

/**
 * Busca uma notícia específica (qualquer tipo) com cache
 */
export async function fetchNewsById(id: string): Promise<UnifiedNewsItem | null> {
  const cacheKey = `news_${id}`;
  
  // Verifica cache primeiro
  const cachedResult = getCachedData(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  try {
    const source = await detectNewsType(id);
    if (!source) return null;

    let result: UnifiedNewsItem | null = null;

    if (source === 'general') {
      const { data, error } = await supabase
        .from('general_news')
        .select('id, title, summary, content, image_url, priority, is_published, created_by, created_at, updated_at')
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error || !data) {
        console.error('Erro ao buscar notícia geral:', error);
        return null;
      }
      result = normalizeGeneralNews(data);
    } else {
      const { data, error } = await supabase
        .from('sector_news')
        .select('id, sector_id, title, summary, content, image_url, is_featured, show_on_homepage, is_published, created_by, created_at, updated_at')
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error || !data) {
        console.error('Erro ao buscar notícia setorial:', error);
        return null;
      }
      result = normalizeSectorNews(data);
    }

    // Armazena no cache se encontrou
    if (result) {
      setCachedData(cacheKey, result);
    }

    return result;
  } catch (error) {
    console.error('Erro ao buscar notícia por ID:', error);
    return null;
  }
}

/**
 * Busca notícias relacionadas baseado no tipo
 */
export async function getRelatedNews(options: RelatedNewsOptions): Promise<UnifiedNewsItem[]> {
  const { newsId, source, sector_id, limit = 3 } = options;

  try {
    if (source === 'general') {
      // Para notícias gerais: outras notícias gerais recentes
      const { data, error } = await supabase
        .from('general_news')
        .select('*')
        .eq('is_published', true)
        .neq('id', newsId)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return data.map(normalizeGeneralNews);

    } else if (source === 'sector' && sector_id) {
      // Para notícias setoriais: outras do mesmo setor
      const { data, error } = await supabase
        .from('sector_news')
        .select('*')
        .eq('sector_id', sector_id)
        .eq('is_published', true)
        .neq('id', newsId)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return data.map(normalizeSectorNews);
    }

    return [];
  } catch (error) {
    console.error('Erro ao buscar notícias relacionadas:', error);
    return [];
  }
}

/**
 * Filtra notícias por categoria
 */
export function filterNewsByCategory(
  news: UnifiedNewsItem[], 
  category: NewsCategory
): UnifiedNewsItem[] {
  if (category === 'Todas') return news;
  return news.filter(item => item.category === category);
}

/**
 * Cria estado de loading estruturado
 */
export function createNewsLoadingState(): NewsLoadingState {
  return {
    general: true,
    sector: true,
    related: true
  };
}