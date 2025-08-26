import { createBrowserClient } from '@supabase/ssr'

import type { Database } from '../../types/supabase'


// Obter as variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Verificar configuração
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias')
}

// Função para criar cliente Supabase - SEMPRE cria nova instância
// Isso garante que a sessão seja verificada corretamente em cada acesso
export const createClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    cookies: {
      get(name: string) {
        if (typeof document !== 'undefined') {
          const value = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1]
          return value ? decodeURIComponent(value) : undefined
        }
        return undefined
      },
      set(name: string, value: string, options?: Record<string, unknown>) {
        if (typeof document !== 'undefined') {
          let cookieStr = `${name}=${encodeURIComponent(value)}`
          
          if (options?.maxAge) cookieStr += `; max-age=${options.maxAge}`
          if (options?.expires && options.expires instanceof Date) cookieStr += `; expires=${options.expires.toUTCString()}`
          if (options?.path) cookieStr += `; path=${options.path}`
          if (options?.domain) cookieStr += `; domain=${options.domain}`
          if (options?.secure) cookieStr += '; secure'
          if (options?.httpOnly) cookieStr += '; httponly'
          if (options?.sameSite) cookieStr += `; samesite=${options.sameSite}`
          
          document.cookie = cookieStr
        }
      },
      remove(name: string, options?: Record<string, unknown>) {
        if (typeof document !== 'undefined') {
          let cookieStr = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          if (options?.path) cookieStr += `; path=${options.path}`
          if (options?.domain) cookieStr += `; domain=${options.domain}`
          document.cookie = cookieStr
        }
      }
    }
  })
}

// IMPORTANTE: Exportar uma função que cria nova instância, não uma instância fixa
// Isso resolve o problema de carregamento direto de páginas
// export const supabase = createClient() // REMOVIDO - causava problemas de sessão

// Para compatibilidade com código existente, criar função helper
export function getSupabase() {
  return createClient()
}