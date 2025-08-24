import { NextRequest, NextResponse } from 'next/server';

import { adminCORS } from '@/lib/cors-config';
import { logger } from '@/lib/logger';
import { authenticateAdminRequest } from '@/lib/supabase/admin';
import { CreateClient } from '@/lib/supabase/server';


// GET - Listar todos os usuários para seleção em grupos
export const GET = adminCORS(async (request: NextRequest) => {
  const apiTimer = logger.apiStart('GET /api/admin/users/all');
  
  try {
    logger.info('Iniciando busca de todos os usuários');
    
    // Autenticação admin
    const authResult = await authenticateAdminRequest(request);
    if (!authResult.success) {
      logger.apiEnd(apiTimer);
      logger.warn('Acesso negado na busca de usuários', { error: authResult.error });
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    logger.success('Usuario autenticado para buscar usuários', { userId: user?.id, role: user?.role });

    // Timer para criação do client
    const clientTimer = logger.dbStart('Create Supabase Client');
    const supabase = CreateClient();
    logger.dbEnd(clientTimer);

    // Buscar todos os usuários com informações relacionadas
    const usersTimer = logger.dbStart('profiles.select(all_users)', { userId: user?.id });
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        work_location_id,
        position_id,
        role,
        avatar_url,
        work_locations(id, name),
        positions(id, name)
      `)
      .order('full_name');
    logger.dbEnd(usersTimer);

    if (error) {
      logger.apiEnd(apiTimer);
      logger.error('Erro ao buscar usuários no banco', error);
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
    }

    // Transformar dados para formato esperado pelo frontend
    const transformedUsers = (users || []).map((user: any) => ({
      avatar_url: user.avatar_url
    }));

    const userCount = transformedUsers.length;
    logger.success(`Usuários carregados com sucesso`, { userCount });

    const apiResult = logger.apiEnd(apiTimer);
    return NextResponse.json({ 
      _debug: {
        userCount,
        queriesCount: 2 // authenticateAdminRequest (auth+profile) + profiles.select
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
});