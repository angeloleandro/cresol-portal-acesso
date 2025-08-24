import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { authenticateAdminRequest } from '@/lib/supabase/admin';
import { CreateClient } from '@/lib/supabase/server';


// GET - Listar todos os setores
export async function GET(request: NextRequest) {
  const apiTimer = logger.apiStart('GET /api/sectors');
  
  try {
    logger.info('Iniciando busca de setores');
    
    // Autenticação admin (admin ou admin_setor podem acessar)
    const authResult = await authenticateAdminRequest(request);
    if (!authResult.success) {
      logger.apiEnd(apiTimer);
      logger.warn('Acesso negado na busca de setores', { error: authResult.error });
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    logger.success('Usuario autenticado para buscar setores', { userId: user?.id, role: user?.role });

    // Timer para criação do client
    const clientTimer = logger.dbStart('Create Supabase Client');
    const supabase = CreateClient();
    logger.dbEnd(clientTimer);

    // Buscar setores
    const sectorsTimer = logger.dbStart('sectors.select(all)', { userId: user?.id });
    const { data: sectors, error } = await supabase
      .from('sectors')
      .select(`
        id,
        name,
        description,
        color_theme,
        icon_name,
        created_at,
        updated_at
      `)
      .order('name');
    logger.dbEnd(sectorsTimer);

    if (error) {
      logger.apiEnd(apiTimer);
      logger.error('Erro ao buscar setores no banco', error);
      return NextResponse.json({ error: 'Erro ao buscar setores' }, { status: 500 });
    }

    const sectorCount = sectors?.length || 0;
    logger.success(`Setores carregados com sucesso`, { sectorCount });

    const apiResult = logger.apiEnd(apiTimer);
    return NextResponse.json({ 
      _debug: {
        sectorCount,
        queriesCount: 2 // authenticateAdminRequest (auth+profile) + sectors.select
      }
    });
    
  } catch (error: any) {
    logger.apiEnd(apiTimer);
    logger.error('Erro crítico ao buscar setores', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}