import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { HTTP_STATUS, API_ERROR_MESSAGES } from '@/lib/constants/api-config';

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
  return createAdminSupabaseClient();
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

    const promises = [
      // 1. Notícias filtradas
      newsQuery.order('created_at', { ascending: false }),
      
      // 2. Eventos filtrados  
      eventsQuery.order('start_date', { ascending: false }),
      
      // 3. Mensagens filtradas
      messagesQuery.order('created_at', { ascending: false }),
      
      // 4. Todas as notícias (para contagem de rascunhos)
      shouldUseAdminClient ? supabase
        .from('subsector_news')
        .select('id, is_published')
        .eq('subsector_id', subsectorId) : Promise.resolve({ data: [], error: null }),
      
      // 5. Todos os eventos (para contagem de rascunhos)
      shouldUseAdminClient ? supabase
        .from('subsector_events')
        .select('id, is_published')
        .eq('subsector_id', subsectorId) : Promise.resolve({ data: [], error: null }),
        
      // 6. Todas as mensagens (para contagem de rascunhos)
      shouldUseAdminClient ? supabase
        .from('subsector_messages')
        .select('id, is_published')
        .eq('subsector_id', subsectorId) : Promise.resolve({ data: [], error: null })
    ];


    const promiseStartTime = Date.now();
    const [
      { data: filteredNews, error: newsError },
      { data: filteredEvents, error: eventsError },
      { data: filteredMessages, error: messagesError },
      { data: allNews, error: allNewsError },
      { data: allEvents, error: allEventsError },
      { data: allMessages, error: allMessagesError }
    ] = await Promise.all(promises);
    const promiseEndTime = Date.now();


    // Verificar erros
    if (newsError) {
      console.error('[API-SUBSECTOR-BATCH] Erro ao buscar notícias:', newsError);
      return NextResponse.json(
        { error: `Erro ao buscar notícias: ${newsError.message}` },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (eventsError) {
      console.error('[API-SUBSECTOR-BATCH] Erro ao buscar eventos:', eventsError);
      return NextResponse.json(
        { error: `Erro ao buscar eventos: ${eventsError.message}` },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    if (messagesError) {
      console.error('[API-SUBSECTOR-BATCH] Erro ao buscar mensagens:', messagesError);
      return NextResponse.json(
        { error: `Erro ao buscar mensagens: ${messagesError.message}` },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (shouldUseAdminClient && (allNewsError || allEventsError || allMessagesError)) {
      console.error('[API-SUBSECTOR-BATCH] Erro ao buscar contagem:', { allNewsError, allEventsError, allMessagesError });
    }

    // Calcular estatísticas de rascunhos
    
    let draftNewsCount = 0;
    let draftEventsCount = 0;
    let draftMessagesCount = 0;

    if (shouldUseAdminClient && Array.isArray(allNews) && Array.isArray(allEvents) && Array.isArray(allMessages)) {
      const newsRascunhos = allNews.filter(n => n && typeof n.is_published === 'boolean' ? n.is_published === false : false);
      const eventsRascunhos = allEvents.filter(e => e && typeof e.is_published === 'boolean' ? e.is_published === false : false);
      const messagesRascunhos = allMessages.filter(m => m && typeof m.is_published === 'boolean' ? m.is_published === false : false);
      
      draftNewsCount = newsRascunhos.length;
      draftEventsCount = eventsRascunhos.length;
      draftMessagesCount = messagesRascunhos.length;
      
    }

    const responseData = {
      news: filteredNews || [],
      events: filteredEvents || [],
      messages: filteredMessages || [],
      newsCount: filteredNews?.length || 0,
      eventsCount: filteredEvents?.length || 0,
      messagesCount: filteredMessages?.length || 0,
      draftNewsCount,
      draftEventsCount,
      draftMessagesCount,
      includeUnpublished,
      subsectorId
    };



    return NextResponse.json({
      data: responseData,
      success: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('[API-SUBSECTOR-BATCH] Erro crítico:', error.message);
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