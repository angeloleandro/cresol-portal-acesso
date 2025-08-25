// Hook para buscar dados do setor

import { useCallback, useEffect, useState } from 'react';

import { useSupabaseClient } from '@/hooks/useSupabaseClient';

import type { Sector } from '../types/sector.types';

export function useSectorData(sectorId: string) {
  const supabase = useSupabaseClient();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSector = useCallback(async () => {
    if (!sectorId) {
      setError('ID do setor não fornecido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('sectors')
        .select('*')
        .eq('id', sectorId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setSector(data);
    } catch (err) {
      console.error('Erro ao buscar dados do setor:', err);
      setError('Erro ao carregar dados do setor');
      setSector(null);
    } finally {
      setLoading(false);
    }
  }, [sectorId, supabase]);

  useEffect(() => {
    fetchSector();
  }, [fetchSector]);

  const refresh = useCallback(async () => {
    await fetchSector();
  }, [fetchSector]);

  return {
    sector,
    loading,
    error,
    refresh
  };
}