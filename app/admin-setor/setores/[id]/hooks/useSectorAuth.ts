// Hook para autenticação e autorização no painel de setores

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/app/providers/AuthProvider';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';

export function useSectorAuth(sectorId: string) {
  const router = useRouter();
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();
  const supabase = useSupabaseClient();
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      // Aguardar autenticação ser inicializada
      if (authLoading) return;
      
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      // Verificar autorização usando o profile do contexto
      if (profile?.role === 'admin') {
        setIsAuthorized(true);
      } else if (profile?.role === 'sector_admin') {
        // Verificar se é admin deste setor específico
        const { data: sectorAdmin } = await supabase
          .from('sector_admins')
          .select('*')
          .eq('user_id', user!.id)
          .eq('sector_id', sectorId);
        
        if (sectorAdmin && sectorAdmin.length > 0) {
          setIsAuthorized(true);
        } else {
          // Redirecionar usuários não autorizados
          router.replace('/admin-setor');
          return;
        }
      } else {
        // Redirecionar usuários regulares
        router.replace('/dashboard');
        return;
      }

      setLoading(false);
    };

    checkAuthorization();
  }, [isAuthenticated, authLoading, profile, user, sectorId, router, supabase]);

  return {
    user,
    profile,
    isAuthorized,
    loading: loading || authLoading
  };
}