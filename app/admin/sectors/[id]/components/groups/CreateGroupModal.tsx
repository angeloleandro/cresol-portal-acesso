'use client';

import React, { useState, useEffect, useMemo } from 'react';

import { createClient } from '@/lib/supabase/client';

// Types
interface User {
  id: string;
  full_name: string;
  email: string;
  position?: string;
  sector?: string;
  sector_id?: string;
  position_id?: string;
}

interface Position {
  id: string;
  name: string;
}

interface Sector {
  id: string;
  name: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sectorId: string;
  editingGroup?: {
    id: string;
    name: string;
    description?: string;
    members?: string[];
  } | null;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  sectorId: _sectorId,
  editingGroup
}) => {
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Selection states
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [allSectorsChecked, setAllSectorsChecked] = useState(false);
  const [allPositionsChecked, setAllPositionsChecked] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Load initial data
  useEffect(() => {
    const loadDataEffect = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        // Load all data in parallel
        const [usersRes, sectorsRes, positionsRes] = await Promise.all([
          fetch('/api/admin/users/all', { headers }),
          fetch('/api/admin/sectors', { headers }),
          fetch('/api/admin/positions', { headers })
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users || []);
        }

        if (sectorsRes.ok) {
          const sectorsData = await sectorsRes.json();
          setSectors(sectorsData.sectors || []);
        }

        if (positionsRes.ok) {
          const positionsData = await positionsRes.json();
          setPositions(positionsData.positions || []);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadDataEffect();
      if (editingGroup) {
        setFormData({
          name: editingGroup.name || '',
          description: editingGroup.description || ''
        });
      }
    }
  }, [isOpen, editingGroup, supabase]);

  // Filter users based on selections (UNION logic - adds users)
  const filteredUsers = useMemo(() => {
    // Se nenhum filtro selecionado, mostrar TODOS os usuários
    if (selectedSectors.length === 0 && selectedPositions.length === 0) {
      // Retornar todos os usuários ordenados
      return [...users].sort((a, b) => {
        const nameA = a.full_name || a.email || '';
        const nameB = b.full_name || b.email || '';
        return nameA.localeCompare(nameB);
      });
    }

    // Usar Set para evitar duplicatas
    const userSet = new Set<string>();
    const filteredList: User[] = [];

    // Adicionar todos os usuários dos setores selecionados
    if (selectedSectors.length > 0) {
      users.forEach(user => {
        if (user.sector_id && selectedSectors.includes(user.sector_id)) {
          if (!userSet.has(user.id)) {
            userSet.add(user.id);
            filteredList.push(user);
          }
        }
      });
    }

    // Adicionar todos os usuários com os cargos selecionados
    if (selectedPositions.length > 0) {
      users.forEach(user => {
        if (user.position && selectedPositions.some(pos => user.position?.includes(pos))) {
          if (!userSet.has(user.id)) {
            userSet.add(user.id);
            filteredList.push(user);
          }
        }
      });
    }

    // Ordenar por nome
    filteredList.sort((a, b) => {
      const nameA = a.full_name || a.email || '';
      const nameB = b.full_name || b.email || '';
      return nameA.localeCompare(nameB);
    });

    return filteredList;
  }, [users, selectedSectors, selectedPositions]);

  const handleToggleAllSectors = () => {
    if (allSectorsChecked) {
      setSelectedSectors([]);
      setAllSectorsChecked(false);
    } else {
      setSelectedSectors(sectors.map(s => s.id));
      setAllSectorsChecked(true);
    }
  };

  const handleToggleAllPositions = () => {
    if (allPositionsChecked) {
      setSelectedPositions([]);
      setAllPositionsChecked(false);
    } else {
      setSelectedPositions(positions.map(p => p.name));
      setAllPositionsChecked(true);
    }
  };

  const handleSectorToggle = (sectorId: string) => {
    setSelectedSectors(prev => {
      const newSelection = prev.includes(sectorId)
        ? prev.filter(id => id !== sectorId)
        : [...prev, sectorId];
      
      setAllSectorsChecked(newSelection.length === sectors.length);
      return newSelection;
    });
  };

  const handlePositionToggle = (positionName: string) => {
    setSelectedPositions(prev => {
      const newSelection = prev.includes(positionName)
        ? prev.filter(name => name !== positionName)
        : [...prev, positionName];
      
      setAllPositionsChecked(newSelection.length === positions.length);
      return newSelection;
    });
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Nome do grupo é obrigatório');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Selecione pelo menos um usuário para o grupo');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/admin/message-groups', {
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
        },
        body: JSON.stringify({
          ...(editingGroup && { id: editingGroup.id }),
          user_ids: selectedUsers
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar grupo');
      }

      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Erro ao salvar grupo:', err);
      setError('Erro ao salvar grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setSelectedSectors([]);
    setSelectedPositions([]);
    setSelectedUsers([]);
    setAllSectorsChecked(false);
    setAllPositionsChecked(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
          {/* Header - Fixed */}
          <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {editingGroup ? 'Editar Grupo' : 'Criar Novo Grupo'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {editingGroup ? 'Atualize as informações do grupo' : 'Configure um novo grupo de mensagens'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="ml-4 p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Fechar modal"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* Group Info Section */}
            <div className="mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Grupo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                    placeholder="Digite o nome do grupo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500 resize-none"
                    placeholder="Descrição opcional"
                  />
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Sectors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Setores
                  </label>
                  <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                    <label className="flex items-center px-3 py-2 border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allSectorsChecked}
                        onChange={handleToggleAllSectors}
                        className="mr-2 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium">Todos os Setores</span>
                    </label>
                    {sectors.map(sector => (
                      <label key={sector.id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSectors.includes(sector.id)}
                          onChange={() => handleSectorToggle(sector.id)}
                          className="mr-2 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm">{sector.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Positions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargos
                  </label>
                  <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                    <label className="flex items-center px-3 py-2 border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allPositionsChecked}
                        onChange={handleToggleAllPositions}
                        className="mr-2 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium">Todos os Cargos</span>
                    </label>
                    {positions.map(position => (
                      <label key={position.id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPositions.includes(position.name)}
                          onChange={() => handlePositionToggle(position.name)}
                          className="mr-2 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm">{position.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Users List Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Usuários para o Grupo
              </label>
              
              <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>
                    <span className="font-medium">{selectedUsers.length}</span> de {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''} selecionado{selectedUsers.length !== 1 ? 's' : ''}
                  </span>
                  {filteredUsers.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllUsers}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      {selectedUsers.length === filteredUsers.length ? 'Desmarcar todos' : 'Selecionar todos'}
                    </button>
                  )}
                </div>
                
                <div className="bg-white border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-4 px-3">
                      <p className="text-sm text-gray-500">
                        Nenhum usuário disponível
                      </p>
                    </div>
                  ) : (
                    <div>
                      {filteredUsers.map(user => (
                        <label 
                          key={user.id} 
                          className="flex items-center p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserToggle(user.id)}
                            className="mr-3 text-orange-500 focus:ring-orange-500"
                          />
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                            <span className="text-white text-xs font-medium">
                              {(user.full_name || user.email)[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 truncate">
                              {user.full_name || 'Sem nome'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.position ? `${user.position} • ` : ''}{user.email}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {(selectedSectors.length > 0 || selectedPositions.length > 0) && (
                  <p className="text-xs text-gray-500 mt-2">
                    Filtros ativos: 
                    {selectedSectors.length > 0 && ` ${selectedSectors.length} setor${selectedSectors.length !== 1 ? 'es' : ''}`}
                    {selectedSectors.length > 0 && selectedPositions.length > 0 && ' + '}
                    {selectedPositions.length > 0 && ` ${selectedPositions.length} cargo${selectedPositions.length !== 1 ? 's' : ''}`}
                  </p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Footer - Fixed with small buttons */}
          <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-lg">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleClose}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.name.trim() || selectedUsers.length === 0}
                className="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Salvando...' : editingGroup ? 'Salvar Alterações' : 'Criar Grupo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateGroupModal;