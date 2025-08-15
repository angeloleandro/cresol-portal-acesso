// Hook para gerenciamento de grupos de notificação

import { useState, useCallback, useEffect } from 'react';
import { Group } from '../types/subsector.types';
import { groupsApi } from '../utils/apiClient';

interface UseGroupManagementReturn {
  groups: Group[];
  isGroupModalOpen: boolean;
  currentGroup: {
    name: string;
    description: string;
    members: string[];
  };
  handleOpenGroupModal: () => void;
  handleSaveGroup: (subsectorId: string) => Promise<void>;
  setIsGroupModalOpen: (open: boolean) => void;
  setCurrentGroup: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    members: string[];
  }>>;
  fetchGroups: () => Promise<void>;
}

export function useGroupManagement(subsectorId: string): UseGroupManagementReturn {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState({
    name: '',
    description: '',
    members: [] as string[]
  });

  const fetchGroups = useCallback(async () => {
    try {
      const result = await groupsApi.fetchAll();
      
      // Validar que result.groups é um array antes de filtrar
      if (result?.groups && Array.isArray(result.groups)) {
        const filteredGroups = result.groups.filter((group: Group) => 
          group.subsector_id === subsectorId
        );
        setGroups(filteredGroups);
      } else {
        console.warn('Resposta da API de grupos inválida:', result);
        setGroups([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao buscar grupos:', errorMessage, { subsectorId, error });
      setGroups([]);
    }
  }, [subsectorId]);

  const handleOpenGroupModal = () => {
    setCurrentGroup({
      name: '',
      description: '',
      members: []
    });
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (subsectorId: string) => {
    // Validar subsectorId
    if (!subsectorId || typeof subsectorId !== 'string' || !subsectorId.trim()) {
      throw new Error('Por favor, forneça um ID de subsetor válido.');
    }

    // Validar nome do grupo
    if (!currentGroup.name.trim()) {
      throw new Error('Por favor, informe o nome do grupo.');
    }

    try {
      await groupsApi.create({
        name: currentGroup.name,
        description: currentGroup.description,
        subsector_id: subsectorId,
        members: currentGroup.members
      });

      setIsGroupModalOpen(false);
      await fetchGroups();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar grupo';
      console.error('Erro ao salvar grupo:', errorMessage, { subsectorId, currentGroup, error });
      throw error;
    }
  };

  useEffect(() => {
    if (subsectorId) {
      fetchGroups();
    }
  }, [subsectorId, fetchGroups]);

  return {
    groups,
    isGroupModalOpen,
    currentGroup,
    handleOpenGroupModal,
    handleSaveGroup,
    setIsGroupModalOpen,
    setCurrentGroup,
    fetchGroups
  };
}