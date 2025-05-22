'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image_url?: string;
  created_at: string;
  category: string;
}

export default function NoticiasDestaque() {
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dados de exemplo (remover quando implementar a busca no Supabase)
  const sampleNews = [
    {
      id: '1',
      title: 'Resultados financeiros do 3º trimestre superaram expectativas',
      summary: 'Os resultados financeiros do terceiro trimestre de 2025 superaram todas as expectativas, com crescimento de 15% nas operações de crédito.',
      image_url: '/images/news/financial-results.jpg',
      created_at: '2025-05-12T10:30:00Z',
      category: 'Financeiro',
    },
    {
      id: '2',
      title: 'Nova campanha de captação de associados',
      summary: 'A Cresol lança hoje sua nova campanha de captação de associados com condições especiais para novos cooperados.',
      image_url: '/images/news/campaign.jpg',
      created_at: '2025-05-10T14:15:00Z',
      category: 'Marketing',
    },
    {
      id: '3',
      title: 'Treinamento sobre sustentabilidade para colaboradores',
      summary: 'Participe do novo treinamento sobre práticas sustentáveis e ESG que será realizado no próximo mês.',
      image_url: '/images/news/sustainability.jpg',
      created_at: '2025-05-08T09:45:00Z',
      category: 'Treinamento',
    },
    {
      id: '4',
      title: 'Novo sistema de gestão de atendimento será implantado',
      summary: 'Com o objetivo de melhorar a experiência dos associados, um novo sistema de gestão de atendimento será implantado em todas as agências.',
      image_url: '/images/news/system.jpg',
      created_at: '2025-05-05T08:00:00Z',
      category: 'Tecnologia',
    },
  ];

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
          .limit(4);
          
        if (featuredError) {
          console.error('Erro ao buscar notícias em destaque:', featuredError);
          throw featuredError;
        }
        
        // Se não encontrou suficientes notícias em destaque, buscar as mais recentes
        if (!featuredData || featuredData.length < 4) {
          console.log(`Encontradas ${featuredData?.length || 0} notícias em destaque. Buscando mais notícias recentes...`);
          
          const numToFetch = 4 - (featuredData?.length || 0);
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
        
        // Se tiver dados, use-os, caso contrário caia para os dados de exemplo
        if (newsData && newsData.length > 0) {
          const formattedNews = newsData.map(item => ({
            ...item,
            category: 'Notícia' // Podemos buscar a categoria do setor posteriormente
          }));
          setFeaturedNews(formattedNews);
        } else {
          setFeaturedNews(sampleNews);
        }
      } catch (error) {
        console.error('Erro ao buscar notícias:', error);
        // Em caso de erro, use os dados de exemplo
        setFeaturedNews(sampleNews);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

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
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded mb-4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-primary">Últimas Notícias</h2>
        <Link 
          href="/noticias" 
          className="text-sm text-primary hover:underline flex items-center"
        >
          Ver todas
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      {featuredNews.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-cresol-gray">Nenhuma notícia em destaque disponível</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mostrar a primeira notícia em destaque no formato horizontal */}
          {featuredNews.slice(0, 1).map((news) => (
            <Link 
              key={news.id} 
              href={`/noticias/${news.id}`}
              className="block bg-white border border-cresol-gray-light rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                {news.image_url ? (
                  <div className="md:w-1/3 h-56 md:h-auto relative overflow-hidden">
                    <Image
                      src={news.image_url}
                      alt={news.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover', objectPosition: 'center center' }}
                      className="h-full w-full"
                    />
                  </div>
                ) : (
                  <div className="md:w-1/3 h-56 md:h-auto bg-primary/5 flex items-center justify-center">
                    <span className="text-primary font-medium">Cresol</span>
                  </div>
                )}
                
                <div className="p-6 md:w-2/3">
                  <div className="flex flex-col h-full">
                    <div className="mb-auto">
                      <div className="flex justify-between items-start mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {news.category}
                        </span>
                        <span className="text-xs text-cresol-gray">
                          {formatDate(news.created_at)}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-cresol-gray mb-3">{news.title}</h3>
                      <p className="text-cresol-gray mb-4">{news.summary}</p>
                    </div>
                    <div className="text-primary text-sm font-medium">
                      Leia mais →
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 