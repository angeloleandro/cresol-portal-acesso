import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { authenticateAdminRequest, AuthorizeAdminOperation } from '@/lib/supabase/admin';


// GET - Listar todos os usuários (profiles)
export async function GET(request: NextRequest) {
  const apiTimer = logger.apiStart('GET /api/users/list');
  
  try {
    logger.info('Iniciando listagem de usuários');
    
    // Autenticar usuário usando helper centralizado
    const authResult = await authenticateAdminRequest(request);
    
    if (!authResult.success) {
      logger.apiEnd(apiTimer);
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user, profile, supabaseAdmin } = authResult;

    if (!user || !supabaseAdmin || !profile) {
      logger.apiEnd(apiTimer);
      logger.error('Dados de autenticação incompletos');
      return NextResponse.json({ error: 'Erro na autenticação' }, { status: 401 });
    }

    // Verificar se é admin ou sector_admin
    if (!AuthorizeAdminOperation(profile.role, ['admin', 'sector_admin'])) {
      logger.apiEnd(apiTimer);
      logger.warn('Permissão negada para listar usuários', { userId: user.id, role: profile.role });
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 });
    }

    // Buscar todos os usuários - TERCEIRA QUERY SUPABASE
    const usersTimer = logger.dbStart('profiles.select(all_users)', { userId: user.id });
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        work_location_id,
        position_id,
        role
      `)
      .order('full_name');
    logger.dbEnd(usersTimer);

    if (error) {
      logger.apiEnd(apiTimer);
      logger.error('Erro ao buscar usuários no banco de dados', error);
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
    }

    const userCount = users?.length || 0;
    logger.success(`Usuários carregados com sucesso`, { userCount });

    const apiResult = logger.apiEnd(apiTimer);
    return NextResponse.json({ 
      success: true, 
      users: users || [],
      _debug: {
        totalTime: apiResult?.duration,
        userCount
      }
    });
    
  } catch (error: any) {
    logger.apiEnd(apiTimer);
    logger.error('Erro crítico ao buscar usuários', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}