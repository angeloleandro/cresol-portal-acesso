'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';

import { useAlert } from '@/app/components/alerts';
import { supabase } from '@/lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

/**
 * useAdminAuth function
 * @todo Add proper documentation
 */
export function useAdminAuth() {
  const router = useRouter();
  const alert = useAlert();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const authCallCounterRef = useRef(0);
  const renderCountRef = useRef(0);
  renderCountRef.current++;

  const checkAuth = useCallback(async () => {
    authCallCounterRef.current++;
    
    try {
      const { data } = await supabase.auth.getUser();
      
      if (!data.user) {
        router.replace('/login');
        return;
      }

      // Verificar se é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        alert.showError('Acesso negado', 'Apenas administradores gerais podem acessar esta página');
        router.replace('/admin');
        return;
      }

      setUser({
        id: data.user.id,
        email: data.user.email || '',
        role: profile.role
      });
    } catch (error) {
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router, alert]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    checkAuth
  };
}