'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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

export const useSupabaseAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    initialized: false
  });

  const supabase = useMemo(() => createClient(), []);

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Erro ao buscar perfil', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Erro fatal ao buscar perfil', error);
      return null;
    }
  }, [supabase]);

  // Update auth state
  const updateAuthState = useCallback(async (session: Session | null) => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      if (session?.user) {
        // User is authenticated, fetch profile
        const profile = await fetchProfile(session.user.id);
        
        setState({
          user: session.user,
          profile,
          session,
          loading: false,
          initialized: true
        });
      } else {
        // User is not authenticated
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          initialized: true
        });
      }
    } catch (error) {
      logger.error('Erro ao atualizar estado de auth', error);
      setState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        initialized: true
      });
    }
  }, [fetchProfile]);

  // Sign in function
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

      // State will be updated automatically by auth listener
      return { data, error: null };
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      return { error: error as Error };
    }
  }, [supabase]);

  // Sign out function
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Erro ao fazer logout', error);
        setState(prev => ({ ...prev, loading: false }));
        return { error };
      }

      // State will be updated automatically by auth listener
      return { error: null };
    } catch (error) {
      logger.error('Erro fatal no logout', error);
      setState(prev => ({ ...prev, loading: false }));
      return { error: error as Error };
    }
  }, [supabase]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        logger.error('Erro ao renovar sessão', error);
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Erro fatal ao renovar sessão', error);
      return { error: error as Error };
    }
  }, [supabase]);

  // Initialize auth state and set up listeners
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Erro ao obter sessão inicial', error);
        }

        if (mounted) {
          await updateAuthState(session);
        }
      } catch (error) {
        logger.error('Erro na inicialização da auth', error);
        if (mounted) {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            initialized: true
          });
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        logger.debug('Auth state change', { event, userEmail: session?.user?.email });

        if (mounted) {
          await updateAuthState(session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, updateAuthState]);

  return {
    ...state,
    signIn,
    signOut,
    refreshSession,
    isAuthenticated: !!state.user,
    isAdmin: state.profile?.role === 'admin',
    isSectorAdmin: state.profile?.role === 'sector_admin' || state.profile?.role === 'admin',
  };
};