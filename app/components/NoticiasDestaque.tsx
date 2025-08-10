'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { NewsCard, CompactNewsCard, FeaturedNewsCard } from './NewsCard';
import type { NewsItem } from './NewsCard';

interface NoticiasDestaqueProps {
  compact?: boolean;
  limit?: number;
}

export default function NoticiasDestaque({ compact = false, limit = 4 }: NoticiasDestaqueProps) {
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      
      try {
        console.log('Buscando notícias para o dashboard...');
        
        let newsData;
        
        // Primeiro, tentar buscar notícias em destaque
        const { data: featuredData, error: featuredError } = await supabase
          .from('sector_news')
          .select('id, title, summary, image_url, created_at, sector_id, is_featured')
          .eq('is_published', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(limit);
          
        if (featuredError) {
          console.error('Erro ao buscar notícias em destaque:', featuredError);
          throw featuredError;
        }
        
        // Se não encontrou suficientes notícias em destaque, buscar as mais recentes
        if (!featuredData || featuredData.length < limit) {
          console.log(`Encontradas ${featuredData?.length || 0} notícias em destaque. Buscando mais notícias recentes...`);
          
          const numToFetch = limit - (featuredData?.length || 0);
          const { data: recentData, error: recentError } = await supabase
            .from('sector_news')
            .select('id, title, summary, image_url, created_at, sector_id, is_featured')
            .eq('is_published', true)
            .eq('is_featured', false)
            .order('created_at', { ascending: false })
            .limit(numToFetch);
            
          if (recentError) {
            console.error('Erro ao buscar notícias recentes:', recentError);
            newsData = featuredData || [];
          } else {
            // Combinar as notícias em destaque com as recentes
            newsData = [...(featuredData || []), ...(recentData || [])];
          }
        } else {
          newsData = featuredData;
        }
        
        console.log(`Total de notícias encontradas: ${newsData?.length || 0}`);
        
        // Se tiver dados, use-os
        if (newsData && newsData.length > 0) {
          const formattedNews = newsData.map((item: any) => ({
            ...item,
            category: 'Notícia' // Podemos buscar a categoria do setor posteriormente
          }));
          setFeaturedNews(formattedNews);
        } else {
          setFeaturedNews([]);
        }
      } catch (error) {
        console.error('Erro ao buscar notícias:', error);
        setFeaturedNews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
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
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded-sm w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded-sm mb-4"></div>
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
          {/* No modo compacto, usar CompactNewsCard */}
          {compact ? (
            featuredNews.map((news) => (
              <CompactNewsCard
                key={news.id}
                news={news}
                showCategory={true}
                showDate={true}
              />
            ))
          ) : (
            <>
              {/* Primeira notícia em formato horizontal (featured) */}
              {featuredNews.slice(0, 1).map((news) => (
                <NewsCard
                  key={news.id}
                  news={news}
                  variant="horizontal"
                  priority={true}
                  showCategory={true}
                  showDate={true}
                  showImage={true}
                />
              ))}
              
              {/* Outras notícias em formato compacto */}
              {featuredNews.slice(1).map((news) => (
                <CompactNewsCard
                  key={news.id}
                  news={news}
                  showCategory={true}
                  showDate={true}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
} 