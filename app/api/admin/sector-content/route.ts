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
  console.log('\n🔶🔶🔶 [API] INÍCIO DO PROCESSAMENTO POST 🔶🔶🔶');
  console.log('⏰ [API] Timestamp:', new Date().toISOString());
  console.log('📍 [API] URL completa:', request.url);
  console.log('📍 [API] Method:', request.method);
  
  // Log de todos os headers
  const headers = Object.fromEntries(request.headers.entries());
  console.log('🔑 [API] Headers recebidos:');
  Object.entries(headers).forEach(([key, value]) => {
    if (key.toLowerCase().includes('cookie') || key.toLowerCase().includes('auth')) {
      console.log(`  ${key}: ${value.substring(0, 50)}...`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  });
  
  try {
    console.log('\n🔐 [API] ETAPA 1: CRIANDO CLIENTES...');
    const supabase = await createAuthenticatedClient();
    console.log('✅ [API] Cliente autenticado criado para verificação de usuário');
    
    // Criar cliente admin para operações de banco que bypassam RLS
    const adminClient = createAdminSupabaseClient();
    console.log('✅ [API] Cliente admin criado para operações de banco (bypassa RLS)');
    
    // Verificar autenticação
    console.log('\n👤 [API] ETAPA 2: VERIFICANDO USUÁRIO...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌❌❌ [API] ERRO DE AUTENTICAÇÃO:');
      console.error('  Mensagem:', authError.message);
      console.error('  Detalhes:', authError);
      console.error('  Status:', authError.status);
      console.error('  Code:', authError.code);
      return NextResponse.json(
        { 
          error: 'Não autorizado', 
          details: authError?.message,
          code: authError?.code,
          status: authError?.status
        },
        { status: 401 }
      );
    }
    
    if (!user) {
      console.error('❌❌❌ [API] USUÁRIO NÃO ENCONTRADO NA SESSÃO');
      console.error('  Possível problema: Cookies não enviados ou sessão expirada');
      return NextResponse.json(
        { error: 'Usuário não encontrado na sessão' },
        { status: 401 }
      );
    }
    
    console.log('✅ [API] Usuário autenticado:', {
      id: user.id,
      email: user.email,
      role: user.role,
      aud: user.aud,
      created_at: user.created_at,
      user_metadata: user.user_metadata
    });
    
    // Verificar se é admin
    console.log('\n🔍 [API] ETAPA 3: VERIFICANDO PERFIL E PERMISSÕES...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌❌❌ [API] ERRO AO BUSCAR PERFIL:');
      console.error('  Mensagem:', profileError.message);
      console.error('  Detalhes:', profileError);
      console.error('  Code:', profileError.code);
      return NextResponse.json(
        { 
          error: 'Erro ao buscar perfil',
          details: profileError.message
        },
        { status: 500 }
      );
    }
    
    console.log('✅ [API] Perfil encontrado:', {
      id: profile?.id,
      role: profile?.role,
      full_name: profile?.full_name,
      email: profile?.email
    });
    
    if (!profile || (profile.role !== 'admin' && profile.role !== 'sector_admin')) {
      console.error('❌❌❌ [API] PERMISSÃO NEGADA:');
      console.error('  Role atual:', profile?.role);
      console.error('  Roles permitidos: admin, sector_admin');
      return NextResponse.json(
        { 
          error: 'Permissão negada', 
          role: profile?.role,
          required_roles: ['admin', 'sector_admin']
        },
        { status: 403 }
      );
    }
    
    console.log('✅ [API] Permissões verificadas - usuário autorizado');
    
    // Parse do body
    console.log('\n📦 [API] ETAPA 4: PROCESSANDO DADOS...');
    const body = await request.json();
    console.log('📦 [API] Body recebido (completo):', JSON.stringify(body, null, 2));
    
    const { type, action, data } = body;
    // Suportar ambos os formatos: 'type' (legado) e 'action' (novo)
    const operationType = action || type;
    console.log('🏷️ [API] Tipo de operação:', operationType);
    console.log('📦 [API] Dados recebidos:', JSON.stringify(data, null, 2));
    
    // Validar campos obrigatórios para notícias
    console.log('\n✅ [API] ETAPA 5: VALIDANDO CAMPOS...');
    if (type === 'sector_news' || type === 'subsector_news') {
      console.log('📋 [API] Validando campos de notícia...');
      const validation = {
        hasTitle: !!data.title,
        titleLength: data.title?.length || 0,
        hasSummary: !!data.summary,
        summaryLength: data.summary?.length || 0,
        hasContent: !!data.content,
        contentLength: data.content?.length || 0
      };
      console.log('📋 [API] Resultado da validação:', validation);
      
      if (!data.title || !data.summary || !data.content) {
        console.error('❌❌❌ [API] CAMPOS OBRIGATÓRIOS FALTANDO:', validation);
        return NextResponse.json(
          { 
            error: 'Campos obrigatórios faltando',
            missing: {
              title: !data.title,
              summary: !data.summary,
              content: !data.content
            },
            validation
          },
          { status: 400 }
        );
      }
      console.log('✅ [API] Todos os campos obrigatórios presentes');
    }
    
    // Validar campos obrigatórios para eventos
    if (type === 'sector_events' || type === 'subsector_events') {
      console.log('📋 [API] Validando campos de evento...');
      const validation = {
        hasTitle: !!data.title,
        titleLength: data.title?.length || 0,
        hasDescription: !!data.description,
        descriptionLength: data.description?.length || 0,
        hasStartDate: !!data.start_date,
        startDateValue: data.start_date
      };
      console.log('📋 [API] Resultado da validação:', validation);
      
      if (!data.title || !data.description || !data.start_date) {
        console.error('❌❌❌ [API] CAMPOS OBRIGATÓRIOS FALTANDO:', validation);
        return NextResponse.json(
          { 
            error: 'Campos obrigatórios faltando',
            missing: {
              title: !data.title,
              description: !data.description,
              start_date: !data.start_date
            },
            validation
          },
          { status: 400 }
        );
      }
      console.log('✅ [API] Todos os campos obrigatórios presentes');
    }
    
    // Adicionar created_by
    console.log('\n🔧 [API] ETAPA 6: PREPARANDO DADOS PARA INSERÇÃO...');
    const enrichedData = {
      ...data,
      created_by: user.id
    };
    
    console.log('🔧 [API] Dados enriquecidos:', JSON.stringify(enrichedData, null, 2));
    console.log('🔧 [API] user.id que será usado como created_by:', user.id);
    
    let result;
    let error;
    
    // INSERÇÃO NO BANCO
    console.log('\n💾 [API] ETAPA 7: INSERINDO NO BANCO DE DADOS...');
    console.log('🔑 [API] Usando cliente autenticado com contexto do usuário');
    console.log('🔑 [API] auth.uid() no contexto será:', user.id);
    console.log('🔑 [API] Tipo de cliente: Admin Client (SERVICE ROLE - bypassa RLS)');
    
    switch (operationType) {
      case 'create_news':
      case 'sector_news':
        console.log('\n📨 [API] Caso: SECTOR_NEWS');
        console.log('📨 [API] Tabela alvo: sector_news');
        console.log('📨 [API] Dados completos para inserção:', JSON.stringify(enrichedData, null, 2));
        console.log('📨 [API] Executando INSERT...');
        
        try {
          ({ data: result, error } = await adminClient
            .from('sector_news')
            .insert(enrichedData)
            .select()
            .single());
          
          if (error) {
            console.error('\n❌❌❌ [API] ERRO NA INSERÇÃO SECTOR_NEWS:');
            console.error('  Tipo de erro:', error.constructor.name);
            console.error('  Mensagem:', error.message);
            console.error('  Detalhes:', error.details);
            console.error('  Hint:', error.hint);
            console.error('  Code:', error.code);
            console.error('  Objeto completo:', JSON.stringify(error, null, 2));
          } else {
            console.log('\n✅✅✅ [API] INSERÇÃO SECTOR_NEWS BEM-SUCEDIDA!');
            console.log('  ID criado:', result?.id);
            console.log('  Dados inseridos:', JSON.stringify(result, null, 2));
          }
        } catch (insertError: any) {
          console.error('\n💥💥💥 [API] EXCEÇÃO NA INSERÇÃO:');
          console.error('  Tipo:', insertError.constructor.name);
          console.error('  Mensagem:', insertError.message);
          console.error('  Stack:', insertError.stack);
          error = insertError;
        }
        break;
        
      case 'sector_events':
        console.log('📅 [API POST] Inserindo em sector_events com contexto de usuário...');
        console.log('📅 [API POST] Dados para inserção:', enrichedData);
        ({ data: result, error } = await supabase
          .from('sector_events')
          .insert(enrichedData)
          .select()
          .single());
        console.log('📅 [API POST] Resultado sector_events:', { 
          success: !!result && !error,
          resultId: result?.id,
          error: error?.message,
          errorDetails: error?.details,
          errorHint: error?.hint
        });
        break;
        
      case 'subsector_news':
        console.log('📰 [API POST] Inserindo em subsector_news com contexto de usuário...');
        console.log('📰 [API POST] Dados para inserção:', enrichedData);
        ({ data: result, error } = await supabase
          .from('subsector_news')
          .insert(enrichedData)
          .select()
          .single());
        console.log('📰 [API POST] Resultado subsector_news:', { 
          success: !!result && !error,
          resultId: result?.id,
          error: error?.message,
          errorDetails: error?.details,
          errorHint: error?.hint
        });
        break;
        
      case 'subsector_events':
        console.log('🗓️ [API POST] Inserindo em subsector_events com contexto de usuário...');
        console.log('🗓️ [API POST] Dados para inserção:', enrichedData);
        ({ data: result, error } = await supabase
          .from('subsector_events')
          .insert(enrichedData)
          .select()
          .single());
        console.log('🗓️ [API POST] Resultado subsector_events:', { 
          success: !!result && !error,
          resultId: result?.id,
          error: error?.message,
          errorDetails: error?.details,
          errorHint: error?.hint
        });
        break;
        
      case 'update_news':
        console.log('\n📨 [API] Caso: UPDATE_NEWS (fallback para compatibilidade)');
        console.log('📨 [API] Tabela alvo: sector_news');
        console.log('📨 [API] ID para atualização:', enrichedData.id);
        
        if (!enrichedData.id) {
          return NextResponse.json(
            { error: 'ID é obrigatório para atualização' },
            { status: 400 }
          );
        }
        
        const { id: newsId, created_by: newsCreatedBy, created_at: newsCreatedAt, ...newsUpdateData } = enrichedData;
        newsUpdateData.updated_at = new Date().toISOString();
        
        ({ data: result, error } = await adminClient
          .from('sector_news')
          .update(newsUpdateData)
          .eq('id', newsId)
          .select()
          .single());
          
        if (error) {
          console.error('\n❌❌❌ [API] ERRO NA ATUALIZAÇÃO SECTOR_NEWS:', error);
        } else {
          console.log('\n✅✅✅ [API] ATUALIZAÇÃO SECTOR_NEWS BEM-SUCEDIDA!');
        }
        break;
        
      case 'update_subsector_news':
        console.log('\n📨 [API] Caso: UPDATE_SUBSECTOR_NEWS');
        console.log('📨 [API] Tabela alvo: subsector_news');
        console.log('📨 [API] ID para atualização:', enrichedData.id);
        
        if (!enrichedData.id) {
          return NextResponse.json(
            { error: 'ID é obrigatório para atualização' },
            { status: 400 }
          );
        }
        
        const { id: subsectorNewsId, created_by: subsectorNewsCreatedBy, created_at: subsectorNewsCreatedAt, ...subsectorNewsUpdateData } = enrichedData;
        subsectorNewsUpdateData.updated_at = new Date().toISOString();
        
        ({ data: result, error } = await adminClient
          .from('subsector_news')
          .update(subsectorNewsUpdateData)
          .eq('id', subsectorNewsId)
          .select()
          .single());
          
        if (error) {
          console.error('\n❌❌❌ [API] ERRO NA ATUALIZAÇÃO SUBSECTOR_NEWS:', error);
        } else {
          console.log('\n✅✅✅ [API] ATUALIZAÇÃO SUBSECTOR_NEWS BEM-SUCEDIDA!');
        }
        break;
        
      case 'update_event':
        console.log('\n📅 [API] Caso: UPDATE_EVENT (fallback para compatibilidade)');
        console.log('📅 [API] Tabela alvo: sector_events');
        console.log('📅 [API] ID para atualização:', enrichedData.id);
        
        if (!enrichedData.id) {
          return NextResponse.json(
            { error: 'ID é obrigatório para atualização' },
            { status: 400 }
          );
        }
        
        const { id: eventId, created_by: eventCreatedBy, created_at: eventCreatedAt, ...eventUpdateData } = enrichedData;
        eventUpdateData.updated_at = new Date().toISOString();
        
        ({ data: result, error } = await adminClient
          .from('sector_events')
          .update(eventUpdateData)
          .eq('id', eventId)
          .select()
          .single());
          
        if (error) {
          console.error('\n❌❌❌ [API] ERRO NA ATUALIZAÇÃO SECTOR_EVENTS:', error);
        } else {
          console.log('\n✅✅✅ [API] ATUALIZAÇÃO SECTOR_EVENTS BEM-SUCEDIDA!');
        }
        break;
        
      default:
        console.error('❌ [API POST] Tipo inválido:', operationType);
        return NextResponse.json(
          { error: 'Tipo inválido', receivedType: operationType },
          { status: 400 }
        );
    }
    
    console.log('\n🔍 [API] ETAPA 8: AVALIANDO RESULTADO...');
    if (error) {
      console.error('\n💥💥💥 [API] ERRO AO CRIAR CONTEÚDO:');
      console.error('  Tipo de erro:', error.constructor?.name || 'Unknown');
      console.error('  Mensagem:', error.message);
      console.error('  Detalhes:', error.details);
      console.error('  Hint:', error.hint);
      console.error('  Code:', error.code);
      console.error('  Dados que causaram erro:', JSON.stringify(enrichedData, null, 2));
      console.error('  Erro completo:', JSON.stringify(error, null, 2));
      console.error('🔶🔶🔶 [API] FIM DO PROCESSAMENTO - ERRO 🔶🔶🔶\n');
      
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
    
    console.log('\n✅✅✅ [API] SUCESSO TOTAL!');
    console.log('  Resultado final:', JSON.stringify(result, null, 2));
    console.log('🔶🔶🔶 [API] FIM DO PROCESSAMENTO - SUCESSO 🔶🔶🔶\n');
    
    return NextResponse.json({ data: result });
    
  } catch (error: any) {
    console.error('\n🔥🔥🔥 [API] ERRO CRÍTICO NO SERVIDOR:');
    console.error('  Tipo:', error.constructor?.name || 'Unknown');
    console.error('  Mensagem:', error.message);
    console.error('  Stack:', error.stack);
    console.error('  Erro completo:', error);
    console.error('🔶🔶🔶 [API] FIM DO PROCESSAMENTO - ERRO CRÍTICO 🔶🔶🔶\n');
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error.message,
        type: error.constructor?.name || 'Unknown',
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
    
    // CORREÇÃO: Usar o adminClient (SERVICE ROLE) para evitar problemas de RLS ao despublicar
    console.log('🔑 [API PUT] Usando adminClient (SERVICE ROLE) para operação de UPDATE...');
    
    // Criar cliente admin para bypassar RLS (necessário para despublicação)
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
    
    // CORREÇÃO: Usar o adminClient (SERVICE ROLE) para operações de DELETE
    console.log('🔑 [API DELETE] Usando adminClient (SERVICE ROLE) para operação de DELETE...');
    
    // Criar cliente admin para bypassar RLS
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