import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

import type { CookieOptions } from '@supabase/ssr';


/**
 * updateSession function
 * @todo Add proper documentation
 */
export function UpdateSession(request: NextRequest) {
  // Criar uma resposta inicial
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Definir no request para que seja disponível imediatamente
          request.cookies.set({
            name,
            value,
            ...options,
          });
          
          // Criar nova resposta com o cookie atualizado
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          
          // Definir no response também
          response.cookies.set({
            name,
            value,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 dias por padrão
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // Remover do request
          request.cookies.delete(name);
          
          // Criar nova resposta
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          
          // Remover do response também
          response.cookies.set({
            name,
            value: '',
            path: '/',
            expires: new Date(0),
            maxAge: 0,
            ...options,
          });
        },
      },
    }
  );

  return { supabase, response };
}

// === COMPATIBILITY EXPORTS ===
// Export camelCase version for backward compatibility
export const updateSession = UpdateSession; 