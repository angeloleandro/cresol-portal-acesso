// Collection Cover Upload API
// Upload de capas para coleções usando Supabase Storage

import { NextRequest, NextResponse } from 'next/server';

import { handleApiError, devLog } from '@/lib/error-handler';
import { CreateClient } from '@/lib/supabase/server';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// POST /api/collections/upload/cover - Upload de capa da coleção
export async function POST(request: NextRequest) {
  try {
    const supabase = CreateClient();
    
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo é obrigatório' },
        { status: 400 }
      );
    }

    // Validações básicas
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB.' },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPG, PNG ou WEBP.' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `cover_${timestamp}_${randomString}.${fileExtension}`;
    const filePath = `collections/covers/${fileName}`;

    // Converter File para ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);

    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (uploadError) {
      devLog.error('Erro no upload de capa', { uploadError });
      return NextResponse.json(
        { error: 'Erro ao fazer upload do arquivo' },
        { status: 500 }
      );
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    devLog.info('Upload de capa realizado', { fileName, fileSize: file.size });

    return NextResponse.json({
      message: 'Upload realizado com sucesso!',
      file_url: publicUrl,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type,
      original_name: file.name,
    });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'uploadCollectionCover');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/upload/cover - Remover capa do storage
export async function DELETE(request: NextRequest) {
  try {
    const supabase = CreateClient();
    
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
    const filePath = searchParams.get('file_path');

    if (!filePath) {
      return NextResponse.json(
        { error: 'file_path é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o arquivo está no diretório correto (segurança)
    if (!filePath.startsWith('collections/covers/')) {
      return NextResponse.json(
        { error: 'Caminho de arquivo inválido' },
        { status: 400 }
      );
    }

    // Remover arquivo do storage
    const { error: deleteError } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (deleteError) {
      devLog.error('Erro ao remover capa', { deleteError, filePath });
      return NextResponse.json(
        { error: 'Erro ao remover arquivo' },
        { status: 500 }
      );
    }

    devLog.info('Capa removida', { filePath });
    return NextResponse.json({
      message: 'Arquivo removido com sucesso!',
    });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'deleteCollectionCover');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}