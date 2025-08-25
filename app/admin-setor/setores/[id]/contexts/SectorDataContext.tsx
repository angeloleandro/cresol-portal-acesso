// Contexto para compartilhar dados do setor entre componentes

'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useSupabaseClient } from '@/hooks/useSupabaseClient';

import type { GroupWithUsers, Sector, Subsector, UserProfile, WorkLocation } from '../types/sector.types';

interface SectorDataContextType {
  sector: Sector | null;
  subsectors: Subsector[];
  groups: GroupWithUsers[];
  automaticGroups: GroupWithUsers[];
  workLocations: WorkLocation[];
  userSearchTerm: string;
  userLocationFilter: string;
  filteredUsers: UserProfile[];
  setUserSearchTerm: (term: string) => void;
  setUserLocationFilter: (locationId: string) => void;
  refreshSectorData: () => Promise<void>;
  refreshGroupsData: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const SectorDataContext = createContext<SectorDataContextType | undefined>(undefined);

export function SectorDataProvider({ 
  children, 
  sectorId 
}: { 
  children: React.ReactNode;
  sectorId: string;
}) {
  const supabase = useSupabaseClient();
  
  const [sector, setSector] = useState<Sector | null>(null);
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [groups, setGroups] = useState<GroupWithUsers[]>([]);
  const [automaticGroups, setAutomaticGroups] = useState<GroupWithUsers[]>([]);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userLocationFilter, setUserLocationFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados do setor
  const fetchSectorData = useCallback(async () => {
    if (!sectorId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Buscar dados do setor
      const { data: sectorData, error: sectorError } = await supabase
        .from('sectors')
        .select('*')
        .eq('id', sectorId)
        .single();

      if (sectorError) throw sectorError;
      setSector(sectorData);

      // Buscar subsetores
      const { data: subsectorsData, error: subsectorsError } = await supabase
        .from('subsectors')
        .select('*')
        .eq('sector_id', sectorId)
        .order('name');

      if (subsectorsError) throw subsectorsError;
      setSubsectors(subsectorsData || []);

    } catch (err) {
      console.error('Erro ao buscar dados do setor:', err);
      setError('Erro ao carregar dados do setor');
    } finally {
      setIsLoading(false);
    }
  }, [sectorId, supabase]);

  // Buscar grupos
  const fetchGroupsData = useCallback(async () => {
    if (!sectorId) return;

    try {
      // Buscar grupos manuais
      const { data: manualGroups, error: groupsError } = await supabase
        .from('message_groups')
        .select(`
          *,
          users:profiles!inner(
            id,
            email,
            full_name
          )
        `)
        .eq('sector_id', sectorId);

      if (groupsError) throw groupsError;
      setGroups(manualGroups || []);

      // Buscar grupos automáticos baseados em localização
      const { data: locations, error: locError } = await supabase
        .from('work_locations')
        .select('*')
        .order('name');

      if (locError) throw locError;
      setWorkLocations(locations || []);

      // Criar grupos automáticos baseados em localização
      const autoGroups: GroupWithUsers[] = [];
      for (const location of locations || []) {
        const { data: usersInLocation } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .eq('work_location_id', location.id);

        if (usersInLocation && usersInLocation.length > 0) {
          autoGroups.push({
            id: `location-${location.id}`,
            name: location.name,
            description: `Todos os usuários de ${location.name}`,
            user_ids: usersInLocation.map(u => u.id),
            users: usersInLocation,
            created_at: location.created_at
          });
        }
      }
      setAutomaticGroups(autoGroups);

    } catch (err) {
      console.error('Erro ao buscar grupos:', err);
    }
  }, [sectorId, supabase]);

  // Buscar todos os usuários
  const fetchAllUsers = useCallback(async () => {
    try {
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select(`
          *,
          work_locations (
            id,
            name,
            city,
            state
          )
        `)
        .order('full_name');

      if (usersError) throw usersError;
      setAllUsers(users || []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    }
  }, [supabase]);

  // Filtrar usuários baseado em busca e localização
  const filteredUsers = useMemo(() => {
    let filtered = allUsers;

    // Filtrar por termo de busca
    if (userSearchTerm) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
    }

    // Filtrar por localização
    if (userLocationFilter && userLocationFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.work_location_id === userLocationFilter
      );
    }

    return filtered;
  }, [allUsers, userSearchTerm, userLocationFilter]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchSectorData(),
        fetchGroupsData(),
        fetchAllUsers()
      ]);
    };
    loadData();
  }, [fetchSectorData, fetchGroupsData, fetchAllUsers]);

  const refreshSectorData = useCallback(async () => {
    await fetchSectorData();
  }, [fetchSectorData]);

  const refreshGroupsData = useCallback(async () => {
    await fetchGroupsData();
  }, [fetchGroupsData]);

  const contextValue = useMemo(
    () => ({
      sector,
      subsectors,
      groups,
      automaticGroups,
      workLocations,
      userSearchTerm,
      userLocationFilter,
      filteredUsers,
      setUserSearchTerm,
      setUserLocationFilter,
      refreshSectorData,
      refreshGroupsData,
      isLoading,
      error
    }),
    [
      sector,
      subsectors,
      groups,
      automaticGroups,
      workLocations,
      userSearchTerm,
      userLocationFilter,
      filteredUsers,
      refreshSectorData,
      refreshGroupsData,
      isLoading,
      error
    ]
  );

  return (
    <SectorDataContext.Provider value={contextValue}>
      {children}
    </SectorDataContext.Provider>
  );
}

export function useSectorDataContext() {
  const context = useContext(SectorDataContext);
  if (!context) {
    throw new Error('useSectorDataContext must be used within SectorDataProvider');
  }
  return context;
}