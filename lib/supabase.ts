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

// Criar cliente usando SSR para compatibilidade com o middleware
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Exportar uma função que sempre retorna a mesma instância e verifica a configuração
export const getSupabaseClient = () => {
  if (typeof window !== 'undefined') {
    // Só verificar a configuração no lado do cliente
    checkSupabaseConfig();
  }
  return supabase;
};