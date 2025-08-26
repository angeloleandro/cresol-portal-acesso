// Componente para gerenciar grupos de mensagens - versão simplificada

'use client';

import { useState } from 'react';

import { useAlert } from '@/app/components/alerts';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';

import { useSectorDataContext } from '../contexts/SectorDataContext';
import type { GroupWithUsers } from '../types/sector.types';

interface GroupsManagementProps {
  sectorId: string;
}

export function GroupsManagement({ sectorId }: GroupsManagementProps) {
  const { showError, showSuccess } = useAlert();
  const { groups, automaticGroups, refreshGroupsData } = useSectorDataContext();
  const deleteModal = useDeleteModal<GroupWithUsers>('grupo');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const groupData = {
        sector_id: sectorId,
        name: formData.name,
        description: formData.description
      };

      const url = '/api/admin/message-groups';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId 
        ? { ...groupData, id: editingId }
        : groupData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar grupo');
      }

      showSuccess(editingId ? 'Grupo atualizado' : 'Grupo criado', 'O grupo foi salvo com sucesso.');
      setShowForm(false);
      setFormData({ name: '', description: '' });
      setEditingId(null);
      await refreshGroupsData();
    } catch (error) {
      showError('Erro ao salvar grupo', 'Tente novamente.');
    }
  };

  const handleEdit = (group: GroupWithUsers) => {
    setFormData({
      name: group.name,
      description: group.description || ''
    });
    setEditingId(group.id);
    setShowForm(true);
  };

  const handleDeleteClick = (group: GroupWithUsers) => {
    deleteModal.openDeleteModal(group, group.name);
  };

  const handleDelete = async (group: GroupWithUsers) => {
    try {
      const response = await fetch(`/api/admin/message-groups?id=${group.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir grupo');
      }

      await refreshGroupsData();
      showSuccess('Grupo excluído', 'O grupo foi removido com sucesso.');
    } catch (error) {
      showError('Erro ao excluir grupo', 'Tente novamente.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Grupos de Mensagens</h3>
        <button
          onClick={() => {
            setFormData({ name: '', description: '' });
            setEditingId(null);
            setShowForm(true);
          }}
          className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark text-sm"
        >
          Criar Grupo
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-md border border-gray-200 mb-6">
          <h4 className="text-lg font-medium mb-3">
            {editingId ? 'Editar Grupo' : 'Novo Grupo'}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Grupo
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (opcional)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-20"
                placeholder="Descrição do grupo"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {/* Grupos Manuais */}
        {groups.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">
              Grupos Manuais
            </h4>
            <div className="space-y-3">
              {groups.map((group) => (
                <div key={group.id} className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{group.name}</h3>
                      {group.description && (
                        <p className="text-gray-600 text-sm mt-1">{group.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        {group.users?.length || 0} membros
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(group)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(group)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grupos Automáticos */}
        {automaticGroups.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">
              Grupos Automáticos (Por Localização)
            </h4>
            <div className="space-y-3">
              {automaticGroups.map((group) => (
                <div key={group.id} className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{group.name}</h3>
                      {group.description && (
                        <p className="text-gray-600 text-sm mt-1">{group.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        {group.users?.length || 0} membros
                      </p>
                    </div>
                    <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      Automático
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {groups.length === 0 && automaticGroups.length === 0 && (
          <div className="bg-white p-6 rounded-md border border-gray-200 text-center">
            <p className="text-gray-500">Nenhum grupo cadastrado para este setor.</p>
          </div>
        )}
      </div>

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