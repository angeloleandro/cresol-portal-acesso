import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Operações em lote nas notificações
export async function POST(request: NextRequest) {
  try {
    const { action, notificationIds } = await request.json();
    
    if (!action || !notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ 
        error: 'Ação e IDs das notificações são obrigatórios' 
      }, { status: 400 });
    }

    if (!['read', 'unread', 'delete', 'read_all'].includes(action)) {
      return NextResponse.json({ 
        error: 'Ação inválida. Use: read, unread, delete, read_all' 
      }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    let result: any = null;
    let message: string = '';

    switch (action) {
      case 'read':
        result = await supabase
          .from('notification_recipients')
          .update({ read_at: new Date().toISOString() })
          .in('notification_id', notificationIds)
          .eq('recipient_id', user.id);
        message = `${notificationIds.length} notificações marcadas como lidas`;
        break;

      case 'unread':
        result = await supabase
          .from('notification_recipients')
          .update({ read_at: null })
          .in('notification_id', notificationIds)
          .eq('recipient_id', user.id);
        message = `${notificationIds.length} notificações marcadas como não lidas`;
        break;

      case 'delete':
        result = await supabase
          .from('notification_recipients')
          .delete()
          .in('notification_id', notificationIds)
          .eq('recipient_id', user.id);
        message = `${notificationIds.length} notificações removidas`;
        break;

      case 'read_all':
        result = await supabase
          .from('notification_recipients')
          .update({ read_at: new Date().toISOString() })
          .eq('recipient_id', user.id)
          .is('read_at', null);
        message = 'Todas as notificações não lidas foram marcadas como lidas';
        break;
    }

    if (result?.error) {
      console.error('Erro na operação em lote:', result.error);
      return NextResponse.json({ 
        error: 'Erro ao executar operação em lote' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message,
      affected: result?.count || 0
    });

  } catch (error) {
    console.error('Erro na API de operações em lote:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}