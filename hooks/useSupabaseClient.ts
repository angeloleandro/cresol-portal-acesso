'use client';

import { useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { logger } from '@/lib/production-logger';

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
    logger.debug('useSupabaseClient - Cliente criado/atualizado', {
      sessionActive: !!session,
      userId: session?.user?.id
    });
    
    return client;
  }, [session]);
  
  return supabase;
};