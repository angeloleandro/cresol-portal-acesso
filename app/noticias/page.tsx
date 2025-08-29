'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import AuthGuard from '@/app/components/AuthGuard';
import OptimizedImage from '@/app/components/OptimizedImage';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { FormatDate } from '@/lib/utils/formatters';
import { fetchUnifiedNews, filterNewsByCategory } from '@/lib/utils/news-helpers';
import type { UnifiedNewsItem, NewsCategory } from '@/types/news';

import Breadcrumb from '../components/Breadcrumb';
import Footer from '../components/Footer';

function NoticiasPageContent() {
  const [allNews, setAllNews] = useState<UnifiedNewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('Todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUnifiedNews = async () => {
      try {
        const response = await fetchUnifiedNews();
        setAllNews(response.news);
      } catch (err) {
        console.error('Erro ao carregar notícias:', err);
        setAllNews([]);
      } finally {
        setLoading(false);
      }
    };

    loadUnifiedNews();
  }, []);


  // Filtrar notícias por categoria
  const filteredNews = filterNewsByCategory(allNews, selectedCategory);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
<UnifiedLoadingSpinner 
            size="default" 
            message={LOADING_MESSAGES.news}
          />
          <p className="mt-4 text-muted">Carregando notícias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header padronizado */}
      <header className="bg-white border-b" style={{ borderColor: 'var(--color-gray-light)' }}>
        <div className="container py-4 flex items-center justify-between">
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
            href="/home" 
            className="inline-flex items-center text-sm text-muted hover:text-primary transition-colors"
          >
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para Início
          </Link>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Notícias' }
            ]} 
          />
        </div>

        <div className="mb-8">
          <h1 className="heading-1 mb-2">Notícias</h1>
          <p className="body-text text-muted">Acompanhe as últimas atualizações e comunicados da Cresol.</p>
        </div>

        {/* Tabs de categorias */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav 
              className="-mb-px flex space-x-1 md:space-x-4 overflow-x-auto scrollbar-hide" 
              aria-label="Tabs de categorias"
              role="tablist"
            >
              {['Todas', 'Notícias Gerais', 'Setorial'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setSelectedCategory(tab as NewsCategory)}
                  className={`group relative flex-shrink-0 py-3 px-4 md:px-6 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1 ${
                    selectedCategory === tab 
                      ? 'border-primary text-primary bg-primary/5 shadow-sm transform-gpu' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/80 active:bg-gray-100/60 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                  role="tab"
                  aria-current={selectedCategory === tab ? 'page' : undefined}
                  aria-selected={selectedCategory === tab}
                  tabIndex={selectedCategory === tab ? 0 : -1}
                >
                  <span className="relative z-20 tracking-wide">{tab}</span>
                  
                  {/* Active background with subtle gradient */}
                  {selectedCategory === tab && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-primary/5 to-primary/3 rounded-t-md z-10" />
                  )}
                  
                  {/* Hover shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden rounded-t-md">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                  </div>
                  
                  {/* Focus indicator */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-200 group-focus:w-full" />
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Lista de notícias vazia */}
        {filteredNews.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="heading-3 mb-2">Nenhuma notícia encontrada</h3>
            <p className="body-text text-muted">
              {selectedCategory === 'Todas' 
                ? 'Não há notícias publicadas no momento.' 
                : `Não há notícias na categoria "${selectedCategory}".`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredNews.map((item) => (
              <Link 
                key={item.id} 
                href={`/noticias/${item.id}`}
                className="card transition-all duration-200 block"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Imagem */}
                  {item.image_url && (
                    <div className="relative w-full md:w-1/3 h-48 md:h-auto min-h-[200px] bg-gray-100 rounded-lg overflow-hidden">
                      <OptimizedImage
                        src={item.image_url}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Conteúdo */}
                  <div className={`p-6 ${item.image_url ? 'md:w-2/3' : 'w-full'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                      <span className="text-xs text-muted">
                        {FormatDate(item.created_at)}
                      </span>
                    </div>
                    <h2 className="heading-3 mb-3">{item.title}</h2>
                    <p className="body-text text-muted mb-4 line-clamp-3">{item.summary}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted">
                        Por: {item.author}
                      </span>
                      <span className="text-primary font-medium text-sm">
                        Leia mais →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default function NoticiasPage() {
  return (
    <AuthGuard loadingMessage={LOADING_MESSAGES.default}>
      <NoticiasPageContent />
    </AuthGuard>
  );
} 