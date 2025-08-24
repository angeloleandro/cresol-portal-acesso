import { NextRequest, NextResponse } from 'next/server'

import { supabase } from '@/lib/supabase'
import { uploadThumbnailWithFallback } from '@/lib/supabase-storage'
import { generateVideoThumbnailSimple } from '@/lib/thumbnail-generator'




/**
 * POST function
 * @todo Add proper documentation
 */
export async function POST(request: NextRequest) {
  try {
    const { videoId, videoUrl, timestamp = 1.0 } = await request.json()

    if (!videoId || !videoUrl) {
      return NextResponse.json(
        { error: 'videoId e videoUrl são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar informações do vídeo
    const { data: video, error: videoError } = await supabase
      .from('dashboard_videos')
      .select('*')
      .eq('id', videoId)
      .single()

    if (videoError || !video) {
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já tem thumbnail automática
    if (video.thumbnail_url && video.upload_type === 'direct') {
      return NextResponse.json({
        message: 'Vídeo já possui thumbnail',
        thumbnailUrl: video.thumbnail_url
      })
    }

    try {
      // Gerar thumbnail usando a URL do vídeo
      const thumbnailResult = await generateVideoThumbnailSimple(videoUrl, {
        timestamp,
        width: 1280,
        height: 720,
        quality: 0.85
      })

      if (!thumbnailResult) {
        throw new Error('Falha ao gerar thumbnail do vídeo')
      }

      // Upload da thumbnail para storage
      const fileName = video.original_filename || `video-${videoId}`
      const thumbnailUrl = await uploadThumbnailWithFallback(
        thumbnailResult.blob,
        fileName
      )

      // Atualizar registro do vídeo com a thumbnail
      const { error: updateError } = await supabase
        .from('dashboard_videos')
        .update({
          thumbnail_url: thumbnailUrl,
          thumbnail_timestamp: timestamp
        })
        .eq('id', videoId)

      if (updateError) {

        throw new Error('Erro ao salvar thumbnail no banco de dados')
      }

      return NextResponse.json({
        success: true,
        thumbnailUrl,
        timestamp,
        message: 'Thumbnail gerada e salva com sucesso'
      })

    } catch (thumbnailError) {

      return NextResponse.json({
        success: false,
        error: thumbnailError instanceof Error ? thumbnailError.message : 'Erro ao gerar thumbnail',
        fallback: true
      }, { status: 500 })
    }

  } catch (error) {

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        success: false
      },
      { status: 500 }
    )
  }
}

// Método GET para verificar status de geração
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('videoId')

  if (!videoId) {
    return NextResponse.json(
      { error: 'videoId é obrigatório' },
      { status: 400 }
    )
  }

  try {
    const { data: video, error } = await supabase
      .from('dashboard_videos')
      .select('thumbnail_url, thumbnail_timestamp, upload_type')
      .eq('id', videoId)
      .single()

    if (error || !video) {
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      hasAutoThumbnail: !!(video.thumbnail_url && video.upload_type === 'direct'),
      thumbnailUrl: video.thumbnail_url,
      timestamp: video.thumbnail_timestamp
    })

  } catch (error) {

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}