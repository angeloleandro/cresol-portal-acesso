import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { adminCORS } from '@/lib/cors-config';
import { z } from 'zod';

// Schema de validação para criação de grupo
const createGroupSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  description: z.string().optional(),
  color_theme: z.string().optional().default('#F58220'),
  sector_id: z.string().uuid().optional(),
  subsector_id: z.string().uuid().optional(),
  members: z.array(z.string().uuid()).optional().default([]),
}).refine(
  (data) => (data.sector_id && !data.subsector_id) || (!data.sector_id && data.subsector_id),
  {
    message: "Deve ser especificado ou sector_id ou subsector_id, mas não ambos",
    path: ["sector_id"]
  }
);

// Schema de validação para atualização de grupo
const updateGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').optional(),
  description: z.string().optional(),
  color_theme: z.string().optional(),
  is_active: z.boolean().optional(),
  members: z.array(z.string().uuid()).optional(),
});

// Função auxiliar para verificar permissões
async function checkPermissions(userId: string, sectorId?: string, subsectorId?: string) {
  const supabase = createAdminSupabaseClient();
  
  // Verificar se é admin geral
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, sector_id')
    .eq('id', userId)
    .single();

  if (!profile) {
    throw new Error('Usuário não encontrado');
  }

  // Admin geral pode tudo
  if (profile.role === 'admin') {
    return true;
  }

  // Admin de setor pode gerenciar grupos do seu setor
  if (profile.role === 'sector_admin' && sectorId && profile.sector_id === sectorId) {
    return true;
  }

  // Admin de subsetor pode gerenciar grupos do seu subsetor
  if (subsectorId) {
    const { data: subsectorAdmin } = await supabase
      .from('subsector_admins')
      .select('id')
      .eq('user_id', userId)
      .eq('subsector_id', subsectorId)
      .single();

    if (subsectorAdmin) {
      return true;
    }

    // Verificar se é admin do setor que contém o subsetor
    const { data: subsector } = await supabase
      .from('subsectors')
      .select('sector_id')
      .eq('id', subsectorId)
      .single();

    if (subsector && profile.role === 'sector_admin' && profile.sector_id === subsector.sector_id) {
      return true;
    }
  }

  return false;
}

// GET - Listar grupos
export const GET = adminCORS(async (request: NextRequest) => {
  try {
    const supabase = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);
    const sectorId = searchParams.get('sector_id');
    const subsectorId = searchParams.get('subsector_id');

    // Buscar grupos com informações relacionadas
    let query = supabase
      .from('message_groups')
      .select(`
        *,
        sectors(name),
        subsectors(name, sectors(name)),
        profiles(full_name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Filtrar por setor se especificado
    if (sectorId) {
      query = query.eq('sector_id', sectorId);
    }

    // Filtrar por subsetor se especificado
    if (subsectorId) {
      query = query.eq('subsector_id', subsectorId);
    }

    const { data: groups, error } = await query;

    if (error) {
      console.error('Erro ao buscar grupos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar grupos' },
        { status: 500 }
      );
    }

    // Buscar membros de cada grupo
    const groupsWithMembers = await Promise.all(
      (groups || []).map(async (group) => {
        const { data: members } = await supabase
          .from('message_group_members')
          .select('user_id')
          .eq('group_id', group.id);
        
        return {
          ...group,
          members: members?.map(m => m.user_id) || []
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      groups: groupsWithMembers 
    });

  } catch (error: any) {
    console.error('Erro no GET message-groups:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
});

// POST - Criar novo grupo
export const POST = adminCORS(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = createGroupSchema.parse(body);

    const supabase = createAdminSupabaseClient();
    
    // Obter usuário autenticado
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    // Extrair user ID do token (simplificado - em produção usar verificação completa)
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar permissões
    const hasPermission = await checkPermissions(
      user.id, 
      validatedData.sector_id, 
      validatedData.subsector_id
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Sem permissão para criar grupos neste contexto' },
        { status: 403 }
      );
    }

    // Extrair membros do body
    const { members, ...groupData } = validatedData;

    // Criar o grupo
    const { data: newGroup, error } = await supabase
      .from('message_groups')
      .insert([{
        ...groupData,
        created_by: user.id
      }])
      .select(`
        *,
        sectors(name),
        subsectors(name, sectors(name)),
        profiles(full_name)
      `)
      .single();

    if (error) {
      console.error('Erro ao criar grupo:', error);
      return NextResponse.json(
        { error: 'Erro ao criar grupo' },
        { status: 500 }
      );
    }

    // Adicionar membros ao grupo se especificados
    if (members && members.length > 0 && newGroup) {
      const memberInserts = members.map(userId => ({
        group_id: newGroup.id,
        user_id: userId,
        added_by: user.id
      }));

      const { error: memberError } = await supabase
        .from('message_group_members')
        .insert(memberInserts);

      if (memberError) {
        console.error('Erro ao adicionar membros ao grupo:', memberError);
        // Não retornar erro, apenas log - o grupo foi criado com sucesso
      }
    }

    // Buscar membros do grupo criado
    const { data: groupMembers } = await supabase
      .from('message_group_members')
      .select('user_id')
      .eq('group_id', newGroup.id);

    return NextResponse.json({
      success: true,
      group: {
        ...newGroup,
        members: groupMembers?.map(m => m.user_id) || []
      }
    }, { status: 201 });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.issues
        },
        { status: 400 }
      );
    }

    console.error('Erro no POST message-groups:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
});

// PUT - Atualizar grupo
export const PUT = adminCORS(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = updateGroupSchema.parse(body);
    const { id, members, ...updateData } = validatedData;

    const supabase = createAdminSupabaseClient();
    
    // Obter usuário autenticado
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Buscar grupo existente para verificar permissões
    const { data: existingGroup, error: fetchError } = await supabase
      .from('message_groups')
      .select('sector_id, subsector_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingGroup) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const hasPermission = await checkPermissions(
      user.id, 
      existingGroup.sector_id, 
      existingGroup.subsector_id
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Sem permissão para atualizar este grupo' },
        { status: 403 }
      );
    }

    // Atualizar o grupo
    const { data: updatedGroup, error } = await supabase
      .from('message_groups')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        sectors(name),
        subsectors(name, sectors(name)),
        profiles(full_name)
      `)
      .single();

    if (error) {
      console.error('Erro ao atualizar grupo:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar grupo' },
        { status: 500 }
      );
    }

    // Atualizar membros se especificados
    if (members !== undefined) {
      // Remover todos os membros atuais
      const { error: deleteError } = await supabase
        .from('message_group_members')
        .delete()
        .eq('group_id', id);

      if (deleteError) {
        console.error('Erro ao remover membros antigos:', deleteError);
      }

      // Adicionar novos membros
      if (members.length > 0) {
        const memberInserts = members.map(userId => ({
          group_id: id,
          user_id: userId,
          added_by: user.id
        }));

        const { error: memberError } = await supabase
          .from('message_group_members')
          .insert(memberInserts);

        if (memberError) {
          console.error('Erro ao adicionar novos membros:', memberError);
        }
      }
    }

    // Buscar membros atualizados
    const { data: groupMembers } = await supabase
      .from('message_group_members')
      .select('user_id')
      .eq('group_id', id);

    return NextResponse.json({
      success: true,
      group: {
        ...updatedGroup,
        members: groupMembers?.map(m => m.user_id) || []
      }
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.issues
        },
        { status: 400 }
      );
    }

    console.error('Erro no PUT message-groups:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
});

// DELETE - Excluir grupo (soft delete)
export const DELETE = adminCORS(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID do grupo é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();
    
    // Obter usuário autenticado
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Buscar grupo existente para verificar permissões
    const { data: existingGroup, error: fetchError } = await supabase
      .from('message_groups')
      .select('sector_id, subsector_id, name')
      .eq('id', id)
      .single();

    if (fetchError || !existingGroup) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const hasPermission = await checkPermissions(
      user.id, 
      existingGroup.sector_id, 
      existingGroup.subsector_id
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Sem permissão para excluir este grupo' },
        { status: 403 }
      );
    }

    // Verificar se há mensagens associadas ao grupo
    const { count: messagesCount, error: countError } = await supabase
      .from('sector_messages')
      .select('id', { count: 'exact', head: true })
      .eq('group_id', id);

    const { count: subsectorMessagesCount, error: subsectorCountError } = await supabase
      .from('subsector_messages')
      .select('id', { count: 'exact', head: true })
      .eq('group_id', id);

    if (countError || subsectorCountError) {
      console.error('Erro ao verificar mensagens:', countError || subsectorCountError);
    }

    const totalMessages = (messagesCount || 0) + (subsectorMessagesCount || 0);

    if (totalMessages > 0) {
      // Soft delete - desativar o grupo em vez de excluir
      const { error: updateError } = await supabase
        .from('message_groups')
        .update({ is_active: false })
        .eq('id', id);

      if (updateError) {
        console.error('Erro ao desativar grupo:', updateError);
        return NextResponse.json(
          { error: 'Erro ao desativar grupo' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Grupo desativado com sucesso (possui mensagens associadas)'
      });
    } else {
      // Hard delete - excluir completamente se não há mensagens
      const { error: deleteError } = await supabase
        .from('message_groups')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Erro ao excluir grupo:', deleteError);
        return NextResponse.json(
          { error: 'Erro ao excluir grupo' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Grupo excluído com sucesso'
      });
    }

  } catch (error: any) {
    console.error('Erro no DELETE message-groups:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
});