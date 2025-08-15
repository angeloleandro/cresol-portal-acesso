// Hook para gerenciamento de autenticação e autorização do setor

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '../types/sector.types';

interface UseSectorAuthReturn {
  user: User | null;
  isAuthorized: boolean;
  loading: boolean;
  checkUser: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

export function useSectorAuth(sectorId: string): UseSectorAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const checkUser = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        router.push('/login');
        return;
      }

      // Buscar informações do perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Erro ao buscar perfil:', profileError);
        router.push('/login');
        return;
      }

      setUser(profile);

      // Verificar autorização - admin global ou admin do setor
      const authorized = profile.role === 'admin' || 
        (profile.role === 'sector_admin' && profile.sector_id === sectorId);

      setIsAuthorized(authorized);

      if (!authorized) {
        router.push('/home');
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [sectorId, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  return {
    user,
    isAuthorized,
    loading,
    checkUser,
    handleLogout
  };
}