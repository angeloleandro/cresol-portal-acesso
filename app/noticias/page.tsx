'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

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

  // Dados de exemplo (remover quando implementar a busca no Supabase)
  const sampleNews = [
    {
      id: '1',
      title: 'Resultados financeiros do 3º trimestre superaram expectativas',
      summary: 'Os resultados financeiros do terceiro trimestre de 2025 superaram todas as expectativas, com crescimento de 15% nas operações de crédito.',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.',
      image_url: '/images/news/financial-results.jpg',
      created_at: '2025-05-12T10:30:00Z',
      category: 'Financeiro',
      author: 'Departamento Financeiro'
    },
    {
      id: '2',
      title: 'Nova campanha de captação de associados',
      summary: 'A Cresol lança hoje sua nova campanha de captação de associados com condições especiais para novos cooperados.',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.',
      image_url: '/images/news/campaign.jpg',
      created_at: '2025-05-10T14:15:00Z',
      category: 'Marketing',
      author: 'Equipe de Marketing'
    },
    {
      id: '3',
      title: 'Treinamento sobre sustentabilidade para colaboradores',
      summary: 'Participe do novo treinamento sobre práticas sustentáveis e ESG que será realizado no próximo mês.',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.',
      image_url: '/images/news/sustainability.jpg',
      created_at: '2025-05-08T09:45:00Z',
      category: 'Treinamento',
      author: 'Recursos Humanos'
    },
    {
      id: '4',
      title: 'Novo sistema de gestão de atendimento será implantado',
      summary: 'Com o objetivo de melhorar a experiência dos associados, um novo sistema de gestão de atendimento será implantado em todas as agências.',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.',
      image_url: '/images/news/system.jpg',
      created_at: '2025-05-05T08:00:00Z',
      category: 'Tecnologia',
      author: 'Departamento de TI'
    },
    {
      id: '5',
      title: 'Assembleia Geral aprova distribuição de sobras',
      summary: 'Em reunião realizada na última semana, a Assembleia Geral aprovou a distribuição de sobras operacionais referentes ao exercício de 2024.',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.',
      image_url: '/images/news/assembly.jpg',
      created_at: '2025-05-01T16:45:00Z',
      category: 'Institucional',
      author: 'Conselho Administrativo'
    },
  ];

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
          // Usa dados de exemplo como fallback
          setNews(sampleNews);
        } else if (newsData && newsData.length > 0) {
          setNews(newsData.map(item => ({
            ...item,
            category: 'Notícia', // Podemos buscar a categoria do setor posteriormente
            author: 'Cresol' // Podemos buscar o autor posteriormente
          })));
        } else {
          // Se não tiver dados, use os exemplos
          setNews(sampleNews);
        }

        // Extrair categorias únicas
        const newsToUse = newsData && newsData.length > 0 ? 
          newsData.map(item => ({ ...item, category: 'Notícia' })) : 
          sampleNews;
        const uniqueCategories = Array.from(new Set(newsToUse.map(item => item.category)));
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Erro:', err);
        setNews(sampleNews);
        const uniqueCategories = Array.from(new Set(sampleNews.map(item => item.category)));
        setCategories(uniqueCategories);
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-cresol-gray">Carregando...</p>
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
            <Link href="/dashboard" className="flex items-center">
              <div className="relative h-10 w-24 mr-3">
                <Image 
                  src="/logo-cresol.png" 
                  alt="Logo Cresol" 
                  fill
                  sizes="(max-width: 768px) 100vw, 96px"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <h1 className="text-xl font-semibold text-cresol-gray">Portal Cresol</h1>
            </Link>
          </div>
          
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-cresol-gray hover:text-primary"
          >
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para Início
          </Link>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Notícias</h1>
          <p className="text-cresol-gray">Acompanhe as últimas atualizações e comunicados da Cresol.</p>
        </div>

        {/* Filtro por categoria */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-white text-cresol-gray border border-cresol-gray-light hover:bg-primary/10'
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
                  ? 'bg-primary text-white' 
                  : 'bg-white text-cresol-gray border border-cresol-gray-light hover:bg-primary/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Lista de notícias */}
        {filteredNews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-8 text-center">
            <p className="text-cresol-gray">Nenhuma notícia encontrada nesta categoria.</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-5xl mx-auto">
            {filteredNews.map((item) => (
              <Link 
                key={item.id} 
                href={`/noticias/${item.id}`}
                className="block bg-white rounded-lg shadow-sm border border-cresol-gray-light overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {item.image_url && (
                    <div className="md:w-1/3 h-56 md:h-auto relative">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="p-6 md:w-2/3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {item.category}
                      </span>
                      <span className="text-xs text-cresol-gray">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-cresol-gray mb-2">{item.title}</h2>
                    <p className="text-cresol-gray mb-4">{item.summary}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-cresol-gray">
                        Por: {item.author}
                      </span>
                      <span className="text-primary text-sm font-medium">
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
    </div>
  );
} 