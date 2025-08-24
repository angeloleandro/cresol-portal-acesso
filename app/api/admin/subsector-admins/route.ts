import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';



/**
 * GET function
 * @todo Add proper documentation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subsectorId = searchParams.get('subsector_id');

    // Criar cliente do Supabase com a chave de serviço
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorização necessário.' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }

    // Verificar se o usuário tem permissão
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'sector_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permissão negada.' }, { status: 403 });
    }

    // Buscar administradores de sub-setor
    let query = supabaseAdmin
      .from('subsector_admins')
      .select(`
        id,
        user_id,
        subsector_id,
        created_at,
        profiles!inner(full_name, email),
        subsectors!inner(name, sector_id, sectors!inner(name))
      `)
      .order('created_at', { ascending: false });

    if (subsectorId) {
      query = query.eq('subsector_id', subsectorId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Erro na API de administradores de sub-setor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

/**
 * POST function
 * @todo Add proper documentation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, subsector_id } = body;

    if (!user_id || !subsector_id) {
      return NextResponse.json({ error: 'ID do usuário e ID do sub-setor são obrigatórios.' }, { status: 400 });
    }

    // Criar cliente do Supabase com a chave de serviço
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorização necessário.' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }

    // Verificar se o usuário tem permissão
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const isSectorAdmin = profile?.role === 'sector_admin';

    if (!isAdmin && !isSectorAdmin) {
      return NextResponse.json({ error: 'Permissão negada.' }, { status: 403 });
    }

    // Se for admin de setor, verificar se tem permissão para o setor deste sub-setor
    if (isSectorAdmin) {
      const { data: subsector } = await supabaseAdmin
        .from('subsectors')
        .select('sector_id')
        .eq('id', subsector_id)
        .single();

      if (!subsector) {
        return NextResponse.json({ error: 'Sub-setor não encontrado.' }, { status: 404 });
      }

      const { data: sectorAdminData } = await supabaseAdmin
        .from('sector_admins')
        .select('*')
        .eq('user_id', user.id)
        .eq('sector_id', subsector.sector_id);

      if (!sectorAdminData || sectorAdminData.length === 0) {
        return NextResponse.json({ error: 'Você não tem permissão para gerenciar este sub-setor.' }, { status: 403 });
      }
    }

    // Verificar se o usuário a ser promovido existe
    const { data: targetUser } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', user_id)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    // Verificar se já é administrador deste sub-setor
    const { data: existingAdmin } = await supabaseAdmin
      .from('subsector_admins')
      .select('*')
      .eq('user_id', user_id)
      .eq('subsector_id', subsector_id);

    if (existingAdmin && existingAdmin.length > 0) {
      return NextResponse.json({ error: 'Este usuário já é administrador deste sub-setor.' }, { status: 400 });
    }

    // Atualizar o role do usuário para subsector_admin se necessário
    if (targetUser.role !== 'subsector_admin' && targetUser.role !== 'admin' && targetUser.role !== 'sector_admin') {
      await supabaseAdmin
        .from('profiles')
        .update({ role: 'subsector_admin' })
        .eq('id', user_id);
    }

    // Adicionar como administrador do sub-setor
    const { data, error } = await supabaseAdmin
      .from('subsector_admins')
      .insert([{ user_id, subsector_id }])
      .select(`
        id,
        user_id,
        subsector_id,
        created_at,
        profiles!inner(full_name, email),
        subsectors!inner(name)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data, 
      message: `${targetUser.full_name} foi adicionado como administrador do sub-setor.` 
    });
  } catch (error) {
    console.error('Erro ao adicionar administrador de sub-setor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

/**
 * DELETE function
 * @todo Add proper documentation
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
    }

    // Criar cliente do Supabase com a chave de serviço
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorização necessário.' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }

    // Verificar se o usuário tem permissão
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'sector_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permissão negada.' }, { status: 403 });
    }

    // Buscar dados do administrador de sub-setor
    const { data: subsectorAdmin } = await supabaseAdmin
      .from('subsector_admins')
      .select(`
        user_id,
        subsector_id,
        subsectors!inner(sector_id)
      `)
      .eq('id', id)
      .single();

    if (!subsectorAdmin) {
      return NextResponse.json({ error: 'Administrador de sub-setor não encontrado.' }, { status: 404 });
    }

    // Se for admin de setor, verificar se tem permissão para este setor
    if (profile.role === 'sector_admin') {
      // O subsectors pode vir como array ou objeto dependendo da query
      const sectorId = (subsectorAdmin as any).subsectors?.sector_id || 
                      ((subsectorAdmin as any).subsectors && Array.isArray((subsectorAdmin as any).subsectors) 
                        ? (subsectorAdmin as any).subsectors[0]?.sector_id 
                        : undefined);

      if (!sectorId) {
        return NextResponse.json({ error: 'Erro ao identificar setor do sub-setor.' }, { status: 500 });
      }

      const { data: sectorAdminData } = await supabaseAdmin
        .from('sector_admins')
        .select('*')
        .eq('user_id', user.id)
        .eq('sector_id', sectorId);

      if (!sectorAdminData || sectorAdminData.length === 0) {
        return NextResponse.json({ error: 'Você não tem permissão para gerenciar este sub-setor.' }, { status: 403 });
      }
    }

    // Remover administrador do sub-setor
    const { error } = await supabaseAdmin
      .from('subsector_admins')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Verificar se o usuário ainda tem outros sub-setores ou se deve ter seu role alterado
    const { data: otherSubsectors } = await supabaseAdmin
      .from('subsector_admins')
      .select('*')
      .eq('user_id', subsectorAdmin.user_id);

    const { data: sectorAdmin } = await supabaseAdmin
      .from('sector_admins')
      .select('*')
      .eq('user_id', subsectorAdmin.user_id);

    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', subsectorAdmin.user_id)
      .single();

    // Se não é admin geral, não é admin de setor e não tem outros sub-setores, alterar para user
    if (userProfile?.role === 'subsector_admin' && 
        (!otherSubsectors || otherSubsectors.length === 0) &&
        (!sectorAdmin || sectorAdmin.length === 0)) {
      await supabaseAdmin
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', subsectorAdmin.user_id);
    }

    return NextResponse.json({ message: 'Administrador de sub-setor removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover administrador de sub-setor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
} 