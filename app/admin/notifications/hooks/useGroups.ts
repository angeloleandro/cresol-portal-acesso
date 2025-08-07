import { useState, useEffect } from 'react';
import { NotificationGroup, GroupFormData } from '../types';

const initialGroupForm: GroupFormData = {
  name: '',
  description: '',
  sectorId: '',
  subsectorId: '',
  members: []
};

export const useGroups = () => {
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupForm, setGroupForm] = useState<GroupFormData>(initialGroupForm);
  const [loading, setLoading] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/groups');
      
      if (!response.ok) {
        console.error('Erro na API de grupos:', response.status, response.statusText);
        setGroups([]);
        return;
      }
      
      const result = await response.json();
      
      if (result.error) {
        console.error('Erro ao buscar grupos:', result.error);
        setGroups([]);
        return;
      }
      
      setGroups(result.groups || []);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const updateGroupForm = (updates: Partial<GroupFormData>) => {
    setGroupForm(prev => ({ ...prev, ...updates }));
  };

  const resetGroupForm = () => {
    setGroupForm(initialGroupForm);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupForm.name,
          description: groupForm.description,
          sectorId: groupForm.sectorId || null,
          subsectorId: groupForm.subsectorId || null,
          members: groupForm.members
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Grupo criado com sucesso!');
        resetGroupForm();
        setShowCreateGroup(false);
        fetchGroups();
        return { success: true, data: result };
      } else {
        alert(`Erro: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      alert('Erro ao criar grupo');
      return { success: false, error: 'Erro interno' };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    showCreateGroup,
    setShowCreateGroup,
    groupForm,
    loading,
    fetchGroups,
    updateGroupForm,
    resetGroupForm,
    handleCreateGroup
  };
};