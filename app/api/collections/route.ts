// Collections API Routes
// CRUD completo para coleções - Portal Cresol

import { NextRequest, NextResponse } from 'next/server';

import { handleApiError, devLog } from '@/lib/error-handler';
import { CreateClient } from '@/lib/supabase/server';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// GET /api/collections - Listar coleções com filtros
export async function GET(request: NextRequest) {
  try {
    const supabase = CreateClient();
    
    // Verificar se usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sort_by') || 'order_index';
    const sortOrder = searchParams.get('sort_order') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50);

    // Construir query básica
    let query = supabase
      .from('collections')
      .select('*', { count: 'exact' });

    // Aplicar filtro de busca se fornecido
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Aplicar ordenação
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    // Aplicar paginação
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: collections, error, count } = await query;

    if (error) {
      devLog.error('Erro ao buscar coleções', { error });
      return NextResponse.json(
        { error: 'Erro ao buscar coleções' },
        { status: 500 }
      );
    }

    devLog.info('Coleções carregadas', { count: collections?.length });
    return NextResponse.json({
      collections: collections || [],
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > (page * limit),
    });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'getCollections');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}

// POST /api/collections - Criar nova coleção (apenas admins)
export async function POST(request: NextRequest) {
  try {
    const supabase = CreateClient();
    
    // Verificar se usuário está autenticado e é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validar campos obrigatórios
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Nome da coleção é obrigatório' },
        { status: 400 }
      );
    }

    // Calcular próximo order_index
    let orderIndex = body.order_index;
    if (!orderIndex) {
      const { data: lastCollection } = await supabase
        .from('collections')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      orderIndex = (lastCollection?.order_index || 0) + 10;
    }

    // Criar coleção
    const { data: newCollection, error } = await supabase
      .from('collections')
      .insert([{
        name: body.name.trim(),
        description: body.description || null,
        cover_image_url: body.cover_image_url || null,
        color_theme: body.color_theme || null,
        type: body.type || 'mixed',
        is_active: body.is_active !== undefined ? body.is_active : true,
        order_index: orderIndex,
        created_by: user.id,
      }])
      .select()
      .single();

    if (error) {
      devLog.error('Erro ao criar coleção', { error, body });
      return NextResponse.json(
        { error: 'Erro ao criar coleção' },
        { status: 500 }
      );
    }

    devLog.info('Coleção criada', { collection: newCollection });
    return NextResponse.json({ collection: newCollection }, { status: 201 });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'createCollection');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}