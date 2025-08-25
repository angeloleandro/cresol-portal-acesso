import { NextRequest, NextResponse } from 'next/server';
import { CreateClient } from '@/lib/supabase/server';


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

// Removed unused TeamMember interface

/**
 * Helper function to verify user permissions for sector team management
 */
async function verifyPermissions(sectorId: string, requiredAction: 'read' | 'write') {
  const supabaseClient = CreateClient();
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  
  if (authError || !user) {
    return { authorized: false, error: 'Não autorizado', status: 401 };
  }
  
  // Get user profile with role
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();
  
  if (profileError || !profile) {
    return { authorized: false, error: 'Perfil não encontrado', status: 403 };
  }
  
  // Read access is public for authenticated users
  if (requiredAction === 'read') {
    return { authorized: true, user, profile };
  }
  
  // Write access requires admin or sector_admin role
  if (profile.role === 'admin') {
    return { authorized: true, user, profile };
  }
  
  if (profile.role === 'sector_admin') {
    // Check if sector_admin has permission for this specific sector
    const { data: sectorAdmin } = await supabaseClient
      .from('sector_admins')
      .select('id')
      .eq('user_id', user.id)
      .eq('sector_id', sectorId)
      .single();
    
    if (sectorAdmin) {
      return { authorized: true, user, profile };
    }
  }
  
  return { authorized: false, error: 'Sem permissão para gerenciar membros deste setor', status: 403 };
}

/**
 * GET function
 * @todo Add proper documentation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectorId = searchParams.get('sector_id');

    if (!sectorId) {
      return NextResponse.json({ error: 'ID do setor é obrigatório' }, { status: 400 });
    }

    // Criar cliente Supabase
    const supabase = CreateClient();

    // Buscar membros da equipe do setor com informações completas

    // Primeiro, buscar membros regulares da equipe
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

    // Buscar admins do setor que devem aparecer como membros da equipe
    const { data: sectorAdmins, error: adminError } = await supabase
      .from('sector_admins')
      .select(`
        id,
        user_id,
        sector_id,
        show_as_team_member,
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
      .eq('sector_id', sectorId)
      .eq('show_as_team_member', true);

    // Combinar os resultados se houver admins visíveis
    if (sectorAdmins && sectorAdmins.length > 0 && !adminError) {
      // Transformar admins para o formato de team members
      const adminMembers = sectorAdmins.map(admin => ({
        id: `admin-${admin.id}`,
        user_id: admin.user_id,
        sector_id: admin.sector_id,
        position: 'Administrador do Setor',
        is_from_subsector: false,
        subsector_id: null,
        created_at: admin.created_at,
        profiles: admin.profiles,
        subsectors: null as any,
        is_admin: true
      }));

      // Combinar com membros regulares, removendo duplicatas
      const userIds = new Set(teamMembers?.map(m => m.user_id) || []);
      const uniqueAdmins = adminMembers.filter(admin => !userIds.has(admin.user_id));
      
      teamMembers = [...uniqueAdmins, ...(teamMembers || [])];

    }
    
    // Se houver erro de relacionamento, tentar busca alternativa
    if (error && error.message?.includes('relationship')) {

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

      // Buscar admins básicos também
      const { data: basicAdmins } = await supabase
        .from('sector_admins')
        .select('*')
        .eq('sector_id', sectorId)
        .eq('show_as_team_member', true);
      
      // Coletar todos os user_ids (membros + admins)
      const allUserIds = new Set<string>();
      basicMembers?.forEach(m => allUserIds.add(m.user_id));
      basicAdmins?.forEach(a => allUserIds.add(a.user_id));
      
      // Buscar dados dos profiles separadamente
      if (allUserIds.size > 0) {
        const userIds = Array.from(allUserIds);
        const subsectorIds = basicMembers
          ?.filter(m => m.subsector_id)
          .map(m => m.subsector_id) || [];
        
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
        const regularMembers = basicMembers?.map(member => {
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
        }) || [];

        // Adicionar admins visíveis
        const adminMembers = basicAdmins?.map(admin => {
          const profile = profiles?.find(p => p.id === admin.user_id);
          const workLocation = profile?.work_location_id 
            ? workLocations.find(w => w.id === profile.work_location_id)
            : null;
          
          return {
            id: `admin-${admin.id}`,
            user_id: admin.user_id,
            sector_id: admin.sector_id,
            position: 'Administrador do Setor',
            is_from_subsector: false,
            subsector_id: null,
            created_at: admin.created_at,
            profiles: profile ? {
              ...profile,
              work_locations: workLocation ? { name: workLocation.name } : undefined
            } : undefined,
            subsectors: null as any,
            is_admin: true
          };
        }) || [];

        // Combinar, removendo duplicatas
        const memberUserIds = new Set(regularMembers.map(m => m.user_id));
        const uniqueAdmins = adminMembers.filter(admin => !memberUserIds.has(admin.user_id));
        
        teamMembers = [...uniqueAdmins, ...regularMembers];

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
      error: 'Erro ao buscar equipe do setor',
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
    const { user_id, sector_id, position } = body;

    if (!user_id || !sector_id) {
      return NextResponse.json({ error: 'User ID e Sector ID são obrigatórios' }, { status: 400 });
    }
    
    // Criar cliente Supabase
    const supabase = CreateClient();
    
    // Verify permissions
    const permissionCheck = await verifyPermissions(sector_id, 'write');
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: permissionCheck.status });
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
        is_from_subsector: false,
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
      error: 'Erro ao adicionar membro ao setor',
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
    
    // Criar cliente Supabase
    const supabase = CreateClient();
    
    // Get the sector_id from the member to verify permissions
    const { data: memberData, error: memberError } = await supabase
      .from('sector_team_members')
      .select('sector_id')
      .eq('id', memberId)
      .single();
    
    if (memberError || !memberData) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });
    }
    
    // Verify permissions
    const permissionCheck = await verifyPermissions(memberData.sector_id, 'write');
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: permissionCheck.status });
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

    return NextResponse.json({ 
      error: 'Erro ao remover membro do setor',
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
    
    // Criar cliente Supabase
    const supabase = CreateClient();
    
    // Get the sector_id from the member to verify permissions
    const { data: memberData, error: memberError } = await supabase
      .from('sector_team_members')
      .select('sector_id')
      .eq('id', member_id)
      .single();
    
    if (memberError || !memberData) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });
    }
    
    // Verify permissions
    const permissionCheck = await verifyPermissions(memberData.sector_id, 'write');
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: permissionCheck.status });
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

    return NextResponse.json({ 
      error: 'Erro ao atualizar membro do setor',
      details: process.env.NODE_ENV === 'development' ? {
        message: error?.message,
        code: error?.code
      } : undefined
    }, { status: 500 });
  }
}