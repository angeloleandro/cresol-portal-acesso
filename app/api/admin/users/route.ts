import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/supabase/admin';

// GET - Listar usuários para administração
export async function GET(request: NextRequest) {
  
  try {
    // Verificar autenticação usando helper
    const authResult = await authenticateAdminRequest(request);
    if (!authResult.success) {
      console.error('Falha na autenticação:', authResult.error);
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { supabaseAdmin, profile, user } = authResult;
    
    if (!user || !supabaseAdmin || !profile) {
      return NextResponse.json({ error: 'Erro na autenticação' }, { status: 401 });
    }
    

    if (!['admin', 'sector_admin'].includes(profile.role)) {
      console.error('Permissão negada. Role atual:', profile.role);
      return NextResponse.json({ error: 'Permissão negada.' }, { status: 403 });
    }

    
    // Buscar usuários com informações relacionadas usando admin client
    // CORREÇÃO: Removidas colunas created_at e updated_at que não existem na tabela profiles
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        work_location_id,
        position_id,
        role,
        work_locations(id, name),
        positions(id, name)
      `)
      .order('full_name');

    if (error) {
      console.error('Erro na query SQL:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }


    // Transformar dados para formato esperado pelo frontend
    // CORREÇÃO: Removidas referências a created_at e updated_at
    const transformedUsers = (users || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      work_location_id: user.work_location_id,
      position_id: user.position_id,
      position: user.positions?.name || null,
      work_location: user.work_locations?.name || null,
      role: user.role
    }));

    return NextResponse.json({ users: transformedUsers });

  } catch (error) {
    console.error('Erro na API de usuários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}