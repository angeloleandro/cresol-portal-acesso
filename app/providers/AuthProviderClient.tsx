'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user' | null;
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

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null; data?: any }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<{ error: Error | null; data?: any }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSectorAdmin: boolean;
  isSubsectorAdmin: boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProviderClient: React.FC<AuthProviderProps> = ({ children }) => {
  
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    initialized: false
  });

  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ [AuthProviderClient] Erro ao buscar sessão:', error);
        } else {
        }

        if (session?.user && mounted) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setState({
            user: session.user,
            profile: profileData,
            session,
            loading: false,
            initialized: true
          });
        } else if (mounted) {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            initialized: true
          });
        }
      } catch (error) {
        console.error('❌ [AuthProviderClient] Erro fatal:', error);
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

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        
        if (!mounted) return;

        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setState({
            user: session.user,
            profile: profileData,
            session,
            loading: false,
            initialized: true
          });
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            initialized: true
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    return { data, error };
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signOut,
    refreshSession,
    isAuthenticated: !!state.user,
    isAdmin: state.profile?.role === 'admin',
    isSectorAdmin: state.profile?.role === 'sector_admin' || state.profile?.role === 'admin',
    isSubsectorAdmin: state.profile?.role === 'subsector_admin' || state.profile?.role === 'sector_admin' || state.profile?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};