// Hook OTIMIZADO para gerenciamento de grupos e usuários usando contexto
// Evita requisições duplicadas compartilhando dados via SectorDataContext

import { useSectorDataContext } from '../contexts/SectorDataContext';

interface UseGroupsManagementReturn {
  groups: any[];
  automaticGroups: any[];
  allUsers: any[];
  workLocations: any[];
  userSearchTerm: string;
  userLocationFilter: string;
  setUserSearchTerm: (term: string) => void;
  setUserLocationFilter: (filter: string) => void;
  refreshAll: () => Promise<void>;
  filteredUsers: any[];
}

export function useGroupsManagement(sectorId: string): UseGroupsManagementReturn {
  // Usar dados compartilhados do contexto ao invés de fazer requisições duplicadas
  const {
    groups,
    automaticGroups,
    allUsers,
    workLocations,
    userSearchTerm,
    userLocationFilter,
    filteredUsers,
    setUserSearchTerm,
    setUserLocationFilter,
    refreshGroupsData
  } = useSectorDataContext();

  // Retornar dados do contexto compartilhado
  return {
    groups,
    automaticGroups,
    allUsers,
    workLocations,
    userSearchTerm,
    userLocationFilter,
    setUserSearchTerm,
    setUserLocationFilter,
    refreshAll: refreshGroupsData,
    filteredUsers
  };
}