'use client';

import React, { useState, useEffect } from 'react';
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

import { MessageForm } from './components/MessageForm';
import { AdminActionMenu } from '@/app/components/ui/AdminActionMenu';

import { FormatDate } from '@/lib/utils/formatters';
interface Message {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  type: 'sector' | 'subsector';
  location_name?: string;
  location_id?: string;
  sector_name?: string;
  author_name?: string;
  group_name?: string;
  group_color?: string;
  [key: string]: unknown;
}


function MessagesAdminPageContent() {
  const alert = useAlert();
  const { user } = useAuth();
  const { 
    data: messages, 
    loading, 
    stats, 
    pagination, 
    filters, 
    updateFilters, 
    updatePagination, 
    reload 
  } = useAdminData<Message>({
    endpoint: 'messages',
    initialFilters: {
      search: '',
      type: 'all',
      status: 'all',
      sector_id: '',
      subsector_id: ''
    },
    debounceMs: 500
  });
  
  const [sectors, setSectors] = useState<any[]>([]);
  const [subsectors, setSubsectors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  
  // Modal de exclusão
  const deleteModal = useDeleteModal<Message>('mensagem');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadInitialData = async () => {
    try {
      // Carregar setores
      const { data: sectorsData } = await supabase
        .from('sectors')
        .select('id, name')
        .order('name');
      
      setSectors(sectorsData || []);

      // Carregar subsetores
      const { data: subsectorsData } = await supabase
        .from('subsectors')
        .select('id, name, sector_id, sectors(name)')
        .order('name');
      
      setSubsectors(subsectorsData || []);
    } catch (error) {

    }
  };

  // Carregar dados iniciais (setores e subsetores)
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const handleToggleStatus = async (message: Message) => {
    const action = message.is_published ? 'unpublish' : 'publish';
    const messageKey = `${message.type}-${message.id}`;
    
    try {
      setActionLoading(messageKey);
      const response = await fetch(
        `/api/admin/messages?id=${message.id}&type=${message.type}&action=${action}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro na operação');
      }

      const result = await response.json();

      if (result.success) {
        alert.showSuccess(
          'Sucesso',
          `Mensagem ${action === 'publish' ? 'publicada' : 'despublicada'} com sucesso`
        );
        reload(); // Recarregar lista
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {

      alert.showError('Erro', error.message || 'Erro ao alterar status da mensagem');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (message: Message) => {
    deleteModal.openDeleteModal(message, message.title);
  };

  const handleDeleteConfirm = async (message: Message) => {
    const messageKey = `${message.type}-${message.id}`;
    
    try {
      setActionLoading(messageKey);
      
      // Obter sessão para autorização
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        alert.showError('Erro de autenticação', 'Faça login novamente');
        return;
      }
      
      const response = await fetch(
        `/api/admin/messages?id=${message.id}&type=${message.type}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao excluir mensagem');
      }

      const result = await response.json();

      if (result.success) {
        alert.showSuccess('Sucesso', 'Mensagem excluída com sucesso');
        reload(); // Recarregar lista
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {

      alert.showError('Erro', error.message || 'Erro ao excluir mensagem');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (message: Message) => {
    const messageKey = `${message.type}-${message.id}`;
    
    try {
      setActionLoading(messageKey);
      
      // Obter sessão para autorização
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        alert.showError('Erro de autenticação', 'Faça login novamente');
        return;
      }
      
      const response = await fetch(
        `/api/admin/messages?id=${message.id}&type=${message.type}&action=duplicate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao duplicar mensagem');
      }

      const result = await response.json();

      if (result.success) {
        alert.showSuccess('Sucesso', 'Mensagem duplicada com sucesso');
        reload(); // Recarregar lista
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {

      alert.showError('Erro', error.message || 'Erro ao duplicar mensagem');
    } finally {
      setActionLoading(null);
    }
  };

  const resetFilters = () => {
    updateFilters({
      search: '',
      type: 'all',
      status: 'all',
      sector_id: '',
      subsector_id: ''
    });
  };

  const getFilteredSubsectors = () => {
    if (!filters.sector_id) return subsectors;
    return subsectors.filter((sub: any) => sub.sector_id === filters.sector_id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />
      
      {/* Loading Overlay */}
      {loading && messages.length === 0 && (
        <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center">
          <UnifiedLoadingSpinner 
            size="default" 
            message="Carregando mensagens..."
          />
        </div>
      )}

      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração', href: '/admin' },
              { label: 'Mensagens' }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-1 mb-2">Gerenciamento de Mensagens</h1>
              <p className="body-text text-muted">
                Administre todas as mensagens do sistema de forma centralizada
              </p>
            </div>
            <StandardizedButton
              variant="primary"
              onClick={() => {
                setEditingMessage(null);
                setIsModalOpen(true);
              }}
            >
              <Icon name="plus" className="h-4 w-4 mr-2" />
              Nova Mensagem
            </StandardizedButton>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid-modern-stats mb-8">
          <div className="stat-card-orange">
            <div className="flex items-center">
              <div className="icon-container-orange mr-5 flex-shrink-0">
                <Icon name="message-square" className="h-6 w-6" />
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
                <Icon name="building-1" className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="stat-value mb-1">
                  {stats?.byType?.sector || 0}
                </div>
                <div className="stat-label">
                  Setores
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
                  placeholder="Título ou conteúdo..."
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
                onChange={(e) => updateFilters({ type: e.target.value as any })}
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
                onChange={(e) => updateFilters({ status: e.target.value as any })}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'published', label: 'Publicadas' },
                  { value: 'draft', label: 'Rascunhos' }
                ]}
                placeholder="Selecione o status"
              />
            </div>

            {/* Setor */}
            <div>
              <label className="label">Setor</label>
              <FormSelect
                value={filters.sector_id}
                onChange={(e) => updateFilters({ 
                  sector_id: e.target.value,
                  subsector_id: '' // Reset subsetor quando setor muda
                })}
                options={[
                  { value: '', label: 'Todos os setores' },
                  ...sectors.map((sector: any) => ({
                    value: sector.id,
                    label: sector.name
                  }))
                ]}
                placeholder="Selecione o setor"
              />
            </div>

            {/* Subsetor */}
            <div>
              <label className="label">Subsetor</label>
              <FormSelect
                value={filters.subsector_id}
                onChange={(e) => updateFilters({ subsector_id: e.target.value })}
                options={[
                  { value: '', label: 'Todos os subsetores' },
                  ...getFilteredSubsectors().map((subsector: any) => ({
                    value: subsector.id,
                    label: subsector.name
                  }))
                ]}
                placeholder="Selecione o subsetor"
                disabled={!filters.sector_id}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted">
              {pagination.totalCount} mensagem{pagination.totalCount !== 1 ? 's' : ''} encontrada{pagination.totalCount !== 1 ? 's' : ''}
            </p>
            
            <StandardizedButton
              variant="secondary"
              size="sm"
              icon={<Icon name="refresh" className="h-4 w-4" />}
              onClick={resetFilters}
            >
              Limpar Filtros
            </StandardizedButton>
          </div>
        </div>

        {/* Lista de Mensagens */}
        {loading ? (
          <div className="card p-12 text-center">
            <UnifiedLoadingSpinner 
              size="default" 
              message="Carregando mensagens..."
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="card p-12 text-center">
            <Icon name="message-square" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="heading-3 mb-2">Nenhuma mensagem encontrada</h3>
            <p className="body-text text-muted mb-6">
              {Object.values(filters).some(f => f !== '' && f !== 'all')
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece criando uma nova mensagem.'
              }
            </p>
            <StandardizedButton
              variant="primary"
              onClick={() => {
                setEditingMessage(null);
                setIsModalOpen(true);
              }}
            >
              <Icon name="plus" className="h-4 w-4 mr-2" />
              Nova Mensagem
            </StandardizedButton>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message: any) => {
              const messageKey = `${message.type}-${message.id}`;
              const isLoading = actionLoading === messageKey;
              
              return (
                <div key={message.id} className="card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 mr-6">
                      {/* Cabeçalho */}
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`badge ${message.is_published ? 'badge-success' : 'badge-warning'}`}>
                          {message.is_published ? 'Publicado' : 'Rascunho'}
                        </span>
                        
                        <span className={`badge ${message.type === 'sector' ? 'badge-info' : 'badge-secondary'}`}>
                          {message.type === 'sector' ? 'Setor' : 'Subsetor'}
                        </span>
                        
                        {message.group_name && (
                          <span 
                            className="badge"
                            style={{ 
                              color: 'white' 
                            }}
                          >
                            {message.group_name}
                          </span>
                        )}
                      </div>

                      {/* Título */}
                      <h3 className="heading-3 mb-2 truncate" title={message.title}>
                        {message.title}
                      </h3>

                      {/* Conteúdo */}
                      <p className="body-text text-muted mb-4 line-clamp-2">
                        {message.content}
                      </p>

                      {/* Metadados */}
                      <div className="flex items-center space-x-4 text-xs text-muted">
                        <span className="flex items-center">
                          <Icon name="building-1" className="h-3 w-3 mr-1" />
                          {message.location_name}
                          {message.sector_name && message.type === 'subsector' && (
                            <span className="ml-1">({message.sector_name})</span>
                          )}
                        </span>
                        
                        {message.author_name && (
                          <span className="flex items-center">
                            <Icon name="user" className="h-3 w-3 mr-1" />
                            {message.author_name}
                          </span>
                        )}
                        
                        <span className="flex items-center">
                          <Icon name="calendar" className="h-3 w-3 mr-1" />
                          {FormatDate(message.created_at)}
                        </span>
                        
                        {message.updated_at !== message.created_at && (
                          <span className="flex items-center">
                            <Icon name="edit" className="h-3 w-3 mr-1" />
                            Editado em {FormatDate(message.updated_at)}
                          </span>
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
                            onClick: () => {
                              setEditingMessage(message);
                              setIsModalOpen(true);
                            },
                          },
                          {
                            label: message.is_published ? 'Despublicar' : 'Publicar',
                            icon: message.is_published ? 'eye-slash' : 'eye',
                            onClick: () => handleToggleStatus(message),
                          },
                          {
                            label: 'Duplicar',
                            icon: 'copy',
                            onClick: () => handleDuplicate(message),
                          },
                          {
                            label: 'Excluir',
                            icon: 'trash',
                            onClick: () => handleDeleteClick(message),
                            variant: 'danger',
                            showDivider: true,
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-muted">
              Página {pagination.currentPage} de {pagination.totalPages}
            </p>
            
            <div className="flex items-center space-x-2">
              <StandardizedButton
                variant="secondary"
                size="sm"
                icon={<Icon name="chevron-left" className="h-4 w-4" />}
                onClick={() => updatePagination({ 
                  currentPage: Math.max(1, pagination.currentPage - 1) 
                })}
                disabled={pagination.currentPage <= 1 || loading}
              >
                Anterior
              </StandardizedButton>

              <StandardizedButton
                variant="secondary"
                size="sm"
                icon={<Icon name="chevron-right" className="h-4 w-4" />}
                onClick={() => updatePagination({ 
                  currentPage: Math.min(pagination.totalPages, pagination.currentPage + 1) 
                })}
                disabled={pagination.currentPage >= pagination.totalPages || loading}
              >
                Próxima
              </StandardizedButton>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Mensagem */}
      <MessageForm
        message={editingMessage}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMessage(null);
        }}
        onSuccess={() => {
          reload();
        }}
      />

      {/* Modal de Exclusão */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.confirmDelete(handleDeleteConfirm)}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}

export default function MessagesAdminPage() {
  return (
    <AuthGuard requireRole="admin">
      <MessagesAdminPageContent />
    </AuthGuard>
  );
}