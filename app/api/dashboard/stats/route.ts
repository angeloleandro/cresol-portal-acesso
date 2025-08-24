import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Força renderização dinâmica para usar cookies
export const dynamic = 'force-dynamic';

// Função para criar cliente do servidor com autenticação
async function createAuthenticatedClient() {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase configuration: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

// GET - Buscar estatísticas do dashboard em batch (1 chamada otimizada)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createAuthenticatedClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }


    // Datas para filtros de 30 dias
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    // EXECUTAR TODAS AS QUERIES EM PARALELO
    const promises = [
      // 1. Contar notícias dos últimos 30 dias (sector_news e subsector_news)
      Promise.all([
        supabase
          .from('sector_news')
          .select('id', { count: 'exact', head: true })
          .eq('is_published', true)
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('subsector_news')
          .select('id', { count: 'exact', head: true })
          .eq('is_published', true)
          .gte('created_at', thirtyDaysAgo.toISOString())
      ]),
      
      // 2. Contar eventos dos próximos 30 dias
      Promise.all([
        supabase
          .from('sector_events')
          .select('id', { count: 'exact', head: true })
          .eq('is_published', true)
          .gte('start_date', now.toISOString())
          .lte('start_date', thirtyDaysFromNow.toISOString()),
        supabase
          .from('subsector_events')
          .select('id', { count: 'exact', head: true })
          .eq('is_published', true)
          .gte('start_date', now.toISOString())
          .lte('start_date', thirtyDaysFromNow.toISOString())
      ]),
        
      // 3. Contar mensagens dos últimos 30 dias
      Promise.all([
        supabase
          .from('sector_messages')
          .select('id', { count: 'exact', head: true })
          .eq('is_published', true)
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('subsector_messages')
          .select('id', { count: 'exact', head: true })
          .eq('is_published', true)
          .gte('created_at', thirtyDaysAgo.toISOString())
      ]),
      
      // 4. Contar documentos dos últimos 30 dias
      Promise.all([
        supabase
          .from('sector_documents')
          .select('id', { count: 'exact', head: true })
          .eq('is_published', true)
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('subsector_documents')
          .select('id', { count: 'exact', head: true })
          .eq('is_published', true)
          .gte('created_at', thirtyDaysAgo.toISOString())
      ]),
        
      // 5. Buscar sistemas recentes (primeiros 6 ordenados por nome)
      supabase
        .from('systems')
        .select('id, name, description, url, icon, sectors(name)')
        .limit(6)
        .order('name')
    ];

    const [
      newsResults,
      eventsResults, 
      messagesResults,
      documentsResults,
      recentSystemsResult
    ] = await Promise.all(promises) as [
      any[], // newsResults
      any[], // eventsResults
      any[], // messagesResults
      any[], // documentsResults
      any    // recentSystemsResult
    ];

    // Processar resultados de notícias
    let newsCount = 0;
    if (newsResults && newsResults[0] && !newsResults[0].error) {
      newsCount += newsResults[0].count || 0;
    }
    if (newsResults && newsResults[1] && !newsResults[1].error) {
      newsCount += newsResults[1].count || 0;
    }

    // Processar resultados de eventos
    let eventsCount = 0;
    if (eventsResults && eventsResults[0] && !eventsResults[0].error) {
      eventsCount += eventsResults[0].count || 0;
    }
    if (eventsResults && eventsResults[1] && !eventsResults[1].error) {
      eventsCount += eventsResults[1].count || 0;
    }

    // Processar resultados de mensagens
    let messagesCount = 0;
    if (messagesResults && messagesResults[0] && !messagesResults[0].error) {
      messagesCount += messagesResults[0].count || 0;
    }
    if (messagesResults && messagesResults[1] && !messagesResults[1].error) {
      messagesCount += messagesResults[1].count || 0;
    }

    // Processar resultados de documentos
    let documentsCount = 0;
    if (documentsResults && documentsResults[0] && !documentsResults[0].error) {
      documentsCount += documentsResults[0].count || 0;
    }
    if (documentsResults && documentsResults[1] && !documentsResults[1].error) {
      documentsCount += documentsResults[1].count || 0;
    }

    const stats = {
      newsCount,           // Notícias dos últimos 30 dias
      eventsCount,         // Eventos dos próximos 30 dias
      messagesCount,       // Mensagens dos últimos 30 dias
      documentsCount,      // Documentos dos últimos 30 dias
      recentSystems: (recentSystemsResult as any)?.data || []
    };


    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Dashboard-Stats] ❌ Erro crítico:', error.message);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}