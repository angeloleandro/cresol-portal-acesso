import { GetCachedUserData, SetCachedUserData } from './middleware-cache';

import type { SupabaseClient } from '@supabase/supabase-js';




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
/**
 * getOptimizedUserAuth function
 * @todo Add proper documentation
 */
export async function getOptimizedUserAuth(
  supabase: SupabaseClient,
  accessToken?: string
): Promise<AuthResult> {
  const { logger } = await import('./logger');
  
  try {
    // Verificar cache primeiro se temos access token
    if (accessToken) {
      const cachedData = GetCachedUserData(accessToken);
      
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
      logger.error('Erro ao verificar permissões do usuário', profileError, { userId: user.id });
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
      SetCachedUserData(accessToken, {
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
    logger.error('Erro interno de autenticação', error instanceof Error ? error : new Error(String(error)));
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
/**
 * hasAdminAccess function
 * @todo Add proper documentation
 */
export function HasAdminAccess(role: string): boolean {
  return role === 'admin';
}

/**
 * Verifica se usuário tem permissão para acessar rota sector_admin
 */
/**
 * hasSectorAdminAccess function
 * @todo Add proper documentation
 */
export function HasSectorAdminAccess(role: string): boolean {
  return role === 'admin' || role === 'sector_admin';
}

/**
 * extractAccessToken function
 * @todo Add proper documentation
 */
export function ExtractAccessToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  // Padrões possíveis de cookie do Supabase
  const patterns = [
    /sb-[^-]+-auth-token=([^;]+)/,  // Formato padrão
    /sb-[^-]+-auth-token-code-verifier=([^;]+)/, // Formato alternativo
    /supabase\.auth\.token=([^;]+)/, // Formato legacy
    /sb-[^=]+=([^;]+)/ // Formato genérico sb-*
  ];

  for (const pattern of patterns) {
    const match = cookieHeader.match(pattern);
    if (match) {
      try {
        const tokenData = JSON.parse(decodeURIComponent(match[1]));
        
        // Verificar diferentes estruturas possíveis
        if (tokenData.access_token) {
          return tokenData.access_token;
        } else if (typeof tokenData === 'string') {
          // Token direto como string
          return tokenData;
        } else if (tokenData.token) {
          return tokenData.token;
        }
      } catch {
        // Se falhar parse JSON, pode ser um token direto
        try {
          const decoded = decodeURIComponent(match[1]);
          // Se não tem caracteres especiais de JSON, pode ser token direto
          if (!decoded.includes('{') && !decoded.includes('[')) {
            return decoded;
          }
        } catch {
          // Continua tentando outros padrões
        }
      }
    }
  }

  return null;
}

/**
 * Determina tipo de rota para otimizar verificações
 */
/**
 * getRouteType function
 * @todo Add proper documentation
 */
export function GetRouteType(pathname: string): {
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
    requiresAuth: pathname === '/' || pathname === '/dashboard' || isAdminRoute || isSectorAdminRoute || isApiAdminRoute || isPublicApi
  };
}

// === COMPATIBILITY EXPORTS ===
// Export camelCase versions for backward compatibility
export const hasAdminAccess = HasAdminAccess;
export const hasSectorAdminAccess = HasSectorAdminAccess;
export const extractAccessToken = ExtractAccessToken;
export const getRouteType = GetRouteType;