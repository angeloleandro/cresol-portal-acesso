// Hook para gerenciamento de dados do setor e subsetores

import { useState, useEffect, useCallback, useRef } from 'react';

import { createClient } from '@/lib/supabase/client';

import { Sector, Subsector } from '../types/sector.types';

interface UseSectorDataReturn {
  sector: Sector | null;
  subsectors: Subsector[];
  loading: boolean;
  error: string | null;
  fetchSector: () => Promise<void>;
  fetchSubsectors: () => Promise<void>;
  refreshData: () => Promise<void>;
}

/**
 * useSectorData function
 * @todo Add proper documentation
 */
export function useSectorData(sectorId: string): UseSectorDataReturn {
  const [sector, setSector] = useState<Sector | null>(null);
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Usar refs para manter funções estáveis e evitar loops
  const loadingRef = useRef(false);

  const fetchSector = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('id', sectorId)
        .single();

      if (error) throw error;
      setSector(data);
    } catch (err) {
      console.error('Erro ao buscar setor:', err);
      setError('Erro ao carregar dados do setor');
    }
  }, [sectorId]);

  const fetchSubsectors = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`/api/admin/subsectors?sector_id=${sectorId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Erro ao carregar subsetores');
      }

      const { data } = await response.json();
      setSubsectors(data || []);
    } catch (err) {
      console.error('Erro ao buscar subsetores:', err);
      setError('Erro ao carregar subsetores');
    }
  }, [sectorId]);

  // Evitar dependências circulares - função estável que não muda
  const refreshData = useCallback(async () => {
    if (loadingRef.current) return; // Prevenir múltiplas chamadas simultâneas
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchSector(),
        fetchSubsectors()
      ]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchSector, fetchSubsectors]);

  // Carregar apenas quando sectorId muda, sem dependência em refreshData
  useEffect(() => {
    if (sectorId) {
      const loadInitialData = async () => {
        if (loadingRef.current) return;
        
        loadingRef.current = true;
        setLoading(true);
        setError(null);
        
        try {
          await Promise.all([
            fetchSector(),
            fetchSubsectors()
          ]);
        } finally {
          setLoading(false);
          loadingRef.current = false;
        }
      };
      
      loadInitialData();
    }
  }, [sectorId, fetchSector, fetchSubsectors]); // Apenas dependências essenciais

  return {
    sector,
    subsectors,
    loading,
    error,
    fetchSector,
    fetchSubsectors,
    refreshData
  };
}