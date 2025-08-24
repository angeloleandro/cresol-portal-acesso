import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';


// Tipos para melhor type safety
interface TeamMemberProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  position?: string;
  work_location_id?: string;
  work_locations?: { name: string };
}

// Removed unused SubsectorTeamMember interface

/**
 * GET function
 * @todo Add proper documentation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subsectorId = searchParams.get('subsector_id');

    if (!subsectorId) {
      return NextResponse.json({ error: 'ID do sub-setor é obrigatório' }, { status: 400 });
    }

    // Buscar membros da equipe do sub-setor

    // Primeiro, tentar buscar com joins completos
    let { data: teamMembers, error } = await supabase
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

    // Se houver erro de relacionamento, tentar busca alternativa
    if (error && error.message?.includes('relationship')) {

      // Buscar dados básicos primeiro
      const { data: basicMembers, error: basicError } = await supabase
        .from('subsector_team_members')
        .select('*')
        .eq('subsector_id', subsectorId)
        .order('created_at', { ascending: false });
      
      if (basicError) {
        throw basicError;
      }
      
      // Buscar dados dos profiles separadamente
      if (basicMembers && basicMembers.length > 0) {
        const userIds = basicMembers.map(m => m.user_id);
        
        // Buscar profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url, position, work_location_id')
          .in('id', userIds);
        
        // Buscar work_locations
        const workLocationIds = profiles
          ?.filter(p => p.work_location_id)
          .map(p => p.work_location_id) || [];
        
        let workLocations: any[] = [];
        if (workLocationIds.length > 0) {
          const { data: locations } = await supabase
            .from('work_locations')
            .select('id, name')
            .in('id', workLocationIds);
          workLocations = locations || [];
        }
        
        // Montar resposta combinada
        teamMembers = basicMembers.map(member => {
          const profile = profiles?.find(p => p.id === member.user_id);
          const workLocation = profile?.work_location_id 
            ? workLocations.find(w => w.id === profile.work_location_id)
            : null;
          
          return {
            ...member,
            profiles: profile ? {
              ...profile,
              work_locations: workLocation ? { name: workLocation.name } : undefined
            } : undefined
          };
        });

      } else {
        teamMembers = [];
      }
    } else if (error) {

      throw error;
    }

    return NextResponse.json({ teamMembers: teamMembers || [] });
  } catch (error: any) {

    // Retornar erro mais específico para ajudar no debug
    return NextResponse.json({ 
      error: 'Erro ao buscar equipe do subsetor',
      details: process.env.NODE_ENV === 'development' ? {
        message: error?.message,
        code: error?.code,
        hint: error?.hint
      } : undefined
    }, { status: 500 });
  }
}

/**
 * POST function
 * @todo Add proper documentation
 */
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
        position: position || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {

      throw error;
    }

    return NextResponse.json({ success: true, member: data });
  } catch (error: any) {

    return NextResponse.json({ 
      error: 'Erro ao adicionar membro ao subsetor',
      details: process.env.NODE_ENV === 'development' ? {
        message: error?.message,
        code: error?.code
      } : undefined
    }, { status: 500 });
  }
}

/**
 * DELETE function
 * @todo Add proper documentation
 */
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
  } catch (error: any) {

    return NextResponse.json({ 
      error: 'Erro ao remover membro do subsetor',
      details: process.env.NODE_ENV === 'development' ? {
        message: error?.message,
        code: error?.code
      } : undefined
    }, { status: 500 });
  }
}

/**
 * PUT function
 * @todo Add proper documentation
 */
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
  } catch (error: any) {

    return NextResponse.json({ 
      error: 'Erro ao atualizar membro do subsetor',
      details: process.env.NODE_ENV === 'development' ? {
        message: error?.message,
        code: error?.code
      } : undefined
    }, { status: 500 });
  }
} 