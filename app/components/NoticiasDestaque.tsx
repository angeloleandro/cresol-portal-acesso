'use client';

import Link from 'next/link';
import React, { useState, useEffect, memo } from 'react';

import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { cachedQueries } from '@/lib/supabase/cached-client';

import { MemoizedCompactNewsCard, MemoizedFeaturedNewsCard } from './MemoizedComponents';
import UnifiedLoadingSpinner from './ui/UnifiedLoadingSpinner';

import type { NewsItem } from './NewsCard';


interface NoticiasDestaqueProps {
  compact?: boolean;
  limit?: number;
  preloadedData?: NewsItem[];
}

function NoticiasDestaque({ compact = false, limit = 4, preloadedData }: NoticiasDestaqueProps) {
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Se tem dados pré-carregados, usa eles
    if (preloadedData) {
      setFeaturedNews(preloadedData);
      setIsLoading(false);
      return;
    }
    
    const fetchNews = async () => {
      setIsLoading(true);
      
      try {
        // Usa cache otimizado para buscar notícias
        const newsData = await cachedQueries.getFeaturedNews(limit);
        
        // Mapear para NewsItem com categoria obrigatória
        const finalNews: NewsItem[] = (newsData || []).map((item: any) => ({
          ...item,
          category: 'Notícia' // Categoria padrão
        }));

        setFeaturedNews(finalNews);
      } catch (error) {

        setFeaturedNews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [limit, preloadedData]);

  // Formatador de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      year: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="card">
        <UnifiedLoadingSpinner message={LOADING_MESSAGES.news} />
      </div>
    );
  }

  return (
    <div className={`card ${compact ? 'p-4' : ''}`}>
      <div className={`flex justify-between items-start ${compact ? 'mb-4' : 'mb-6'}`}>
        <div>
          <h2 className={`${compact ? 'heading-4' : 'heading-3'} text-title`}>Últimas Notícias</h2>
          {!compact && <p className="body-text-small text-muted mt-1">Acompanhe as informações mais recentes</p>}
        </div>
        <Link 
          href="/noticias" 
          className="text-sm font-medium transition-colors flex items-center hover:bg-primary/10 px-3 py-1.5 rounded-md text-primary"
        >
          Ver todas
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      {featuredNews.length === 0 ? (
        <div className="p-8 text-center">
          <p className="body-text text-muted">Nenhuma notícia em destaque disponível</p>
        </div>
      ) : (
        <div className={compact ? "space-y-2" : "space-y-4"}>
          {/* No modo compacto, usar MemoizedCompactNewsCard */}
          {compact ? (
            featuredNews.map((news) => (
              <MemoizedCompactNewsCard
                key={news.id}
                news={news}
              />
            ))
          ) : (
            <>
              {/* Primeira notícia em formato horizontal (featured) */}
              {featuredNews.slice(0, 1).map((news) => (
                <MemoizedFeaturedNewsCard
                  key={news.id}
                  news={news}
                />
              ))}
              
              {/* Outras notícias em formato compacto */}
              {featuredNews.slice(1).map((news) => (
                <MemoizedCompactNewsCard
                  key={news.id}
                  news={news}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Exporta versão memoizada do componente
const NoticiasDestaqueMemo = memo(NoticiasDestaque);
NoticiasDestaqueMemo.displayName = 'NoticiasDestaque';

export default NoticiasDestaqueMemo; 