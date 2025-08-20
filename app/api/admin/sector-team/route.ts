import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectorId = searchParams.get('sector_id');

    if (!sectorId) {
      return NextResponse.json({ error: 'ID do setor é obrigatório' }, { status: 400 });
    }

    // Buscar membros da equipe do setor com informações completas
    const { data: teamMembers, error } = await supabase
      .from('sector_team_members')
      .select(`
        id,
        user_id,
        sector_id,
        position,
        is_from_subsector,
        subsector_id,
        created_at,
        profiles(
          id,
          full_name,
          email,
          avatar_url,
          position,
          work_location_id,
          work_locations(name)
        ),
        subsectors(
          id,
          name
        )
      `)
      .eq('sector_id', sectorId)
      .order('is_from_subsector', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ teamMembers: teamMembers || [] });
  } catch (error) {
    console.error('Erro ao buscar equipe do setor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, sector_id, position } = body;

    if (!user_id || !sector_id) {
      return NextResponse.json({ error: 'User ID e Sector ID são obrigatórios' }, { status: 400 });
    }

    // Verificar se o usuário já está na equipe do setor
    const { data: existing, error: checkError } = await supabase
      .from('sector_team_members')
      .select('id')
      .eq('user_id', user_id)
      .eq('sector_id', sector_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = não encontrado
      throw checkError;
    }

    if (existing) {
      return NextResponse.json({ error: 'Usuário já está na equipe do setor' }, { status: 400 });
    }

    // Adicionar membro à equipe do setor
    const { data, error } = await supabase
      .from('sector_team_members')
      .insert({
        user_id,
        sector_id,
        position: position || null,
        is_from_subsector: false
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, member: data });
  } catch (error) {
    console.error('Erro ao adicionar membro ao setor:', error);
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

    // Verificar se o membro veio de um subsetor
    const { data: member, error: checkError } = await supabase
      .from('sector_team_members')
      .select('is_from_subsector')
      .eq('id', memberId)
      .single();

    if (checkError) {
      throw checkError;
    }

    if (member?.is_from_subsector) {
      return NextResponse.json({ 
        error: 'Não é possível remover um membro que foi adicionado através de um subsetor. Remova-o do subsetor correspondente.' 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('sector_team_members')
      .delete()
      .eq('id', memberId)
      .eq('is_from_subsector', false); // Garantir que só remove membros diretos

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover membro do setor:', error);
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
      .from('sector_team_members')
      .update({ 
        position,
        updated_at: new Date().toISOString()
      })
      .eq('id', member_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, member: data });
  } catch (error) {
    console.error('Erro ao atualizar membro do setor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}