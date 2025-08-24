// Collection Items API Routes
// Gerenciamento de itens das coleções - Portal Cresol

import { NextRequest, NextResponse } from 'next/server';

import { handleApiError, devLog } from '@/lib/error-handler';
import { CreateClient } from '@/lib/supabase/server';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// GET /api/collections/[id]/items - Listar itens de uma coleção
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

    // Verificar se a coleção existe
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('*')
      .eq('id', collectionId)
      .single();

    if (collectionError || !collection) {
      return NextResponse.json(
        { error: 'Coleção não encontrada' },
        { status: 404 }
      );
    }

    // Buscar itens da coleção com seus dados
    const { data: items, error: itemsError } = await supabase
      .from('collection_items')
      .select(`
        id,
        collection_id,
        item_id,
        item_type,
        order_index,
        added_at,
        added_by
      `)
      .eq('collection_id', collectionId)
      .order('order_index', { ascending: true });

    if (itemsError) {
      devLog.error('Erro ao buscar itens da coleção', { itemsError });
      return NextResponse.json(
        { error: 'Erro ao buscar itens da coleção' },
        { status: 500 }
      );
    }

    // Separar IDs por tipo para buscar dados específicos
    const imageIds = items?.filter(item => item.item_type === 'image').map(item => item.item_id) || [];
    const videoIds = items?.filter(item => item.item_type === 'video').map(item => item.item_id) || [];

    // Buscar dados das imagens
    let imagesData: any[] = [];
    if (imageIds.length > 0) {
      const { data: images } = await supabase
        .from('gallery_images')
        .select('id, title, image_url, is_active, order_index, created_at')
        .in('id', imageIds);
      
      imagesData = images || [];
    }

    // Buscar dados dos vídeos
    let videosData: any[] = [];
    if (videoIds.length > 0) {
      const { data: videos } = await supabase
        .from('dashboard_videos')
        .select('id, title, video_url, thumbnail_url, is_active, order_index, upload_type, created_at')
        .in('id', videoIds);
      
      videosData = videos || [];
    }

    // Combinar dados dos itens com suas informações específicas
    const itemsWithData = items?.map(item => {
      let itemData = null;
      
      if (item.item_type === 'image') {
        itemData = imagesData.find(img => img.id === item.item_id);
      } else if (item.item_type === 'video') {
        itemData = videosData.find(vid => vid.id === item.item_id);
      }

      return {
        ...item,
        item_data: itemData,
      };
    }) || [];

    return NextResponse.json({
      items: itemsWithData,
      collection,
      total: itemsWithData.length,
    });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'getCollectionItems');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}

// POST /api/collections/[id]/items - Adicionar item à coleção
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
    const { item_id, item_type, order_index } = body;

    // Validar campos obrigatórios
    if (!item_id || !item_type) {
      return NextResponse.json(
        { error: 'item_id e item_type são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['image', 'video'].includes(item_type)) {
      return NextResponse.json(
        { error: 'Tipo de item inválido. Deve ser "image" ou "video"' },
        { status: 400 }
      );
    }

    // Verificar se a coleção existe
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('*')
      .eq('id', collectionId)
      .single();

    if (collectionError || !collection) {
      return NextResponse.json(
        { error: 'Coleção não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o item existe na tabela correspondente
    const itemTable = item_type === 'image' ? 'gallery_images' : 'dashboard_videos';
    const { data: itemExists } = await supabase
      .from(itemTable)
      .select('id')
      .eq('id', item_id)
      .single();

    if (!itemExists) {
      return NextResponse.json(
        { error: `${item_type === 'image' ? 'Imagem' : 'Vídeo'} não encontrado` },
        { status: 404 }
      );
    }

    // Verificar se o item já está na coleção
    const { data: existingItem } = await supabase
      .from('collection_items')
      .select('id')
      .eq('collection_id', collectionId)
      .eq('item_id', item_id)
      .eq('item_type', item_type)
      .single();

    if (existingItem) {
      return NextResponse.json(
        { error: 'Este item já está na coleção' },
        { status: 409 }
      );
    }

    // Calcular order_index se não fornecido
    let finalOrderIndex = order_index;
    if (!finalOrderIndex) {
      const { data: lastItem } = await supabase
        .from('collection_items')
        .select('order_index')
        .eq('collection_id', collectionId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      finalOrderIndex = (lastItem?.order_index || 0) + 1;
    }

    // Adicionar item à coleção
    const { data: newItem, error: addError } = await supabase
      .from('collection_items')
      .insert({
        collection_id: collectionId,
        item_id,
        item_type,
        order_index: finalOrderIndex,
        added_by: user.id,
      })
      .select()
      .single();

    if (addError) {
      devLog.error('Erro ao adicionar item à coleção', { addError });
      return NextResponse.json(
        { error: 'Erro ao adicionar item à coleção' },
        { status: 500 }
      );
    }

    devLog.info('Item adicionado à coleção', { newItem });
    return NextResponse.json(
      {
        item: newItem,
        message: 'Item adicionado à coleção com sucesso!',
      },
      { status: 201 }
    );

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'addItemToCollection');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}