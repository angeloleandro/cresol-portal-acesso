// DEPRECATED: Use lib/supabase/client.ts em vez deste arquivo
// Mantido apenas para compatibilidade com imports existentes

import { createClient, supabase as clientSupabase } from './supabase/client'

// Re-exportar o cliente unificado
export const supabase = clientSupabase
export const getSupabaseClient = createClient

// Função de verificação de configuração (mantida para compatibilidade)
export const checkSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('As variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias')
  }
}