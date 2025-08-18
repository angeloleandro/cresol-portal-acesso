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


    // EXECUTAR TODAS AS QUERIES EM PARALELO
    const promises = [
      // 1. Contar sistemas disponíveis
      supabase
        .from('systems')
        .select('id', { count: 'exact', head: true }),
      
      // 2. Contar eventos próximos (publicados e futuros)
      supabase
        .from('sector_events')
        .select('id', { count: 'exact', head: true })
        .eq('is_published', true)
        .gte('start_date', new Date().toISOString()),
        
      // 3. Contar notificações não lidas do usuário
      supabase
        .from('notification_recipients')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false),
        
      // 4. Buscar sistemas recentes (primeiros 6 ordenados por nome)
      supabase
        .from('systems')
        .select('id, name, description, url, icon, sectors(name)')
        .limit(6)
        .order('name')
    ];

    const [
      systemsResult,
      eventsResult, 
      notificationsResult,
      recentSystemsResult
    ] = await Promise.all(promises);

    // Collect errors and provide detailed error information
    const errors: Record<string, any> = {};
    
    if (systemsResult.error) {
      console.error('[Dashboard-Stats] Erro ao buscar sistemas:', systemsResult.error);
      errors.systems = systemsResult.error;
    }
    if (eventsResult.error) {
      console.error('[Dashboard-Stats] Erro ao buscar eventos:', eventsResult.error);
      errors.events = eventsResult.error;
    }
    if (notificationsResult.error) {
      console.error('[Dashboard-Stats] Erro ao buscar notificações:', notificationsResult.error);
      errors.notifications = notificationsResult.error;
    }
    if (recentSystemsResult.error) {
      console.error('[Dashboard-Stats] Erro ao buscar sistemas recentes:', recentSystemsResult.error);
      errors.recentSystems = recentSystemsResult.error;
    }

    // If any critical errors occurred, return early with error information
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Partial failures occurred while fetching dashboard stats',
          errors,
          data: {
            systemsCount: systemsResult.error ? 0 : systemsResult.count || 0,
            upcomingEventsCount: eventsResult.error ? 0 : eventsResult.count || 0,
            unreadNotificationsCount: notificationsResult.error ? 0 : notificationsResult.count || 0,
            favoriteSystemsCount: 0,
            recentSystems: recentSystemsResult.error ? [] : recentSystemsResult.data || []
          }
        },
        { status: 500 }
      );
    }

    // Buscar favoritos do localStorage (isso não pode ser feito no servidor)
    // O frontend terá que fazer isso separadamente ou podemos criar uma tabela no banco

    const stats = {
      systemsCount: systemsResult.count || 0,
      upcomingEventsCount: eventsResult.count || 0,
      unreadNotificationsCount: notificationsResult.count || 0,
      favoriteSystemsCount: 0, // Será atualizado pelo frontend via localStorage
      recentSystems: recentSystemsResult.data || []
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