'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { logger } from '@/lib/production-logger';

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

// Cache interface para gerenciar estado localmente
interface AuthCache {
  session: Session | null;
  profile: UserProfile | null;
  sessionCheckedAt: number;
  profileCheckedAt: number;
}

const CACHE_DURATION = {
  session: 5 * 60 * 1000, // 5 minutos
  profile: 10 * 60 * 1000, // 10 minutos
};

export const useOptimizedAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    initialized: false
  });

  const supabase = useMemo(() => createClient(), []);
  const authListenerRef = useRef<{ subscription: any } | null>(null);
  const cacheRef = useRef<AuthCache>({
    session: null,
    profile: null,
    sessionCheckedAt: 0,
    profileCheckedAt: 0,
  });
  
  // Função para verificar e carregar sessão com cache local
  const loadSession = useCallback(async (force = false) => {
    const now = Date.now();
    const cache = cacheRef.current;
    
    // Usar cache se ainda válido e não forçar refresh
    if (!force && cache.session && (now - cache.sessionCheckedAt) < CACHE_DURATION.session) {
      return cache.session;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        logger.error('Erro ao carregar sessão', error);
        return null;
      }
      
      // Atualizar cache
      cacheRef.current.session = session;
      cacheRef.current.sessionCheckedAt = now;
      
      return session;
    } catch (error) {
      logger.error('Erro fatal ao carregar sessão', error);
      return null;
    }
  }, [supabase]);

  // Função para carregar profile com cache local
  const loadProfile = useCallback(async (userId: string, force = false) => {
    const now = Date.now();
    const cache = cacheRef.current;
    
    // Usar cache se ainda válido e não forçar refresh
    if (!force && cache.profile && cache.profile.id === userId && 
        (now - cache.profileCheckedAt) < CACHE_DURATION.profile) {
      return cache.profile;
    }

    try {
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

      if (error) {
        logger.error('Erro ao carregar profile', error);
        return null;
      }
      
      // Atualizar cache
      const profile = data as UserProfile;
      cacheRef.current.profile = profile;
      cacheRef.current.profileCheckedAt = now;
      
      return profile;
    } catch (error) {
      logger.error('Erro fatal ao carregar profile', error);
      return null;
    }
  }, [supabase]);

  // Carregar sessão e profile na inicialização
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Carregar sessão
        const session = await loadSession();
        
        if (!mounted) return;
        
        if (session?.user) {
          // Carregar profile se tiver sessão
          const profile = await loadProfile(session.user.id);
          
          if (!mounted) return;
          
          setState({
            user: session.user,
            session,
            profile,
            loading: false,
            initialized: true
          });
        } else {
          setState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            initialized: true
          });
        }
      } catch (error) {
        logger.error('Erro na inicialização do auth', error);
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            initialized: true
          }));
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [loadSession, loadProfile]);

  // Atualizar quando a janela ganha foco
  useEffect(() => {
    const handleFocus = async () => {
      const session = await loadSession();
      if (session?.user && session.user.id !== state.user?.id) {
        const profile = await loadProfile(session.user.id);
        setState(prev => ({
          ...prev,
          user: session.user,
          session,
          profile
        }));
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadSession, loadProfile, state.user?.id]);

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

      // Atualizar cache local imediatamente
      if (data.session) {
        cacheRef.current.session = data.session;
        cacheRef.current.sessionCheckedAt = Date.now();
        
        // Carregar profile do novo usuário
        if (data.session.user) {
          const profile = await loadProfile(data.session.user.id, true);
          setState({
            user: data.session.user,
            session: data.session,
            profile,
            loading: false,
            initialized: true
          });
        }
      }

      return { data, error: null };
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      return { error: error as Error };
    }
  }, [supabase, loadProfile]);

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

      // Limpar cache local imediatamente
      cacheRef.current = {
        session: null,
        profile: null,
        sessionCheckedAt: 0,
        profileCheckedAt: 0,
      };
      
      setState({
        user: null,
        session: null,
        profile: null,
        loading: false,
        initialized: true
      });

      return { error: null };
    } catch (error) {
      logger.error('Erro fatal no logout', error);
      setState(prev => ({ ...prev, loading: false }));
      return { error: error as Error };
    }
  }, [supabase]);

  // Refresh session otimizado
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        logger.error('Erro ao renovar sessão', error);
        return { error };
      }

      // Atualizar cache local
      if (data.session) {
        cacheRef.current.session = data.session;
        cacheRef.current.sessionCheckedAt = Date.now();
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Erro fatal ao renovar sessão', error);
      return { error: error as Error };
    }
  }, [supabase]);

  // Setup otimizado do listener
  useEffect(() => {
    if (authListenerRef.current) {
      authListenerRef.current.subscription.unsubscribe();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        logger.debug('Auth state change', { event, userEmail: session?.user?.email });

        // Atualizar cache local
        if (session) {
          cacheRef.current.session = session;
          cacheRef.current.sessionCheckedAt = Date.now();
          
          // Carregar profile para novo usuário
          if (session.user && event === 'SIGNED_IN') {
            const profile = await loadProfile(session.user.id, true);
            setState({
              user: session.user,
              session,
              profile,
              loading: false,
              initialized: true
            });
          }
        } else {
          // Limpar cache quando sair
          cacheRef.current = {
            session: null,
            profile: null,
            sessionCheckedAt: 0,
            profileCheckedAt: 0,
          };
          
          setState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            initialized: true
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
  }, [supabase, loadProfile]);

  // Forçar recarga do profile
  const refreshProfile = useCallback(async () => {
    if (state.user?.id) {
      const profile = await loadProfile(state.user.id, true);
      setState(prev => ({ ...prev, profile }));
    }
  }, [state.user?.id, loadProfile]);

  // Limpar cache manualmente
  const clearCache = useCallback(() => {
    cacheRef.current = {
      session: null,
      profile: null,
      sessionCheckedAt: 0,
      profileCheckedAt: 0,
    };
  }, []);

  return {
    ...state,
    signIn,
    signOut,
    refreshSession,
    refreshProfile,
    clearCache,
    isAuthenticated: !!state.user,
    isAdmin: state.profile?.role === 'admin',
    isSectorAdmin: state.profile?.role === 'sector_admin' || state.profile?.role === 'admin',
    // Métricas de cache para debug
    cacheInfo: {
      sessionCached: !!cacheRef.current.session,
      profileCached: !!cacheRef.current.profile,
      sessionAge: Date.now() - cacheRef.current.sessionCheckedAt,
      profileAge: Date.now() - cacheRef.current.profileCheckedAt,
    }
  };
};