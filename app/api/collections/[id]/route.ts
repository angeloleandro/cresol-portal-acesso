// Collections API Routes - Single Collection
// CRUD para coleção específica - Portal Cresol

import { NextRequest, NextResponse } from 'next/server';

import { handleApiError, devLog } from '@/lib/error-handler';
import { CreateClient } from '@/lib/supabase/server';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// GET /api/collections/[id] - Obter coleção específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = CreateClient();
    
    // Verificar se usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const collectionId = params.id;

    // Buscar coleção
    const { data: collection, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', collectionId)
      .single();

    if (error || !collection) {
      return NextResponse.json(
        { error: 'Coleção não encontrada' },
        { status: 404 }
      );
    }

    devLog.info('Coleção encontrada', { collectionId });
    return NextResponse.json({ collection });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'getCollection');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}

// PUT /api/collections/[id] - Atualizar coleção (apenas admins)
export async function PUT(
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

    // Validar campos obrigatórios
    if (body.name && !body.name.trim()) {
      return NextResponse.json(
        { error: 'Nome da coleção não pode estar vazio' },
        { status: 400 }
      );
    }

    // Atualizar coleção
    const { data: updatedCollection, error } = await supabase
      .from('collections')
      .update({
        name: body.name?.trim() || undefined,
        description: body.description || null,
        cover_image_url: body.cover_image_url || null,
        color_theme: body.color_theme || null,
        type: body.type || undefined,
        is_active: body.is_active !== undefined ? body.is_active : undefined,
        order_index: body.order_index !== undefined ? body.order_index : undefined,
      })
      .eq('id', collectionId)
      .select()
      .single();

    if (error) {
      devLog.error('Erro ao atualizar coleção', { error, body });
      return NextResponse.json(
        { error: 'Erro ao atualizar coleção' },
        { status: 500 }
      );
    }

    devLog.info('Coleção atualizada', { collection: updatedCollection });
    return NextResponse.json({ collection: updatedCollection });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'updateCollection');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/[id] - Excluir coleção (apenas admins)
export async function DELETE(
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

    // Excluir coleção
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId);

    if (error) {
      devLog.error('Erro ao excluir coleção', { error, collectionId });
      return NextResponse.json(
        { error: 'Erro ao excluir coleção' },
        { status: 500 }
      );
    }

    devLog.info('Coleção excluída', { collectionId });
    return NextResponse.json({ message: 'Coleção excluída com sucesso' });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'deleteCollection');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}