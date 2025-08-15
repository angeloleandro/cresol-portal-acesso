// Hook para gerenciamento de dados do setor e subsetores

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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

export function useSectorData(sectorId: string): UseSectorDataReturn {
  const [sector, setSector] = useState<Sector | null>(null);
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSector = useCallback(async () => {
    try {
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
      const { data, error } = await supabase
        .from('subsectors')
        .select('*')
        .eq('sector_id', sectorId)
        .order('name');

      if (error) throw error;
      setSubsectors(data || []);
    } catch (err) {
      console.error('Erro ao buscar subsetores:', err);
      setError('Erro ao carregar subsetores');
    }
  }, [sectorId]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      fetchSector(),
      fetchSubsectors()
    ]);
    
    setLoading(false);
  }, [fetchSector, fetchSubsectors]);

  useEffect(() => {
    if (sectorId) {
      refreshData();
    }
  }, [sectorId, refreshData]);

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