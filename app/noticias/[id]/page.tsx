'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function NoticiaDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);

  // Dados de exemplo (remover quando implementar a busca no Supabase)
  const sampleNews = [
    {
      id: '1',
      title: 'Resultados financeiros do 3º trimestre superaram expectativas',
      summary: 'Os resultados financeiros do terceiro trimestre de 2025 superaram todas as expectativas, com crescimento de 15% nas operações de crédito.',
      content: `<p>A Cresol anuncia com satisfação que os resultados financeiros do terceiro trimestre de 2025 superaram significativamente as expectativas projetadas, com um crescimento notável de 15% nas operações de crédito em comparação ao mesmo período do ano anterior.</p>
      
      <p>Entre os destaques do período estão:</p>
      
      <ul>
        <li>Aumento de 22% na captação de novos associados</li>
        <li>Crescimento de 18% na carteira de crédito rural</li>
        <li>Expansão de 12% nos depósitos totais</li>
        <li>Redução de 5% na inadimplência</li>
      </ul>
      
      <p>"Estes resultados refletem a confiança de nossos associados e a eficácia de nossa estratégia de crescimento sustentável", afirmou o diretor financeiro em comunicado oficial.</p>
      
      <p>A cooperativa também destaca que os investimentos em tecnologia e capacitação das equipes contribuíram significativamente para a melhoria nos indicadores operacionais e na qualidade do atendimento.</p>
      
      <p>Para o próximo trimestre, a expectativa é de manutenção da trajetória de crescimento, com foco especial no fortalecimento das iniciativas de sustentabilidade e apoio ao desenvolvimento regional.</p>`,
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
        // Buscar notícia específica do Supabase
        const { data: newsData, error } = await supabase
          .from('sector_news')
          .select('*')
          .eq('id', id)
          .eq('is_published', true)
          .single();
          
        if (error) {
          console.error('Erro ao buscar notícia:', error);
          // Tenta encontrar nos dados de exemplo
          const foundNews = sampleNews.find(item => item.id === id);
          if (!foundNews) {
            router.push('/noticias');
            return;
          }
          setNews(foundNews);

          // Notícias relacionadas dos exemplos
          const related = sampleNews
            .filter(item => item.category === foundNews.category && item.id !== id)
            .slice(0, 3);
          setRelatedNews(related);
        } else {
          // Adicionar campos necessários
          const formattedNews = {
            ...newsData,
            category: 'Notícia', // Podemos buscar a categoria do setor posteriormente
            author: 'Cresol'     // Podemos buscar o autor posteriormente
          };
          setNews(formattedNews);

          // Buscar notícias relacionadas do mesmo setor
          const { data: relatedData, error: relatedError } = await supabase
            .from('sector_news')
            .select('*')
            .eq('sector_id', newsData.sector_id)
            .eq('is_published', true)
            .neq('id', id)
            .order('created_at', { ascending: false })
            .limit(3);
            
          if (relatedError || !relatedData || relatedData.length === 0) {
            // Usar exemplos se não encontrar relacionadas
            const related = sampleNews
              .filter(item => item.id !== id)
              .slice(0, 3);
            setRelatedNews(related);
          } else {
            // Formatar notícias relacionadas
            const formattedRelated = relatedData.map(item => ({
              ...item,
              category: 'Notícia',
              author: 'Cresol'
            }));
            setRelatedNews(formattedRelated);
          }
        }
      } catch (error) {
        console.error('Erro geral:', error);
        router.push('/noticias');
        return;
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router, id]);

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

  // Função para renderizar HTML como conteúdo
  const renderHTML = (html: string) => {
    return { __html: html };
  };

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
        {/* Cabeçalho da notícia */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {news.category}
            </span>
            <span className="text-sm text-cresol-gray">
              {formatDate(news.created_at)}
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
              <Image
                src={news.image_url}
                alt={news.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                className="rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Conteúdo da notícia */}
        <div className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-6 mb-8">
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
                  className="block bg-white rounded-lg shadow-sm border border-cresol-gray-light overflow-hidden hover:shadow-md transition-shadow"
                >
                  {item.image_url && (
                    <div className="relative h-40 w-full bg-cresol-gray-light">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
                      {item.category}
                    </span>
                    <h3 className="text-base font-semibold text-cresol-gray mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-cresol-gray mb-2 line-clamp-2">{item.summary}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-cresol-gray">
                        {formatDate(item.created_at)}
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