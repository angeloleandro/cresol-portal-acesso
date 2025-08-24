// Admin Collections Stats API
// Estatísticas de coleções para interface administrativa

import { NextRequest, NextResponse } from 'next/server';

import { handleApiError, devLog } from '@/lib/error-handler';
import { CreateClient } from '@/lib/supabase/server';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// GET /api/admin/collections/stats - Obter estatísticas das coleções
export async function GET(_request: NextRequest) {
  try {
    const supabase = CreateClient();
    
    // Verificar se usuário está autenticado e é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Obter estatísticas básicas
    const { data: collections, error } = await supabase
      .from('collections')
      .select('id, is_active, type, created_at');

    if (error) {
      devLog.error('Erro ao buscar coleções para stats', { error });
      return NextResponse.json(
        { error: 'Erro ao buscar estatísticas' },
        { status: 500 }
      );
    }

    // Calcular estatísticas
    const total = collections?.length || 0;
    const active = collections?.filter(c => c.is_active).length || 0;

    const stats = {
      total,
      active,
      inactive: total - active,
    };

    devLog.info('Stats de coleções calculadas', { stats });
    return NextResponse.json({ stats });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'getCollectionStats');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}