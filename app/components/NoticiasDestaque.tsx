'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import OptimizedImage from './OptimizedImage';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image_url?: string;
  created_at: string;
  category: string;
}

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
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded mb-4"></div>
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
          {/* No modo compacto, mostrar apenas lista simples */}
          {compact ? (
            featuredNews.map((news) => (
              <Link 
                key={news.id} 
                href={`/noticias/${news.id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="body-text-bold text-title line-clamp-2 mb-1">
                      {news.title}
                    </h3>
                    <p className="text-xs text-muted">
                      {formatDate(news.created_at)}
                    </p>
                  </div>
                  <span className="badge-text text-white ml-2" style={{ backgroundColor: 'var(--color-primary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--border-radius-small)' }}>
                    {news.category}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <>
              {/* Mostrar a primeira notícia em destaque no formato horizontal */}
              {featuredNews.slice(0, 1).map((news) => (
                <Link 
                  key={news.id} 
                  href={`/noticias/${news.id}`}
                  className="block bg-gray-50 border border-gray-100 rounded-lg overflow-hidden hover: hover:border-gray-200 transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row">
                    {news.image_url ? (
                      <div className="md:w-1/3 h-56 md:h-auto relative overflow-hidden">
                        <OptimizedImage
                          src={news.image_url}
                          alt={news.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                    ) : (
                      <div className="md:w-1/3 h-56 md:h-auto bg-gray-100 flex items-center justify-center">
                        <span className="font-medium" style={{ color: '#F38332' }}>Cresol</span>
                      </div>
                    )}
                    
                    <div className="p-6 md:w-2/3">
                      <div className="flex flex-col h-full">
                        <div className="mb-auto">
                          <div className="flex justify-between items-start mb-2">
                            <span className="badge-text text-white" style={{ backgroundColor: 'var(--color-primary)', padding: '0.25rem 0.625rem', borderRadius: 'var(--border-radius-full)' }}>
                              {news.category}
                            </span>
                            <span className="text-xs text-muted">
                              {formatDate(news.created_at)}
                            </span>
                          </div>
                          <h3 className="heading-4 text-title mb-3 leading-tight">{news.title}</h3>
                          <p className="body-text text-body mb-4 leading-relaxed">{news.summary}</p>
                        </div>
                        <div className="text-sm font-medium text-primary">
                          Leia mais →
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              {/* Outras notícias em formato de cards menores */}
              {featuredNews.slice(1).map((news) => (
                <Link 
                  key={news.id} 
                  href={`/noticias/${news.id}`}
                  className="block bg-gray-50 border border-gray-100 rounded-lg p-4 hover: hover:border-gray-200 transition-all duration-200"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className="badge-text text-white" style={{ backgroundColor: 'var(--color-primary)', padding: '0.25rem 0.625rem', borderRadius: 'var(--border-radius-full)' }}>
                          {news.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(news.created_at)}
                        </span>
                      </div>
                      <h3 className="heading-4 text-title mb-2 leading-tight">{news.title}</h3>
                      <p className="body-text-small text-body line-clamp-2">{news.summary}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
} 