'use client';

import React, { useState } from 'react';
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

import { EventForm } from './components/EventForm';
import { AdminActionMenu } from '@/app/components/ui/AdminActionMenu';

import { FormatDate } from '@/lib/utils/formatters';
interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  type: 'sector' | 'subsector';
  location_name?: string;
  location_id?: string;
  sector_name?: string;
  [key: string]: unknown;
}

function EventsPageContent() {
  const alert = useAlert();
  const { user } = useAuth();
  const { 
    data: events, 
    loading, 
    stats, 
    pagination, 
    filters, 
    updateFilters, 
    updatePagination, 
    reload 
  } = useAdminData<Event>({
    endpoint: 'events',
    initialFilters: {
      search: '',
      type: 'all',
      status: 'all',
      featured: 'all',
      period: 'all'
    },
    debounceMs: 500
  });

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal de exclusão
  const deleteModal = useDeleteModal<Event>('evento');

  // Estados do modal de evento
  const [eventModal, setEventModal] = useState({
    isOpen: false,
    event: null as Event | null
  });

  // Não é necessário mais lógica de carregamento, tudo é gerenciado pelos hooks

  const handleDeleteClick = (event: Event) => {
    deleteModal.openDeleteModal(event, event.title);
  };

  const handleDeleteConfirm = async (event: Event) => {
    const eventKey = `${event.type}-${event.id}`;
    
    try {
      setActionLoading(eventKey);
      const response = await fetch(
        `/api/admin/events?id=${event.id}&type=${event.type}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao excluir evento');
      }

      const result = await response.json();

      if (result.success) {
        alert.showSuccess('Sucesso', 'Evento excluído com sucesso');
        reload(); // Recarregar lista
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {

      alert.showError('Erro', error.message || 'Erro ao excluir evento');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (event: Event) => {
    const action = event.is_published ? 'unpublish' : 'publish';
    const eventKey = `${event.type}-${event.id}`;
    
    try {
      setActionLoading(eventKey);
      const response = await fetch(
        `/api/admin/events?id=${event.id}&type=${event.type}&action=${action}`,
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
          `Evento ${action === 'publish' ? 'publicado' : 'despublicado'} com sucesso`
        );
        reload(); // Recarregar lista
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {

      alert.showError('Erro', error.message || 'Erro ao alterar status do evento');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (event: Event) => {
    const action = event.is_featured ? 'unfeature' : 'feature';
    const eventKey = `${event.type}-${event.id}`;
    
    try {
      setActionLoading(eventKey);
      const response = await fetch(
        `/api/admin/events?id=${event.id}&type=${event.type}&action=${action}`,
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
          `Evento ${action === 'feature' ? 'marcado como destaque' : 'removido dos destaques'} com sucesso`
        );
        reload(); // Recarregar lista
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {

      alert.showError('Erro', error.message || 'Erro ao alterar destaque do evento');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (event: Event) => {
    const eventKey = `${event.type}-${event.id}`;
    
    try {
      setActionLoading(eventKey);
      const response = await fetch(
        `/api/admin/events?id=${event.id}&type=${event.type}&action=duplicate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao duplicar evento');
      }

      const result = await response.json();

      if (result.success) {
        alert.showSuccess('Sucesso', 'Evento duplicado com sucesso');
        reload(); // Recarregar lista
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {

      alert.showError('Erro', error.message || 'Erro ao duplicar evento');
    } finally {
      setActionLoading(null);
    }
  };

  const resetFilters = () => {
    updateFilters({
      search: '',
      type: 'all',
      status: 'all',
      featured: 'all',
      period: 'all'
    });
  };

  // Funções do modal de eventos
  const handleCreateEvent = () => {
    setEventModal({
      isOpen: true,
      event: null
    });
  };

  const handleEditEvent = (event: Event) => {
    setEventModal({
      isOpen: true,
      event
    });
  };

  const handleCloseEventModal = () => {
    setEventModal({
      isOpen: false,
      event: null
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />
      
      {/* Loading Overlay */}
      {loading && events.length === 0 && (
        <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center">
          <UnifiedLoadingSpinner 
            size="default" 
            message="Carregando eventos..."
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
              { label: 'Eventos' }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-1 mb-2">Gerenciamento de Eventos</h1>
              <p className="body-text text-muted">
                Gerencie eventos de setores e subsetores centralizadamente
              </p>
            </div>
            <StandardizedButton
              variant="primary"
              onClick={handleCreateEvent}
            >
              <Icon name="plus" className="h-4 w-4 mr-2" />
              Novo Evento
            </StandardizedButton>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid-modern-stats mb-8">
          <div className="stat-card-orange">
            <div className="flex items-center">
              <div className="icon-container-orange mr-5 flex-shrink-0">
                <Icon name="calendar" className="h-6 w-6" />
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
                  Publicados
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

          <div className="stat-card-orange">
            <div className="flex items-center">
              <div className="icon-container-orange mr-5 flex-shrink-0">
                <Icon name="clock" className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="stat-value mb-1">
                  {stats?.upcoming || 0}
                </div>
                <div className="stat-label">
                  Próximos
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card-orange">
            <div className="flex items-center">
              <div className="icon-container-orange mr-5 flex-shrink-0">
                <Icon name="folder" className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="stat-value mb-1">
                  {stats?.past || 0}
                </div>
                <div className="stat-label">
                  Passados
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Busca */}
            <div className="xl:col-span-2">
              <label className="label">Buscar</label>
              <div className="relative">
                <Icon name="search" className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="Título ou descrição..."
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
                onChange={(e) => updateFilters({ type: e.target.value })}
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
                  { value: 'published', label: 'Publicados' },
                  { value: 'draft', label: 'Rascunhos' }
                ]}
                placeholder="Selecione o status"
              />
            </div>

            {/* Período */}
            <div>
              <label className="label">Período</label>
              <FormSelect
                value={filters.period}
                onChange={(e) => updateFilters({ period: e.target.value })}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'upcoming', label: 'Próximos' },
                  { value: 'past', label: 'Passados' }
                ]}
                placeholder="Selecione o período"
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
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted">
              {pagination?.totalCount || events.length} evento{(pagination?.totalCount || events.length) !== 1 ? 's' : ''} encontrado{(pagination?.totalCount || events.length) !== 1 ? 's' : ''}
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

        {/* Lista de Eventos */}
        {loading ? (
          <div className="card p-12 text-center">
            <UnifiedLoadingSpinner 
              size="default" 
              message="Carregando eventos..."
            />
          </div>
        ) : events.length === 0 ? (
          <div className="card p-12 text-center">
            <Icon name="calendar" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="heading-3 mb-2">Nenhum evento encontrado</h3>
            <p className="body-text text-muted mb-6">
              {Object.values(filters).some(f => f !== '' && f !== 'all' && f !== 1 && f !== 20 && f !== 'start_date' && f !== 'asc')
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece criando um novo evento.'
              }
            </p>
            <StandardizedButton
              variant="primary"
              onClick={handleCreateEvent}
            >
              <Icon name="plus" className="h-4 w-4 mr-2" />
              Novo Evento
            </StandardizedButton>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Local e Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                              {event.title}
                            </h3>
                            {event.is_featured && (
                              <Icon name="star" className="ml-2 h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                            {event.description}
                          </p>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Icon name="map" className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Icon name="clock" className="h-4 w-4 text-gray-400 mr-1" />
                            <span>{FormatDate(event.start_date)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            event.is_published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {event.is_published ? 'Publicado' : 'Rascunho'}
                          </span>
                          {event.is_featured && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                              Destaque
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            event.type === 'sector' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {event.type === 'sector' ? 'Setor' : 'Subsetor'}
                          </span>
                          {event.location_name && (
                            <div className="text-xs text-gray-500 mt-1">
                              {event.location_name}
                              {event.sector_name && event.type === 'subsector' && (
                                <span> ({event.sector_name})</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end">
                          <AdminActionMenu
                            items={[
                              {
                                label: 'Editar',
                                icon: 'edit',
                                onClick: () => handleEditEvent(event),
                              },
                              {
                                label: event.is_published ? 'Despublicar' : 'Publicar',
                                icon: event.is_published ? 'eye-slash' : 'eye',
                                onClick: () => handleToggleStatus(event),
                              },
                              {
                                label: event.is_featured ? 'Remover destaque' : 'Destacar',
                                icon: 'star',
                                onClick: () => handleToggleFeatured(event),
                              },
                              {
                                label: 'Duplicar',
                                icon: 'copy',
                                onClick: () => handleDuplicate(event),
                              },
                              {
                                label: 'Excluir',
                                icon: 'trash',
                                onClick: () => handleDeleteClick(event),
                                variant: 'danger',
                                showDivider: true,
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Paginação */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-muted">
              Página {pagination.currentPage} de {pagination.totalPages}
            </p>
            
            <div className="flex items-center space-x-2">
              <StandardizedButton
                variant="secondary"
                size="sm"
                icon={<Icon name="chevron-left" className="h-4 w-4" />}
                onClick={() => updatePagination({ currentPage: Math.max(1, pagination.currentPage - 1) })}
                disabled={pagination.currentPage <= 1 || loading}
              >
                Anterior
              </StandardizedButton>

              <StandardizedButton
                variant="secondary"
                size="sm"
                icon={<Icon name="chevron-right" className="h-4 w-4" />}
                onClick={() => updatePagination({ currentPage: Math.min(pagination.totalPages, pagination.currentPage + 1) })}
                disabled={pagination.currentPage >= pagination.totalPages || loading}
              >
                Próxima
              </StandardizedButton>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Evento */}
      <EventForm
        event={eventModal.event}
        isOpen={eventModal.isOpen}
        onClose={handleCloseEventModal}
        onSuccess={reload}
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

export default function EventsPage() {
  return (
    <AuthGuard requireRole="admin">
      <EventsPageContent />
    </AuthGuard>
  );
}