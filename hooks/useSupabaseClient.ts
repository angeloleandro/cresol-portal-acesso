'use client';

import { useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';

/**
 * Hook que retorna um cliente Supabase autenticado
 * Este hook garante que o cliente Supabase sempre tenha a sessão atual
 */
export const useSupabaseClient = () => {
  const { session } = useAuth();
  
  // Criar cliente Supabase que é recriado quando a sessão muda
  const supabase = useMemo(() => {
    const client = createClient();
    
    // Log para debug
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 [useSupabaseClient] Cliente criado/atualizado');
      console.log('   Sessão ativa:', !!session);
      console.log('   User ID:', session?.user?.id);
    }
    
    return client;
  }, [session]);
  
  return supabase;
};