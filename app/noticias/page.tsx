'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OptimizedImage from '@/app/components/OptimizedImage';
import { supabase } from '@/lib/supabase';
import Footer from '../components/Footer';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  created_at: string;
  category: string;
  author: string;
}

export default function NoticiasPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }
      setUser(data.user);

      try {
        // Carregar notícias do Supabase
        const { data: newsData, error } = await supabase
          .from('sector_news')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Erro ao buscar notícias:', error);
          setNews([]);
        } else {
          // Formatar dados do Supabase
          const formattedNews = (newsData || []).map((item: any) => ({
            ...item,
            category: 'Notícia', // Podemos buscar a categoria do setor posteriormente
            author: 'Cresol' // Podemos buscar o autor posteriormente
          }));
          setNews(formattedNews);
        }

        // Extrair categorias únicas dos dados reais
        const formattedNewsForCategories = (newsData || []).map((item: any) => ({ ...item, category: 'Notícia' }));
        const uniqueCategories = Array.from(new Set(formattedNewsForCategories.map((item: any) => item.category)));
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Erro:', err);
        setNews([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  // Formatador de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Filtrar notícias por categoria
  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner"></div>
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
                  src="/logo-cresol.png" 
                  alt="Logo Cresol" 
                  fill
                  sizes="(max-width: 768px) 100vw, 96px"
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl font-medium text-title">Portal Cresol</h1>
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
        <div className="mb-8">
          <h1 className="heading-1 mb-2">Notícias</h1>
          <p className="body-text text-muted">Acompanhe as últimas atualizações e comunicados da Cresol.</p>
        </div>

        {/* Filtro por categoria */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedCategory === 'all' 
                ? 'btn-primary' 
                : 'bg-white text-muted border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Todas
          </button>
          {categories.map((category) => (
            <button 
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === category 
                  ? 'btn-primary' 
                  : 'bg-white text-muted border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Lista de notícias vazia */}
        {filteredNews.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="heading-3 mb-2">Nenhuma notícia encontrada</h3>
            <p className="body-text text-muted">
              {selectedCategory === 'all' 
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
                className="card hover:shadow-md transition-all duration-200 hover:-translate-y-1 block"
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
                      <span className="badge-success">
                        {item.category}
                      </span>
                      <span className="text-xs text-muted">
                        {formatDate(item.created_at)}
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