import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Listar notificações do usuário logado
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // 'all', 'read', 'unread'
    const type = searchParams.get('type') || 'all'; // 'all', 'info', 'success', 'warning', 'error', 'system'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Construir query base
    let query = supabase
      .from('notification_recipients')
      .select(`
        read_at,
        notifications!inner (
          id,
          title,
          message,
          type,
          priority,
          created_at,
          expires_at,
          action_url,
          sent_by,
          sender:profiles!notifications_sent_by_fkey(full_name)
        )
      `)
      .eq('recipient_id', user.id)
      .order('notifications(created_at)', { ascending: false });

    // Aplicar filtros
    if (filter === 'read') {
      query = query.not('read_at', 'is', null);
    } else if (filter === 'unread') {
      query = query.is('read_at', null);
    }

    if (type !== 'all') {
      query = query.eq('notifications.type', type);
    }

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      return NextResponse.json({ error: 'Erro ao buscar notificações' }, { status: 500 });
    }

    // Formatar dados para compatibilidade com frontend
    const formattedNotifications = data?.map((recipient: any) => ({
      ...recipient.notifications,
      read: !!recipient.read_at,
      sender_name: recipient.notifications.sender?.full_name || 'Sistema',
      priority: recipient.notifications.priority || 'normal'
    })) || [];

    // Contar total para paginação
    const { count } = await supabase
      .from('notification_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', user.id);

    return NextResponse.json({
      notifications: formattedNotifications,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Erro na API de notificações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar status da notificação (marcar como lida/não lida)
export async function PUT(request: NextRequest) {
  try {
    const { notificationId, action } = await request.json(); // action: 'read' | 'unread'
    
    if (!notificationId || !action) {
      return NextResponse.json({ error: 'ID da notificação e ação são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const readAtValue = action === 'read' ? new Date().toISOString() : null;

    const { error } = await supabase
      .from('notification_recipients')
      .update({ read_at: readAtValue })
      .eq('notification_id', notificationId)
      .eq('recipient_id', user.id);

    if (error) {
      console.error('Erro ao atualizar notificação:', error);
      return NextResponse.json({ error: 'Erro ao atualizar notificação' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `Notificação marcada como ${action === 'read' ? 'lida' : 'não lida'}` 
    });

  } catch (error) {
    console.error('Erro na API de atualização de notificação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Remover notificação para o usuário
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    
    if (!notificationId) {
      return NextResponse.json({ error: 'ID da notificação é obrigatório' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { error } = await supabase
      .from('notification_recipients')
      .delete()
      .eq('notification_id', notificationId)
      .eq('recipient_id', user.id);

    if (error) {
      console.error('Erro ao deletar notificação:', error);
      return NextResponse.json({ error: 'Erro ao deletar notificação' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Notificação removida com sucesso' });

  } catch (error) {
    console.error('Erro na API de remoção de notificação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}