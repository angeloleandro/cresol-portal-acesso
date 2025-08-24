// Sector Images Upload API
// Upload direto de imagens para setores - Portal Cresol

import { NextRequest, NextResponse } from 'next/server';

import { handleApiError, devLog } from '@/lib/error-handler';
import { CreateClient } from '@/lib/supabase/server';

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

// POST /api/admin/sectors/[id]/images/upload - Upload de imagem direto para setor
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sectorId = params.id;
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

    if (!profile || !['admin', 'sector_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Sem permissão para fazer upload de imagens' }, { status: 403 });
    }

    // Verificar se o setor existe
    const { data: sector, error: sectorError } = await supabase
      .from('sectors')
      .select('id, name')
      .eq('id', sectorId)
      .single();

    if (sectorError || !sector) {
      return NextResponse.json({ error: 'Setor não encontrado' }, { status: 404 });
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
    const filePath = `images/sectors/${sectorId}/${fileName}`;

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
      devLog.error('[SECTOR-IMAGE-UPLOAD] Erro no upload', { 
        error: uploadError.message,
        sectorId 
      });
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
      .from('sector_images')
      .select('order_index')
      .eq('sector_id', sectorId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = (lastImage?.order_index || 0) + 1;

    // Se for featured, remover featured das outras imagens
    if (isFeatured) {
      await supabase
        .from('sector_images')
        .update({ is_featured: false })
        .eq('sector_id', sectorId);
    }

    // Extrair dimensões da imagem (para implementar futuramente com library de processamento)
    const width = null;
    const height = null;

    // Inserir registro na tabela sector_images
    const { data: imageRecord, error: insertError } = await supabase
      .from('sector_images')
      .insert({
        sector_id: sectorId,
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
      devLog.error('[SECTOR-IMAGE-UPLOAD] Erro ao inserir imagem', { 
        error: insertError.message,
        sectorId
      });
      
      // Limpar arquivo do storage em caso de erro
      await supabase.storage.from('images').remove([filePath]);
      
      return NextResponse.json(
        { error: `Erro ao salvar imagem no banco de dados: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Retornar dados da imagem criada
    return NextResponse.json({
      success: true,
      data: imageRecord
    });

  } catch (error: any) {
    const errorDetails = handleApiError(error, 'uploadSectorImage');
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
}