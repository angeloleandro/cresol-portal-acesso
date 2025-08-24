// Subsector Images Upload API
// Upload direto de imagens para subsetores - Portal Cresol

import { NextRequest, NextResponse } from 'next/server';

import { handleApiError, devLog } from '@/lib/error-handler';
import { CreateClient } from '@/lib/supabase/server';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// POST /api/admin/subsectors/[id]/images/upload - Upload de imagem direto para subsetor
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subsectorId = params.id;
    const supabase = CreateClient();
    
    // Verificar se usuário está autenticado e tem permissão
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'sector_admin', 'subsector_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Sem permissão para fazer upload de imagens' }, { status: 403 });
    }

    // Verificar se o subsetor existe
    const { data: subsector, error: subsectorError } = await supabase
      .from('subsectors')
      .select('id, name, sector_id')
      .eq('id', subsectorId)
      .single();

    if (subsectorError || !subsector) {
      return NextResponse.json({ error: 'Subsetor não encontrado' }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const isPublished = formData.get('is_published') === 'true';
    const isFeatured = formData.get('is_featured') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo é obrigatório' },
        { status: 400 }
      );
    }

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      );
    }

    // Validações do arquivo
    const maxSize = 10 * 1024 * 1024; // 10MB para imagens
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB.' },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `image_${timestamp}_${randomString}.${fileExtension}`;
    const filePath = `images/subsectors/${subsectorId}/${fileName}`;

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
      devLog.error('Erro no upload de imagem do subsetor', { uploadError, subsectorId });
      return NextResponse.json(
        { error: 'Erro ao fazer upload do arquivo' },
        { status: 500 }
      );
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    // Buscar próximo order_index
    const { data: lastImage } = await supabase
      .from('subsector_images')
      .select('order_index')
      .eq('subsector_id', subsectorId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = (lastImage?.order_index || 0) + 1;

    // Se for featured, remover featured das outras imagens
    if (isFeatured) {
      await supabase
        .from('subsector_images')
        .update({ is_featured: false })
        .eq('subsector_id', subsectorId);
    }

    // Extrair dimensões da imagem (para implementar futuramente com library de processamento)
    const width = null;
    const height = null;

    // Inserir registro na tabela subsector_images
    const { data: imageRecord, error: insertError } = await supabase
      .from('subsector_images')
      .insert({
        subsector_id: subsectorId,
        title: title.trim(),
        description: description?.trim() || null,
        image_url: publicUrl,
        thumbnail_url: publicUrl, // Por enquanto usa a mesma URL
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        width: width,
        height: height,
        is_published: isPublished,
        is_featured: isFeatured,
        order_index: nextOrderIndex,
        processing_status: 'ready',
        created_by: user.id
      })
      .select()
      .single();

    if (insertError) {
      devLog.error('Erro ao inserir imagem do subsetor', { insertError, subsectorId });
      
      // Limpar arquivo do storage em caso de erro
      await supabase.storage.from('images').remove([filePath]);
      
      return NextResponse.json(
        { error: 'Erro ao salvar imagem no banco de dados' },
        { status: 500 }
      );
    }

    devLog.info('Imagem do subsetor adicionada com sucesso', { 
      id: imageRecord.id,
      subsectorId,
      title,
      fileName, 
      fileSize: file.size
    });

    // Retornar dados da imagem criada
    return NextResponse.json({
      success: true,
      data: imageRecord
    });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'uploadSubsectorImage');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}