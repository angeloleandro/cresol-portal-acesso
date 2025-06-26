import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Listar grupos
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar grupos com consulta simplificada
    const { data: groups, error } = await supabase
      .from('notification_groups')
      .select(`
        id,
        name,
        description,
        type,
        is_active,
        created_by,
        sector_id,
        subsector_id,
        created_at
      `)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Erro ao buscar grupos:', error);
      return NextResponse.json({ error: 'Erro ao buscar grupos' }, { status: 500 });
    }

    // Buscar informações adicionais separadamente para evitar problemas de JOIN
    const enrichedGroups = await Promise.all(
      (groups || []).map(async (group) => {
        // Buscar informações do criador
        const { data: creator } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', group.created_by)
          .single();

        // Buscar setor se existir
        let sector = null;
        if (group.sector_id) {
          const { data: sectorData } = await supabase
            .from('sectors')
            .select('name')
            .eq('id', group.sector_id)
            .single();
          sector = sectorData;
        }

        // Buscar subsetor se existir
        let subsector = null;
        if (group.subsector_id) {
          const { data: subsectorData } = await supabase
            .from('subsectors')
            .select('name')
            .eq('id', group.subsector_id)
            .single();
          subsector = subsectorData;
        }

        // Contar membros
        const { count: memberCount } = await supabase
          .from('notification_group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);

        return {
          ...group,
          creator: creator || null,
          sector: sector || null,
          subsector: subsector || null,
          member_count: memberCount || 0
        };
      })
    );

    return NextResponse.json({ groups: enrichedGroups });

  } catch (error) {
    console.error('Erro na API de grupos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar novo grupo
export async function POST(request: NextRequest) {
  try {
    const { name, description, sectorId, subsectorId, members } = await request.json();

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar permissões
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, sector_id, subsector_id')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'sector_admin', 'subsector_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 });
    }

    // Criar grupo
    const groupData: any = {
      name,
      description,
      type: 'sector',
      is_active: true,
      created_by: user.id
    };

    if (sectorId) {
      groupData.sector_id = sectorId;
    }

    if (subsectorId) {
      groupData.subsector_id = subsectorId;
    }

    const { data: group, error: groupError } = await supabase
      .from('notification_groups')
      .insert(groupData)
      .select()
      .single();

    if (groupError) {
      console.error('Erro ao criar grupo:', groupError);
      return NextResponse.json({ error: 'Erro ao criar grupo' }, { status: 500 });
    }

    // Adicionar membros se fornecidos
    if (members && members.length > 0) {
      const memberData = members.map((memberId: string) => ({
        group_id: group.id,
        user_id: memberId,
        added_by: user.id
      }));

      const { error: membersError } = await supabase
        .from('notification_group_members')
        .insert(memberData);

      if (membersError) {
        console.error('Erro ao adicionar membros:', membersError);
        // Não retornar erro aqui, grupo foi criado com sucesso
      }
    }

    return NextResponse.json({
      message: 'Grupo criado com sucesso',
      group
    });

  } catch (error) {
    console.error('Erro na API de criação de grupo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 