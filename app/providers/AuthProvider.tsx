'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';


interface UserProfile {
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

interface AuthContextData {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; data?: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSectorAdmin: boolean;
  isSubsectorAdmin: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('[DEBUG-AUTH] useAuth chamado fora do AuthProvider');
    throw new Error('useAuth deve ser usado dentro do AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();
  


  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[DEBUG-AUTH] fetchUserProfile - Erro:', error);
        throw error;
      }

      return data as UserProfile;
    } catch (err) {
      console.error('[DEBUG-AUTH] fetchUserProfile - Erro ao buscar profile:', err);
      return null;
    }
  }, [supabase]);

  const initializeAuth = useCallback(async () => {
    
    try {
      setLoading(true);
      setError(null);

      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[DEBUG-AUTH] initializeAuth - Erro na sessão:', sessionError);
        setError(sessionError.message);
        return;
      }


      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        const userProfile = await fetchUserProfile(currentSession.user.id);
        if (userProfile) {
          setProfile(userProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
        setSession(null);
      }
    } catch (err) {
      console.error('[DEBUG-AUTH] initializeAuth - Erro crítico:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [supabase, fetchUserProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      console.error('[DEBUG-AUTH] signIn - Erro:', err);
      return { error: err as Error };
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setSession(null);
      router.push('/login');
    } catch (err) {
      console.error('[DEBUG-AUTH] signOut - Erro:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  const refreshSession = useCallback(async () => {
    await initializeAuth();
  }, [initializeAuth]);

  // UseEffect principal - simplificado
  useEffect(() => {
    
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setSession(null);
        router.push('/login');
      } else if (event === 'SIGNED_IN' && newSession) {
        setSession(newSession);
        setUser(newSession.user);
        const userProfile = await fetchUserProfile(newSession.user.id);
        if (userProfile) {
          setProfile(userProfile);
        }
      } else if (event === 'TOKEN_REFRESHED' && newSession) {
        setSession(newSession);
        setUser(newSession.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, fetchUserProfile, router, supabase.auth]);


  const contextValue: AuthContextData = {
    user,
    profile,
    session,
    loading,
    initialized,
    error,
    signIn,
    signOut,
    refreshSession,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isSectorAdmin: profile?.role === 'sector_admin' || profile?.role === 'admin',
    isSubsectorAdmin: profile?.role === 'subsector_admin' || profile?.role === 'sector_admin' || profile?.role === 'admin'
  };


  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}