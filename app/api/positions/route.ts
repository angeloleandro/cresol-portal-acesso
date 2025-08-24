import { NextRequest, NextResponse } from 'next/server';

import { CreateClient } from '@/lib/supabase/server';


// Força renderização dinâmica para usar cookies via createClient
export const dynamic = 'force-dynamic';

// GET - Listar todas as posições/cargos
export async function GET(_request: NextRequest) {
  try {
    const supabase = CreateClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o usuário está autenticado (todos os usuários autenticados podem ver posições)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 403 });
    }

    // Buscar todas as posições/cargos
    const { data: positions, error } = await supabase
      .from('positions')
      .select(`
        id,
        name,
        description,
        department,
        created_at,
        updated_at
      `)
      .order('name');

    if (error) {
      console.error('Erro ao buscar posições/cargos:', error);
      return NextResponse.json({ error: 'Erro ao buscar posições/cargos' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      positions: positions || [] 
    });
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro crítico ao buscar posições/cargos:', message);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}