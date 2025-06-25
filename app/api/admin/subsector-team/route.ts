import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subsectorId = searchParams.get('subsector_id');

    if (!subsectorId) {
      return NextResponse.json({ error: 'ID do sub-setor é obrigatório' }, { status: 400 });
    }

    // Buscar membros da equipe do sub-setor
    const { data: teamMembers, error } = await supabase
      .from('subsector_team_members')
      .select(`
        id,
        user_id,
        subsector_id,
        position,
        created_at,
        profiles(
          id,
          full_name,
          email,
          avatar_url,
          position,
          work_location_id,
          work_locations(name)
        )
      `)
      .eq('subsector_id', subsectorId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ teamMembers: teamMembers || [] });
  } catch (error) {
    console.error('Erro ao buscar equipe:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, subsector_id, position } = body;

    if (!user_id || !subsector_id) {
      return NextResponse.json({ error: 'User ID e Subsector ID são obrigatórios' }, { status: 400 });
    }

    // Verificar se o usuário já está na equipe
    const { data: existing, error: checkError } = await supabase
      .from('subsector_team_members')
      .select('id')
      .eq('user_id', user_id)
      .eq('subsector_id', subsector_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = não encontrado
      throw checkError;
    }

    if (existing) {
      return NextResponse.json({ error: 'Usuário já está na equipe' }, { status: 400 });
    }

    // Adicionar membro à equipe
    const { data, error } = await supabase
      .from('subsector_team_members')
      .insert({
        user_id,
        subsector_id,
        position: position || null
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, member: data });
  } catch (error) {
    console.error('Erro ao adicionar membro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('member_id');

    if (!memberId) {
      return NextResponse.json({ error: 'ID do membro é obrigatório' }, { status: 400 });
    }

    const { error } = await supabase
      .from('subsector_team_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover membro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { member_id, position } = body;

    if (!member_id) {
      return NextResponse.json({ error: 'ID do membro é obrigatório' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('subsector_team_members')
      .update({ position })
      .eq('id', member_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, member: data });
  } catch (error) {
    console.error('Erro ao atualizar membro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 