'use client';

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import MultiSelectDropdown from './MultiSelectDropdown';
import { Icon } from '@/app/components/icons/Icon';

interface User {
  id: string;
  full_name: string;
  email: string;
  position?: string;
  work_location_id?: string;
  position_id?: string;
  work_location?: string;
}

interface FilterOption {
  id: string;
  label: string;
  value: string;
  meta?: any;
}

interface UserSelectionFilterProps {
  selectedUserIds: string[];
  onUserSelectionChange: (userIds: string[]) => void;
  sectorId?: string;
  loading?: boolean;
  error?: string;
  // Novos props para receber dados do contexto ao invés de buscar
  allUsers?: User[];
  workLocations?: any[];
  positions?: FilterOption[];
  sectors?: FilterOption[];
}

const UserSelectionFilter = memo(function UserSelectionFilter({
  selectedUserIds,
  onUserSelectionChange,
  sectorId,
  loading = false,
  error,
  allUsers = [],
  workLocations = [],
  positions = [],
  sectors = []
}: UserSelectionFilterProps) {
  // Estados dos filtros
  const [selectedWorkLocations, setSelectedWorkLocations] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>(sectorId ? [sectorId] : []);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Transformar dados recebidos para formato esperado usando useMemo para performance
  const workLocationOptions = useMemo(() => 
    workLocations.map((loc: any) => ({
      id: loc.id,
      label: loc.name,
      value: loc.id,
      meta: loc
    })), [workLocations]);

  const sectorOptions = useMemo(() => 
    sectors.length > 0 ? sectors : [], [sectors]);

  // Aplicar filtros sem fazer requisições - usar dados do contexto
  const applyFilters = useCallback(() => {
    let filtered = [...allUsers];

    // Filtrar por local de trabalho
    if (selectedWorkLocations.length > 0) {
      filtered = filtered.filter(user => 
        user.work_location_id && selectedWorkLocations.includes(user.work_location_id)
      );
    }

    // Filtrar por cargo/posição
    if (selectedPositions.length > 0) {
      filtered = filtered.filter(user => {
        const positionMatch = selectedPositions.some(posId => {
          const position = positions.find(p => p.id === posId);
          return position && (
            user.position === position.meta?.name ||
            user.position === position.label
          );
        });
        return positionMatch;
      });
    }

    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.position?.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(filtered);
  }, [selectedWorkLocations, selectedPositions, allUsers, positions, searchTerm]);

  // Aplicar filtros quando qualquer filtro mudar
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSelectAllUsers = useCallback(() => {
    if (selectedUserIds.length === filteredUsers.length) {
      onUserSelectionChange([]);
    } else {
      onUserSelectionChange(filteredUsers.map(user => user.id));
    }
  }, [selectedUserIds.length, filteredUsers, onUserSelectionChange]);

  const handleUserToggle = useCallback((userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onUserSelectionChange(selectedUserIds.filter(id => id !== userId));
    } else {
      onUserSelectionChange([...selectedUserIds, userId]);
    }
  }, [selectedUserIds, onUserSelectionChange]);

  const clearAllFilters = useCallback(() => {
    setSelectedWorkLocations([]);
    setSelectedPositions([]);
    setSelectedSectors(sectorId ? [sectorId] : []);
    setSearchTerm('');
    onUserSelectionChange([]);
  }, [sectorId, onUserSelectionChange]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center">
          <Icon name="alert-circle" className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-red-700 text-sm">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filtros para Seleção</h3>
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-sm text-primary hover:text-primary-dark transition-colors"
          >
            Limpar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por Local de Trabalho */}
          <MultiSelectDropdown
            label="Locais de Trabalho"
            placeholder="Todos os locais"
            options={workLocationOptions}
            selectedValues={selectedWorkLocations}
            onChange={setSelectedWorkLocations}
            searchable={true}
            showSelectAll={true}
          />

          {/* Filtro por Cargo */}
          <MultiSelectDropdown
            label="Cargos"
            placeholder="Todos os cargos"
            options={positions}
            selectedValues={selectedPositions}
            onChange={setSelectedPositions}
            searchable={true}
            showSelectAll={true}
          />

          {/* Filtro por Setor */}
          <MultiSelectDropdown
            label="Setores"
            placeholder="Todos os setores"
            options={sectorOptions}
            selectedValues={selectedSectors}
            onChange={setSelectedSectors}
            searchable={true}
            showSelectAll={true}
            disabled={!!sectorId} // Desabilitar se já tem setor fixo
          />
        </div>
      </div>

      {/* Busca adicional */}
      <div>
        <label className="block text-sm font-medium text-cresol-gray mb-1">
          Buscar usuários
        </label>
        <div className="relative">
          <Icon 
            name="search" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, email ou cargo..."
            className="w-full pl-10 pr-4 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Lista de usuários filtrados */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">
            Usuários encontrados ({filteredUsers.length})
          </h4>
          {filteredUsers.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAllUsers}
              className="text-sm text-primary hover:text-primary-dark transition-colors"
            >
              {selectedUserIds.length === filteredUsers.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
          )}
        </div>

        <div className="border border-cresol-gray-light rounded-md max-h-64 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Icon name="user" className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Nenhum usuário encontrado com os filtros aplicados</p>
            </div>
          ) : (
            <div className="divide-y divide-cresol-gray-light">
              {filteredUsers.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => handleUserToggle(user.id)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.full_name || user.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email} • {user.position || 'Cargo não informado'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {selectedUserIds.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            {selectedUserIds.length} usuário(s) selecionado(s)
          </p>
        )}
      </div>
    </div>
  );
});

export default UserSelectionFilter;