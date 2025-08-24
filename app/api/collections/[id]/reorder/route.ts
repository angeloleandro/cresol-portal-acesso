// Collection Items Reorder API
// Reordenação de itens nas coleções - Portal Cresol

import { NextRequest, NextResponse } from 'next/server';

import { handleApiError, devLog } from '@/lib/error-handler';
import { CreateClient } from '@/lib/supabase/server';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// POST /api/collections/[id]/reorder - Reordenar itens da coleção
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const collectionId = params.id;
    const body = await request.json();
    const { items } = body; // Mudando para receber array de objetos com id e order_index

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items deve ser um array não vazio com objetos {id, order_index}' },
        { status: 400 }
      );
    }

    // Verificar se a coleção existe
    const { data: collection } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .single();

    if (!collection) {
      return NextResponse.json(
        { error: 'Coleção não encontrada' },
        { status: 404 }
      );
    }

    // Fazer updates individuais de ordem
    const updatePromises = items.map(item => 
      supabase
        .from('collection_items')
        .update({ order_index: item.order_index })
        .eq('id', item.id)
        .eq('collection_id', collectionId)
    );

    const results = await Promise.all(updatePromises);
    const hasError = results.some(result => result.error);
    
    if (hasError) {
      const errors = results.filter(r => r.error).map(r => r.error);
      devLog.error('Erro na reordenação', { errors });
      return NextResponse.json(
        { error: 'Erro ao reordenar itens' },
        { status: 500 }
      );
    }

    devLog.info('Itens reordenados', { collectionId, count: items.length });

    return NextResponse.json({
      message: 'Ordem dos itens atualizada com sucesso!',
      updated_count: items.length,
    });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'reorderCollectionItems');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}