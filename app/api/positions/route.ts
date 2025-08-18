import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateAdminRequest } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

// GET - Listar todas as posições/cargos
export async function GET(request: NextRequest) {
  const apiTimer = logger.apiStart('GET /api/positions');
  
  try {
    logger.info('Iniciando busca de posições/cargos');
    
    // Single auth check com profile - UMA QUERY OTIMIZADA
    const authResult = await authenticateAdminRequest(request);
    if (!authResult.success) {
      logger.apiEnd(apiTimer);
      logger.warn('Acesso negado na busca de posições', { error: authResult.error });
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    logger.success('Usuario autenticado para buscar posições', { userId: user?.id, role: user?.role });

    // Timer para criação do client
    const clientTimer = logger.dbStart('Create Supabase Client');
    const supabase = createClient();
    logger.dbEnd(clientTimer);

    // Buscar posições - ÚNICA QUERY RESTANTE
    const positionsTimer = logger.dbStart('positions.select(all)', { userId: user?.id });
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
      logger.error('Erro ao buscar cargos no banco', error);
      return NextResponse.json({ error: 'Erro ao buscar cargos' }, { status: 500 });
    }

    const positionCount = positions?.length || 0;
    logger.success(`Posições carregadas com sucesso`, { positionCount });

    const apiResult = logger.apiEnd(apiTimer);
    return NextResponse.json({ 
      success: true, 
      positions: positions || [],
      _debug: {
        totalTime: apiResult?.duration,
        positionCount,
        queriesCount: 2 // authenticateAdminRequest (auth+profile) + positions.select
      }
    });
    
  } catch (error: any) {
    logger.apiEnd(apiTimer);
    logger.error('Erro crítico ao buscar cargos', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}