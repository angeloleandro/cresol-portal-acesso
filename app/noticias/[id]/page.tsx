'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import AuthGuard from '@/app/components/AuthGuard';
import { useAuth } from '@/app/providers/AuthProvider';
import OptimizedImage from '@/app/components/OptimizedImage';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { FormatDate } from '@/lib/utils/formatters';
import { fetchNewsById, getRelatedNews } from '@/lib/utils/news-helpers';
import type { UnifiedNewsItem } from '@/types/news';

import Breadcrumb from '../../components/Breadcrumb';

function NoticiaDetalheContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user, profile } = useAuth();
  
  const [news, setNews] = useState<UnifiedNewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState<UnifiedNewsItem[]>([]);

  useEffect(() => {
    const loadNewsData = async () => {
      try {
        // Buscar notícia específica usando busca unificada
        const newsData = await fetchNewsById(id);
        
        if (!newsData) {
          router.push('/noticias');
          return;
        }
        
        setNews(newsData);

        // Buscar notícias relacionadas baseado no tipo
        const relatedData = await getRelatedNews({
          newsId: id,
          source: newsData.source,
          sector_id: newsData.sector_id,
          limit: 3
        });
        
        setRelatedNews(relatedData);
        
      } catch (error) {
        console.error('Erro ao carregar notícia:', error);
        router.push('/noticias');
        return;
      } finally {
        setLoading(false);
      }
    };

    loadNewsData();
  }, [router, id]);

  // Formatador de data

  // Função para renderizar HTML como conteúdo
  const renderHTML = (html: string) => {
    return { __html: html };
  };

  if (loading) {
    return (
      <UnifiedLoadingSpinner 
        fullScreen={true}
        size="large" 
        message={LOADING_MESSAGES.news} 
      />
    );
  }

  if (!news) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-cresol-gray text-xl">Notícia não encontrada</p>
          <Link href="/noticias" className="mt-4 inline-block text-primary hover:underline">
            Voltar para todas as notícias
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cresol-gray-light/30">
      {/* Header simples com botão de voltar */}
      <header className="bg-white border-b border-cresol-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
                          <Link href="/home" className="flex items-center">
              <div className="relative h-10 w-24 mr-3">
                <OptimizedImage 
                  src="/logo-horizontal-laranja.svg" 
                  alt="Logo Cresol" 
                  fill
                  sizes="(max-width: 768px) 100vw, 96px"
                  className="object-contain"
                />
              </div>
              <p className="text-primary text-xl tracking-wide">
                <span className="font-bold">HUB</span>{" "}
                <span className="font-light">2.0</span>{" - "}
                <span className="font-bold">Cresol Fronteiras</span>{" "}
                <span className="font-light">PR/SC/SP/ES</span>
              </p>
            </Link>
          </div>
          
          <Link 
            href="/noticias" 
            className="inline-flex items-center text-sm text-cresol-gray hover:text-primary"
          >
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para Notícias
          </Link>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Notícias', href: '/noticias' },
              { label: news.title }
            ]} 
          />
        </div>

        {/* Cabeçalho da notícia */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              news.source === 'general' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {news.category}
            </span>
            {(news.priority && news.priority > 5) || news.is_featured ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Destaque
              </span>
            ) : null}
            <span className="text-sm text-cresol-gray">
              {FormatDate(news.created_at)}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-cresol-gray mb-4">{news.title}</h1>
          <p className="text-xl text-cresol-gray mb-4">{news.summary}</p>
          <p className="text-sm text-cresol-gray">Por: {news.author}</p>
        </div>

        {/* Imagem principal (se disponível) */}
        {news.image_url && (
          <div className="mb-8 rounded-lg overflow-hidden max-w-3xl mx-auto">
            <div className="relative w-full h-96">
              <OptimizedImage
                src={news.image_url}
                alt={news.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        )}

        {/* Conteúdo da notícia */}
        <div className="bg-white rounded-lg border border-cresol-gray-light p-6 mb-8">
          <div 
            className="prose max-w-none prose-headings:text-cresol-gray prose-p:text-cresol-gray prose-li:text-cresol-gray prose-a:text-primary"
            dangerouslySetInnerHTML={renderHTML(news.content)}
          />
        </div>

        {/* Notícias relacionadas */}
        {relatedNews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary mb-4">Notícias relacionadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedNews.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/noticias/${item.id}`}
                  className="block bg-white rounded-lg border border-cresol-gray-light overflow-hidden hover:border-card-hover/60 transition-colors"
                >
                  {item.image_url && (
                    <div className="relative h-40 w-full bg-cresol-gray-light">
                      <OptimizedImage
                        src={item.image_url}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.source === 'general' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.category}
                      </span>
                      {(item.priority && item.priority > 5) || item.is_featured ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Destaque
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-base font-semibold text-cresol-gray mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-cresol-gray mb-2 line-clamp-2">{item.summary}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-cresol-gray">
                        {FormatDate(item.created_at)}
                      </span>
                      <span className="text-primary font-medium">
                        Leia mais →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function NoticiaDetalhePage() {
  return (
    <AuthGuard loadingMessage={LOADING_MESSAGES.news}>
      <NoticiaDetalheContent />
    </AuthGuard>
  );
} 