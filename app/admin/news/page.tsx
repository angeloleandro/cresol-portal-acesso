'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import AuthGuard from '@/app/components/AuthGuard';
import { useAuth } from '@/app/providers/AuthProvider';
import { useAdminData } from '@/app/admin/hooks';
import { StandardizedButton } from '@/app/components/admin';
import AdminHeader from '@/app/components/AdminHeader';
import { useAlert } from '@/app/components/alerts';
import Breadcrumb from '@/app/components/Breadcrumb';
import { FormSelect } from '@/app/components/forms';
import { Icon } from '@/app/components/icons/Icon';
import DeleteModal from '@/app/components/ui/DeleteModal';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

import { NewsForm } from './components/NewsForm';
import { AdminActionMenu } from '@/app/components/ui/AdminActionMenu';

import { FormatDate } from '@/lib/utils/formatters';
interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  is_featured: boolean;
  show_on_homepage: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  type: 'sector' | 'subsector';
  location_name?: string;
  location_id?: string;
  sector_name?: string;
  [key: string]: unknown;
}

function NewsAdminPageContent() {
  const alert = useAlert();
  const { user } = useAuth();
  const { 
    data: news, 
    loading, 
    stats, 
    pagination, 
    filters, 
    updateFilters, 
    updatePagination, 
    reload 
  } = useAdminData<News>({
    endpoint: 'news',
    initialFilters: {
      search: '',
      type: 'all',
      status: 'all',
      featured: 'all',
      sector_id: '',
      subsector_id: ''
    },
    debounceMs: 500
  });
  
  const [sectors, setSectors] = useState<any[]>([]);
  const [subsectors, setSubsectors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Carregar dados iniciais (setores e subsetores)
  const loadInitialData = useCallback(async () => {
    try {
      const [sectorsData, subsectorsData] = await Promise.all([
        supabase.from('sectors').select('id, name').order('name'),
        supabase.from('subsectors').select('id, name, sector_id, sectors(name)').order('name')
      ]);
      
      setSectors(sectorsData.data || []);
      setSubsectors(subsectorsData.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  }, []);

  // Carregar dados iniciais quando usuário estiver autenticado
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user, loadInitialData]);

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingNews(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNews(null);
  };

  const handleSuccess = () => {
    reload(); // Recarregar a lista
  };

  const handleAction = async (action: string, newsItem: News) => {
    try {
      setActionLoading(`${action}-${newsItem.id}`);
      
      // Obter sessão atual para autorização
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert.showError('Erro', 'Sessão expirada, faça login novamente');
        return;
      }

      const response = await fetch(
        `/api/admin/news?id=${newsItem.id}&type=${newsItem.type}&action=${action}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        alert.showSuccess('Sucesso', data.message);
        reload();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error(`Erro na ação ${action}:`, error);
      alert.showError('Erro', error.message || `Erro ao executar ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeature = async (newsItem: News) => {
    const action = newsItem.is_featured ? 'unfeature' : 'feature';
    await handleAction(action, newsItem);
  };

  const handleToggleHomepage = async (newsItem: News) => {
    const action = newsItem.show_on_homepage ? 'unhomepage' : 'homepage';
    await handleAction(action, newsItem);
  };

  const deleteModal = useDeleteModal<News>('notícia');

  const handleDelete = async (newsItem: News) => {
    try {
      setActionLoading(`delete-${newsItem.id}`);
      
      // Obter sessão atual para autorização
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert.showError('Erro', 'Sessão expirada, faça login novamente');
        return;
      }

      const response = await fetch(
        `/api/admin/news?id=${newsItem.id}&type=${newsItem.type}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        alert.showSuccess('Sucesso', 'Notícia excluída com sucesso');
        reload();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      alert.showError('Erro', error.message || 'Erro ao excluir notícia');
    } finally {
      setActionLoading(null);
    }
  };

  const getFilteredSubsectors = () => {
    if (!filters.sector_id) return subsectors;
    return subsectors.filter(sub => sub.sector_id === filters.sector_id);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} />
      
      {/* Loading Overlay */}
      {loading && news.length === 0 && (
        <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center">
          <UnifiedLoadingSpinner 
            size="default" 
            message="Carregando notícias..."
          />
        </div>
      )}
      
      <main className="container py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Início', href: '/home', icon: 'house' },
            { label: 'Administração', href: '/admin' },
            { label: 'Notícias' }
          ]}
        />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-1 mb-2">Gerenciamento de Notícias</h1>
            <p className="body-text text-muted">
              Gerencie notícias de setores e subsetores de forma centralizada
            </p>
          </div>
          <StandardizedButton
            variant="primary"
            onClick={handleCreate}
          >
            <Icon name="plus" className="h-4 w-4 mr-2" />
            Nova Notícia
          </StandardizedButton>
        </div>

        {/* Estatísticas */}
        <div className="grid-modern-stats mb-8">
          <div className="stat-card-orange">
            <div className="flex items-center">
              <div className="icon-container-orange mr-5 flex-shrink-0">
                <Icon name="file-text" className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="stat-value mb-1">
                  {stats?.total || 0}
                </div>
                <div className="stat-label">
                  Total
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card-orange">
            <div className="flex items-center">
              <div className="icon-container-orange mr-5 flex-shrink-0">
                <Icon name="check-circle" className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="stat-value mb-1">
                  {stats?.published || 0}
                </div>
                <div className="stat-label">
                  Publicadas
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card-orange">
            <div className="flex items-center">
              <div className="icon-container-orange mr-5 flex-shrink-0">
                <Icon name="edit" className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="stat-value mb-1">
                  {stats?.drafts || 0}
                </div>
                <div className="stat-label">
                  Rascunhos
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card-orange">
            <div className="flex items-center">
              <div className="icon-container-orange mr-5 flex-shrink-0">
                <Icon name="star" className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="stat-value mb-1">
                  {stats?.featured || 0}
                </div>
                <div className="stat-label">
                  Em Destaque
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Busca */}
            <div className="xl:col-span-2">
              <label className="label">Buscar</label>
              <div className="relative">
                <Icon name="search" className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="Título, resumo ou conteúdo..."
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="input !pl-12 h-10"
                />
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label className="label">Tipo</label>
              <FormSelect
                value={filters.type}
                onChange={(e) => updateFilters({ type: e.target.value, sector_id: '', subsector_id: '' })}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'sector', label: 'Setor' },
                  { value: 'subsector', label: 'Subsetor' }
                ]}
                placeholder="Selecione o tipo"
              />
            </div>

            {/* Status */}
            <div>
              <label className="label">Status</label>
              <FormSelect
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value })}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'published', label: 'Publicadas' },
                  { value: 'draft', label: 'Rascunhos' }
                ]}
                placeholder="Selecione o status"
              />
            </div>

            {/* Destaque */}
            <div>
              <label className="label">Destaque</label>
              <FormSelect
                value={filters.featured}
                onChange={(e) => updateFilters({ featured: e.target.value })}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'featured', label: 'Em destaque' },
                  { value: 'not_featured', label: 'Sem destaque' }
                ]}
                placeholder="Selecione o destaque"
              />
              <p className="text-xs text-muted mt-1">
                Notícias em destaque aparecem na homepage
              </p>
            </div>

            {/* Setor */}
            <div>
              <label className="label">Setor</label>
              <FormSelect
                value={filters.sector_id}
                onChange={(e) => updateFilters({ sector_id: e.target.value, subsector_id: '' })}
                options={[
                  { value: '', label: 'Todos os setores' },
                  ...sectors.map(sector => ({
                    value: sector.id,
                    label: sector.name
                  }))
                ]}
                placeholder="Selecione o setor"
              />
            </div>
          </div>

          {/* Subsetor */}
          {filters.sector_id && (
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
              <div className="md:col-start-6">
                <label className="label">Subsetor</label>
                <FormSelect
                  value={filters.subsector_id}
                  onChange={(e) => updateFilters({ subsector_id: e.target.value })}
                  options={[
                    { value: '', label: 'Todos os subsetores' },
                    ...getFilteredSubsectors().map(subsector => ({
                      value: subsector.id,
                      label: subsector.name
                    }))
                  ]}
                  placeholder="Selecione o subsetor"
                />
              </div>
            </div>
          )}
        </div>

        {/* Lista de notícias */}
        {loading ? (
          <div className="card p-12 text-center">
            <UnifiedLoadingSpinner size="large" message="Carregando notícias..." />
          </div>
        ) : news.length === 0 ? (
          <div className="card p-12 text-center">
            <Icon name="file-text" className="h-16 w-16 text-muted mx-auto mb-4" />
            <h3 className="heading-3 mb-2">Nenhuma notícia encontrada</h3>
            <p className="body-text text-muted mb-6">
              Não há notícias que correspondam aos filtros aplicados.
            </p>
            <StandardizedButton variant="primary" onClick={handleCreate}>
              <Icon name="plus" className="h-4 w-4 mr-2" />
              Criar primeira notícia
            </StandardizedButton>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {news.map((newsItem) => (
                <div key={newsItem.id} className="card p-6">
                  <div className="flex items-start space-x-4">
                    {/* Imagem */}
                    {newsItem.image_url && (
                      <div className="flex-shrink-0">
                        <Image
                          src={newsItem.image_url}
                          alt={newsItem.title}
                          width={96}
                          height={96}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Tags e metadata */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`badge ${newsItem.type === 'sector' ? 'badge-primary' : 'badge-secondary'}`}>
                                {newsItem.type === 'sector' ? 'Setor' : 'Subsetor'}
                              </span>
                              
                              <span className="badge badge-outline">
                                {newsItem.location_name}
                              </span>

                              <span className={`badge ${newsItem.is_published ? 'badge-success' : 'badge-outline'}`}>
                                {newsItem.is_published ? 'Publicada' : 'Rascunho'}
                              </span>
                            </div>
                            
                            {/* Controles separados para destaque e homepage */}
                            <div className="flex flex-col space-y-3">
                              {/* Toggle de destaque no setor */}
                              <div className="flex items-center space-x-2">
                                <label className="flex items-center cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    checked={newsItem.is_featured}
                                    onChange={() => handleToggleFeature(newsItem)}
                                    disabled={actionLoading === `feature-${newsItem.id}` || actionLoading === `unfeature-${newsItem.id}`}
                                    className="sr-only"
                                  />
                                  <div className={`relative flex items-center h-6 w-11 rounded-full transition-colors duration-200 ease-in-out 
                                    ${newsItem.is_featured ? 'bg-green-500' : 'bg-gray-200'} 
                                    ${actionLoading === `feature-${newsItem.id}` || actionLoading === `unfeature-${newsItem.id}` ? 'opacity-50 cursor-not-allowed' : 'group-hover:shadow-md'}`}
                                  >
                                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out 
                                      ${newsItem.is_featured ? 'translate-x-6' : 'translate-x-1'}`} />
                                  </div>
                                </label>
                                
                                <div className="flex flex-col items-start">
                                  <span className="text-xs font-medium text-gray-700">
                                    {newsItem.is_featured ? 'Destacada' : 'Destacar'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    No setor
                                  </span>
                                </div>
                              </div>

                              {/* Toggle de publicação na homepage */}
                              <div className="flex items-center space-x-2">
                                <label className="flex items-center cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    checked={newsItem.show_on_homepage}
                                    onChange={() => handleToggleHomepage(newsItem)}
                                    disabled={actionLoading === `homepage-${newsItem.id}` || actionLoading === `unhomepage-${newsItem.id}`}
                                    className="sr-only"
                                  />
                                  <div className={`relative flex items-center h-6 w-11 rounded-full transition-colors duration-200 ease-in-out 
                                    ${newsItem.show_on_homepage ? 'bg-primary' : 'bg-gray-200'} 
                                    ${actionLoading === `homepage-${newsItem.id}` || actionLoading === `unhomepage-${newsItem.id}` ? 'opacity-50 cursor-not-allowed' : 'group-hover:shadow-md'}`}
                                  >
                                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out 
                                      ${newsItem.show_on_homepage ? 'translate-x-6' : 'translate-x-1'}`} />
                                  </div>
                                </label>
                                
                                <div className="flex flex-col items-start">
                                  <span className="text-xs font-medium text-gray-700">
                                    {newsItem.show_on_homepage ? 'Na Homepage' : 'Publicar'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Homepage geral
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Título e resumo */}
                          <h3 className="heading-3 mb-2">{newsItem.title}</h3>
                          <p className="body-text text-muted mb-4">
                            {truncateText(newsItem.summary, 200)}
                          </p>

                          {/* Dados da notícia */}
                          <div className="flex items-center space-x-4 text-sm text-muted">
                            <span>Criada em {FormatDate(newsItem.created_at)}</span>
                            {newsItem.updated_at !== newsItem.created_at && (
                              <span>• Editada em {FormatDate(newsItem.updated_at)}</span>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex-shrink-0">
                          <AdminActionMenu
                            items={[
                              {
                                label: 'Editar',
                                icon: 'edit',
                                onClick: () => handleEdit(newsItem),
                              },
                              {
                                label: newsItem.is_published ? 'Despublicar' : 'Publicar',
                                icon: newsItem.is_published ? 'eye-slash' : 'eye',
                                onClick: () => handleAction(newsItem.is_published ? 'unpublish' : 'publish', newsItem),
                              },
                              {
                                label: newsItem.is_featured ? 'Remover destaque do setor' : 'Destacar no setor',
                                icon: 'star',
                                onClick: () => handleAction(newsItem.is_featured ? 'unfeature' : 'feature', newsItem),
                              },
                              {
                                label: newsItem.show_on_homepage ? 'Remover da homepage' : 'Publicar na homepage',
                                icon: 'house',
                                onClick: () => handleAction(newsItem.show_on_homepage ? 'unhomepage' : 'homepage', newsItem),
                              },
                              {
                                label: 'Duplicar',
                                icon: 'copy',
                                onClick: () => handleAction('duplicate', newsItem),
                              },
                              {
                                label: 'Excluir',
                                icon: 'trash',
                                onClick: () => deleteModal.openDeleteModal(newsItem, newsItem.title),
                                variant: 'danger',
                                showDivider: true,
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <p className="body-small text-muted">
                  Mostrando {news.length} de {pagination.totalCount} notícias
                </p>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updatePagination({ currentPage: pagination.currentPage - 1 })}
                    disabled={pagination.currentPage === 1}
                    className="btn btn-ghost btn-sm"
                  >
                    <Icon name="chevron-left" className="h-4 w-4" />
                  </button>
                  
                  <span className="body-small">
                    Página {pagination.currentPage} de {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => updatePagination({ currentPage: pagination.currentPage + 1 })}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="btn btn-ghost btn-sm"
                  >
                    <Icon name="chevron-right" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de notícia */}
      <NewsForm
        news={editingNews}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />

      {/* Modal de exclusão */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.confirmDelete(handleDelete)}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}

export default function NewsAdminPage() {
  return (
    <AuthGuard requireRole="admin">
      <NewsAdminPageContent />
    </AuthGuard>
  );
}