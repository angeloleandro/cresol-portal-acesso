import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectorId = searchParams.get('sectorId');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    if (!sectorId) {
      return NextResponse.json(
        { error: 'Sector ID é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Buscar notícias do setor
    let newsQuery = supabase
      .from('sector_news')
      .select('*')
      .eq('sector_id', sectorId)
      .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      newsQuery = newsQuery.eq('is_published', true);
    }

    // Buscar eventos do setor
    let eventsQuery = supabase
      .from('sector_events')
      .select('*')
      .eq('sector_id', sectorId)
      .order('start_date', { ascending: false });

    if (!includeUnpublished) {
      eventsQuery = eventsQuery.eq('is_published', true);
    }

    // Buscar mensagens do setor
    let messagesQuery = supabase
      .from('sector_messages')
      .select('*')
      .eq('sector_id', sectorId)
      .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      messagesQuery = messagesQuery.eq('is_published', true);
    }

    // Buscar documentos do setor
    let documentsQuery = supabase
      .from('sector_documents')
      .select('*')
      .eq('sector_id', sectorId)
      .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      documentsQuery = documentsQuery.eq('is_published', true);
    }

    // Buscar vídeos do setor
    let videosQuery = supabase
      .from('sector_videos')
      .select('*')
      .eq('sector_id', sectorId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      videosQuery = videosQuery.eq('is_published', true);
    }

    // Buscar imagens do setor
    let imagesQuery = supabase
      .from('sector_images')
      .select('*')
      .eq('sector_id', sectorId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      imagesQuery = imagesQuery.eq('is_published', true);
    }

    // Executar todas as queries em paralelo
    const [newsResult, eventsResult, messagesResult, documentsResult, videosResult, imagesResult] = await Promise.all([
      newsQuery,
      eventsQuery,
      messagesQuery,
      documentsQuery,
      videosQuery,
      imagesQuery
    ]);

    // Verificar erros críticos
    const hasErrors = newsResult.error || eventsResult.error || messagesResult.error || 
                     documentsResult.error || videosResult.error || imagesResult.error;
    
    if (hasErrors) {
      const errors = {
        news: newsResult.error?.message,
        events: eventsResult.error?.message, 
        messages: messagesResult.error?.message,
        documents: documentsResult.error?.message,
        videos: videosResult.error?.message,
        images: imagesResult.error?.message
      };
      console.error('[SECTOR-BATCH] Erro ao buscar dados:', errors);
    }

    // Calcular contagem de rascunhos
    const newsData = newsResult.data || [];
    const eventsData = eventsResult.data || [];
    const messagesData = messagesResult.data || [];
    const documentsData = documentsResult.data || [];
    const videosData = videosResult.data || [];
    const imagesData = imagesResult.data || [];
    
    // Log para debug de vídeos
    console.log('[SECTOR-BATCH] Vídeos retornados:', {
      count: videosData.length,
      videos: videosData.map(v => ({
        id: v.id,
        title: v.title,
        upload_type: v.upload_type,
        thumbnail_url: v.thumbnail_url,
        thumbnail_mode: v.thumbnail_mode,
        thumbnail_timestamp: v.thumbnail_timestamp,
        is_published: v.is_published
      }))
    });

    const draftNewsCount = newsData.filter(item => !item.is_published).length;
    const draftEventsCount = eventsData.filter(item => !item.is_published).length;
    const draftMessagesCount = messagesData.filter(item => !item.is_published).length;
    const draftDocumentsCount = documentsData.filter(item => !item.is_published).length;
    const draftVideosCount = videosData.filter(item => !item.is_published).length;
    const draftImagesCount = imagesData.filter(item => !item.is_published).length;

    // Retornar dados mesmo se alguma query falhar
    return NextResponse.json({
      success: true,
      data: {
        news: newsData,
        events: eventsData,
        messages: messagesData,
        documents: documentsData,
        videos: videosData,
        images: imagesData,
        draftNewsCount,
        draftEventsCount,
        draftMessagesCount,
        draftDocumentsCount,
        draftVideosCount,
        draftImagesCount
      }
    });

  } catch (error: any) {
    console.error('[SECTOR-BATCH] Erro crítico:', error.message);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// POST - Criar conteúdo em lote (notícia, evento ou mensagem)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, sectorId } = body;

    if (!type || !data || !sectorId) {
      return NextResponse.json(
        { error: 'Tipo, dados e ID do setor são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    let result;
    switch (type) {
      case 'news':
        result = await supabase
          .from('sector_news')
          .insert({ ...data, sector_id: sectorId })
          .select()
          .single();
        break;

      case 'event':
        result = await supabase
          .from('sector_events')
          .insert({ ...data, sector_id: sectorId })
          .select()
          .single();
        break;

      case 'message':
        result = await supabase
          .from('sector_messages')
          .insert({ ...data, sector_id: sectorId })
          .select()
          .single();
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo inválido. Use: news, event ou message' },
          { status: 400 }
        );
    }

    if (result.error) {
      console.error(`[SECTOR-BATCH] Erro ao criar ${type}:`, result.error.message);
      return NextResponse.json(
        { error: `Erro ao criar ${type}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: result.data
    }, { status: 201 });

  } catch (error: any) {
    console.error('[SECTOR-BATCH] Erro no POST:', error.message);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar conteúdo
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, data } = body;

    if (!type || !id || !data) {
      return NextResponse.json(
        { error: 'Tipo, ID e dados são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    let result;
    switch (type) {
      case 'news':
        result = await supabase
          .from('sector_news')
          .update(data)
          .eq('id', id)
          .select()
          .single();
        break;

      case 'event':
        result = await supabase
          .from('sector_events')
          .update(data)
          .eq('id', id)
          .select()
          .single();
        break;

      case 'message':
        result = await supabase
          .from('sector_messages')
          .update(data)
          .eq('id', id)
          .select()
          .single();
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo inválido. Use: news, event ou message' },
          { status: 400 }
        );
    }

    if (result.error) {
      console.error(`[SECTOR-BATCH] Erro ao atualizar ${type}:`, result.error.message);
      return NextResponse.json(
        { error: `Erro ao atualizar ${type}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: result.data
    });

  } catch (error: any) {
    console.error('[SECTOR-BATCH] Erro no PUT:', error.message);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE - Deletar conteúdo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Tipo e ID são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    let result;
    switch (type) {
      case 'news':
        result = await supabase
          .from('sector_news')
          .delete()
          .eq('id', id);
        break;

      case 'event':
        result = await supabase
          .from('sector_events')
          .delete()
          .eq('id', id);
        break;

      case 'message':
        result = await supabase
          .from('sector_messages')
          .delete()
          .eq('id', id);
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo inválido. Use: news, event ou message' },
          { status: 400 }
        );
    }

    if (result.error) {
      console.error(`[SECTOR-BATCH] Erro ao deletar ${type}:`, result.error.message);
      return NextResponse.json(
        { error: `Erro ao deletar ${type}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `${type} deletado com sucesso`
    });

  } catch (error: any) {
    console.error('[SECTOR-BATCH] Erro no DELETE:', error.message);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}