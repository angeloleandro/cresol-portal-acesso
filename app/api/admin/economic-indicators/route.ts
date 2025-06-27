import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleApiError, devLog } from '@/lib/error-handler';

interface EconomicIndicator {
  id?: string;
  title: string;
  value: string;
  icon: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  issue_date?: string; // Formato MM/YYYY
}

// GET - Listar todos os indicadores
export async function GET(request: NextRequest) {
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
      .from('economic_indicators')
      .select('*')
      .order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: indicators, error } = await query;

    if (error) {
      devLog.error('Erro ao buscar indicadores econômicos', { error });
      return NextResponse.json(
        { error: 'Erro ao buscar indicadores econômicos' },
        { status: 500 }
      );
    }

    devLog.info('Indicadores econômicos carregados', { count: indicators?.length });
    return NextResponse.json({ indicators: indicators || [] });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'getEconomicIndicators');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}

// POST - Criar novo indicador
export async function POST(request: NextRequest) {
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

    const body: EconomicIndicator = await request.json();
    
    // Validar campos obrigatórios
    if (!body.title || !body.value || !body.icon) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: title, value, icon' },
        { status: 400 }
      );
    }

    const { data: indicator, error } = await supabase
      .from('economic_indicators')
      .insert([{
        title: body.title,
        value: body.value,
        icon: body.icon,
        description: body.description || null,
        display_order: body.display_order || 0,
        is_active: body.is_active !== undefined ? body.is_active : true,
        issue_date: body.issue_date || null
      }])
      .select()
      .single();

    if (error) {
      devLog.error('Erro ao criar indicador econômico', { error, body });
      return NextResponse.json(
        { error: 'Erro ao criar indicador econômico' },
        { status: 500 }
      );
    }

    devLog.info('Indicador econômico criado', { indicator });
    return NextResponse.json({ indicator }, { status: 201 });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'createEconomicIndicator');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar indicador existente
export async function PUT(request: NextRequest) {
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

    const body: EconomicIndicator & { id: string } = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'ID do indicador é obrigatório' },
        { status: 400 }
      );
    }

    const { data: indicator, error } = await supabase
      .from('economic_indicators')
      .update({
        title: body.title,
        value: body.value,
        icon: body.icon,
        description: body.description,
        display_order: body.display_order,
        is_active: body.is_active,
        issue_date: body.issue_date
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      devLog.error('Erro ao atualizar indicador econômico', { error, body });
      return NextResponse.json(
        { error: 'Erro ao atualizar indicador econômico' },
        { status: 500 }
      );
    }

    devLog.info('Indicador econômico atualizado', { indicator });
    return NextResponse.json({ indicator });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'updateEconomicIndicator');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir indicador
export async function DELETE(request: NextRequest) {
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
        { error: 'ID do indicador é obrigatório' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('economic_indicators')
      .delete()
      .eq('id', id);

    if (error) {
      devLog.error('Erro ao excluir indicador econômico', { error, id });
      return NextResponse.json(
        { error: 'Erro ao excluir indicador econômico' },
        { status: 500 }
      );
    }

    devLog.info('Indicador econômico excluído', { id });
    return NextResponse.json({ message: 'Indicador excluído com sucesso' });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'deleteEconomicIndicator');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
} 