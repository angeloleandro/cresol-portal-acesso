import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { HTTP_STATUS, API_ERROR_MESSAGES, API_SUCCESS_MESSAGES, CONTENT_TYPES, API_VALIDATION } from '@/lib/constants/api-config';


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

// GET - Buscar notícias e eventos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // sector_news, sector_events, subsector_news, subsector_events
    const sectorId = searchParams.get('sectorId');
    const subsectorId = searchParams.get('subsectorId');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';
    
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

    let query;
    let tableName = '';
    
    switch (type) {
      case 'sector_news':
        tableName = 'sector_news';
        query = supabase
          .from('sector_news')
          .select('*')
          .eq('sector_id', sectorId)
          .order('created_at', { ascending: false });
        break;
        
      case 'sector_events':
        tableName = 'sector_events';
        query = supabase
          .from('sector_events')
          .select('*')
          .eq('sector_id', sectorId)
          .order('start_date', { ascending: false });
        break;
        
      case 'subsector_news':
        tableName = 'subsector_news';
        query = supabase
          .from('subsector_news')
          .select('*')
          .eq('subsector_id', subsectorId)
          .order('created_at', { ascending: false });
        break;
        
      case 'subsector_events':
        tableName = 'subsector_events';
        query = supabase
          .from('subsector_events')
          .select('*')
          .eq('subsector_id', subsectorId)
          .order('start_date', { ascending: false });
        break;
        
      default:
        return NextResponse.json(
          { error: 'Tipo inválido', supportedTypes: ['sector_news', 'sector_events', 'subsector_news', 'subsector_events'] },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
    }
    
    // Se não incluir não publicados, filtrar apenas os publicados
    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }
    
    const { data: result, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    return NextResponse.json({ 
      data: result || [],
      count: result?.length || 0,
      type,
      includeUnpublished,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('[API-GET] Erro crítico:', error.message);
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

// Função helper para operações de update (usando cliente admin)
async function handleUpdateOperation(adminClient: any, tableName: string, enrichedData: any) {
  if (!enrichedData.id) {
    return NextResponse.json(
      { error: API_ERROR_MESSAGES.invalidId },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
  
  const { id, created_by, created_at, ...updateData } = enrichedData;
  updateData.updated_at = new Date().toISOString();
  
  const { data: result, error } = await adminClient
    .from(tableName)
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  return { result, error };
}

// POST - Criar notícia ou evento
export async function POST(request: NextRequest) {
  try {
    // Parse do body primeiro para logging
    const body = await request.json();
    const { type, action, data } = body;
    const operationType = action || type;
    
    console.log(`[API-POST] ${operationType} - tipo:${type}, hasData:${!!data}`);

    const supabase = await createAuthenticatedClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('[API-POST] Auth falhou:', authError?.message);
      return NextResponse.json(
        { 
          error: API_ERROR_MESSAGES.unauthorized, 
          details: authError?.message,
          code: authError?.code,
          status: authError?.status
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }
    
    if (!user) {
      console.error('[API-POST] Usuário não encontrado');
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.userNotFound },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }
    
    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('[API-POST] Erro perfil:', profileError.message);
      return NextResponse.json(
        { 
          error: API_ERROR_MESSAGES.internalError,
          details: profileError.message
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }
    
    console.log(`[API-POST] User: ${user.email}, Role: ${profile?.role}`);
    
    if (!profile || (profile.role !== 'admin' && profile.role !== 'sector_admin' && profile.role !== 'subsector_admin')) {
      console.error(`[API-POST] Permissão negada - role: ${profile?.role}`);
      return NextResponse.json(
        { 
          error: API_ERROR_MESSAGES.permissionDenied, 
          role: profile?.role,
          required_roles: ['admin', 'sector_admin', 'subsector_admin']
        },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }
    
    // MAPEAR TIPOS DO FRONTEND PARA BACKEND
    let mappedType = type;
    
    // Mapear tipos simples do frontend para tipos completos do backend
    if (type === 'news') {
      if (data.sector_id || action === 'sector') {
        mappedType = CONTENT_TYPES.sectorNews; // 'sector_news'
      } else if (data.subsector_id) {
        mappedType = CONTENT_TYPES.subsectorNews; // 'subsector_news'
      } else {
        mappedType = CONTENT_TYPES.sectorNews; // default para sector_news
      }
    } else if (type === 'event') {
      if (data.sector_id || action === 'sector') {
        mappedType = CONTENT_TYPES.sectorEvents; // 'sector_events'
      } else if (data.subsector_id) {
        mappedType = CONTENT_TYPES.subsectorEvents; // 'subsector_events'
      } else {
        mappedType = CONTENT_TYPES.sectorEvents; // default para sector_events
      }
    }
    
    console.log(`[API-POST] Mapeamento: "${type}" → "${mappedType}" (sector_id: ${data.sector_id})`);
    
    // Validar campos obrigatórios para notícias
    if (mappedType === CONTENT_TYPES.sectorNews || mappedType === CONTENT_TYPES.subsectorNews) {
      if (!data.title || !data.summary || !data.content) {
        console.error(`[API-POST] Campos obrigatórios faltando - notícias`);
        return NextResponse.json(
          { 
            error: API_ERROR_MESSAGES.missingFields,
            missing: {
              title: !data.title,
              summary: !data.summary,
              content: !data.content
            },
            receivedType: type,
            mappedType: mappedType
          },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    }
    
    // Validar campos obrigatórios para eventos
    if (mappedType === CONTENT_TYPES.sectorEvents || mappedType === CONTENT_TYPES.subsectorEvents) {
      if (!data.title || !data.description || !data.start_date) {
        console.error(`[API-POST] Campos obrigatórios faltando - eventos`);
        return NextResponse.json(
          { 
            error: API_ERROR_MESSAGES.missingFields,
            missing: {
              title: !data.title,
              description: !data.description,
              start_date: !data.start_date
            },
            receivedType: type,
            mappedType: mappedType
          },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    }
    
    // Adicionar created_by
    const enrichedData = {
      ...data,
      created_by: user.id
    };
    
    let result;
    let error;
    
    // USAR CLIENTE ADMIN PARA INSERÇÕES (BYPASS RLS)
    const adminClient = createAdminClient();
    
    // INSERÇÃO NO BANCO - USAR TIPO MAPEADO COM CLIENTE ADMIN
    switch (mappedType) {
      case CONTENT_TYPES.createNews:
      case CONTENT_TYPES.sectorNews:
        try {
          console.log(`[API-POST] Inserindo notícia: "${enrichedData.title}" (is_published: ${enrichedData.is_published})`);
          ({ data: result, error } = await adminClient
            .from('sector_news')
            .insert(enrichedData)
            .select()
            .single());
          if (result) {
            console.log(`[API-POST] ✅ Notícia criada: ID=${result.id}, published=${result.is_published}`);
          }
        } catch (insertError: any) {
          error = insertError;
          console.error('[API-POST] Erro INSERT sector_news:', insertError.message);
        }
        break;
        
      case CONTENT_TYPES.sectorEvents:
        console.log(`[API-POST] Inserindo evento: "${enrichedData.title}" (is_published: ${enrichedData.is_published})`);
        ({ data: result, error } = await adminClient
          .from('sector_events')
          .insert(enrichedData)
          .select()
          .single());
        if (result) {
          console.log(`[API-POST] ✅ Evento criado: ID=${result.id}, published=${result.is_published}`);
        }
        break;
        
      case CONTENT_TYPES.subsectorNews:
        console.log(`[API-POST] Inserindo subsector news: "${enrichedData.title}" (is_published: ${enrichedData.is_published})`);
        ({ data: result, error } = await adminClient
          .from('subsector_news')
          .insert(enrichedData)
          .select()
          .single());
        if (result) {
          console.log(`[API-POST] ✅ Subsector news criada: ID=${result.id}, published=${result.is_published}`);
        }
        break;
        
      case CONTENT_TYPES.subsectorEvents:
        console.log(`[API-POST] Inserindo subsector event: "${enrichedData.title}" (is_published: ${enrichedData.is_published})`);
        ({ data: result, error } = await adminClient
          .from('subsector_events')
          .insert(enrichedData)
          .select()
          .single());
        if (result) {
          console.log(`[API-POST] ✅ Subsector event criado: ID=${result.id}, published=${result.is_published}`);
        }
        break;
        
      case CONTENT_TYPES.updateNews:
        const updateNewsResult = await handleUpdateOperation(adminClient, 'sector_news', enrichedData);
        if (updateNewsResult instanceof NextResponse) return updateNewsResult;
        ({ result, error } = updateNewsResult);
        break;
        
      case CONTENT_TYPES.updateSubsectorNews:
        const updateSubsectorNewsResult = await handleUpdateOperation(adminClient, 'subsector_news', enrichedData);
        if (updateSubsectorNewsResult instanceof NextResponse) return updateSubsectorNewsResult;
        ({ result, error } = updateSubsectorNewsResult);
        break;
        
      case CONTENT_TYPES.updateEvent:
        const updateEventResult = await handleUpdateOperation(adminClient, 'sector_events', enrichedData);
        if (updateEventResult instanceof NextResponse) return updateEventResult;
        ({ result, error } = updateEventResult);
        break;
        
      default:
        console.error(`[API-POST] Tipo inválido: ${type} → ${mappedType}`);
        return NextResponse.json(
          { 
            error: API_ERROR_MESSAGES.invalidType, 
            originalType: type,
            mappedType: mappedType,
            operationType: operationType,
            supportedTypes: [
              CONTENT_TYPES.sectorNews,
              CONTENT_TYPES.sectorEvents,
              CONTENT_TYPES.subsectorNews,
              CONTENT_TYPES.subsectorEvents
            ]
          },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
    }
    
    if (error) {
      console.error('[API-POST] Erro final:', error.message);
      return NextResponse.json(
        { 
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          sentData: enrichedData,
          operationType,
          timestamp: new Date().toISOString()
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    console.log(`[API-POST] ✅ Criado com sucesso: ID=${result?.id}, tipo=${mappedType}`);
    return NextResponse.json({ 
      data: result,
      success: true,
      originalType: type,
      mappedType: mappedType,
      operationType: operationType,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('[API-POST] Erro crítico:', error.message);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error.message,
        type: error.constructor?.name || 'Unknown',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// PUT - Atualizar notícia ou evento
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, data, sectorId, subsectorId } = body;
    
    console.log(`[API-PUT] Atualizando ${type} ID:${id}, sectorId:${sectorId}`);

    const supabase = await createAuthenticatedClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[API-PUT] Auth erro:', authError?.message || 'User not found');
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.unauthorized },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }
    
    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    console.log(`[API-PUT] User: ${user.email}, Role: ${profile?.role}`);
    
    if (!profile || (profile.role !== 'admin' && profile.role !== 'sector_admin' && profile.role !== 'subsector_admin')) {
      console.error(`[API-PUT] Permissão negada - role: ${profile?.role}`);
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.permissionDenied },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }
    
    // Determinar o ID real e o tipo correto
    let realId = id || data?.id;
    let realType = type;
    
    // Determinar o tipo correto baseado no contexto
    // Mapear tipos simples do frontend para tipos completos do backend (similar ao POST)
    if (type === 'news') {
      if (sectorId) {
        realType = CONTENT_TYPES.sectorNews; // 'sector_news'
      } else if (subsectorId) {
        realType = CONTENT_TYPES.subsectorNews; // 'subsector_news'
      }
    } else if (type === 'event' || type === 'events') {
      if (sectorId) {
        realType = CONTENT_TYPES.sectorEvents; // 'sector_events'
      } else if (subsectorId) {
        realType = CONTENT_TYPES.subsectorEvents; // 'subsector_events'
      }
    }
    
    // Se o tipo já é completo (vem direto do frontend), manter como está
    if (type === CONTENT_TYPES.sectorNews || type === CONTENT_TYPES.sectorEvents || 
        type === CONTENT_TYPES.subsectorNews || type === CONTENT_TYPES.subsectorEvents) {
      realType = type;
    }
    
    console.log(`[API-PUT] Mapeamento: "${type}" → "${realType}" (ID: ${realId})`);
    
    // Validações com logging detalhado
    if (!realId) {
      console.error('[API-PUT] ID obrigatório faltando');
      return NextResponse.json(
        { 
          error: API_ERROR_MESSAGES.invalidId,
          received: { type, id, hasData: !!data, dataId: data?.id }
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    if (!realType) {
      console.error(`[API-PUT] Tipo inválido: ${type}`);
      return NextResponse.json(
        { 
          error: API_ERROR_MESSAGES.invalidType,
          received: { type, sectorId, subsectorId },
          mapped: realType
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    if (!data || typeof data !== 'object') {
      console.error('[API-PUT] Dados obrigatórios faltando');
      return NextResponse.json(
        { 
          error: API_ERROR_MESSAGES.missingFields,
          received: { hasData: !!data, dataType: typeof data }
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    // Validar campos obrigatórios para eventos (similar ao POST)
    if (realType === CONTENT_TYPES.sectorEvents || realType === CONTENT_TYPES.subsectorEvents) {
      if (!data.title || !data.description || !data.start_date) {
        console.error('[API-PUT] Campos obrigatórios faltando - eventos');
        return NextResponse.json(
          { 
            error: API_ERROR_MESSAGES.missingFields,
            missing: {
              title: !data.title,
              description: !data.description,
              start_date: !data.start_date
            },
            type: realType
          },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    }
    
    // Validar campos obrigatórios para notícias (similar ao POST)
    if (realType === CONTENT_TYPES.sectorNews || realType === CONTENT_TYPES.subsectorNews) {
      if (!data.title || !data.summary || !data.content) {
        console.error('[API-PUT] Campos obrigatórios faltando - notícias');
        return NextResponse.json(
          { 
            error: API_ERROR_MESSAGES.missingFields,
            missing: {
              title: !data.title,
              summary: !data.summary,
              content: !data.content
            },
            type: realType
          },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    }
    
    // Preparar dados para atualização
    const { 
      id: dataId, 
      created_by, 
      created_at, 
      ...updateData 
    } = data;
    
    // Adicionar timestamp de atualização
    updateData.updated_at = new Date().toISOString();
    
    // USAR CLIENTE ADMIN PARA ATUALIZAÇÕES (BYPASS RLS)
    const putAdminClient = createAdminClient();
    
    let result;
    let error;
    
    // ATUALIZAÇÃO NO BANCO - COM LOGGING DETALHADO USANDO CLIENTE ADMIN
    switch (realType) {
      case CONTENT_TYPES.sectorNews:
        console.log(`[API-PUT] Atualizando notícia ID=${realId}: "${updateData.title}"`);
        ({ data: result, error } = await putAdminClient
          .from('sector_news')
          .update(updateData)
          .eq('id', realId)
          .select()
          .single());
        if (result) {
          console.log(`[API-PUT] ✅ Notícia atualizada: published=${result.is_published}`);
        }
        break;
        
      case CONTENT_TYPES.sectorEvents:
        console.log(`[API-PUT] Atualizando evento ID=${realId}: "${updateData.title}"`);
        ({ data: result, error } = await putAdminClient
          .from('sector_events')
          .update(updateData)
          .eq('id', realId)
          .select()
          .single());
        if (result) {
          console.log(`[API-PUT] ✅ Evento atualizado: published=${result.is_published}`);
        }
        break;
        
      case CONTENT_TYPES.subsectorNews:
        console.log(`[API-PUT] Atualizando subsector news ID=${realId}: "${updateData.title}"`);
        ({ data: result, error } = await putAdminClient
          .from('subsector_news')
          .update(updateData)
          .eq('id', realId)
          .select()
          .single());
        if (result) {
          console.log(`[API-PUT] ✅ Subsector news atualizada: published=${result.is_published}`);
        }
        break;
        
      case CONTENT_TYPES.subsectorEvents:
        console.log(`[API-PUT] Atualizando subsector event ID=${realId}: "${updateData.title}"`);
        ({ data: result, error } = await putAdminClient
          .from('subsector_events')
          .update(updateData)
          .eq('id', realId)
          .select()
          .single());
        if (result) {
          console.log(`[API-PUT] ✅ Subsector event atualizado: published=${result.is_published}`);
        }
        break;
        
      default:
        console.error(`[API-PUT] Tipo inválido: ${type} → ${realType}`);
        return NextResponse.json(
          { 
            error: API_ERROR_MESSAGES.invalidType,
            received: realType,
            originalType: type,
            supported: [
              CONTENT_TYPES.sectorNews,
              CONTENT_TYPES.sectorEvents,
              CONTENT_TYPES.subsectorNews,
              CONTENT_TYPES.subsectorEvents
            ]
          },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
    }
    
    if (error) {
      console.error('[API-PUT] Erro final:', error.message);
      return NextResponse.json(
        { 
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          sentData: updateData,
          realType,
          realId,
          timestamp: new Date().toISOString()
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    console.log(`[API-PUT] ✅ Atualizado com sucesso: ID=${realId}, tipo=${realType}`);
    return NextResponse.json({ 
      data: result,
      success: true,
      originalType: type,
      mappedType: realType,
      updated_id: realId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('[API-PUT] Erro crítico:', error.message);
    return NextResponse.json(
      { error: API_ERROR_MESSAGES.internalError },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// DELETE - Excluir notícia ou evento
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    
    console.log(`[API-DELETE] Excluindo ${type} ID:${id}`);

    const supabase = await createAuthenticatedClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[API-DELETE] Auth erro:', authError?.message || 'User not found');
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.unauthorized },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }
    
    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    console.log(`[API-DELETE] User: ${user.email}, Role: ${profile?.role}`);
    
    if (!profile || (profile.role !== 'admin' && profile.role !== 'sector_admin' && profile.role !== 'subsector_admin')) {
      console.error(`[API-DELETE] Permissão negada - role: ${profile?.role}`);
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.permissionDenied },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }
    
    if (!type || !id) {
      return NextResponse.json(
        { error: 'Parâmetros faltando' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    // USAR CLIENTE ADMIN PARA EXCLUSÕES (BYPASS RLS)
    const deleteAdminClient = createAdminClient();
    
    let error;
    
    switch (type) {
      case CONTENT_TYPES.sectorNews:
        console.log(`[API-DELETE] Excluindo notícia ID=${id}`);
        ({ error } = await deleteAdminClient
          .from('sector_news')
          .delete()
          .eq('id', id));
        if (!error) {
          console.log(`[API-DELETE] ✅ Notícia excluída`);
        }
        break;
        
      case CONTENT_TYPES.sectorEvents:
        console.log(`[API-DELETE] Excluindo evento ID=${id}`);
        ({ error } = await deleteAdminClient
          .from('sector_events')
          .delete()
          .eq('id', id));
        if (!error) {
          console.log(`[API-DELETE] ✅ Evento excluído`);
        }
        break;
        
      case CONTENT_TYPES.subsectorNews:
        console.log(`[API-DELETE] Excluindo subsector news ID=${id}`);
        ({ error } = await deleteAdminClient
          .from('subsector_news')
          .delete()
          .eq('id', id));
        if (!error) {
          console.log(`[API-DELETE] ✅ Subsector news excluída`);
        }
        break;
        
      case CONTENT_TYPES.subsectorEvents:
        console.log(`[API-DELETE] Excluindo subsector event ID=${id}`);
        ({ error } = await deleteAdminClient
          .from('subsector_events')
          .delete()
          .eq('id', id));
        if (!error) {
          console.log(`[API-DELETE] ✅ Subsector event excluído`);
        }
        break;
        
      default:
        return NextResponse.json(
          { error: 'Tipo inválido' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
    }
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('[API-DELETE] Erro crítico:', error.message);
    return NextResponse.json(
      { error: API_ERROR_MESSAGES.internalError },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}