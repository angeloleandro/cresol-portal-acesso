import { createClient } from '@supabase/supabase-js';

// Verificar se as variáveis de ambiente estão definidas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY precisam ser definidas');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Criação de uma única instância do cliente Supabase que será reutilizada
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'sb-cresol-portal-acesso-auth-token',
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

// Exportar uma função que sempre retorna a mesma instância
export const getSupabaseClient = () => supabase;