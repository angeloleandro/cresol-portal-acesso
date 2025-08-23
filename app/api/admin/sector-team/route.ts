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

interface TeamMember {
  id: string;
  user_id: string;
  sector_id: string;
  position?: string;
  is_from_subsector: boolean;
  subsector_id?: string;
  created_at: string;
  profiles?: TeamMemberProfile;
  subsectors?: { id: string; name: string };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectorId = searchParams.get('sector_id');

    if (!sectorId) {
      return NextResponse.json({ error: 'ID do setor é obrigatório' }, { status: 400 });
    }

    // Buscar membros da equipe do setor com informações completas
    console.log('[SECTOR-TEAM API] Buscando membros do setor:', sectorId);
    
    // Primeiro, tentar buscar com joins completos
    let { data: teamMembers, error } = await supabase
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

    // Se houver erro de relacionamento, tentar busca alternativa
    if (error && error.message?.includes('relationship')) {
      console.warn('[SECTOR-TEAM API] Erro de relacionamento detectado, tentando busca alternativa:', error);
      
      // Buscar dados básicos primeiro
      const { data: basicMembers, error: basicError } = await supabase
        .from('sector_team_members')
        .select('*')
        .eq('sector_id', sectorId)
        .order('is_from_subsector', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (basicError) {
        throw basicError;
      }
      
      // Buscar dados dos profiles separadamente
      if (basicMembers && basicMembers.length > 0) {
        const userIds = basicMembers.map(m => m.user_id);
        const subsectorIds = basicMembers
          .filter(m => m.subsector_id)
          .map(m => m.subsector_id);
        
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
        
        // Buscar subsectors
        let subsectors: any[] = [];
        if (subsectorIds.length > 0) {
          const { data: subs } = await supabase
            .from('subsectors')
            .select('id, name')
            .in('id', subsectorIds);
          subsectors = subs || [];
        }
        
        // Montar resposta combinada
        teamMembers = basicMembers.map(member => {
          const profile = profiles?.find(p => p.id === member.user_id);
          const workLocation = profile?.work_location_id 
            ? workLocations.find(w => w.id === profile.work_location_id)
            : null;
          const subsector = member.subsector_id
            ? subsectors.find(s => s.id === member.subsector_id)
            : null;
          
          return {
            ...member,
            profiles: profile ? {
              ...profile,
              work_locations: workLocation ? { name: workLocation.name } : undefined
            } : undefined,
            subsectors: subsector || undefined
          };
        });
        
        console.log('[SECTOR-TEAM API] Busca alternativa bem-sucedida, retornando', teamMembers?.length, 'membros');
      } else {
        teamMembers = [];
      }
    } else if (error) {
      console.error('[SECTOR-TEAM API] Erro ao buscar membros:', error);
      throw error;
    }
    
    console.log('[SECTOR-TEAM API] Retornando', teamMembers?.length || 0, 'membros');

    return NextResponse.json({ teamMembers: teamMembers || [] });
  } catch (error: any) {
    console.error('[SECTOR-TEAM API] Erro detalhado:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      stack: error?.stack
    });
    
    // Retornar erro mais específico para ajudar no debug
    return NextResponse.json({ 
      error: 'Erro ao buscar equipe do setor',
      details: process.env.NODE_ENV === 'development' ? {
        message: error?.message,
        code: error?.code,
        hint: error?.hint
      } : undefined
    }, { status: 500 });
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
    console.log('[SECTOR-TEAM API] Verificando se usuário já está na equipe:', { user_id, sector_id });
    
    const { data: existing, error: checkError } = await supabase
      .from('sector_team_members')
      .select('id')
      .eq('user_id', user_id)
      .eq('sector_id', sector_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = não encontrado
      console.error('[SECTOR-TEAM API] Erro ao verificar membro existente:', checkError);
      throw checkError;
    }

    if (existing) {
      return NextResponse.json({ error: 'Usuário já está na equipe do setor' }, { status: 400 });
    }

    // Adicionar membro à equipe do setor
    console.log('[SECTOR-TEAM API] Adicionando membro:', { user_id, sector_id, position });
    
    const { data, error } = await supabase
      .from('sector_team_members')
      .insert({
        user_id,
        sector_id,
        position: position || null,
        is_from_subsector: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[SECTOR-TEAM API] Erro ao adicionar membro:', error);
      throw error;
    }
    
    console.log('[SECTOR-TEAM API] Membro adicionado com sucesso:', data);

    return NextResponse.json({ success: true, member: data });
  } catch (error: any) {
    console.error('[SECTOR-TEAM API POST] Erro detalhado:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint
    });
    
    return NextResponse.json({ 
      error: 'Erro ao adicionar membro ao setor',
      details: process.env.NODE_ENV === 'development' ? {
        message: error?.message,
        code: error?.code
      } : undefined
    }, { status: 500 });
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
  } catch (error: any) {
    console.error('[SECTOR-TEAM API DELETE] Erro detalhado:', {
      message: error?.message,
      code: error?.code,
      details: error?.details
    });
    
    return NextResponse.json({ 
      error: 'Erro ao remover membro do setor',
      details: process.env.NODE_ENV === 'development' ? {
        message: error?.message,
        code: error?.code
      } : undefined
    }, { status: 500 });
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
  } catch (error: any) {
    console.error('[SECTOR-TEAM API PUT] Erro detalhado:', {
      message: error?.message,
      code: error?.code,
      details: error?.details
    });
    
    return NextResponse.json({ 
      error: 'Erro ao atualizar membro do setor',
      details: process.env.NODE_ENV === 'development' ? {
        message: error?.message,
        code: error?.code
      } : undefined
    }, { status: 500 });
  }
}