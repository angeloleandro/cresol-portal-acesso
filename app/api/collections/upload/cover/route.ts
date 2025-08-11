// Collection Cover Upload API
// Upload de capas para coleções usando Supabase Storage

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { COLLECTION_CONFIG, ERROR_MESSAGES, STORAGE_BUCKETS } from '@/lib/constants/collections';
import { validateCollection } from '@/lib/utils/collections';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// POST /api/collections/upload/cover - Upload de capa da coleção
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PERMISSION_DENIED },
        { status: 401 }
      );
    }

    // Verificar permissão admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PERMISSION_DENIED },
        { status: 403 }
      );
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

    // Validar arquivo
    const fileError = validateCollection.file(file, COLLECTION_CONFIG.ALLOWED_IMAGE_TYPES);
    if (fileError) {
      return NextResponse.json(
        { error: fileError },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `cover_${timestamp}_${randomString}.${fileExtension}`;
    const filePath = `${STORAGE_BUCKETS.COVERS}/${fileName}`;

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
      console.error('Erro no upload:', uploadError);
      return NextResponse.json(
        { error: ERROR_MESSAGES.UPLOAD_FAILED },
        { status: 500 }
      );
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      message: 'Upload realizado com sucesso!',
      file_url: publicUrl,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type,
      original_name: file.name,
    });

  } catch (error) {
    console.error('Erro no upload de capa:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.NETWORK_ERROR },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/upload/cover - Remover capa do storage
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PERMISSION_DENIED },
        { status: 401 }
      );
    }

    // Verificar permissão admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PERMISSION_DENIED },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('file_path');

    if (!filePath) {
      return NextResponse.json(
        { error: 'file_path é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o arquivo está no bucket correto (segurança)
    if (!filePath.startsWith(STORAGE_BUCKETS.COVERS)) {
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
      console.error('Erro ao remover arquivo:', deleteError);
      return NextResponse.json(
        { error: 'Erro ao remover arquivo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Arquivo removido com sucesso!',
    });

  } catch (error) {
    console.error('Erro na remoção de capa:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.NETWORK_ERROR },
      { status: 500 }
    );
  }
}