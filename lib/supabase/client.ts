import { createBrowserClient } from '@supabase/ssr';

// Variável para armazenar a instância do cliente
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // Se já existe um cliente, retorna a instância existente
  if (supabaseClient) {
    return supabaseClient;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Variáveis de ambiente do Supabase não definidas');
  }
  
  // Cria uma nova instância e a armazena
  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      name: 'sb-supabase-auth',
      maxAge: 60 * 60 * 8, // 8 horas
      domain: '',
      path: '/',
      sameSite: 'lax'
    }
  });
  
  return supabaseClient;
} 