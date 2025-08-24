import { NextRequest, NextResponse } from 'next/server';

import { CreateClient } from '@/lib/supabase/server';


// Força renderização dinâmica para usar cookies via createClient
export const dynamic = 'force-dynamic';

// GET - Listar todos os locais de trabalho
export async function GET(_request: NextRequest) {
  try {
    const supabase = CreateClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o usuário está autenticado (todos os usuários autenticados podem ver locais de trabalho)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 403 });
    }

    // Buscar todos os locais de trabalho
    const { data: locations, error } = await supabase
      .from('work_locations')
      .select(`
        id,
        name,
        address,
        phone,
        created_at,
        updated_at
      `)
      .order('name');

    if (error) {
      console.error('Erro ao buscar locais de trabalho:', error);
      return NextResponse.json({ error: 'Erro ao buscar locais de trabalho' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      locations: locations || [] 
    });
    
  } catch (error: any) {
    console.error('Erro crítico ao buscar locais de trabalho:', error.message);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}