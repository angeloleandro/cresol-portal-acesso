/**
 * VideoUploadForm Simple Thumbnail Component
 * Redesigned for minimal complexity and clear user flow
 */

import { memo, useCallback, useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ThumbnailConfigProps } from './VideoUploadForm.types'
import { Icon } from '../icons/Icon'
import { useThumbnailGenerator } from '@/app/hooks/useThumbnailGenerator'
import { Spinner } from "@chakra-ui/react"
import { VideoUploadFormThumbnailTimePicker } from './VideoUploadForm.ThumbnailTimePicker'
import { VIDEO_HELPERS } from '@/lib/constants/video-ui'

// Consolidated YouTube thumbnail helper
function getYouTubeThumbnail(url: string): string | null {
  const videoId = VIDEO_HELPERS.extractYouTubeId(url)
  return videoId ? VIDEO_HELPERS.getYouTubeThumbnail(videoId) : null
}

export const VideoUploadFormSimpleThumbnail = memo(({ 
  mode,
  onModeChange,
  uploadType,
  videoUrl,
  videoFile,
  thumbnailFile,
  onThumbnailSelect,
  thumbnailPreview,
  disabled = false,
  onTimestampChange
}: ThumbnailConfigProps) => {
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastAutoTimestamp = useRef<number | null>(null)
  
  // Estado para armazenar o timestamp selecionado no time picker
  const [selectedTimestamp, setSelectedTimestamp] = useState<number>(1.0)

  // Hook de geração de thumbnail usando timestamp selecionado
  const autoThumbState = useThumbnailGenerator({
    videoFile: uploadType === 'direct' ? (videoFile || null) : null,
    autoGenerate: false, // Geração manual via botão
    timestamp: selectedTimestamp
  })
  const [dragActive, setDragActive] = useState(false)
  
  const handleModeChange = useCallback((newMode: 'auto' | 'custom' | 'none') => {
    if (!disabled) {
      onModeChange(newMode)
    }
  }, [disabled, onModeChange])
  
  const handleFileSelect = useCallback((file: File) => {
    if (file && !disabled) {
      onThumbnailSelect(file)
      if (mode !== 'custom') {
        onModeChange('custom')
      }
    }
  }, [disabled, onThumbnailSelect, mode, onModeChange])
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])
  
  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])


  // Auto thumbnail URL (YouTube ou gerada do vídeo direto)
  const autoThumbnailUrl = uploadType === 'youtube' && videoUrl 
    ? getYouTubeThumbnail(videoUrl)
    : (autoThumbState?.thumbnail?.url || null)

  // Sincroniza file quando gerar auto (direto)
  useEffect(() => {
    if (
      uploadType === 'direct' &&
      mode === 'auto' &&
      videoFile &&
      autoThumbState?.thumbnail &&
      !autoThumbState.isGenerating
    ) {
      const ts = autoThumbState.thumbnail.timestamp
      if (lastAutoTimestamp.current !== ts) {
        lastAutoTimestamp.current = ts
        try {
          const { blob, timestamp } = autoThumbState.thumbnail
          const f = new File([blob], `auto-thumb-${Math.round(timestamp * 1000)}.jpg`, { type: blob.type || 'image/jpeg' })
          onThumbnailSelect(f)
        } catch (err) {}
      }
    }
  }, [uploadType, mode, videoFile, autoThumbState?.thumbnail, autoThumbState?.isGenerating, onThumbnailSelect])

  return (
    <div className="space-y-4">
      {/* Mode Selection - Simplified Pills */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Thumbnail do Vídeo
        </label>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleModeChange('auto')}
            disabled={disabled}
            className={`
              px-4 py-2 rounded-full text-sm font-medium border transition-all
              ${mode === 'auto'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400'
              }
            `}
          >
            Automática
          </button>
          
          <button
            type="button"
            onClick={() => handleModeChange('custom')}
            disabled={disabled}
            className={`
              px-4 py-2 rounded-full text-sm font-medium border transition-all
              ${mode === 'custom'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400'
              }
            `}
          >
            Personalizada
          </button>
          
          <button
            type="button"
            onClick={() => handleModeChange('none')}
            disabled={disabled}
            className={`
              px-4 py-2 rounded-full text-sm font-medium border transition-all
              ${mode === 'none'
                ? 'bg-neutral-600 text-white border-neutral-600 shadow-sm'
                : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400'
              }
            `}
          >
            Sem imagem
          </button>
        </div>
      </div>

      {/* Thumbnail Preview/Upload Area */}
      {mode === 'custom' && (
        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={`
              relative border-2 border-dashed rounded-md p-8 text-center transition-all
              ${dragActive 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400'
              }
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto">
                <Icon name="image" className="w-8 h-8 text-neutral-400" />
              </div>
              
              <div>
                <p className="text-base font-medium text-neutral-700 mb-1">
                  Clique ou arraste uma imagem
                </p>
                <p className="text-sm text-neutral-500">
                  PNG, JPG até 5MB • Recomendado: 1280×720px
                </p>
              </div>
              
              <button
                type="button"
                onClick={openFileDialog}
                disabled={disabled}
                className="
                  px-6 py-2 bg-white border border-neutral-300 rounded-lg 
                  text-sm font-medium text-neutral-700 
                  hover:bg-neutral-50 hover:border-neutral-400 
                  focus:outline-none focus:ring-2 focus:ring-primary/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all
                "
              >
                Selecionar Arquivo
              </button>
            </div>
          </div>

          {/* Custom Thumbnail Preview */}
          {thumbnailPreview && (
            <div className="space-y-3">
              <div className="relative w-full aspect-video bg-neutral-100 rounded-lg overflow-hidden">
                <Image
                  src={thumbnailPreview}
                  alt="Preview da thumbnail"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <button
                  type="button"
                  onClick={openFileDialog}
                  disabled={disabled}
                  className="
                    absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 
                    text-white rounded-full flex items-center justify-center
                    transition-colors
                  "
                  title="Alterar imagem"
                >
                  <Icon name="pencil" className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between text-xs text-neutral-500 bg-neutral-50 px-3 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon name="check-circle" className="w-4 h-4 text-green-600" />
                  <span>Imagem carregada com sucesso</span>
                </div>
                <button
                  type="button"
                  onClick={openFileDialog}
                  disabled={disabled}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Alterar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auto Thumbnail Preview - YouTube */}
      {mode === 'auto' && uploadType === 'youtube' && autoThumbnailUrl && (
        <div className="space-y-3">
          <div className="relative w-full aspect-video bg-neutral-100 rounded-lg overflow-hidden">
            <Image
              src={autoThumbnailUrl}
              alt="Thumbnail automática do YouTube"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-sm flex items-center gap-1">
              <Icon name="play" className="w-3 h-3" />
              YouTube
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-neutral-500 bg-neutral-50 px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <Icon name="check-circle" className="w-4 h-4 text-green-600" />
              <span>Usando thumbnail oficial do YouTube</span>
            </div>
          </div>
        </div>
      )}

      {/* Auto Thumbnail Preview - Local Video File */}
      {mode === 'auto' && uploadType === 'direct' && videoFile && (
        <div className="space-y-4">
          {/* Visual Time Picker with Video Player */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
            <h4 className="font-medium text-neutral-800 mb-4">Selecionar Momento da Thumbnail</h4>
            <VideoUploadFormThumbnailTimePicker
              videoFile={videoFile}
              onTimeSelect={(timestamp) => {
                setSelectedTimestamp(timestamp);
                onTimestampChange?.(timestamp);
              }}
              disabled={disabled}
            />
            
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-600 mb-3">
                Após escolher o momento ideal, clique em &quot;Gerar Thumbnail&quot; para criar a imagem.
              </p>
              
              <button
                type="button"
                onClick={async () => {
                  // Usar o sistema de geração local com o timestamp selecionado
                  try {
                    const result = await autoThumbState.generateThumbnail(selectedTimestamp);
                    if (result && result.blob) {
                      const thumbnailFile = new File(
                        [result.blob], 
                        `thumbnail_${selectedTimestamp.toFixed(1)}s.jpg`, 
                        { type: 'image/jpeg' }
                      );
                      onThumbnailSelect(thumbnailFile);
                    }
                  } catch (error) {
                    // Error handling
                  }
                }}
                disabled={disabled || autoThumbState.isGenerating || !videoFile}
                className="
                  px-6 py-2 bg-primary text-white text-sm rounded-lg font-medium
                  hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                "
              >
                {autoThumbState.isGenerating ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" color="white" />
                    <span>Gerando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Icon name="image" className="w-4 h-4" />
                    <span>Gerar Thumbnail</span>
                  </div>
                )}
              </button>
            </div>
          </div>
          
          {/* Thumbnail Preview Area */}
          {autoThumbState.thumbnail && (
            <div className="space-y-3">
              <div className="relative aspect-video bg-neutral-100 rounded-lg overflow-hidden">
                <Image
                  src={autoThumbState.thumbnail.url}
                  alt="Preview da thumbnail gerada"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-sm">
                  {autoThumbState.thumbnail.timestamp?.toFixed(1) || '1.0'}s
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-neutral-500 bg-neutral-50 px-3 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon name="check-circle" className="w-4 h-4 text-green-600" />
                  <span>Thumbnail gerada no momento selecionado</span>
                </div>
              </div>
            </div>
          )}
          
          {autoThumbState.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 text-sm">
                <Icon name="triangle-alert" className="w-4 h-4" />
                <span>{autoThumbState.error}</span>
              </div>
            </div>
          )}
        </div>
      )}


      {/* No Thumbnail State */}
      {mode === 'none' && (
        <div className="py-8 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="x" className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-sm text-neutral-500">
            Nenhuma thumbnail será exibida para este vídeo
          </p>
        </div>
      )}
    </div>
  )
})

VideoUploadFormSimpleThumbnail.displayName = 'VideoUploadFormSimpleThumbnail'