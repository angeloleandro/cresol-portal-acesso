// Gallery Upload API
// Upload direto de imagens para a galeria - Portal Cresol

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleApiError, devLog } from '@/lib/error-handler';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// POST /api/admin/gallery/upload - Upload de imagem para galeria
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
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB.' },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF.' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `gallery_${timestamp}_${randomString}.${fileExtension}`;
    const filePath = `gallery/${fileName}`;

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
      devLog.error('Erro no upload de imagem da galeria', { uploadError });
      return NextResponse.json(
        { error: 'Erro ao fazer upload do arquivo' },
        { status: 500 }
      );
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    // Extrair título do nome do arquivo (sem extensão)
    const title = file.name.replace(/\.[^/.]+$/, '');

    // Buscar próximo order_index
    const { data: lastImage } = await supabase
      .from('gallery_images')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = (lastImage?.order_index || 0) + 1;

    // Inserir registro na tabela gallery_images
    const { data: imageRecord, error: insertError } = await supabase
      .from('gallery_images')
      .insert({
        title,
        image_url: publicUrl,
        is_active: true,
        order_index: nextOrderIndex,
      })
      .select()
      .single();

    if (insertError) {
      devLog.error('Erro ao inserir imagem na galeria', { insertError });
      
      // Limpar arquivo do storage em caso de erro
      await supabase.storage.from('images').remove([filePath]);
      
      return NextResponse.json(
        { error: 'Erro ao salvar imagem na galeria' },
        { status: 500 }
      );
    }

    devLog.info('Imagem adicionada à galeria', { 
      id: imageRecord.id,
      title,
      fileName, 
      fileSize: file.size 
    });

    // Retornar dados no formato esperado pelo BulkUpload
    return NextResponse.json({
      id: imageRecord.id,
      title: imageRecord.title,
      image_url: imageRecord.image_url,
      is_active: imageRecord.is_active,
      order_index: imageRecord.order_index,
      created_at: imageRecord.created_at,
      // Dados extras para compatibilidade
      file_size: file.size,
      file_type: file.type,
      original_name: file.name,
    });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'uploadGalleryImage');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}