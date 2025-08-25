// Hook para verificar autenticação e autorização do admin de subsetor

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/app/providers/AuthProvider';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';

interface ProfileWithSector {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user' | null;
  sector_id?: string;
  subsector_id?: string;
}

export function useSubsectorAuth(subsectorId: string) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const supabase = useSupabaseClient();
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        // Se não tem usuário ou perfil, não autorizado
        if (!user || !profile) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        // Cast profile to include sector_id and subsector_id
        const profileWithSector = profile as ProfileWithSector;

        // Admin tem acesso total
        if (profileWithSector.role === 'admin') {
          setIsAuthorized(true);
          setLoading(false);
          return;
        }

        // Sector admin precisa verificar se o subsetor pertence ao seu setor
        if (profileWithSector.role === 'sector_admin' && profileWithSector.sector_id) {
          const { data: subsector, error } = await supabase
            .from('subsectors')
            .select('sector_id')
            .eq('id', subsectorId)
            .single();

          if (!error && subsector && subsector.sector_id === profileWithSector.sector_id) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
          setLoading(false);
          return;
        }

        // Subsector admin precisa ter acesso a este subsetor específico
        if (profileWithSector.role === 'subsector_admin' && profileWithSector.subsector_id === subsectorId) {
          setIsAuthorized(true);
          setLoading(false);
          return;
        }

        // Caso contrário, não autorizado
        setIsAuthorized(false);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao verificar autorização:', error);
        setIsAuthorized(false);
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [user, profile, subsectorId, supabase]);

  return { isAuthorized, loading };
}