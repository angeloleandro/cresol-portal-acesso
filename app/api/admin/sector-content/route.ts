import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

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

// POST - Criar notícia ou evento
export async function POST(request: NextRequest) {
  console.log('🚀 [API POST] Requisição recebida');
  console.log('🕑 [API POST] Timestamp:', new Date().toISOString());
  console.log('📍 [API POST] URL:', request.url);
  console.log('🔑 [API POST] Headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    console.log('🔐 [API POST] Criando cliente autenticado...');
    const supabase = await createAuthenticatedClient();
    
    // Verificar autenticação
    console.log('👤 [API POST] Verificando usuário...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('👤 [API POST] Resultado da autenticação:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      authError: authError?.message
    });
    
    if (authError || !user) {
      console.error('❌ [API POST] Usuário não autenticado:', authError);
      return NextResponse.json(
        { error: 'Não autorizado', details: authError?.message },
        { status: 401 }
      );
    }
    
    // Verificar se é admin
    console.log('🔍 [API POST] Verificando perfil do usuário...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    console.log('🔍 [API POST] Perfil encontrado:', {
      hasProfile: !!profile,
      role: profile?.role,
      profileError: profileError?.message
    });
    
    if (!profile || (profile.role !== 'admin' && profile.role !== 'sector_admin')) {
      console.error('❌ [API POST] Permissão negada. Role:', profile?.role);
      return NextResponse.json(
        { error: 'Permissão negada', role: profile?.role },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    console.log('📦 [API POST] Body recebido:', JSON.stringify(body, null, 2));
    
    const { type, data } = body;
    console.log('🏷️ [API POST] Tipo:', type);
    console.log('📦 [API POST] Dados:', data);
    
    // Validar campos obrigatórios para notícias
    if (type === 'sector_news' || type === 'subsector_news') {
      console.log('✅ [API POST] Validando campos de notícia...');
      if (!data.title || !data.summary || !data.content) {
        console.error('❌ [API POST] Campos obrigatórios faltando:', {
          hasTitle: !!data.title,
          hasSummary: !!data.summary,
          hasContent: !!data.content
        });
        return NextResponse.json(
          { 
            error: 'Campos obrigatórios faltando',
            missing: {
              title: !data.title,
              summary: !data.summary,
              content: !data.content
            }
          },
          { status: 400 }
        );
      }
    }
    
    // Validar campos obrigatórios para eventos
    if (type === 'sector_events' || type === 'subsector_events') {
      console.log('✅ [API POST] Validando campos de evento...');
      if (!data.title || !data.description || !data.start_date) {
        console.error('❌ [API POST] Campos obrigatórios faltando:', {
          hasTitle: !!data.title,
          hasDescription: !!data.description,
          hasStartDate: !!data.start_date
        });
        return NextResponse.json(
          { 
            error: 'Campos obrigatórios faltando',
            missing: {
              title: !data.title,
              description: !data.description,
              start_date: !data.start_date
            }
          },
          { status: 400 }
        );
      }
    }
    
    // Adicionar created_by
    const enrichedData = {
      ...data,
      created_by: user.id
    };
    
    console.log('🔧 [API POST] Dados enriquecidos com created_by:', enrichedData);
    
    let result;
    let error;
    
    // Criar usando service role para garantir
    console.log('🔑 [API POST] Criando cliente admin com service role...');
    const adminClient = createAdminSupabaseClient();
    console.log('🔑 [API POST] Cliente admin criado');
    
    switch (type) {
      case 'sector_news':
        console.log('📨 [API POST] Inserindo em sector_news...');
        console.log('📨 [API POST] Dados para inserção:', enrichedData);
        ({ data: result, error } = await adminClient
          .from('sector_news')
          .insert(enrichedData)
          .select()
          .single());
        console.log('📨 [API POST] Resultado sector_news:', { 
          success: !!result && !error,
          resultId: result?.id,
          error: error?.message 
        });
        break;
        
      case 'sector_events':
        console.log('📅 [API POST] Inserindo em sector_events...');
        console.log('📅 [API POST] Dados para inserção:', enrichedData);
        ({ data: result, error } = await adminClient
          .from('sector_events')
          .insert(enrichedData)
          .select()
          .single());
        console.log('📅 [API POST] Resultado sector_events:', { 
          success: !!result && !error,
          resultId: result?.id,
          error: error?.message 
        });
        break;
        
      case 'subsector_news':
        console.log('📰 [API POST] Inserindo em subsector_news...');
        console.log('📰 [API POST] Dados para inserção:', enrichedData);
        ({ data: result, error } = await adminClient
          .from('subsector_news')
          .insert(enrichedData)
          .select()
          .single());
        console.log('📰 [API POST] Resultado subsector_news:', { 
          success: !!result && !error,
          resultId: result?.id,
          error: error?.message 
        });
        break;
        
      case 'subsector_events':
        console.log('🗓️ [API POST] Inserindo em subsector_events...');
        console.log('🗓️ [API POST] Dados para inserção:', enrichedData);
        ({ data: result, error } = await adminClient
          .from('subsector_events')
          .insert(enrichedData)
          .select()
          .single());
        console.log('🗓️ [API POST] Resultado subsector_events:', { 
          success: !!result && !error,
          resultId: result?.id,
          error: error?.message 
        });
        break;
        
      default:
        console.error('❌ [API POST] Tipo inválido:', type);
        return NextResponse.json(
          { error: 'Tipo inválido', receivedType: type },
          { status: 400 }
        );
    }
    
    if (error) {
      console.error('💥 [API POST] Erro ao criar conteúdo:', error);
      console.error('💥 [API POST] Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      console.error('💥 [API POST] Dados que causaram erro:', enrichedData);
      
      return NextResponse.json(
        { 
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          sentData: enrichedData
        },
        { status: 400 }
      );
    }
    
    console.log('✅ [API POST] Sucesso! Retornando resultado:', result);
    return NextResponse.json({ data: result });
    
  } catch (error: any) {
    console.error('🔥 [API POST] Erro crítico no servidor:', error);
    console.error('🔥 [API POST] Stack trace:', error.stack);
    console.error('🔥 [API POST] Tipo de erro:', error.constructor.name);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error.message,
        type: error.constructor.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar notícia ou evento
export async function PUT(request: NextRequest) {
  console.log('🔄 [API PUT] Requisição recebida');
  console.log('🕑 [API PUT] Timestamp:', new Date().toISOString());
  
  try {
    const supabase = await createAuthenticatedClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ [API PUT] Usuário não autenticado');
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!profile || (profile.role !== 'admin' && profile.role !== 'sector_admin')) {
      console.error('❌ [API PUT] Permissão negada');
      return NextResponse.json(
        { error: 'Permissão negada' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    console.log('📦 [API PUT] Body recebido:', body);
    
    const { type, id, data } = body;
    
    let result;
    let error;
    
    // Atualizar usando service role
    const adminClient = createAdminSupabaseClient();
    
    switch (type) {
      case 'sector_news':
        ({ data: result, error } = await adminClient
          .from('sector_news')
          .update(data)
          .eq('id', id)
          .select()
          .single());
        break;
        
      case 'sector_events':
        ({ data: result, error } = await adminClient
          .from('sector_events')
          .update(data)
          .eq('id', id)
          .select()
          .single());
        break;
        
      case 'subsector_news':
        ({ data: result, error } = await adminClient
          .from('subsector_news')
          .update(data)
          .eq('id', id)
          .select()
          .single());
        break;
        
      case 'subsector_events':
        ({ data: result, error } = await adminClient
          .from('subsector_events')
          .update(data)
          .eq('id', id)
          .select()
          .single());
        break;
        
      default:
        return NextResponse.json(
          { error: 'Tipo inválido' },
          { status: 400 }
        );
    }
    
    if (error) {
      console.error('💥 [API PUT] Erro ao atualizar conteúdo:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    console.log('✅ [API PUT] Atualizado com sucesso');
    return NextResponse.json({ data: result });
    
  } catch (error: any) {
    console.error('🔥 [API PUT] Erro no servidor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir notícia ou evento
export async function DELETE(request: NextRequest) {
  console.log('🗑️ [API DELETE] Requisição recebida');
  console.log('🕑 [API DELETE] Timestamp:', new Date().toISOString());
  
  try {
    const supabase = await createAuthenticatedClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ [API DELETE] Usuário não autenticado');
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!profile || (profile.role !== 'admin' && profile.role !== 'sector_admin')) {
      console.error('❌ [API DELETE] Permissão negada');
      return NextResponse.json(
        { error: 'Permissão negada' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    
    console.log('🗑️ [API DELETE] Parâmetros:', { type, id });
    
    if (!type || !id) {
      return NextResponse.json(
        { error: 'Parâmetros faltando' },
        { status: 400 }
      );
    }
    
    let error;
    
    // Excluir usando service role
    const adminClient = createAdminSupabaseClient();
    
    switch (type) {
      case 'sector_news':
        ({ error } = await adminClient
          .from('sector_news')
          .delete()
          .eq('id', id));
        break;
        
      case 'sector_events':
        ({ error } = await adminClient
          .from('sector_events')
          .delete()
          .eq('id', id));
        break;
        
      case 'subsector_news':
        ({ error } = await adminClient
          .from('subsector_news')
          .delete()
          .eq('id', id));
        break;
        
      case 'subsector_events':
        ({ error } = await adminClient
          .from('subsector_events')
          .delete()
          .eq('id', id));
        break;
        
      default:
        return NextResponse.json(
          { error: 'Tipo inválido' },
          { status: 400 }
        );
    }
    
    if (error) {
      console.error('💥 [API DELETE] Erro ao excluir conteúdo:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    console.log('✅ [API DELETE] Excluído com sucesso');
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('🔥 [API DELETE] Erro no servidor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}