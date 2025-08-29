'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import AuthGuard from '@/app/components/AuthGuard';
import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import { NewsManagement, BaseNews } from '@/app/components/management/NewsManagement';
import { GENERAL_NEWS_CONFIG } from '@/app/components/management/configs/news-config';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Interface específica para notícias gerais
interface GeneralNews extends BaseNews {
  priority: number;
}

function GeneralNewsAdminPageContent() {
  const { user } = useAuth();
  const [news, setNews] = useState<GeneralNews[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [totalDraftNewsCount, setTotalDraftNewsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Carregar notícias gerais
  const loadNews = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/general-news?includeUnpublished=${showDrafts}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar notícias');
      }
      
      const data = await response.json();
      setNews(data.data || []);
      
      // Carregar contagem de rascunhos se não estiver mostrando eles
      if (!showDrafts) {
        const draftsResponse = await fetch('/api/admin/general-news?includeUnpublished=true');
        if (draftsResponse.ok) {
          const draftsData = await draftsResponse.json();
          const draftCount = draftsData.data?.filter((item: GeneralNews) => !item.is_published).length || 0;
          setTotalDraftNewsCount(draftCount);
        }
      }
      
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
    } finally {
      setLoading(false);
    }
  }, [user, showDrafts]);

  // Carregar dados quando componente montar ou dependências mudarem
  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // Toggle entre rascunhos e publicadas
  const handleToggleDrafts = async () => {
    setShowDrafts(!showDrafts);
  };

  // Deletar notícia
  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/admin/general-news?id=${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao deletar notícia');
    }
    
    // Recarregar lista após deletar
    await loadNews();
  };

  // Filtrar notícias com base no estado atual
  const filteredNews = showDrafts 
    ? news.filter(item => !item.is_published)
    : news.filter(item => item.is_published);

  if (loading && news.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader user={user} />
        <main className="container py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted">Carregando notícias gerais...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} />
      
      <main className="container py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Início', href: '/home', icon: 'house' },
            { label: 'Administração', href: '/admin' },
            { label: 'Notícias Gerais' }
          ]}
        />

        {/* Cabeçalho da página */}
        <div className="mb-8">
          <h1 className="heading-1 mb-2">Notícias Gerais</h1>
          <p className="body-text text-muted">
            Gerencie notícias gerais que aparecem diretamente na homepage do portal
          </p>
        </div>

        {/* Componente de gerenciamento de notícias */}
        <div className="card">
          <NewsManagement<GeneralNews>
            news={filteredNews}
            showDrafts={showDrafts}
            totalDraftNewsCount={totalDraftNewsCount}
            onToggleDrafts={handleToggleDrafts}
            onRefresh={loadNews}
            onDelete={handleDelete}
            config={GENERAL_NEWS_CONFIG}
          />
        </div>
      </main>
    </div>
  );
}

export default function GeneralNewsAdminPage() {
  return (
    <AuthGuard requireRole="admin">
      <GeneralNewsAdminPageContent />
    </AuthGuard>
  );
}