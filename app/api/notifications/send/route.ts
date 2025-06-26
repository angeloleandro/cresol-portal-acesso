import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Enviar notificação
export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      message, 
      type = 'general',
      groups,
      users,
      sectorId,
      subsectorId 
    } = await request.json();

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

    // Criar notificação
    const notificationData: any = {
      title,
      message,
      type,
      sender_id: user.id
    };

    if (sectorId) {
      notificationData.sector_id = sectorId;
    }

    if (subsectorId) {
      notificationData.subsector_id = subsectorId;
    }

    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (notificationError) {
      console.error('Erro ao criar notificação:', notificationError);
      return NextResponse.json({ error: 'Erro ao criar notificação' }, { status: 500 });
    }

    // Coletar IDs dos destinatários
    let recipientIds: string[] = [];

    // Adicionar usuários específicos
    if (users && users.length > 0) {
      recipientIds = [...recipientIds, ...users];
    }

    // Adicionar membros dos grupos
    if (groups && groups.length > 0) {
      const { data: groupMembers } = await supabase
        .from('notification_group_members')
        .select('user_id')
        .in('group_id', groups);

      if (groupMembers) {
        const groupUserIds = groupMembers.map((member: any) => member.user_id);
        recipientIds = [...recipientIds, ...groupUserIds];
      }
    }

    // Remover duplicatas
    recipientIds = Array.from(new Set(recipientIds));

    // Criar registros de destinatários
    if (recipientIds.length > 0) {
      const recipientData = recipientIds.map(userId => ({
        notification_id: notification.id,
        user_id: userId
      }));

      const { error: recipientsError } = await supabase
        .from('notification_recipients')
        .insert(recipientData);

      if (recipientsError) {
        console.error('Erro ao adicionar destinatários:', recipientsError);
        return NextResponse.json({ error: 'Erro ao adicionar destinatários' }, { status: 500 });
      }
    }

    return NextResponse.json({
      message: 'Notificação enviada com sucesso',
      notification,
      recipientCount: recipientIds.length
    });

  } catch (error) {
    console.error('Erro na API de envio de notificação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 