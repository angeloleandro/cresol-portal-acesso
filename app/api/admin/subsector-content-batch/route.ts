import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';


import { HTTP_STATUS, API_ERROR_MESSAGES } from '@/lib/constants/api-config';
import { CreateAdminSupabaseClient } from '@/lib/supabase/admin';


// Força renderização dinâmica para usar request.url e cookies
export const dynamic = 'force-dynamic';

// Função para criar cliente do servidor com autenticação
async function createAuthenticatedClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // O cookie não pode ser modificado no Server Component
          }
        },
      },
    }
  );
}

// Função para operações administrativas que usam Service Role Key (bypass RLS)
function createAdminClient() {
  return CreateAdminSupabaseClient();
}

// GET - Buscar todo conteúdo do subsetor em batch (notícias + eventos + mensagens + contadores)
export async function GET(request: NextRequest) {
  const requestId = `SUBSECTOR-BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const subsectorId = searchParams.get('subsectorId');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';
    
    if (!subsectorId) {
      return NextResponse.json(
        { error: 'subsectorId é obrigatório' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const authClient = await createAuthenticatedClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.unauthorized },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.internalError },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const isAuthorizedAdmin = profile && ['admin', 'sector_admin', 'subsector_admin'].includes(profile.role);
    const shouldUseAdminClient = includeUnpublished && isAuthorizedAdmin;

    const supabase = shouldUseAdminClient ? createAdminClient() : authClient;

    // FAZER TODAS AS CONSULTAS EM PARALELO
    
    // 1. Build news query with conditional filter
    let newsQuery = supabase
      .from('subsector_news')
      .select('*')
      .eq('subsector_id', subsectorId);

    if (!includeUnpublished) {
      newsQuery = newsQuery.eq('is_published', true);
    }
    
    // 2. Build events query with conditional filter
    let eventsQuery = supabase
      .from('subsector_events')
      .select('*')
      .eq('subsector_id', subsectorId);

    if (!includeUnpublished) {
      eventsQuery = eventsQuery.eq('is_published', true);
    }
    
    // 3. Build messages query with conditional filter
    let messagesQuery = supabase
      .from('subsector_messages')
      .select('*')
      .eq('subsector_id', subsectorId);

    if (!includeUnpublished) {
      messagesQuery = messagesQuery.eq('is_published', true);
    }

    // 4. Build documents query with conditional filter
    let documentsQuery = supabase
      .from('subsector_documents')
      .select('*')
      .eq('subsector_id', subsectorId);
    
    if (!includeUnpublished) {
      documentsQuery = documentsQuery.eq('is_published', true);
    }
    
    // 5. Build videos query with conditional filter
    let videosQuery = supabase
      .from('subsector_videos')
      .select('*')
      .eq('subsector_id', subsectorId);
    
    if (!includeUnpublished) {
      videosQuery = videosQuery.eq('is_published', true);
    }

    // 6. Build images query with conditional filter
    let imagesQuery = supabase
      .from('subsector_images')
      .select('*')
      .eq('subsector_id', subsectorId);
    
    if (!includeUnpublished) {
      imagesQuery = imagesQuery.eq('is_published', true);
    }

    const promises = [
      // 1. Notícias filtradas
      newsQuery.order('created_at', { ascending: false }),
      
      // 2. Eventos filtrados  
      eventsQuery.order('start_date', { ascending: false }),
      
      // 3. Mensagens filtradas
      messagesQuery.order('created_at', { ascending: false }),
      
      // 4. Documentos filtrados
      documentsQuery.order('created_at', { ascending: false }),
      
      // 5. Vídeos filtrados
      videosQuery.order('order_index', { ascending: true }).order('created_at', { ascending: false }),
      
      // 6. Imagens filtradas
      imagesQuery.order('order_index', { ascending: true }).order('created_at', { ascending: false }),
      
      // 7. Todas as notícias (para contagem de rascunhos)
      shouldUseAdminClient ? supabase
        .from('subsector_news')
        .select('id, is_published')
        .eq('subsector_id', subsectorId) : Promise.resolve({ data: [], error: null }),
      
      // 8. Todos os eventos (para contagem de rascunhos)
      shouldUseAdminClient ? supabase
        .from('subsector_events')
        .select('id, is_published')
        .eq('subsector_id', subsectorId) : Promise.resolve({ data: [], error: null }),
        
      // 9. Todas as mensagens (para contagem de rascunhos)
      shouldUseAdminClient ? supabase
        .from('subsector_messages')
        .select('id, is_published')
        .eq('subsector_id', subsectorId) : Promise.resolve({ data: [], error: null }),
      
      // 10. Todos os documentos (para contagem de rascunhos)
      shouldUseAdminClient ? supabase
        .from('subsector_documents')
        .select('id, is_published')
        .eq('subsector_id', subsectorId) : Promise.resolve({ data: [], error: null }),
      
      // 11. Todos os vídeos (para contagem de rascunhos)
      shouldUseAdminClient ? supabase
        .from('subsector_videos')
        .select('id, is_published')
        .eq('subsector_id', subsectorId) : Promise.resolve({ data: [], error: null }),
      
      // 12. Todas as imagens (para contagem de rascunhos)
      shouldUseAdminClient ? supabase
        .from('subsector_images')
        .select('id, is_published')
        .eq('subsector_id', subsectorId) : Promise.resolve({ data: [], error: null })
    ];

    const promiseStartTime = Date.now();
    const [
      { data: filteredNews, error: newsError },
      { data: filteredEvents, error: eventsError },
      { data: filteredMessages, error: messagesError },
      { data: filteredDocuments, error: documentsError },
      { data: filteredVideos, error: videosError },
      { data: filteredImages, error: imagesError },
      { data: allNews, error: allNewsError },
      { data: allEvents, error: allEventsError },
      { data: allMessages, error: allMessagesError },
      { data: allDocuments, error: allDocumentsError },
      { data: allVideos, error: allVideosError },
      { data: allImages, error: allImagesError }
    ] = await Promise.all(promises);
    const promiseEndTime = Date.now();

    // Verificar erros críticos
    const hasErrors = newsError || eventsError || messagesError || documentsError || videosError || imagesError;
    
    if (hasErrors) {
      const firstError = newsError || eventsError || messagesError || documentsError || videosError || imagesError;
      if (firstError) {

        return NextResponse.json(
          { error: `Erro ao buscar dados: ${firstError.message}` },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    }

    // Log apenas se houver erro crítico na contagem
    if (shouldUseAdminClient && (allNewsError || allEventsError || allMessagesError || allDocumentsError || allVideosError || allImagesError)) {
      const countErrors = { allNewsError, allEventsError, allMessagesError, allDocumentsError, allVideosError, allImagesError };
      console.error('[SUBSECTOR-BATCH] Erro na contagem:', Object.values(countErrors).filter(Boolean).map(e => e?.message || 'Erro desconhecido'));
    }

    // Calcular estatísticas de rascunhos
    
    let draftNewsCount = 0;
    let draftEventsCount = 0;
    let draftMessagesCount = 0;
    let draftDocumentsCount = 0;
    let draftVideosCount = 0;
    let draftImagesCount = 0;

    if (shouldUseAdminClient && Array.isArray(allNews) && Array.isArray(allEvents) && Array.isArray(allMessages) && Array.isArray(allDocuments) && Array.isArray(allVideos) && Array.isArray(allImages)) {
      const newsRascunhos = allNews.filter(n => n && typeof n.is_published === 'boolean' ? n.is_published === false : false);
      const eventsRascunhos = allEvents.filter(e => e && typeof e.is_published === 'boolean' ? e.is_published === false : false);
      const messagesRascunhos = allMessages.filter(m => m && typeof m.is_published === 'boolean' ? m.is_published === false : false);
      const documentsRascunhos = allDocuments.filter(d => d && typeof d.is_published === 'boolean' ? d.is_published === false : false);
      const videosRascunhos = allVideos.filter(v => v && typeof v.is_published === 'boolean' ? v.is_published === false : false);
      const imagesRascunhos = allImages.filter(i => i && typeof i.is_published === 'boolean' ? i.is_published === false : false);
      
      draftNewsCount = newsRascunhos.length;
      draftEventsCount = eventsRascunhos.length;
      draftMessagesCount = messagesRascunhos.length;
      draftDocumentsCount = documentsRascunhos.length;
      draftVideosCount = videosRascunhos.length;
      draftImagesCount = imagesRascunhos.length;
      
    }

    const responseData = {
      news: filteredNews || [],
      events: filteredEvents || [],
      messages: filteredMessages || [],
      documents: filteredDocuments || [],
      videos: filteredVideos || [],
      images: filteredImages || [],
      newsCount: filteredNews?.length || 0,
      eventsCount: filteredEvents?.length || 0,
      messagesCount: filteredMessages?.length || 0,
      documentsCount: filteredDocuments?.length || 0,
      videosCount: filteredVideos?.length || 0,
      imagesCount: filteredImages?.length || 0,
      draftNewsCount,
      draftEventsCount,
      draftMessagesCount,
      draftDocumentsCount,
      draftVideosCount,
      draftImagesCount,
      includeUnpublished,
      subsectorId
    };

    return NextResponse.json({
      data: responseData,
      success: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {

    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}