'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

// [DEBUG] Component tracking
let _newsPageRenderCount = 0;
const _newsPageInstanceId = `news-page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

import { useAdminAuth, useAdminData } from '@/app/admin/hooks';
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

import { FormatDate } from '@/lib/utils/formatters';
interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  type: 'sector' | 'subsector';
  location_name?: string;
  location_id?: string;
  sector_name?: string;
}

export default function NewsAdminPage() {
  // [DEBUG] Component render tracking
  _newsPageRenderCount++;
  // Debug component render logging removed for production

  const alert = useAlert();
  const { user } = useAdminAuth();
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert.showError('Sessão expirada', 'Faça login novamente');
        return;
      }

      const response = await fetch(
        `/api/admin/news?id=${newsItem.id}&type=${newsItem.type}&action=${action}`,
        {
          headers: {
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

  const deleteModal = useDeleteModal('notícia');

  const handleDelete = async (newsItem: News) => {
    try {
      setActionLoading(`delete-${newsItem.id}`);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert.showError('Sessão expirada', 'Faça login novamente');
        setActionLoading('');
        return;
      }

      const response = await fetch(
        `/api/admin/news?id=${newsItem.id}&type=${newsItem.type}`,
        {
          headers: {
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
            className="flex items-center space-x-2"
          >
            <Icon name="plus" className="h-4 w-4" />
            <span>Nova Notícia</span>
          </StandardizedButton>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <Icon name="file-text" className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Total</p>
                <p className="text-2xl font-bold text-primary">{stats?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <Icon name="check-circle" className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Publicadas</p>
                <p className="text-2xl font-bold text-green-600">{stats?.published || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <Icon name="edit" className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Rascunhos</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.drafts || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <Icon name="star" className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Em Destaque</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.featured || 0}</p>
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
              <input
                type="text"
                placeholder="Título, resumo ou conteúdo..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="input"
              />
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
                <div key={newsItem.id} className="card p-6 hover:shadow-md transition-shadow">
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
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`badge ${newsItem.type === 'sector' ? 'badge-primary' : 'badge-secondary'}`}>
                              {newsItem.type === 'sector' ? 'Setor' : 'Subsetor'}
                            </span>
                            
                            <span className="badge badge-outline">
                              {newsItem.location_name}
                            </span>

                            {newsItem.is_featured && (
                              <span className="badge badge-warning">
                                <Icon name="star" className="h-3 w-3 mr-1" />
                                Destaque
                              </span>
                            )}

                            <span className={`badge ${newsItem.is_published ? 'badge-success' : 'badge-outline'}`}>
                              {newsItem.is_published ? 'Publicada' : 'Rascunho'}
                            </span>
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
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <StandardizedButton
                            variant="secondary"
                            size="sm"
                            icon={<Icon name="edit" className="h-4 w-4" />}
                            onClick={() => handleEdit(newsItem)}
                            disabled={actionLoading === `edit-${newsItem.id}`}
                          >
                            Editar
                          </StandardizedButton>

                          <StandardizedButton
                            variant={newsItem.is_published ? "warning" : "success"}
                            size="sm"
                            icon={<Icon name={newsItem.is_published ? "eye-slash" : "eye"} className="h-4 w-4" />}
                            onClick={() => handleAction(newsItem.is_published ? 'unpublish' : 'publish', newsItem)}
                            disabled={actionLoading === `${newsItem.is_published ? 'unpublish' : 'publish'}-${newsItem.id}`}
                            loading={actionLoading === `${newsItem.is_published ? 'unpublish' : 'publish'}-${newsItem.id}`}
                          >
                            {newsItem.is_published ? 'Despublicar' : 'Publicar'}
                          </StandardizedButton>

                          <StandardizedButton
                            variant={newsItem.is_featured ? "warning" : "secondary"}
                            size="sm"
                            icon={<Icon name="star" className="h-4 w-4" />}
                            onClick={() => handleAction(newsItem.is_featured ? 'unfeature' : 'feature', newsItem)}
                            disabled={actionLoading === `${newsItem.is_featured ? 'unfeature' : 'feature'}-${newsItem.id}`}
                          >
                            {newsItem.is_featured ? 'Remover destaque' : 'Destacar'}
                          </StandardizedButton>

                          <StandardizedButton
                            variant="secondary"
                            size="sm"
                            icon={<Icon name="copy" className="h-4 w-4" />}
                            onClick={() => handleAction('duplicate', newsItem)}
                            disabled={actionLoading === `duplicate-${newsItem.id}`}
                          >
                            Duplicar
                          </StandardizedButton>

                          <StandardizedButton
                            variant="danger"
                            size="sm"
                            icon={<Icon name="trash" className="h-4 w-4" />}
                            onClick={() => deleteModal.openDeleteModal(newsItem, newsItem.title)}
                            disabled={actionLoading === `delete-${newsItem.id}`}
                          >
                            Excluir
                          </StandardizedButton>
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