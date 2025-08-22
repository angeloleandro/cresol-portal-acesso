'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAlert } from '@/app/components/alerts';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export function useAdminAuth() {
  const router = useRouter();
  const alert = useAlert();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // [DEBUG-COUNTER] Contador de chamadas para rastrear múltiplas execuções
  const authCallCounterRef = useRef(0);
  const renderCountRef = useRef(0);
  renderCountRef.current++;
  
  console.log('[DEBUG-AUTH] useAdminAuth - Render:', {
    renderCount: renderCountRef.current,
    userExists: !!user,
    userRole: user?.role,
    loading,
    timestamp: new Date().toISOString()
  });

  const checkAuth = useCallback(async () => {
    // [DEBUG-AUTH] Log entrada da função checkAuth
    authCallCounterRef.current++;
    const callId = `auth-${authCallCounterRef.current}`;
    
    console.log('[DEBUG-AUTH] checkAuth - Entry:', {
      callId,
      renderCount: renderCountRef.current,
      currentUser: user?.email,
      currentRole: user?.role,
      currentLoading: loading,
      stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n'),
      timestamp: new Date().toISOString()
    });
    
    try {
      console.log('[DEBUG-AUTH] checkAuth - Getting user from Supabase:', {
        callId,
        timestamp: new Date().toISOString()
      });
      
      const { data } = await supabase.auth.getUser();
      
      console.log('[DEBUG-AUTH] checkAuth - Supabase getUser response:', {
        callId,
        hasUser: !!data.user,
        userEmail: data.user?.email,
        timestamp: new Date().toISOString()
      });
      
      if (!data.user) {
        console.log('[DEBUG-AUTH] checkAuth - No user found, redirecting to login:', {
          callId,
          timestamp: new Date().toISOString()
        });
        router.replace('/login');
        return;
      }

      console.log('[DEBUG-AUTH] checkAuth - Fetching user profile:', {
        callId,
        userId: data.user.id,
        timestamp: new Date().toISOString()
      });

      // Verificar se é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      console.log('[DEBUG-AUTH] checkAuth - Profile response:', {
        callId,
        hasProfile: !!profile,
        profileRole: profile?.role,
        timestamp: new Date().toISOString()
      });

      if (!profile || profile.role !== 'admin') {
        console.log('[DEBUG-AUTH] checkAuth - User is not admin, showing error:', {
          callId,
          profileRole: profile?.role,
          timestamp: new Date().toISOString()
        });
        alert.showError('Acesso negado', 'Apenas administradores gerais podem acessar esta página');
        router.replace('/admin');
        return;
      }

      console.log('[DEBUG-AUTH] checkAuth - Setting user state:', {
        callId,
        userId: data.user.id,
        userEmail: data.user.email,
        userRole: profile.role,
        timestamp: new Date().toISOString()
      });

      setUser({
        id: data.user.id,
        email: data.user.email || '',
        role: profile.role
      });
    } catch (error) {
      console.error('[DEBUG-AUTH] checkAuth - Error occurred:', {
        callId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      router.replace('/login');
    } finally {
      console.log('[DEBUG-AUTH] checkAuth - Finally block:', {
        callId,
        settingLoadingToFalse: true,
        currentUser: user?.email,
        timestamp: new Date().toISOString()
      });
      setLoading(false);
    }
  }, [router, alert, user?.email, user?.role, loading]);

  useEffect(() => {
    console.log('[DEBUG-AUTH] useEffect - Entry:', {
      renderCount: renderCountRef.current,
      callCount: authCallCounterRef.current,
      hasUser: !!user,
      loading,
      timestamp: new Date().toISOString()
    });
    checkAuth();
  }, [checkAuth, loading, user]);

  console.log('[DEBUG-AUTH] useAdminAuth - Return:', {
    renderCount: renderCountRef.current,
    callCount: authCallCounterRef.current,
    hasUser: !!user,
    userEmail: user?.email,
    userRole: user?.role,
    loading,
    isAuthenticated: !!user,
    timestamp: new Date().toISOString()
  });

  return {
    user,
    loading,
    isAuthenticated: !!user,
    checkAuth
  };
}