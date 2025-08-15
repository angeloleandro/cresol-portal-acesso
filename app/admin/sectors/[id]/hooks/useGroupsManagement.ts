// Hook para gerenciamento de grupos e usuários

import { useState, useEffect, useCallback } from 'react';
import { Group, User, WorkLocation } from '../types/sector.types';

interface UseGroupsManagementReturn {
  groups: Group[];
  automaticGroups: Group[];
  allUsers: User[];
  workLocations: WorkLocation[];
  userSearchTerm: string;
  userLocationFilter: string;
  setUserSearchTerm: (term: string) => void;
  setUserLocationFilter: (filter: string) => void;
  fetchGroups: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchWorkLocations: () => Promise<void>;
  refreshAll: () => Promise<void>;
  filteredUsers: User[];
}

export function useGroupsManagement(sectorId: string): UseGroupsManagementReturn {
  const [groups, setGroups] = useState<Group[]>([]);
  const [automaticGroups, setAutomaticGroups] = useState<Group[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userLocationFilter, setUserLocationFilter] = useState('all');

  const fetchGroups = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/groups');
      const result = await response.json();

      if (result.success) {
        // Filtrar grupos do setor
        const sectorGroups = result.groups.filter((group: Group) => 
          group.sector_id === sectorId
        );
        setGroups(sectorGroups);

        // Filtrar grupos automáticos
        const autoGroups = result.groups.filter((group: Group) => 
          group.is_automatic && !group.sector_id
        );
        setAutomaticGroups(autoGroups);
      }
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
    }
  }, [sectorId]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users/list');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (result.success) {
        setAllUsers(result.users || []);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  }, []);

  const fetchWorkLocations = useCallback(async () => {
    try {
      const response = await fetch('/api/work-locations');
      const result = await response.json();

      if (result.success) {
        setWorkLocations(result.locations || []);
      }
    } catch (error) {
      console.error('Erro ao buscar locais de trabalho:', error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchGroups(),
      fetchUsers(),
      fetchWorkLocations()
    ]);
  }, [fetchGroups, fetchUsers, fetchWorkLocations]);

  // Filtrar usuários baseado em busca e localização
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = userSearchTerm === '' || 
      user.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchTerm.toLowerCase());

    const matchesLocation = userLocationFilter === 'all' || 
      user.work_location_id === userLocationFilter;

    return matchesSearch && matchesLocation;
  });

  useEffect(() => {
    if (sectorId) {
      refreshAll();
    }
  }, [sectorId, refreshAll]);

  return {
    groups,
    automaticGroups,
    allUsers,
    workLocations,
    userSearchTerm,
    userLocationFilter,
    setUserSearchTerm,
    setUserLocationFilter,
    fetchGroups,
    fetchUsers,
    fetchWorkLocations,
    refreshAll,
    filteredUsers
  };
}