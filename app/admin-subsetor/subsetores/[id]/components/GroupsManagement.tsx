// Componente OTIMIZADO de gerenciamento de grupos de notificação - PADRONIZADO
// Baseado no padrão do setor para manter consistência

import React, { useState, memo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAlert } from '@/app/components/alerts';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import { Group, User, WorkLocation } from '../types/subsector.types';
import { formatDate } from '../utils/dateFormatters';
import CreateGroupModal from './groups/CreateGroupModal';

interface GroupsManagementProps {
  subsectorId: string;
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
  subsectorId,
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
  const alert = useAlert();
  const deleteModal = useDeleteModal('grupo');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const handleOpenModal = useCallback((editGroup?: Group) => {
    setEditingGroup(editGroup || null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingGroup(null);
  }, []);

  const handleModalSuccess = useCallback(async () => {
    await onRefresh();
  }, [onRefresh]);

  const handleDeleteGroup = useCallback(async (itemToDelete: Group) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`/api/admin/message-groups?id=${itemToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Erro ao excluir grupo');
      }

      await onRefresh();
      alert.groups.deleted();
    } catch (error) {
      alert.showError('Erro ao excluir grupo', error instanceof Error ? error.message : 'Erro ao excluir grupo. Tente novamente.');
    }
  }, [alert, onRefresh]);

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
                  <div className="flex items-center mt-2 space-x-2">
                    {group.color_theme && (
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: group.color_theme }}
                        title={`Cor do tema: ${group.color_theme}`}
                      />
                    )}
                    <span className="text-xs text-gray-500">
                      {group.profiles?.full_name ? `Criado por ${group.profiles.full_name}` : 'Sistema'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grupos do subsetor */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Grupos do Subsetor</h3>
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
                        onClick={() => deleteModal.openDeleteModal(group, group.name)}
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
                    <div className="flex items-center space-x-2">
                      {group.color_theme && (
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: group.color_theme }}
                          title={`Cor do tema: ${group.color_theme}`}
                        />
                      )}
                      <span>
                        {group.profiles?.full_name ? `Por ${group.profiles.full_name}` : 'Sistema'}
                      </span>
                    </div>
                    <span>Criado em {formatDate(group.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de criação/edição de grupo */}
      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        subsectorId={subsectorId}
        editingGroup={editingGroup}
      />

      {/* Modal de exclusão */}
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