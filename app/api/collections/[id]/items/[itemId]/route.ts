// Collection Item Specific Operations API
// Operações específicas para item individual da coleção

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ERROR_MESSAGES } from '@/lib/constants/collections';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// DELETE /api/collections/[id]/items/[itemId] - Remover item da coleção
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
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
    const itemId = params.itemId;

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

    // Verificar se o item está na coleção
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
      console.error('Erro ao remover item da coleção:', deleteError);
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNKNOWN_ERROR },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Item removido da coleção com sucesso!',
    });

  } catch (error) {
    console.error('Erro ao remover item da coleção:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.NETWORK_ERROR },
      { status: 500 }
    );
  }
}