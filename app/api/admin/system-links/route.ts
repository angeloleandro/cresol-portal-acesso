import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleApiError, devLog } from '@/lib/error-handler';
import { adminCORS } from '@/lib/cors-config';

interface SystemLink {
  id?: string;
  name: string;
  url: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

// GET - Listar todos os links
export const GET = adminCORS(async (request: NextRequest) => {
  try {
    const supabase = createClient();
    
    // Verificar se usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active_only') === 'true';

    let query = supabase
      .from('system_links')
      .select('*')
      .order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: links, error } = await query;

    if (error) {
      devLog.error('Erro ao buscar links de sistemas', { error });
      return NextResponse.json(
        { error: 'Erro ao buscar links de sistemas' },
        { status: 500 }
      );
    }

    devLog.info('Links de sistemas carregados', { count: links?.length });
    return NextResponse.json({ links: links || [] });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'getSystemLinks');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
});

// POST - Criar novo link
export const POST = adminCORS(async (request: NextRequest) => {
  try {
    const supabase = createClient();
    
    // Verificar se usuário está autenticado e é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body: SystemLink = await request.json();
    
    // Validar campos obrigatórios
    if (!body.name || !body.url) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, url' },
        { status: 400 }
      );
    }

    const { data: link, error } = await supabase
      .from('system_links')
      .insert([{
        is_active: body.is_active !== undefined ? body.is_active : true
      }])
      .select()
      .single();

    if (error) {
      devLog.error('Erro ao criar link de sistema', { error, body });
      return NextResponse.json(
        { error: 'Erro ao criar link de sistema' },
        { status: 500 }
      );
    }

    devLog.info('Link de sistema criado', { link });
    return NextResponse.json({ link }, { status: 201 });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'createSystemLink');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
});

// PUT - Atualizar link existente
export const PUT = adminCORS(async (request: NextRequest) => {
  try {
    const supabase = createClient();
    
    // Verificar se usuário está autenticado e é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body: SystemLink & { id: string } = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'ID do link é obrigatório' },
        { status: 400 }
      );
    }

    const { data: link, error } = await supabase
      .from('system_links')
      .update({
        is_active: body.is_active
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      devLog.error('Erro ao atualizar link de sistema', { error, body });
      return NextResponse.json(
        { error: 'Erro ao atualizar link de sistema' },
        { status: 500 }
      );
    }

    devLog.info('Link de sistema atualizado', { link });
    return NextResponse.json({ link });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'updateSystemLink');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
});

// DELETE - Excluir link
export const DELETE = adminCORS(async (request: NextRequest) => {
  try {
    const supabase = createClient();
    
    // Verificar se usuário está autenticado e é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do link é obrigatório' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('system_links')
      .delete()
      .eq('id', id);

    if (error) {
      devLog.error('Erro ao excluir link de sistema', { error, id });
      return NextResponse.json(
        { error: 'Erro ao excluir link de sistema' },
        { status: 500 }
      );
    }

    devLog.info('Link de sistema excluído', { id });
    return NextResponse.json({ message: 'Link excluído com sucesso' });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'deleteSystemLink');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
});