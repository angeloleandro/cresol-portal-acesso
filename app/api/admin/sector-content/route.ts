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
        
      case 'sector_documents':
        tableName = 'sector_documents';
        query = supabase
          .from('sector_documents')
          .select('*')
          .eq('sector_id', sectorId)
          .order('created_at', { ascending: false });
        break;
        
      case 'subsector_documents':
        tableName = 'subsector_documents';
        query = supabase
          .from('subsector_documents')
          .select('*')
          .eq('subsector_id', subsectorId)
          .order('created_at', { ascending: false });
        break;
        
      default:
        return NextResponse.json(
          { error: 'Tipo inválido', supportedTypes: ['sector_news', 'sector_events', 'subsector_news', 'subsector_events', 'sector_documents', 'subsector_documents'] },
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
    

    const supabase = await createAuthenticatedClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
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
      return NextResponse.json(
        { 
          error: API_ERROR_MESSAGES.internalError,
          details: profileError.message
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }
    
    
    if (!profile || (profile.role !== 'admin' && profile.role !== 'sector_admin' && profile.role !== 'subsector_admin')) {
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
    } else if (type === 'documents') {
      if (data.sector_id || action === 'sector') {
        mappedType = CONTENT_TYPES.sectorDocuments; // 'sector_documents'
      } else if (data.subsector_id) {
        mappedType = CONTENT_TYPES.subsectorDocuments; // 'subsector_documents'
      } else {
        mappedType = CONTENT_TYPES.sectorDocuments; // default para sector_documents
      }
    } else if (type === 'message' || type === 'messages') {
      if (data.sector_id || action === 'sector') {
        mappedType = 'sector_messages';
      } else if (data.subsector_id) {
        mappedType = 'subsector_messages';
      } else {
        mappedType = 'sector_messages'; // default para sector_messages
      }
    }
    
    
    // Validar campos obrigatórios para notícias
    if (mappedType === CONTENT_TYPES.sectorNews || mappedType === CONTENT_TYPES.subsectorNews) {
      if (!data.title || !data.summary || !data.content) {
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
    
    // Validar campos obrigatórios para documentos
    if (mappedType === CONTENT_TYPES.sectorDocuments || mappedType === CONTENT_TYPES.subsectorDocuments) {
      if (!data.title || !data.file_url) {
        return NextResponse.json(
          { 
            error: API_ERROR_MESSAGES.missingFields,
            missing: {
              title: !data.title,
              file_url: !data.file_url
            },
            receivedType: type,
            mappedType: mappedType
          },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    }
    
    // Validar campos obrigatórios para mensagens
    if (mappedType === 'sector_messages' || mappedType === 'subsector_messages') {
      if (!data.title || !data.content) {
        return NextResponse.json(
          { 
            error: API_ERROR_MESSAGES.missingFields,
            missing: {
              title: !data.title,
              content: !data.content
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
          ({ data: result, error } = await adminClient
            .from('sector_news')
            .insert(enrichedData)
            .select()
            .single());
          if (result) {
          }
        } catch (insertError: any) {
          error = insertError;
        }
        break;
        
      case CONTENT_TYPES.sectorEvents:
        ({ data: result, error } = await adminClient
          .from('sector_events')
          .insert(enrichedData)
          .select()
          .single());
        if (result) {
        }
        break;
        
      case CONTENT_TYPES.subsectorNews:
        ({ data: result, error } = await adminClient
          .from('subsector_news')
          .insert(enrichedData)
          .select()
          .single());
        if (result) {
        }
        break;
        
      case CONTENT_TYPES.subsectorEvents:
        ({ data: result, error } = await adminClient
          .from('subsector_events')
          .insert(enrichedData)
          .select()
          .single());
        if (result) {
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
        
      case CONTENT_TYPES.sectorDocuments:
        ({ data: result, error } = await adminClient
          .from('sector_documents')
          .insert(enrichedData)
          .select()
          .single());
        if (result) {
        }
        break;
        
      case CONTENT_TYPES.subsectorDocuments:
        ({ data: result, error } = await adminClient
          .from('subsector_documents')
          .insert(enrichedData)
          .select()
          .single());
        if (result) {
        }
        break;
        
      case CONTENT_TYPES.updateEvent:
        const updateEventResult = await handleUpdateOperation(adminClient, 'sector_events', enrichedData);
        if (updateEventResult instanceof NextResponse) return updateEventResult;
        ({ result, error } = updateEventResult);
        break;
        
      case CONTENT_TYPES.updateDocument:
        const updateDocumentResult = await handleUpdateOperation(adminClient, 'sector_documents', enrichedData);
        if (updateDocumentResult instanceof NextResponse) return updateDocumentResult;
        ({ result, error } = updateDocumentResult);
        break;
        
      case 'sector_messages':
        ({ data: result, error } = await adminClient
          .from('sector_messages')
          .insert(enrichedData)
          .select()
          .single());
        if (result) {
        }
        break;
        
      case 'subsector_messages':
        ({ data: result, error } = await adminClient
          .from('subsector_messages')
          .insert(enrichedData)
          .select()
          .single());
        if (result) {
        }
        break;
        
      default:
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
    
    return NextResponse.json({ 
      data: result,
      success: true,
      originalType: type,
      mappedType: mappedType,
      operationType: operationType,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
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
    

    const supabase = await createAuthenticatedClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
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
    
    
    if (!profile || (profile.role !== 'admin' && profile.role !== 'sector_admin' && profile.role !== 'subsector_admin')) {
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
    } else if (type === 'documents') {
      if (sectorId) {
        realType = CONTENT_TYPES.sectorDocuments; // 'sector_documents'
      } else if (subsectorId) {
        realType = CONTENT_TYPES.subsectorDocuments; // 'subsector_documents'
      }
    } else if (type === 'message' || type === 'messages') {
      if (sectorId) {
        realType = 'sector_messages';
      } else if (subsectorId) {
        realType = 'subsector_messages';
      }
    }
    
    // Se o tipo já é completo (vem direto do frontend), manter como está
    if (type === CONTENT_TYPES.sectorNews || type === CONTENT_TYPES.sectorEvents || 
        type === CONTENT_TYPES.subsectorNews || type === CONTENT_TYPES.subsectorEvents ||
        type === CONTENT_TYPES.sectorDocuments || type === CONTENT_TYPES.subsectorDocuments) {
      realType = type;
    }
    
    
    // Validações com logging detalhado
    if (!realId) {
      return NextResponse.json(
        { 
          error: API_ERROR_MESSAGES.invalidId,
          received: { type, id, hasData: !!data, dataId: data?.id }
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    if (!realType) {
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
    
    // Validar campos obrigatórios para mensagens
    if (realType === 'sector_messages' || realType === 'subsector_messages') {
      if (!data.title || !data.content) {
        return NextResponse.json(
          { 
            error: API_ERROR_MESSAGES.missingFields,
            missing: {
              title: !data.title,
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
        ({ data: result, error } = await putAdminClient
          .from('sector_news')
          .update(updateData)
          .eq('id', realId)
          .select()
          .single());
        if (result) {
        }
        break;
        
      case CONTENT_TYPES.sectorEvents:
        ({ data: result, error } = await putAdminClient
          .from('sector_events')
          .update(updateData)
          .eq('id', realId)
          .select()
          .single());
        if (result) {
        }
        break;
        
      case CONTENT_TYPES.subsectorNews:
        ({ data: result, error } = await putAdminClient
          .from('subsector_news')
          .update(updateData)
          .eq('id', realId)
          .select()
          .single());
        if (result) {
        }
        break;
        
      case CONTENT_TYPES.subsectorEvents:
        ({ data: result, error } = await putAdminClient
          .from('subsector_events')
          .update(updateData)
          .eq('id', realId)
          .select()
          .single());
        if (result) {
        }
        break;
        
      case CONTENT_TYPES.sectorDocuments:
        ({ data: result, error } = await putAdminClient
          .from('sector_documents')
          .update(updateData)
          .eq('id', realId)
          .select()
          .single());
        if (result) {
        }
        break;
        
      case CONTENT_TYPES.subsectorDocuments:
        ({ data: result, error } = await putAdminClient
          .from('subsector_documents')
          .update(updateData)
          .eq('id', realId)
          .select()
          .single());
        if (result) {
        }
        break;
        
      case 'sector_messages':
        ({ data: result, error } = await putAdminClient
          .from('sector_messages')
          .update(updateData)
          .eq('id', realId)
          .select()
          .single());
        if (result) {
        }
        break;
        
      case 'subsector_messages':
        ({ data: result, error } = await putAdminClient
          .from('subsector_messages')
          .update(updateData)
          .eq('id', realId)
          .select()
          .single());
        if (result) {
        }
        break;
        
      default:
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
    
    return NextResponse.json({ 
      data: result,
      success: true,
      originalType: type,
      mappedType: realType,
      updated_id: realId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
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
    

    const supabase = await createAuthenticatedClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
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
    
    
    if (!profile || (profile.role !== 'admin' && profile.role !== 'sector_admin' && profile.role !== 'subsector_admin')) {
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
        ({ error } = await deleteAdminClient
          .from('sector_news')
          .delete()
          .eq('id', id));
        if (!error) {
        }
        break;
        
      case CONTENT_TYPES.sectorEvents:
        ({ error } = await deleteAdminClient
          .from('sector_events')
          .delete()
          .eq('id', id));
        if (!error) {
        }
        break;
        
      case CONTENT_TYPES.subsectorNews:
        ({ error } = await deleteAdminClient
          .from('subsector_news')
          .delete()
          .eq('id', id));
        if (!error) {
        }
        break;
        
      case CONTENT_TYPES.subsectorEvents:
        ({ error } = await deleteAdminClient
          .from('subsector_events')
          .delete()
          .eq('id', id));
        if (!error) {
        }
        break;
        
      case CONTENT_TYPES.sectorDocuments:
        ({ error } = await deleteAdminClient
          .from('sector_documents')
          .delete()
          .eq('id', id));
        if (!error) {
        }
        break;
        
      case CONTENT_TYPES.subsectorDocuments:
        ({ error } = await deleteAdminClient
          .from('subsector_documents')
          .delete()
          .eq('id', id));
        if (!error) {
        }
        break;
        
      case 'sector_messages':
        ({ error } = await deleteAdminClient
          .from('sector_messages')
          .delete()
          .eq('id', id));
        if (!error) {
        }
        break;
        
      case 'subsector_messages':
        ({ error } = await deleteAdminClient
          .from('subsector_messages')
          .delete()
          .eq('id', id));
        if (!error) {
        }
        break;
        
      case 'sector_videos':
        ({ error } = await deleteAdminClient
          .from('sector_videos')
          .delete()
          .eq('id', id));
        if (!error) {
        }
        break;
        
      case 'subsector_videos':
        ({ error } = await deleteAdminClient
          .from('subsector_videos')
          .delete()
          .eq('id', id));
        if (!error) {
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
    return NextResponse.json(
      { error: API_ERROR_MESSAGES.internalError },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}