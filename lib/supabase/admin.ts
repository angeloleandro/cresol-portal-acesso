import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

/**
 * Cria um cliente Supabase com privilégios administrativos usando a service role key
 * @returns Cliente Supabase configurado com service role
 */
export function createAdminSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase admin configuration: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }
  
  return createClient(supabaseUrl, serviceKey, { 
    auth: { persistSession: false } 
  });
}

/**
 * Valida se um usuário é administrador usando o service role key
 * @param userId ID do usuário para verificar
 * @returns boolean indicando se o usuário é admin
 */
export async function validateAdminUser(userId: string): Promise<boolean> {
  try {
    const supabaseAdmin = createAdminSupabaseClient();
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      return false;
    }

    return data.role === 'admin';
  } catch (error) {
    console.error('Erro ao validar admin user:', error);
    return false;
  }
}

/**
 * Valida se um usuário é admin ou sector admin
 * @param userId ID do usuário para verificar
 * @returns boolean indicando se o usuário tem privilégios de admin/sector admin
 */
export async function validateAdminOrSectorAdminUser(userId: string): Promise<boolean> {
  try {
    const supabaseAdmin = createAdminSupabaseClient();
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      return false;
    }

    return ['admin', 'sector_admin'].includes(data.role);
  } catch (error) {
    console.error('Erro ao validar admin/sector admin user:', error);
    return false;
  }
}

/**
 * Extrai e valida token de autorização do header
 * @param authHeader Header de autorização
 * @returns Token limpo ou null se inválido
 */
export function extractAuthToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  return token && token !== authHeader ? token : null;
}

/**
 * Middleware de autenticação para APIs administrativas
 * @param request Request object do Next.js (suporta Request e NextRequest)
 * @returns Objeto com informações do usuário autenticado ou erro
 */
export async function authenticateAdminRequest(request: Request | { headers: Headers | { get: (name: string) => string | null } }) {
  const requestId = logger.generateRequestId();
  const authTimer = logger.authStart('Admin Authentication', { requestId });
  
  try {
    // Timer para criação do client
    const clientTimer = logger.dbStart('Create Admin Client', { requestId });
    const supabaseAdmin = createAdminSupabaseClient();
    logger.dbEnd(clientTimer);
    
    // Extrair token do header - compatível com Request e NextRequest
    let authHeader: string | null = null;
    
    if (request.headers && typeof request.headers.get === 'function') {
      authHeader = request.headers.get('authorization');
    }
    
    logger.debug('Token extraction', { 
      requestId,
      hasHeaders: !!request.headers,
      hasGetMethod: !!(request.headers && typeof request.headers.get === 'function'),
      authHeaderPresent: !!authHeader,
      authHeaderLength: authHeader?.length || 0
    });
    
    const token = extractAuthToken(authHeader);
    
    if (!token) {
      logger.authEnd(authTimer);
      logger.warn('Token de autorização não encontrado', { 
        requestId,
        authHeaderPresent: !!authHeader,
        authHeaderValue: authHeader ? `${authHeader.substring(0, 10)}...` : null
      });
      return { 
        success: false, 
        error: 'Token de autorização não encontrado',
        status: 401 
      };
    }

    // Validar usuário com token - PRIMEIRA QUERY SUPABASE
    const getUserTimer = logger.dbStart('supabase.auth.getUser', { requestId });
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    logger.dbEnd(getUserTimer);
    
    if (authError || !user) {
      logger.authEnd(authTimer);
      logger.error('Token inválido ou usuário não encontrado', authError || undefined, { requestId });
      return { 
        success: false, 
        error: 'Token inválido ou usuário não encontrado',
        status: 401 
      };
    }

    // Verificar role do usuário - SEGUNDA QUERY SUPABASE
    const profileTimer = logger.dbStart('profiles.select(role)', { requestId, userId: user.id });
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    logger.dbEnd(profileTimer);

    if (profileError || !profile) {
      logger.authEnd(authTimer);
      logger.error('Perfil de usuário não encontrado', profileError, { requestId, userId: user.id });
      return { 
        success: false, 
        error: 'Perfil de usuário não encontrado',
        status: 403 
      };
    }

    const authResult = logger.authEnd(authTimer);
    logger.success('Autenticação admin bem-sucedida', { 
      requestId, 
      userId: user.id, 
      role: profile.role,
      totalAuthTime: authResult?.duration
    });

    return {
      success: true,
      user,
      profile,
      supabaseAdmin
    };
  } catch (error) {
    logger.authEnd(authTimer);
    logger.error('Erro crítico na autenticação admin', error instanceof Error ? error : new Error(String(error)), { requestId });
    return { 
      success: false, 
      error: 'Erro interno do servidor',
      status: 500 
    };
  }
}

/**
 * Middleware de autorização para operações administrativas
 * @param userRole Role do usuário
 * @param requiredRoles Roles permitidas para a operação
 * @returns boolean indicando se tem autorização
 */
export function authorizeAdminOperation(
  userRole: string, 
  requiredRoles: string[] = ['admin']
): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Helper para criar responses de erro padronizados
 */
export const AdminAPIResponses = {
  unauthorized: () => ({ error: 'Não autorizado' }),
  forbidden: () => ({ error: 'Acesso negado' }),
  notFound: (resource: string) => ({ error: `${resource} não encontrado` }),
  serverError: (message?: string) => ({ error: message || 'Erro interno do servidor' }),
  success: (data?: any, message?: string) => ({ 
    ...(message && { message }), 
    ...(data && { data }) 
  })
} as const;