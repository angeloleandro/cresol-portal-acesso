// Componente de gerenciamento de grupos de notificação

import React, { useState } from 'react';
import { Group, User, WorkLocation } from '../types/sector.types';
import { formatDate } from '../utils/dateFormatters';

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

export function GroupsManagement({
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
  const [currentGroup, setCurrentGroup] = useState({
    name: '',
    description: '',
    members: [] as string[]
  });

  const handleOpenModal = () => {
    setCurrentGroup({
      name: '',
      description: '',
      members: []
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentGroup({
      name: '',
      description: '',
      members: []
    });
    onSearchTermChange('');
    onLocationFilterChange('all');
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentGroup.members.length === 0) {
      alert('Selecione pelo menos um membro para o grupo');
      return;
    }

    try {
      const response = await fetch('/api/notifications/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentGroup,
          sector_id: sectorId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar grupo');
      }

      await onRefresh();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar grupo:', error);
      alert('Erro ao salvar grupo. Tente novamente.');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setCurrentGroup(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  const toggleGroupSelection = (group: Group) => {
    const groupMembers = group.members || [];
    if (groupMembers.length === 0) return; // Skip empty groups

    const isGroupSelected = groupMembers.every(memberId => 
      currentGroup.members.includes(memberId)
    );

    if (isGroupSelected) {
      // Remover membros do grupo
      setCurrentGroup(prev => ({
        ...prev,
        members: prev.members.filter(id => !groupMembers.includes(id))
      }));
    } else {
      // Adicionar membros do grupo
      const allMembers = [...currentGroup.members, ...groupMembers];
      const uniqueMembers = Array.from(new Set(allMembers));
      setCurrentGroup(prev => ({
        ...prev,
        members: uniqueMembers
      }));
    }
  };

  return (
    <div className="p-6">
      {/* Cabeçalho com ações */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Grupos de Notificação</h2>
        <button
          onClick={handleOpenModal}
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
                    {group.members?.length || 0} membros
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
                  <div className="mb-2">
                    <h4 className="font-medium text-gray-900">{group.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{group.members?.length || 0} membros</span>
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
              <h2 className="text-xl font-semibold mb-4">Novo Grupo de Notificação</h2>
              
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

                {/* Seleção de membros */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Selecionar Membros ({currentGroup.members.length} selecionados)
                  </label>

                  {/* Filtros */}
                  <div className="flex space-x-4 mb-4">
                    <input
                      type="text"
                      placeholder="Buscar por nome ou email..."
                      value={userSearchTerm}
                      onChange={(e) => onSearchTermChange(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <select
                      value={userLocationFilter}
                      onChange={(e) => onLocationFilterChange(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="all">Todos os locais</option>
                      {workLocations.map(location => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Grupos rápidos */}
                  {automaticGroups.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Seleção rápida:</p>
                      <div className="flex flex-wrap gap-2">
                        {automaticGroups.map(group => {
                          const isSelected = group.members?.every(id => 
                            currentGroup.members.includes(id)
                          ) && (group.members?.length > 0) || false;
                          
                          return (
                            <button
                              key={group.id}
                              type="button"
                              onClick={() => toggleGroupSelection(group)}
                              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                isSelected
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {group.name} ({group.members?.length || 0})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Lista de usuários */}
                  <div className="border rounded-md max-h-64 overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                      <p className="text-center py-4 text-gray-500">
                        Nenhum usuário encontrado
                      </p>
                    ) : (
                      filteredUsers.map(user => (
                        <label
                          key={user.id}
                          className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={currentGroup.members.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {user.full_name || user.email}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          {user.work_location_id && (
                            <span className="text-xs text-gray-500">
                              {workLocations.find(l => l.id === user.work_location_id)?.name}
                            </span>
                          )}
                        </label>
                      ))
                    )}
                  </div>
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
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Criar Grupo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}