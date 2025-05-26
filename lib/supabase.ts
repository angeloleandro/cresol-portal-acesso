import { createBrowserClient } from '@supabase/ssr'

// Verificar se as variáveis de ambiente estão definidas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY precisam ser definidas');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Criar cliente usando SSR para compatibilidade com o middleware
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Exportar uma função que sempre retorna a mesma instância
export const getSupabaseClient = () => supabase;