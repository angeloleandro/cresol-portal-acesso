import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { z } from 'zod';

// Schema de validação para criação/edição de documento
const documentSchema = z.object({
  type: z.enum(['sector', 'subsector'], { message: 'Tipo é obrigatório' }),
  sector_id: z.string().optional(),
  subsector_id: z.string().optional(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  file_url: z.string().min(1, 'URL do arquivo é obrigatória'),
  file_type: z.string().optional(),
  file_size: z.number().optional(),
  is_featured: z.boolean().optional().default(false),
  is_published: z.boolean().optional().default(false),
}).refine(
  (data) => {
    if (data.type === 'sector' && !data.sector_id) {
      return false;
    }
    if (data.type === 'subsector' && !data.subsector_id) {
      return false;
    }
    return true;
  },
  {
    message: "ID do setor/subsetor é obrigatório",
    path: ["sector_id"]
  }
);

const updateDocumentSchema = documentSchema.partial().extend({
  id: z.string().min(1, 'ID é obrigatório para atualização'),
});

// Schema para filtros de busca
const searchFiltersSchema = z.object({
  type: z.enum(['all', 'sector', 'subsector']).optional().default('all'),
  search: z.string().optional(),
  sector_id: z.string().optional(),
  subsector_id: z.string().optional(),
  status: z.enum(['all', 'published', 'draft']).optional().default('all'),
  featured: z.enum(['all', 'featured', 'not_featured']).optional().default('all'),
  file_type: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  order_by: z.enum(['created_at', 'updated_at', 'title', 'file_size']).optional().default('created_at'),
  order_direction: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Função auxiliar para verificar permissões de admin
async function checkAdminPermissions(userId: string) {
  const supabase = createAdminSupabaseClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (!profile) {
    throw new Error('Usuário não encontrado');
  }

  // Apenas admin geral pode acessar este endpoint
  return profile.role === 'admin';
}

// GET - Buscar todos os documentos com filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pré-processar parâmetros para converter strings vazias em undefined
    const rawFilters = Object.fromEntries(searchParams);
    const cleanedFilters = Object.entries(rawFilters).reduce((acc, [key, value]) => {
      // Converter strings vazias em undefined para campos UUID
      if (['sector_id', 'subsector_id'].includes(key) && value === '') {
        return acc; // Omitir o campo
      }
      acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
    
    const filters = searchFiltersSchema.parse(cleanedFilters);

    const supabase = createAdminSupabaseClient();

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar permissões de admin
    const hasPermission = await checkAdminPermissions(user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas admin geral' },
        { status: 403 }
      );
    }

    // Construir queries para documentos de setor e subsetor
    let sectorDocuments: any[] = [];
    let subsectorDocuments: any[] = [];
    let totalCount = 0;

    // Buscar documentos de setor
    if (filters.type === 'all' || filters.type === 'sector') {
      let sectorQuery = supabase
        .from('sector_documents')
        .select(`
          id,
          title,
          description,
          file_url,
          file_type,
          file_size,
          is_featured,
          is_published,
          created_at,
          updated_at,
          sector_id,
          sectors!inner(id, name)
        `, { count: 'exact' });

      // Aplicar filtros
      if (filters.search) {
        sectorQuery = sectorQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      if (filters.sector_id) {
        sectorQuery = sectorQuery.eq('sector_id', filters.sector_id);
      }
      
      if (filters.status === 'published') {
        sectorQuery = sectorQuery.eq('is_published', true);
      } else if (filters.status === 'draft') {
        sectorQuery = sectorQuery.eq('is_published', false);
      }
      
      if (filters.featured === 'featured') {
        sectorQuery = sectorQuery.eq('is_featured', true);
      } else if (filters.featured === 'not_featured') {
        sectorQuery = sectorQuery.eq('is_featured', false);
      }
      
      if (filters.file_type) {
        sectorQuery = sectorQuery.eq('file_type', filters.file_type);
      }
      
      if (filters.date_from) {
        sectorQuery = sectorQuery.gte('created_at', filters.date_from);
      }
      
      if (filters.date_to) {
        sectorQuery = sectorQuery.lte('created_at', filters.date_to);
      }

      const { data: sectorData, count: sectorCount } = await sectorQuery
        .order(filters.order_by, { ascending: filters.order_direction === 'asc' });

      sectorDocuments = (sectorData || []).map((doc: any) => ({
        ...doc,
        type: 'sector',
        location_name: (doc.sectors && typeof doc.sectors === 'object' && 'name' in doc.sectors) ? doc.sectors.name : 'Setor'
      }));
      
      totalCount += sectorCount || 0;
    }

    // Buscar documentos de subsetor
    if (filters.type === 'all' || filters.type === 'subsector') {
      let subsectorQuery = supabase
        .from('subsector_documents')
        .select(`
          id,
          title,
          description,
          file_url,
          file_type,
          file_size,
          is_featured,
          is_published,
          created_at,
          updated_at,
          subsector_id,
          subsectors!inner(id, name, sectors(name))
        `, { count: 'exact' });

      // Aplicar filtros
      if (filters.search) {
        subsectorQuery = subsectorQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      if (filters.subsector_id) {
        subsectorQuery = subsectorQuery.eq('subsector_id', filters.subsector_id);
      }
      
      if (filters.sector_id) {
        subsectorQuery = subsectorQuery.eq('subsectors.sector_id', filters.sector_id);
      }
      
      if (filters.status === 'published') {
        subsectorQuery = subsectorQuery.eq('is_published', true);
      } else if (filters.status === 'draft') {
        subsectorQuery = subsectorQuery.eq('is_published', false);
      }
      
      if (filters.featured === 'featured') {
        subsectorQuery = subsectorQuery.eq('is_featured', true);
      } else if (filters.featured === 'not_featured') {
        subsectorQuery = subsectorQuery.eq('is_featured', false);
      }
      
      if (filters.file_type) {
        subsectorQuery = subsectorQuery.eq('file_type', filters.file_type);
      }
      
      if (filters.date_from) {
        subsectorQuery = subsectorQuery.gte('created_at', filters.date_from);
      }
      
      if (filters.date_to) {
        subsectorQuery = subsectorQuery.lte('created_at', filters.date_to);
      }

      const { data: subsectorData, count: subsectorCount } = await subsectorQuery
        .order(filters.order_by, { ascending: filters.order_direction === 'asc' });

      subsectorDocuments = (subsectorData || []).map((doc: any) => ({
        ...doc,
        type: 'subsector',
        location_name: doc.subsectors?.name || 'Subsetor',
        sector_name: (doc.subsectors?.sectors && typeof doc.subsectors.sectors === 'object' && 'name' in doc.subsectors.sectors) ? doc.subsectors.sectors.name : undefined
      }));
      
      totalCount += subsectorCount || 0;
    }

    // Combinar e ordenar documentos
    const allDocuments = [...sectorDocuments, ...subsectorDocuments];
    
    allDocuments.sort((a, b) => {
      const aValue = a[filters.order_by];
      const bValue = b[filters.order_by];
      
      if (filters.order_direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Aplicar paginação após combinação
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedDocuments = allDocuments.slice(startIndex, endIndex);

    // Calcular metadados de paginação baseado no total combinado
    const actualTotalCount = allDocuments.length;
    const totalPages = Math.ceil(actualTotalCount / filters.limit);
    const hasNextPage = filters.page < totalPages;
    const hasPrevPage = filters.page > 1;

    // Calcular estatísticas
    const published = allDocuments.filter(d => d.is_published).length;
    const drafts = allDocuments.filter(d => !d.is_published).length;
    const featured = allDocuments.filter(d => d.is_featured).length;

    const responseTime = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: {
        documents: paginatedDocuments,
        pagination: {
          currentPage: filters.page,
          totalPages,
          totalCount: actualTotalCount,
          limit: filters.limit,
          hasNextPage,
          hasPrevPage,
        },
        stats: {
          total: actualTotalCount,
          published,
          drafts,
          featured,
          byType: { 
            sector: sectorDocuments.length, 
            subsector: subsectorDocuments.length 
          }
        },
        filters: filters,
      }
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.issues
        },
        { status: 400 }
      );
    }

    console.error('[SUPABASE-ERROR] Error in GET documents:', { 
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo documento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = documentSchema.parse(body);
    
    const supabase = createAdminSupabaseClient();
    
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar permissões de admin
    const hasPermission = await checkAdminPermissions(user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas admin geral' },
        { status: 403 }
      );
    }

    // Preparar dados do documento
    const documentData = {
      title: validatedData.title,
      description: validatedData.description,
      file_url: validatedData.file_url,
      file_type: validatedData.file_type,
      file_size: validatedData.file_size,
      is_featured: validatedData.is_featured || false,
      is_published: validatedData.is_published || false,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let newDocument;

    // Criar documento no local apropriado
    if (validatedData.type === 'sector') {
      const { data, error } = await supabase
        .from('sector_documents')
        .insert([{
          ...documentData,
          sector_id: validatedData.sector_id,
        }])
        .select(`
          *,
          sectors(name)
        `)
        .single();

      if (error) {
        console.error('[SUPABASE-ERROR] Error creating sector document:', {
          error: error.message,
          documentData,
          timestamp: new Date().toISOString()
        });
        return NextResponse.json(
          { error: 'Erro ao criar documento' },
          { status: 500 }
        );
      }

      newDocument = {
        ...data,
        type: 'sector',
        location_name: data.sectors?.name || 'Setor'
      };
    } else {
      const { data, error } = await supabase
        .from('subsector_documents')
        .insert([{
          ...documentData,
          subsector_id: validatedData.subsector_id,
        }])
        .select(`
          *,
          subsectors(name, sectors(name))
        `)
        .single();

      if (error) {
        console.error('Erro ao criar documento de subsetor:', error);
        return NextResponse.json(
          { error: 'Erro ao criar documento' },
          { status: 500 }
        );
      }

      newDocument = {
        ...data,
        type: 'subsector',
        location_name: data.subsectors?.name || 'Subsetor',
        sector_name: data.subsectors?.sectors?.name
      };
    }

    return NextResponse.json({
      success: true,
      data: newDocument,
      message: 'Documento criado com sucesso'
    }, { status: 201 });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.issues
        },
        { status: 400 }
      );
    }

    console.error('Erro no POST documents:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar documento existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateDocumentSchema.parse(body);
    const { id, type, ...updateData } = validatedData;

    const supabase = createAdminSupabaseClient();
    
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar permissões de admin
    const hasPermission = await checkAdminPermissions(user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas admin geral' },
        { status: 403 }
      );
    }

    // Preparar dados de atualização
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    cleanUpdateData.updated_at = new Date().toISOString();

    let updatedDocument;

    // Atualizar documento no local apropriado
    if (type === 'sector') {
      const { data, error } = await supabase
        .from('sector_documents')
        .update(cleanUpdateData)
        .eq('id', id)
        .select(`
          *,
          sectors(name)
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar documento de setor:', error);
        return NextResponse.json(
          { error: 'Erro ao atualizar documento' },
          { status: 500 }
        );
      }

      updatedDocument = {
        ...data,
        type: 'sector',
        location_name: data.sectors?.name || 'Setor'
      };
    } else {
      const { data, error } = await supabase
        .from('subsector_documents')
        .update(cleanUpdateData)
        .eq('id', id)
        .select(`
          *,
          subsectors(name, sectors(name))
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar documento de subsetor:', error);
        return NextResponse.json(
          { error: 'Erro ao atualizar documento' },
          { status: 500 }
        );
      }

      updatedDocument = {
        ...data,
        type: 'subsector',
        location_name: data.subsectors?.name || 'Subsetor',
        sector_name: data.subsectors?.sectors?.name
      };
    }

    return NextResponse.json({
      success: true,
      data: updatedDocument,
      message: 'Documento atualizado com sucesso'
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.issues
        },
        { status: 400 }
      );
    }

    console.error('Erro no PUT documents:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir documento
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json(
        { error: 'ID e tipo do documento são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['sector', 'subsector'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo deve ser "sector" ou "subsector"' },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();
    
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar permissões de admin
    const hasPermission = await checkAdminPermissions(user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas admin geral' },
        { status: 403 }
      );
    }

    // Excluir documento do local apropriado
    const tableName = type === 'sector' ? 'sector_documents' : 'subsector_documents';
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erro ao excluir documento de ${type}:`, error);
      return NextResponse.json(
        { error: 'Erro ao excluir documento' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Documento excluído com sucesso'
    });

  } catch (error: any) {
    console.error('Erro no DELETE documents:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Alternar status ou duplicar documento
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const action = searchParams.get('action');

    if (!id || !type || !action) {
      return NextResponse.json(
        { error: 'ID, tipo e ação são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['sector', 'subsector'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo deve ser "sector" ou "subsector"' },
        { status: 400 }
      );
    }

    if (!['publish', 'unpublish', 'duplicate', 'feature', 'unfeature'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação deve ser "publish", "unpublish", "duplicate", "feature" ou "unfeature"' },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();
    
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar permissões de admin
    const hasPermission = await checkAdminPermissions(user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas admin geral' },
        { status: 403 }
      );
    }

    const tableName = type === 'sector' ? 'sector_documents' : 'subsector_documents';

    if (action === 'duplicate') {
      // Buscar documento original
      const { data: originalDocument, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !originalDocument) {
        return NextResponse.json(
          { error: 'Documento não encontrado' },
          { status: 404 }
        );
      }

      // Criar cópia
      const { title, description, file_url, file_type, file_size, sector_id, subsector_id } = originalDocument;
      const duplicatedData = {
        title: `${title} (Cópia)`,
        description,
        file_url,
        file_type,
        file_size,
        is_featured: false, // Cópia não vem destacada
        is_published: false, // Cópia sempre começa como rascunho
        created_by: user.id,
        ...(type === 'sector' ? { sector_id } : { subsector_id }),
      };

      const { data: duplicatedDocument, error: duplicateError } = await supabase
        .from(tableName)
        .insert([duplicatedData])
        .select('*')
        .single();

      if (duplicateError) {
        console.error('Erro ao duplicar documento:', duplicateError);
        return NextResponse.json(
          { error: 'Erro ao duplicar documento' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: duplicatedDocument,
        message: 'Documento duplicado com sucesso'
      });
    } else {
      // Publish/Unpublish/Feature/Unfeature
      let updateField = {};
      
      if (action === 'publish') {
        updateField = { is_published: true };
      } else if (action === 'unpublish') {
        updateField = { is_published: false };
      } else if (action === 'feature') {
        updateField = { is_featured: true };
      } else if (action === 'unfeature') {
        updateField = { is_featured: false };
      }
      
      const { data: updatedDocument, error } = await supabase
        .from(tableName)
        .update({ 
          ...updateField,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error(`Erro ao ${action} documento:`, error);
        return NextResponse.json(
          { error: `Erro ao executar ação ${action}` },
          { status: 500 }
        );
      }

      const actionMessages = {
        publish: 'publicado',
        unpublish: 'despublicado',
        feature: 'destacado',
        unfeature: 'removido dos destaques'
      };

      return NextResponse.json({
        success: true,
        message: `Documento ${(actionMessages as any)[action]} com sucesso`,
        data: updatedDocument
      });
    }

  } catch (error: any) {
    console.error('Erro no PATCH documents:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}