import Image from 'next/image'
import { memo } from 'react'


import { useAsyncThumbnailGenerator } from '@/app/hooks/useAsyncThumbnailGenerator'

import { Icon } from '../icons/Icon'




interface AsyncThumbnailStatusProps {
  videoId: string
  videoUrl: string
  show: boolean
  onComplete?: (thumbnailUrl: string, timestamp: number) => void
}

export const VideoUploadFormAsyncThumbnailStatus = memo(({
  videoId,
  videoUrl,
  show,
  onComplete
}: AsyncThumbnailStatusProps) => {
  
  const asyncThumb = useAsyncThumbnailGenerator({
    videoId,
    videoUrl,
    autoStart: show
  })

  // Notificar quando completa
  if (asyncThumb.isComplete && asyncThumb.thumbnailUrl && onComplete) {
    onComplete(asyncThumb.thumbnailUrl, asyncThumb.timestamp || 1.0)
  }

  if (!show || (!asyncThumb.isGenerating && !asyncThumb.isComplete && !asyncThumb.error)) {
    return null
  }

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-3">
        {asyncThumb.isGenerating && (
          <div className="flex-shrink-0">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {asyncThumb.isComplete && (
          <div className="flex-shrink-0">
            <Icon name="check-circle" className="w-5 h-5 text-green-600" />
          </div>
        )}
        
        {asyncThumb.error && (
          <div className="flex-shrink-0">
            <Icon name="triangle-alert" className="w-5 h-5 text-red-500" />
          </div>
        )}
        
        <div className="flex-1">
          <div className="font-medium text-sm text-neutral-800 mb-1">
            {asyncThumb.isGenerating && 'Gerando thumbnail automática...'}
            {asyncThumb.isComplete && 'Thumbnail gerada com sucesso!'}
            {asyncThumb.error && 'Erro na geração de thumbnail'}
          </div>
          
          <div className="text-xs text-neutral-600">
            {asyncThumb.isGenerating && 'Processando frames do vídeo para criar thumbnail automática'}
            {asyncThumb.isComplete && `Thumbnail salva no timestamp ${asyncThumb.timestamp?.toFixed(1)}s`}
            {asyncThumb.error && asyncThumb.error}
          </div>
          
          {asyncThumb.isComplete && asyncThumb.thumbnailUrl && (
            <div className="mt-3">
              <div className="relative w-32 h-18 bg-neutral-100 rounded-md overflow-hidden">
                <Image
                  src={asyncThumb.thumbnailUrl}
                  alt="Thumbnail gerada"
                  fill
                  className="object-cover"
                  sizes="128px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded-sm">
                  Auto
                </div>
              </div>
            </div>
          )}
        </div>
        
        {asyncThumb.error && (
          <button
            type="button"
            onClick={() => asyncThumb.generateThumbnail()}
            className="flex-shrink-0 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  )
})

VideoUploadFormAsyncThumbnailStatus.displayName = 'VideoUploadFormAsyncThumbnailStatus'