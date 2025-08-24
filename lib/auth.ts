import { createClient } from '@supabase/supabase-js';

import { ADMIN_EMAIL, KNOWN_ADMIN_ID } from './constants';

import type { SupabaseClient } from '@supabase/supabase-js';


// Create admin Supabase client with service role key
export function CreateAdminSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, serviceKey, { 
    auth: { persistSession: false } 
  });
}

// Verificar se o usuário é um administrador
export async function isUserAdmin(userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return false;
  }
  
  // Para depuração, verificar se o userId recebido corresponde ao esperado para o usuário admin
  const adminEmail = ADMIN_EMAIL;
  
  try {
    // Usar a chave de serviço para contornar as políticas RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    });
    
    // Primeiro verificar diretamente pelo userId fornecido
    const { data, error } = await supabase
      .from('profiles')
      .select('role, email, full_name')
      .eq('id', userId)
      .single();
    
    if (error) {
      // Tentar uma abordagem alternativa se a primeira falhar
      return await checkAdminByEmail(supabase, adminEmail, userId);
    }
    
    if (!data) {
      // Tentar uma abordagem alternativa se a primeira falhar
      return await checkAdminByEmail(supabase, adminEmail, userId);
    }

    const isAdmin = data.role === 'admin';
    return isAdmin;
  } catch (error) {
    // Como último recurso, comparar diretamente com o userId conhecido do admin
    try {
      const knownAdminId = KNOWN_ADMIN_ID; // ID do usuário admin verificado no Supabase
      const isKnownAdmin = userId === knownAdminId;
      return isKnownAdmin;
    } catch (e) {
      return false;
    }
  }
}

// Função auxiliar para verificar se um determinado email tem privilégios de admin
async function checkAdminByEmail(supabase: SupabaseClient, adminEmail: string, originalUserId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', adminEmail)
      .single();
      
    if (error) {
      return false;
    }
    
    if (!data) {
      return false;
    }
    
    // Verificar se o ID do usuário admin corresponde ao userId que estamos verificando
    const isCorrectUser = data.id === originalUserId;
    const isAdminRole = data.role === 'admin';
    
    return isCorrectUser && isAdminRole;
  } catch (error) {
    return false;
  }
}

// Verificar se o usuário está autenticado com cookies válidos
export async function validateUserSession(headers: Headers) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return { isValid: false, userId: null };
    }
    
    // Extrair cookies
    const cookieHeader = headers.get('cookie') || '';
    
    // Verificar se o cookie de autenticação existe
    if (!cookieHeader.includes('sb-')) {
      return { isValid: false, userId: null };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, userId: null };
  }
} 