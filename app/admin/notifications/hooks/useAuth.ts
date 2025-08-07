import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkUserAuth = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.replace('/login');
        return;
      }

      // Verificar se é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !['admin', 'sector_admin', 'subsector_admin'].includes(profile.role)) {
        router.replace('/home');
        return;
      }

      setUser(user);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    checkAuth: checkUserAuth
  };
};