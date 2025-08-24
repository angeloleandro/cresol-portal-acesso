// Collection Item Specific Operations API
// Operações específicas para item individual da coleção

import { NextRequest, NextResponse } from 'next/server';

import { handleApiError, devLog } from '@/lib/error-handler';
import { CreateClient } from '@/lib/supabase/server';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// DELETE /api/collections/[id]/items/[itemId] - Remover item da coleção
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
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
    const itemId = params.itemId;

    // Verificar se o item está na coleção antes de remover
    const { data: collectionItem } = await supabase
      .from('collection_items')
      .select('*')
      .eq('collection_id', collectionId)
      .eq('id', itemId)
      .single();

    if (!collectionItem) {
      return NextResponse.json(
        { error: 'Item não encontrado na coleção' },
        { status: 404 }
      );
    }

    // Remover item da coleção
    const { error: deleteError } = await supabase
      .from('collection_items')
      .delete()
      .eq('id', itemId)
      .eq('collection_id', collectionId);

    if (deleteError) {
      devLog.error('Erro ao remover item da coleção', { deleteError, itemId, collectionId });
      return NextResponse.json(
        { error: 'Erro ao remover item da coleção' },
        { status: 500 }
      );
    }

    devLog.info('Item removido da coleção', { itemId, collectionId });

    return NextResponse.json({
      message: 'Item removido da coleção com sucesso!',
    });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'deleteCollectionItem');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}