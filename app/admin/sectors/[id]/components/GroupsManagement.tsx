// Componente OTIMIZADO de gerenciamento de grupos de notificação com memoização

import React, { useState, memo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Group, User, WorkLocation } from '../types/sector.types';
import { formatDate } from '@/lib/utils/formatters';
import UserSelectionFilter from '@/app/components/ui/UserSelectionFilter';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import DeleteModal from '@/app/components/ui/DeleteModal';

interface GroupsManagementProps {
  sectorId: string;
  groups: Group[];
  automaticGroups: Group[];
  workLocations: WorkLocation[];
  userSearchTerm: string;
  userLocationFilter: string;
  filteredUsers: User[];
  onSearchTermChange: (term: string) => void;
  onLocationFilterChange: (filter: string) => void;
  onRefresh: () => Promise<void>;
}

const GroupsManagement = memo(function GroupsManagement({
  sectorId,
  groups,
  automaticGroups,
  workLocations,
  userSearchTerm,
  userLocationFilter,
  filteredUsers,
  onSearchTermChange,
  onLocationFilterChange,
  onRefresh
}: GroupsManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentGroup, setCurrentGroup] = useState({
    name: '',
    description: '',
    members: [] as string[]
  });
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // Modal de exclusão
  const deleteModal = useDeleteModal('grupo');

  const handleOpenModal = useCallback((editGroup?: Group) => {
    if (editGroup) {
      setIsEditMode(true);
      setEditingGroupId(editGroup.id);
      setCurrentGroup({
        name: editGroup.name,
        description: editGroup.description || '',
        members: editGroup.members || []
      });
      // Carregar membros atuais do grupo
      setSelectedUserIds(editGroup.members || []);
    } else {
      setIsEditMode(false);
      setEditingGroupId(null);
      setCurrentGroup({
        name: '',
        description: '',
        members: []
      });
      setSelectedUserIds([]);
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingGroupId(null);
    setCurrentGroup({
      name: '',
      description: '',
      members: []
    });
    setSelectedUserIds([]);
    setIsSubmitting(false);
  }, []);

  const handleSaveGroup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevenir duplo clique
    if (isSubmitting) {
      return;
    }

    if (selectedUserIds.length === 0) {
      // TODO: Implementar sistema de notificação moderno (toast/alert)
      console.warn('Validação: Selecione pelo menos um membro para o grupo');
      // Por ora, retornar sem ação até implementar sistema de notificação
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const method = isEditMode ? 'PUT' : 'POST';
      const bodyData = isEditMode ? {
        id: editingGroupId,
        name: currentGroup.name,
        description: currentGroup.description,
        members: selectedUserIds
      } : {
        name: currentGroup.name,
        description: currentGroup.description,
        sector_id: sectorId,
        members: selectedUserIds
      };

      const response = await fetch('/api/notifications/groups', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(bodyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} grupo`);
      }

      const result = await response.json();
      await onRefresh();
      handleCloseModal();
    } catch (error) {
      // TODO: Implementar sistema de notificação moderno (toast/alert)
      console.error('Erro ao salvar grupo:', error instanceof Error ? error.message : error);
      // Por ora, mostrar erro no console até implementar sistema de notificação
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, currentGroup, selectedUserIds, isEditMode, editingGroupId, sectorId, onRefresh, handleCloseModal]);

  const handleUserSelectionChange = useCallback((userIds: string[]) => {
    setSelectedUserIds(userIds);
  }, []);

  const handleDeleteClick = useCallback((group: Group) => {
    deleteModal.openDeleteModal(group, group.name);
  }, [deleteModal]);

  const handleDeleteGroup = useCallback(async (group: Group) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`/api/notifications/groups?id=${group.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Erro ao excluir grupo');
      }

      await onRefresh();
    } catch (error) {
      // TODO: Implementar sistema de notificação moderno (toast/alert)
      console.error('Erro ao excluir grupo:', error instanceof Error ? error.message : error);
      // Por ora, mostrar erro no console até implementar sistema de notificação
    }
  }, [onRefresh]);

  return (
    <div className="p-6">
      {/* Cabeçalho com ações */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Grupos de Notificação</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Novo Grupo
        </button>
      </div>

      {/* Lista de grupos */}
      <div className="space-y-4">
        {/* Grupos automáticos */}
        {automaticGroups.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Grupos Automáticos</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {automaticGroups.map((group) => (
                <div key={group.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{group.name}</h4>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Automático
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{group.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {group.member_count || 0} membros
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grupos do setor */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Grupos do Setor</h3>
          {groups.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Nenhum grupo criado ainda</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {groups.map((group) => (
                <div key={group.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{group.name}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(group)}
                        className="p-1 text-primary hover:text-primary/80 transition-colors"
                        title="Editar grupo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(group)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        title="Excluir grupo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{group.member_count || 0} membros</span>
                    <span>Criado em {formatDate(group.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de criação de grupo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {isEditMode ? 'Editar Grupo de Notificação' : 'Novo Grupo de Notificação'}
              </h2>
              
              <form onSubmit={handleSaveGroup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Grupo
                    </label>
                    <input
                      type="text"
                      value={currentGroup.name}
                      onChange={(e) => setCurrentGroup({ ...currentGroup, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={currentGroup.description}
                      onChange={(e) => setCurrentGroup({ ...currentGroup, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      placeholder="Breve descrição do grupo"
                    />
                  </div>
                </div>

                {/* Seleção de membros com filtros avançados */}
                <div>
                  <UserSelectionFilter
                    selectedUserIds={selectedUserIds}
                    onUserSelectionChange={handleUserSelectionChange}
                    sectorId={sectorId}
                    allUsers={filteredUsers as any[]}
                    workLocations={workLocations}
                    loading={false}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Salvando...' : (isEditMode ? 'Atualizar Grupo' : 'Criar Grupo')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.confirmDelete(handleDeleteGroup)}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
});

export { GroupsManagement };