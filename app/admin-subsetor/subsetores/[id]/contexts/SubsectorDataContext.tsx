'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Group, User, WorkLocation, Subsector } from '../types/subsector.types';

interface FilterOption {
  id: string;
  label: string;
  value: string;
  meta?: any;
}

interface SubsectorDataContextType {
  // Dados básicos do subsetor
  subsector: Subsector | null;
  
  // Dados de grupos e usuários
  groups: Group[];
  automaticGroups: Group[];
  allUsers: User[];
  workLocations: WorkLocation[];
  positions: FilterOption[];
  
  // Estados de carregamento
  isLoading: boolean;
  error: string | null;
  
  // Filtros de usuários
  userSearchTerm: string;
  userLocationFilter: string;
  filteredUsers: User[];
  
  // Ações
  setUserSearchTerm: (term: string) => void;
  setUserLocationFilter: (filter: string) => void;
  refreshAll: () => Promise<void>;
  refreshSubsectorData: () => Promise<void>;
  refreshGroupsData: () => Promise<void>;
}

const SubsectorDataContext = createContext<SubsectorDataContextType | undefined>(undefined);

export const useSubsectorDataContext = () => {
  const context = useContext(SubsectorDataContext);
  if (!context) {
    throw new Error('useSubsectorDataContext must be used within a SubsectorDataProvider');
  }
  return context;
};

interface SubsectorDataProviderProps {
  subsectorId: string;
  children: React.ReactNode;
}

export function SubsectorDataProvider({ subsectorId, children }: SubsectorDataProviderProps) {
  // Estados dos dados
  const [subsector, setSubsector] = useState<Subsector | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [automaticGroups, setAutomaticGroups] = useState<Group[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [positions, setPositions] = useState<FilterOption[]>([]);
  
  // Estados de controle
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userLocationFilter, setUserLocationFilter] = useState('all');
  
  // Refs para controle de carregamento
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Cache simples com TTL de 5 minutos para dados estáticos
  const cacheRef = useRef<{
    workLocations?: { data: WorkLocation[]; timestamp: number };
    positions?: { data: FilterOption[]; timestamp: number };
    allUsers?: { data: User[]; timestamp: number };
  }>({});
  

  // Buscar dados do subsetor
  const fetchSubsectorData = useCallback(async () => {
    if (!subsectorId) {
      return;
    }
    
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Criar novo AbortController
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('subsectors')
        .select('*, sectors(name)')
        .eq('id', subsectorId)
        .single();
      
      // Verificar se não foi cancelado
      if (signal.aborted) {
        return;
      }

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Subsetor não encontrado');
      }

      if (mountedRef.current) {
        setSubsector({
          id: data.id,
          name: data.name,
          description: data.description,
          sector_id: data.sector_id,
          sector_name: data.sectors?.name
        });
      }
      
    } catch (err) {
      // Se foi cancelado, não tratar como erro
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      // Apenas definir erro se componente ainda está montado
      if (mountedRef.current) {
        setError('Erro ao carregar dados do subsetor: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
      }
    }
  }, [subsectorId]);

  // Helper para fazer fetch com timeout e retry
  const fetchWithTimeout = useCallback(async (url: string, options: RequestInit = {}, timeout = 10000, maxRetries = 3) => {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        
        // Se não é a última tentativa, aguardar antes de tentar novamente
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Backoff exponencial limitado a 5s
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }, []);

  // Buscar grupos de mensagens
  const fetchGroups = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`/api/admin/message-groups?subsector_id=${subsectorId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && mountedRef.current) {
          // Os grupos agora são de mensagens, não há mais "grupos automáticos"
          setGroups(result.groups || []);
          setAutomaticGroups([]); // Deixar vazio por enquanto
        }
      }
    } catch (err) {
      // Falha silenciosa para grupos - não quebrar a aplicação se grupos não carregarem
      if (mountedRef.current) {
        setGroups([]);
        setAutomaticGroups([]);
      }
    }
  }, [subsectorId]);

  // Buscar usuários com cache
  const fetchUsers = useCallback(async () => {
    try {
      const now = Date.now();
      const cached = cacheRef.current.allUsers;
      const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
      
      // Usar cache se disponível e válido
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        if (mountedRef.current) {
          setAllUsers(cached.data);
        }
        return;
      }

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch('/api/users/list', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && mountedRef.current) {
          const users = result.users || [];
          setAllUsers(users);
          // Atualizar cache
          cacheRef.current.allUsers = { data: users, timestamp: now };
        }
      }
    } catch (err) {
      // Falha silenciosa para usuários
    }
  }, []);

  // Buscar locais de trabalho com cache
  const fetchWorkLocations = useCallback(async () => {
    try {
      const now = Date.now();
      const cached = cacheRef.current.workLocations;
      const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
      
      // Usar cache se disponível e válido
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        if (mountedRef.current) {
          setWorkLocations(cached.data);
        }
        return;
      }

      const response = await fetch('/api/work-locations');
      const result = await response.json();

      if (result.success && mountedRef.current) {
        const locations = result.locations || [];
        setWorkLocations(locations);
        // Atualizar cache
        cacheRef.current.workLocations = { data: locations, timestamp: now };
      }
    } catch (err) {
      // Falha silenciosa para locais de trabalho
    }
  }, []);

  // Buscar posições com cache
  const fetchPositions = useCallback(async () => {
    try {
      const now = Date.now();
      const cached = cacheRef.current.positions;
      const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
      
      // Usar cache se disponível e válido
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        if (mountedRef.current) {
          setPositions(cached.data);
        }
        return;
      }

      const response = await fetch('/api/positions');
      const result = await response.json();

      if (result.positions && mountedRef.current) {
        const positionsData = result.positions.map((pos: any) => ({
          id: pos.id,
          label: `${pos.name}${pos.department ? ` - ${pos.department}` : ''}`,
          value: pos.id,
          meta: pos
        }));
        setPositions(positionsData);
        // Atualizar cache
        cacheRef.current.positions = { data: positionsData, timestamp: now };
      }
    } catch (err) {
      // Falha silenciosa para posições
    }
  }, []);

  // Atualizar dados do subsetor
  const refreshSubsectorData = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      await fetchSubsectorData();
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      loadingRef.current = false;
    }
  }, [fetchSubsectorData]);

  // Atualizar dados de grupos
  const refreshGroupsData = useCallback(async () => {
    await fetchGroups();
  }, [fetchGroups]);

  // Atualizar todos os dados
  const refreshAll = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      // Executar em paralelo para otimizar performance
      await Promise.all([
        fetchSubsectorData(),
        fetchGroups(),
        fetchUsers(),
        fetchWorkLocations(),
        fetchPositions()
      ]);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      loadingRef.current = false;
    }
  }, [fetchSubsectorData, fetchGroups, fetchUsers, fetchWorkLocations, fetchPositions]); // eslint-disable-line react-hooks/exhaustive-deps

  // Usuários filtrados
  const filteredUsers = React.useMemo(() => {
    return allUsers.filter(user => {
      const matchesSearch = userSearchTerm === '' || 
        user.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchTerm.toLowerCase());

      const matchesLocation = userLocationFilter === 'all' || 
        user.work_location_id === userLocationFilter;

      return matchesSearch && matchesLocation;
    });
  }, [allUsers, userSearchTerm, userLocationFilter]);

  // Carregar dados iniciais - com proteção contra re-renderizações
  useEffect(() => {
    // Garantir que está marcado como montado
    mountedRef.current = true;

    // Evitar múltiplas chamadas simultâneas
    if (!subsectorId || loadingRef.current) {
      return;
    }
    
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    // Usar Promise para evitar problemas com async/await no useEffect
    Promise.all([
      fetchSubsectorData(),
      fetchGroups(),
      fetchUsers(),
      fetchWorkLocations(),
      fetchPositions()
    ])
    .then(() => {
      // Sucesso silencioso
    })
    .catch((err) => {
      if (mountedRef.current) {
        setError('Erro ao carregar dados do subsetor');
      }
    })
    .finally(() => {
      // Sempre definir loading como false se o componente ainda estiver montado
      if (mountedRef.current) {
        setIsLoading(false);
        loadingRef.current = false;
      }
    });

    // Cleanup function
    return () => {
      // Cancelar qualquer requisição em andamento
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Marcar como desmontado
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subsectorId]); // APENAS subsectorId como dependência

  const value: SubsectorDataContextType = {
    // Dados básicos
    subsector,
    
    // Dados de grupos e usuários
    groups,
    automaticGroups,
    allUsers,
    workLocations,
    positions,
    
    // Estados de carregamento
    isLoading,
    error,
    
    // Filtros
    userSearchTerm,
    userLocationFilter,
    filteredUsers,
    
    // Ações
    setUserSearchTerm,
    setUserLocationFilter,
    refreshAll,
    refreshSubsectorData,
    refreshGroupsData
  };

  return (
    <SubsectorDataContext.Provider value={value}>
      {children}
    </SubsectorDataContext.Provider>
  );
}