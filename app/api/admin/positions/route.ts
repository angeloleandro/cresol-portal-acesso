import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateAdminRequest } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';
import { adminCORS } from '@/lib/cors-config';

// GET - Listar todas as posições/cargos para administração
export const GET = adminCORS(async (request: NextRequest) => {
  const apiTimer = logger.apiStart('GET /api/admin/positions');
  
  try {
    logger.info('Iniciando busca de posições/cargos (admin)');
    
    // Autenticação admin
    const authResult = await authenticateAdminRequest(request);
    if (!authResult.success) {
      logger.apiEnd(apiTimer);
      logger.warn('Acesso negado na busca de posições (admin)', { error: authResult.error });
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    logger.success('Usuario autenticado para buscar posições (admin)', { userId: user?.id, role: user?.role });

    // Timer para criação do client
    const clientTimer = logger.dbStart('Create Supabase Client');
    const supabase = createClient();
    logger.dbEnd(clientTimer);

    // Buscar posições
    const positionsTimer = logger.dbStart('positions.select(admin)', { userId: user?.id });
    const { data: positions, error } = await supabase
      .from('positions')
      .select(`
        id,
        name,
        description,
        department,
        created_at,
        updated_at
      `)
      .order('name');
    logger.dbEnd(positionsTimer);

    if (error) {
      logger.apiEnd(apiTimer);
      logger.error('Erro ao buscar cargos no banco (admin)', error);
      return NextResponse.json({ error: 'Erro ao buscar cargos' }, { status: 500 });
    }

    const positionCount = positions?.length || 0;
    logger.success(`Posições carregadas com sucesso (admin)`, { positionCount });

    const apiResult = logger.apiEnd(apiTimer);
    return NextResponse.json({ 
      _debug: {
        positionCount,
        queriesCount: 2 // authenticateAdminRequest (auth+profile) + positions.select
      }
    });
    
  } catch (error: any) {
    logger.apiEnd(apiTimer);
    logger.error('Erro crítico ao buscar cargos (admin)', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
});