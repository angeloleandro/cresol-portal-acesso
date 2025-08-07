import { createBrowserClient } from '@supabase/ssr'

// Obter as variáveis de ambiente com fallbacks para o build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Verificar se as variáveis são reais (não placeholders) apenas em tempo de execução
const isValidConfig = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';

// Função para verificar configuração em tempo de execução
export const checkSupabaseConfig = () => {
  if (!isValidConfig) {
    throw new Error('As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY precisam ser definidas');
  }
};

// Função para criar cliente Supabase para uso client-side
export const createClient = () => {
  if (typeof window !== 'undefined') {
    // Só verificar a configuração no lado do cliente
    checkSupabaseConfig();
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Exportar uma instância padrão para compatibilidade
export const supabase = createClient();