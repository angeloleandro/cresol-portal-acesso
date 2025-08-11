// Collections API Routes - Single Collection
// CRUD para coleção específica - Portal Cresol

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ERROR_MESSAGES } from '@/lib/constants/collections';
import { validateCollection } from '@/lib/utils/collections';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// GET /api/collections/[id] - Obter coleção específica
export async function GET(
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

    const collectionId = params.id;
    const { searchParams } = new URL(request.url);
    const includeItems = searchParams.get('include_items') === 'true';

    // Buscar coleção
    let query = supabase
      .from('collections')
      .select(`
        *,
        profiles!collections_created_by_fkey(id, name)
      `)
      .eq('id', collectionId)
      .single();

    const { data: collection, error } = await query;

    if (error || !collection) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.COLLECTION_NOT_FOUND },
        { status: 404 }
      );
    }

    let result = { ...collection };

    // Incluir itens se solicitado
    if (includeItems) {
      const { data: items } = await supabase
        .from('collection_items')
        .select(`
          *,
          gallery_images!collection_items_item_id_fkey(
            id, title, image_url, is_active, order_index, created_at
          ),
          dashboard_videos!collection_items_item_id_fkey(
            id, title, video_url, thumbnail_url, is_active, 
            order_index, upload_type, created_at
          )
        `)
        .eq('collection_id', collectionId)
        .order('order_index', { ascending: true });

      // Processar itens com seus dados
      const processedItems = items?.map(item => {
        let itemData = null;
        
        if (item.item_type === 'image' && item.gallery_images) {
          itemData = Array.isArray(item.gallery_images) 
            ? item.gallery_images[0] 
            : item.gallery_images;
        } else if (item.item_type === 'video' && item.dashboard_videos) {
          itemData = Array.isArray(item.dashboard_videos) 
            ? item.dashboard_videos[0] 
            : item.dashboard_videos;
        }

        return {
          ...item,
          item_data: itemData,
        };
      }) || [];

      result = {
        ...result,
        items: processedItems,
        item_count: processedItems.length,
      };
    } else {
      // Apenas contar itens
      const { count } = await supabase
        .from('collection_items')
        .select('*', { count: 'exact', head: true })
        .eq('collection_id', collectionId);

      result = {
        ...result,
        item_count: count || 0,
      };
    }

    return NextResponse.json({ collection: result });

  } catch (error) {
    console.error('Erro ao buscar coleção:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.NETWORK_ERROR },
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
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PERMISSION_DENIED },
        { status: 401 }
      );
    }

    // Verificar se é admin
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
    const {
      name,
      description,
      cover_image_url,
      color_theme,
      type,
      is_active,
      order_index,
    } = body;

    // Verificar se coleção existe
    const { data: existingCollection } = await supabase
      .from('collections')
      .select('id, name')
      .eq('id', collectionId)
      .single();

    if (!existingCollection) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.COLLECTION_NOT_FOUND },
        { status: 404 }
      );
    }

    // Validações
    if (name) {
      const nameError = validateCollection.name(name);
      if (nameError) {
        return NextResponse.json({ error: nameError }, { status: 400 });
      }

      // Verificar se já existe outra coleção com mesmo nome
      if (name !== existingCollection.name) {
        const { data: duplicateCollection } = await supabase
          .from('collections')
          .select('id')
          .eq('name', name)
          .neq('id', collectionId)
          .single();

        if (duplicateCollection) {
          return NextResponse.json(
            { error: ERROR_MESSAGES.COLLECTION_ALREADY_EXISTS },
            { status: 409 }
          );
        }
      }
    }

    if (description) {
      const descriptionError = validateCollection.description(description);
      if (descriptionError) {
        return NextResponse.json({ error: descriptionError }, { status: 400 });
      }
    }

    if (color_theme) {
      const colorError = validateCollection.colorTheme(color_theme);
      if (colorError) {
        return NextResponse.json({ error: colorError }, { status: 400 });
      }
    }

    // Preparar dados para atualização (apenas campos fornecidos)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;
    if (color_theme !== undefined) updateData.color_theme = color_theme;
    if (type !== undefined) updateData.type = type;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (order_index !== undefined) updateData.order_index = order_index;

    // Atualizar coleção
    const { data: updatedCollection, error: updateError } = await supabase
      .from('collections')
      .update(updateData)
      .eq('id', collectionId)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar coleção:', updateError);
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNKNOWN_ERROR },
        { status: 500 }
      );
    }

    // Buscar count de itens
    const { count } = await supabase
      .from('collection_items')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', collectionId);

    return NextResponse.json({
      collection: {
        ...updatedCollection,
        item_count: count || 0,
      },
      message: 'Coleção atualizada com sucesso!',
    });

  } catch (error) {
    console.error('Erro na atualização de coleção:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.NETWORK_ERROR },
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
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PERMISSION_DENIED },
        { status: 401 }
      );
    }

    // Verificar se é admin
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

    // Verificar se coleção existe
    const { data: existingCollection } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .single();

    if (!existingCollection) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.COLLECTION_NOT_FOUND },
        { status: 404 }
      );
    }

    // Verificar se coleção possui itens
    const { searchParams } = new URL(request.url);
    const forceDelete = searchParams.get('force') === 'true';

    if (!forceDelete) {
      const { count } = await supabase
        .from('collection_items')
        .select('*', { count: 'exact', head: true })
        .eq('collection_id', collectionId);

      if ((count || 0) > 0) {
        return NextResponse.json(
          { 
            error: ERROR_MESSAGES.CANNOT_DELETE_WITH_ITEMS,
            item_count: count,
          },
          { status: 409 }
        );
      }
    }

    // Excluir coleção (cascade vai remover collection_items automaticamente)
    const { error: deleteError } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId);

    if (deleteError) {
      console.error('Erro ao excluir coleção:', deleteError);
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNKNOWN_ERROR },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Coleção excluída com sucesso!',
    });

  } catch (error) {
    console.error('Erro na exclusão de coleção:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.NETWORK_ERROR },
      { status: 500 }
    );
  }
}