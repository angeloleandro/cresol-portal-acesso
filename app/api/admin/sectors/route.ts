import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/supabase/admin';
import { adminCORS } from '@/lib/cors-config';

// GET - Listar setores
export const GET = adminCORS(async (request: NextRequest) => {
  try {
    // Verificar autenticação usando helper
    const authResult = await authenticateAdminRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { supabaseAdmin, profile } = authResult;

    if (!profile || !['admin', 'sector_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permissão negada.' }, { status: 403 });
    }

    // Buscar setores usando admin client
    const { data: sectors, error } = await supabaseAdmin
      .from('sectors')
      .select(`
        id,
        name,
        description,
        created_at,
        updated_at
      `)
      .order('name');

    if (error) {
      console.error('Erro ao buscar setores:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sectors: sectors || [] });

  } catch (error) {
    console.error('Erro na API de setores:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
});