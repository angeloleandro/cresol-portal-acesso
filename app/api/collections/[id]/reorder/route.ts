// Collection Items Reorder API
// Reordenação de itens nas coleções - Portal Cresol

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ERROR_MESSAGES, COLLECTION_CONFIG } from '@/lib/constants/collections';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// PATCH /api/collections/[id]/reorder - Reordenar itens da coleção
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PERMISSION_DENIED },
        { status: 401 }
      );
    }

    // Verificar permissão admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PERMISSION_DENIED },
        { status: 403 }
      );
    }

    const collectionId = params.id;
    const body = await request.json();
    const { item_ids } = body;

    if (!Array.isArray(item_ids) || item_ids.length === 0) {
      return NextResponse.json(
        { error: 'item_ids deve ser um array não vazio' },
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
        { error: ERROR_MESSAGES.COLLECTION_NOT_FOUND },
        { status: 404 }
      );
    }

    // Verificar se todos os itens pertencem à coleção
    const { data: existingItems, error: itemsError } = await supabase
      .from('collection_items')
      .select('id')
      .eq('collection_id', collectionId)
      .in('id', item_ids);

    if (itemsError) {
      console.error('Erro ao verificar itens:', itemsError);
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNKNOWN_ERROR },
        { status: 500 }
      );
    }

    if (!existingItems || existingItems.length !== item_ids.length) {
      return NextResponse.json(
        { error: 'Alguns itens não pertencem a esta coleção' },
        { status: 400 }
      );
    }

    // Preparar updates para reordenação
    const updates = item_ids.map((itemId, index) => ({
      id: itemId,
      collection_id: collectionId,
      order_index: (index + 1) * COLLECTION_CONFIG.DEFAULT_ORDER_INCREMENT,
    }));

    // Executar updates em batch (usando transação manual)
    const { error: updateError } = await supabase.rpc('update_collection_items_order', {
      collection_id: collectionId,
      item_updates: updates,
    });

    // Se a função RPC não existir, fazer updates individuais
    if (updateError && updateError.message.includes('function') && updateError.message.includes('does not exist')) {
      console.warn('Função RPC não encontrada, usando updates individuais');
      
      // Fazer updates individuais
      const updatePromises = updates.map(update => 
        supabase
          .from('collection_items')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
          .eq('collection_id', collectionId)
      );

      const results = await Promise.all(updatePromises);
      const hasError = results.some(result => result.error);
      
      if (hasError) {
        console.error('Erro nos updates individuais:', results.filter(r => r.error));
        return NextResponse.json(
          { error: ERROR_MESSAGES.UNKNOWN_ERROR },
          { status: 500 }
        );
      }
    } else if (updateError) {
      console.error('Erro na reordenação:', updateError);
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNKNOWN_ERROR },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Ordem dos itens atualizada com sucesso!',
      updated_count: item_ids.length,
    });

  } catch (error) {
    console.error('Erro na reordenação de itens:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.NETWORK_ERROR },
      { status: 500 }
    );
  }
}