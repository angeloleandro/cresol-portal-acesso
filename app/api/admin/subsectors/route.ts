import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticateAdminRequest } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const apiTimer = logger.apiStart('GET /api/admin/subsectors');
  
  try {
    const { searchParams } = new URL(request.url);
    const sectorId = searchParams.get('sector_id');
    
    logger.info('Iniciando busca de sub-setores', { sectorId: sectorId || 'undefined' });

    // Verificar autenticação usando helper
    const authResult = await authenticateAdminRequest(request);
    
    logger.debug('Resultado da autenticação', { 
      success: authResult.success,
      hasProfile: !!authResult.success && 'profile' in authResult && !!authResult.profile,
      role: authResult.success && 'profile' in authResult ? authResult.profile?.role : null,
      error: !authResult.success ? authResult.error : null
    });
    
    if (!authResult.success) {
      logger.apiEnd(apiTimer);
      logger.error('Autenticação falhou');
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { supabaseAdmin, profile } = authResult;

    if (!profile || !['admin', 'sector_admin'].includes(profile.role)) {
      logger.apiEnd(apiTimer);
      logger.warn('Permissão negada para sub-setores', { role: profile?.role });
      return NextResponse.json({ error: 'Permissão negada.' }, { status: 403 });
    }

    // Buscar sub-setores usando admin client
    const subsectorsTimer = logger.dbStart('subsectors.select', { 
      sectorId: sectorId || undefined, 
      userId: authResult.user?.id || undefined 
    });
    
    let query = supabaseAdmin
      .from('subsectors')
      .select(`
        id,
        name,
        description,
        sector_id,
        created_at,
        updated_at,
        sectors!inner(name)
      `)
      .order('name');

    if (sectorId) {
      query = query.eq('sector_id', sectorId);
      logger.debug('Filtrando por sector_id', { sectorId: sectorId || undefined });
    }

    const { data, error } = await query;
    logger.dbEnd(subsectorsTimer);

    if (error) {
      logger.apiEnd(apiTimer);
      logger.error('Erro ao buscar sub-setores no banco', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const subsectorCount = data?.length || 0;
    logger.success('Sub-setores carregados com sucesso', { subsectorCount, sectorId: sectorId || undefined });
    
    const apiResult = logger.apiEnd(apiTimer);
    return NextResponse.json({ 
      data,
      _debug: {
        totalTime: apiResult?.duration,
        subsectorCount,
        sectorId
      }
    });
    
  } catch (error) {
    logger.apiEnd(apiTimer);
    logger.error('Erro crítico na API de sub-setores', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, sector_id } = body;

    if (!name || !sector_id) {
      return NextResponse.json({ error: 'Nome e setor são obrigatórios.' }, { status: 400 });
    }

    // Verificar autenticação usando helper
    const authResult = await authenticateAdminRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user, profile, supabaseAdmin } = authResult;

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 403 });
    }

    const isAdmin = profile.role === 'admin';
    const isSectorAdmin = profile.role === 'sector_admin';

    if (!isAdmin && !isSectorAdmin) {
      return NextResponse.json({ error: 'Permissão negada.' }, { status: 403 });
    }

    // Se for admin de setor, verificar se tem permissão para este setor
    if (isSectorAdmin) {
      const { data: sectorAdminData } = await supabaseAdmin
        .from('sector_admins')
        .select('*')
        .eq('user_id', user.id)
        .eq('sector_id', sector_id);

      if (!sectorAdminData || sectorAdminData.length === 0) {
        return NextResponse.json({ error: 'Você não tem permissão para gerenciar este setor.' }, { status: 403 });
      }
    }

    // Criar sub-setor usando admin client
    const { data, error } = await supabaseAdmin
      .from('subsectors')
      .insert([{ name, description, sector_id }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: 'Sub-setor criado com sucesso.' });
  } catch (error) {
    console.error('Erro ao criar sub-setor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID e nome são obrigatórios.' }, { status: 400 });
    }

    // Verificar autenticação usando helper
    const authResult = await authenticateAdminRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { supabaseAdmin, profile } = authResult;

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 403 });
    }

    const isAdmin = profile.role === 'admin';
    const isSectorAdmin = profile.role === 'sector_admin';

    if (!isAdmin && !isSectorAdmin) {
      return NextResponse.json({ error: 'Permissão negada.' }, { status: 403 });
    }

    // Atualizar sub-setor usando admin client
    const { data, error } = await supabaseAdmin
      .from('subsectors')
      .update({ name, description, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: 'Sub-setor atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar sub-setor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
    }

    // Verificar autenticação usando helper
    const authResult = await authenticateAdminRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { supabaseAdmin, profile } = authResult;

    if (!profile || !['admin', 'sector_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permissão negada.' }, { status: 403 });
    }

    // Deletar sub-setor usando admin client (CASCADE deletará dados relacionados)
    const { error } = await supabaseAdmin
      .from('subsectors')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Sub-setor deletado com sucesso.' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ 
      error: 'Erro interno do servidor.',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
} 