'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface EntityAuthOptions {
  entityType: 'admin' | 'sector' | 'subsector';
  entityId?: string;
  requiredRole?: string | string[];
  redirectTo?: string;
  allowedRoles?: string[];
}

interface AuthState {
  user: any | null;
  profile: any | null;
  isLoading: boolean;
  isAuthorized: boolean;
  error: string | null;
}

// Cache para evitar múltiplas chamadas
const authCache = new Map<string, { data: AuthState; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useEntityAuth(options: EntityAuthOptions) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  
  const {
    entityType,
    entityId,
    requiredRole,
    redirectTo = '/home',
    allowedRoles = ['admin']
  } = options;

  const cacheKey = `${entityType}-${entityId || 'global'}-${requiredRole}`;
  
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Verificar cache
    const cached = authCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    return {
      user: null,
      profile: null,
      isLoading: true,
      isAuthorized: false,
      error: null
    };
  });

  const checkAuthorization = useCallback(async () => {
    try {
      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setAuthState({
          user: null,
          profile: null,
          isLoading: false,
          isAuthorized: false,
          error: 'Não autenticado'
        });
        router.replace('/login');
        return;
      }

      // Obter perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        setAuthState({
          user,
          profile: null,
          isLoading: false,
          isAuthorized: false,
          error: 'Perfil não encontrado'
        });
        router.replace('/login');
        return;
      }

      // Verificar autorização baseada no tipo de entidade
      let isAuthorized = false;
      
      switch (entityType) {
        case 'admin':
          isAuthorized = profile.role === 'admin';
          break;
          
        case 'sector':
          isAuthorized = profile.role === 'admin' || 
            (profile.role === 'sector_admin' && (!entityId || profile.sector_id === entityId));
          break;
          
        case 'subsector':
          isAuthorized = profile.role === 'admin' || 
            (profile.role === 'subsector_admin' && (!entityId || profile.subsector_id === entityId));
          break;
          
        default:
          isAuthorized = allowedRoles.includes(profile.role);
      }

      // Se requiredRole é especificado, verificar também
      if (requiredRole) {
        if (Array.isArray(requiredRole)) {
          isAuthorized = isAuthorized && requiredRole.includes(profile.role);
        } else {
          isAuthorized = isAuthorized && profile.role === requiredRole;
        }
      }

      const newState = {
        user,
        profile,
        isLoading: false,
        isAuthorized,
        error: isAuthorized ? null : 'Não autorizado'
      };

      // Atualizar cache
      authCache.set(cacheKey, {
        data: newState,
        timestamp: Date.now()
      });

      setAuthState(newState);

      // Redirecionar se não autorizado
      if (!isAuthorized) {
        router.replace(redirectTo);
      }
    } catch (error) {
      console.error('Erro ao verificar autorização:', error);
      setAuthState({
        user: null,
        profile: null,
        isLoading: false,
        isAuthorized: false,
        error: 'Erro ao verificar autorização'
      });
      router.replace(redirectTo);
    }
  }, [supabase, entityType, entityId, requiredRole, allowedRoles, redirectTo, router, cacheKey]);

  useEffect(() => {
    checkAuthorization();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        authCache.clear();
        router.replace('/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkAuthorization();
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAuthorization, supabase, router]);

  const refreshAuth = useCallback(() => {
    authCache.delete(cacheKey);
    checkAuthorization();
  }, [cacheKey, checkAuthorization]);

  return {
    ...authState,
    refreshAuth
  };
}