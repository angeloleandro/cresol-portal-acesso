import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleApiError, devLog } from '@/lib/error-handler';

// GET /api/admin/gallery - Listar imagens da galeria
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verificar se usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Buscar imagens da galeria
    const { data: images, error } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100));

    if (error) {
      devLog.error('Erro ao buscar imagens da galeria', { error });
      return NextResponse.json(
        { error: 'Erro ao buscar imagens da galeria' },
        { status: 500 }
      );
    }

    devLog.info('Imagens da galeria carregadas', { count: images?.length });
    return NextResponse.json({ images: images || [] });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'getGalleryImages');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
  }

  try {
    const supabase = createClient();
    
    // Verificar se usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Excluir imagem da galeria
    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);

    if (error) {
      devLog.error('Erro ao excluir imagem da galeria', { error, id });
      return NextResponse.json({ error: 'Erro ao excluir imagem' }, { status: 500 });
    }

    devLog.info('Imagem da galeria excluída', { id });
    return NextResponse.json({ message: 'Imagem excluída com sucesso' });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'deleteGalleryImage');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}