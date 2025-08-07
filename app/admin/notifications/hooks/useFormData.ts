import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Sector, Subsector } from '../types';

export const useFormData = () => {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, sector_id, subsector_id')
        .order('full_name');

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return;
      }

      setAvailableUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectors = async () => {
    try {
      setLoading(true);
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('id, name')
        .order('name');

      if (!sectorsError) {
        setSectors(sectorsData || []);
      }

      const { data: subsectorsData, error: subsectorsError } = await supabase
        .from('subsectors')
        .select('id, name')
        .order('name');

      if (!subsectorsError) {
        setSubsectors(subsectorsData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchUsers();
    fetchSectors();
  };

  useEffect(() => {
    fetchUsers();
    fetchSectors();
  }, []);

  return {
    availableUsers,
    sectors,
    subsectors,
    loading,
    refetch,
    fetchUsers,
    fetchSectors
  };
};