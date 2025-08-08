/**
 * Middleware Authentication Utilities
 * Funções otimizadas para verificação de autenticação e autorização
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getCachedUserData, setCachedUserData } from './middleware-cache';

export interface UserAuthData {
  id: string;
  email?: string;
  role: string;
  isAuthenticated: boolean;
}

export interface AuthResult {
  user: UserAuthData | null;
  error: string | null;
  fromCache: boolean;
}

/**
 * Verifica usuário com cache otimizado - ÚNICA query para user + profile
 */
export async function getOptimizedUserAuth(
  supabase: SupabaseClient,
  accessToken?: string
): Promise<AuthResult> {
  try {
    // Verificar cache primeiro se temos access token
    if (accessToken) {
      const cachedData = getCachedUserData(accessToken);
      if (cachedData) {
        return {
          user: {
            id: cachedData.id,
            email: cachedData.email,
            role: cachedData.role,
            isAuthenticated: true
          },
          error: null,
          fromCache: true
        };
      }
    }

    // Single query para user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        user: null,
        error: userError?.message || 'Usuário não autenticado',
        fromCache: false
      };
    }

    // Single query otimizada para buscar profile com role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return {
        user: null,
        error: 'Erro ao verificar permissões do usuário',
        fromCache: false
      };
    }

    const userData: UserAuthData = {
      id: user.id,
      email: user.email,
      role: profile.role || 'user',
      isAuthenticated: true
    };

    // Cache os dados se temos access token
    if (accessToken) {
      setCachedUserData(accessToken, {
        id: userData.id,
        role: userData.role,
        email: userData.email,
        cachedAt: Date.now()
      });
    }

    return {
      user: userData,
      error: null,
      fromCache: false
    };

  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Erro interno de autenticação',
      fromCache: false
    };
  }
}

/**
 * Verifica se usuário tem permissão para acessar rota admin
 */
export function hasAdminAccess(role: string): boolean {
  return role === 'admin';
}

/**
 * Verifica se usuário tem permissão para acessar rota sector_admin
 */
export function hasSectorAdminAccess(role: string): boolean {
  return role === 'admin' || role === 'sector_admin';
}

/**
 * Extrair access token dos cookies de forma otimizada
 */
export function extractAccessToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  // Parse otimizado - busca apenas pelo token que precisamos
  const accessTokenMatch = cookieHeader.match(/sb-[^-]+-auth-token=([^;]+)/);
  if (!accessTokenMatch) return null;

  try {
    const tokenData = JSON.parse(decodeURIComponent(accessTokenMatch[1]));
    return tokenData.access_token || null;
  } catch {
    return null;
  }
}

/**
 * Determina tipo de rota para otimizar verificações
 */
export function getRouteType(pathname: string): {
  isAdmin: boolean;
  isSectorAdmin: boolean;
  isApiAdmin: boolean;
  isPublicApi: boolean;
  requiresAuth: boolean;
} {
  const isSectorAdminRoute = pathname.startsWith('/admin-setor');
  const isAdminRoute = pathname.startsWith('/admin') && !isSectorAdminRoute;
  const isApiAdminRoute = pathname.startsWith('/api/admin');
  
  // APIs públicas para usuários autenticados (apenas GET)
  const publicApiRoutes = [
    '/api/admin/economic-indicators',
    '/api/admin/system-links'
  ];
  const isPublicApi = publicApiRoutes.some(route => pathname === route);
  
  return {
    isAdmin: isAdminRoute,
    isSectorAdmin: isSectorAdminRoute,
    isApiAdmin: isApiAdminRoute && !isPublicApi,
    isPublicApi,
    requiresAuth: isAdminRoute || isSectorAdminRoute || isApiAdminRoute || isPublicApi
  };
}