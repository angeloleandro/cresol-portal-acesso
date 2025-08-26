'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { logger } from '@/lib/production-logger';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: 'admin' | 'sector_admin' | 'user' | null;
  position: string | null;
  work_location_id: string | null;
  position_id: string | null;
  updated_at: string | null;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

// Cache keys
const AUTH_QUERY_KEYS = {
  session: ['auth', 'session'] as const,
  profile: (userId?: string) => ['auth', 'profile', userId] as const,
} as const;

export const useOptimizedAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    initialized: false
  });

  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);
  const authListenerRef = useRef<{ subscription: any } | null>(null);
  
  // Cache da sessão com React Query
  const { data: cachedSession, isLoading: sessionLoading } = useQuery({
    queryKey: AUTH_QUERY_KEYS.session,
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });

  // Cache do profile com React Query
  const { data: cachedProfile, isLoading: profileLoading } = useQuery({
    queryKey: AUTH_QUERY_KEYS.profile(state.user?.id),
    queryFn: async () => {
      if (!state.user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          username,
          avatar_url,
          role,
          position,
          work_location_id,
          position_id,
          updated_at
        `)
        .eq('id', state.user.id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!state.user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutos para profile
    gcTime: 1000 * 60 * 30, // 30 minutos
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 2;
    },
  });

  // Atualizar estado quando cache muda
  useEffect(() => {
    setState(prev => ({
      ...prev,
      session: cachedSession || null,
      user: cachedSession?.user || null,
      loading: sessionLoading || profileLoading,
      initialized: !sessionLoading
    }));
  }, [cachedSession, sessionLoading, profileLoading]);

  useEffect(() => {
    setState(prev => ({
      ...prev,
      profile: cachedProfile || null
    }));
  }, [cachedProfile]);

  // Sign in otimizado com cache
  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState(prev => ({ ...prev, loading: false }));
        return { error };
      }

      // Atualizar cache imediatamente
      if (data.session) {
        queryClient.setQueryData(AUTH_QUERY_KEYS.session, data.session);
      }

      return { data, error: null };
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      return { error: error as Error };
    }
  }, [supabase, queryClient]);

  // Sign out otimizado com limpeza de cache
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Erro ao fazer logout', error);
        setState(prev => ({ ...prev, loading: false }));
        return { error };
      }

      // Limpar cache imediatamente
      queryClient.removeQueries({ queryKey: ['auth'] });
      queryClient.clear(); // Limpar todo o cache na saída

      return { error: null };
    } catch (error) {
      logger.error('Erro fatal no logout', error);
      setState(prev => ({ ...prev, loading: false }));
      return { error: error as Error };
    }
  }, [supabase, queryClient]);

  // Refresh session otimizado
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        logger.error('Erro ao renovar sessão', error);
        return { error };
      }

      // Atualizar cache
      if (data.session) {
        queryClient.setQueryData(AUTH_QUERY_KEYS.session, data.session);
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Erro fatal ao renovar sessão', error);
      return { error: error as Error };
    }
  }, [supabase, queryClient]);

  // Setup otimizado do listener
  useEffect(() => {
    if (authListenerRef.current) {
      authListenerRef.current.subscription.unsubscribe();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        logger.debug('Auth state change', { event, userEmail: session?.user?.email });

        // Atualizar cache do React Query
        queryClient.setQueryData(AUTH_QUERY_KEYS.session, session);

        // Limpar cache do profile se o usuário mudou
        if (event === 'SIGNED_OUT' || !session) {
          queryClient.removeQueries({ queryKey: ['auth', 'profile'] });
        }

        // Invalidar queries para refetch
        if (event === 'SIGNED_IN' && session?.user) {
          queryClient.invalidateQueries({ 
            queryKey: AUTH_QUERY_KEYS.profile(session.user.id) 
          });
        }
      }
    );

    authListenerRef.current = { subscription };

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.subscription.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, [supabase, queryClient]);

  // Invalidar cache do profile quando necessário
  const invalidateProfile = useCallback(() => {
    if (state.user?.id) {
      queryClient.invalidateQueries({ 
        queryKey: AUTH_QUERY_KEYS.profile(state.user.id) 
      });
    }
  }, [state.user?.id, queryClient]);

  // Prefetch do profile para performance
  const prefetchProfile = useCallback((userId: string) => {
    queryClient.prefetchQuery({
      queryKey: AUTH_QUERY_KEYS.profile(userId),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            full_name,
            username,
            avatar_url,
            role,
            position,
            work_location_id,
            position_id,
            updated_at
          `)
          .eq('id', userId)
          .single();

        if (error) throw error;
        return data as UserProfile;
      },
      staleTime: 1000 * 60 * 10,
    });
  }, [supabase, queryClient]);

  return {
    ...state,
    signIn,
    signOut,
    refreshSession,
    invalidateProfile,
    prefetchProfile,
    isAuthenticated: !!state.user,
    isAdmin: state.profile?.role === 'admin',
    isSectorAdmin: state.profile?.role === 'sector_admin' || state.profile?.role === 'admin',
    // Métricas de cache para debug
    cacheInfo: {
      sessionCached: !!cachedSession,
      profileCached: !!cachedProfile,
      sessionLoading,
      profileLoading,
    }
  };
};