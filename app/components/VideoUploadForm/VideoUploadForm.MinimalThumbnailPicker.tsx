/**
 * Seletor de thumbnail minimalista com geração automática
 * Design limpo e funcional para melhor UX
 */

import { memo, useState, useRef, useCallback, useEffect } from 'react'

interface MinimalThumbnailPickerProps {
  videoFile?: File | null
  videoUrl?: string
  onTimeSelect: (timestamp: number) => void
  onThumbnailGenerate?: (blob: Blob, timestamp: number) => void
  disabled?: boolean
  autoGenerate?: boolean
}

export const VideoUploadFormMinimalThumbnailPicker = memo(({
  videoFile,
  videoUrl,
  onTimeSelect,
  onThumbnailGenerate,
  disabled = false,
  autoGenerate = false
}: MinimalThumbnailPickerProps) => {
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const generateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastGeneratedTime = useRef<number | null>(null)
  const isGeneratingRef = useRef<boolean>(false)
  
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [thumbnailGenerated, setThumbnailGenerated] = useState(false)

  // Configurar source do vídeo
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile)
      setVideoSrc(url)
      return () => URL.revokeObjectURL(url)
    } else if (videoUrl) {
      setVideoSrc(videoUrl)
    } else {
      setVideoSrc(null)
      setIsLoaded(false)
    }
  }, [videoFile, videoUrl])
  
  // Cleanup timers ao desmontar
  useEffect(() => {
    return () => {
      if (generateTimeoutRef.current) {
        clearTimeout(generateTimeoutRef.current)
      }
    }
  }, [])

  // Gerar thumbnail automaticamente
  const generateThumbnail = useCallback(async (timestamp?: number) => {
    if (!videoRef.current || !canvasRef.current) {
      return
    }
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      return
    }
    
    // Se um timestamp foi fornecido, navegar para ele primeiro
    if (timestamp !== undefined) {
      video.currentTime = timestamp
      // Aguardar o seek completar
      await new Promise<void>((resolve) => {
        const handleSeeked = () => {
          video.removeEventListener('seeked', handleSeeked)
          resolve()
        }
        video.addEventListener('seeked', handleSeeked)
      })
    }
    
    // Configurar dimensões do canvas mantendo aspect ratio
    const maxWidth = 1280
    const maxHeight = 720
    let { videoWidth: width, videoHeight: height } = video
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height)
      width = Math.floor(width * ratio)
      height = Math.floor(height * ratio)
    }
    
    canvas.width = width
    canvas.height = height
    
    // Desenhar frame atual no canvas
    ctx.drawImage(video, 0, 0, width, height)
    
    // Converter para blob
    canvas.toBlob((blob) => {
      if (blob) {
        if (onThumbnailGenerate) {
          onThumbnailGenerate(blob, video.currentTime)
          setThumbnailGenerated(true)
        }
      }
    }, 'image/jpeg', 0.9)
  }, [onThumbnailGenerate])

  // Handler quando o vídeo carrega
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration
      setDuration(videoDuration)
      setIsLoaded(true)
      
      // Definir tempo inicial (2 segundos ou 10% da duração)
      const initialTime = Math.min(2.0, videoDuration * 0.1)
      setCurrentTime(initialTime)
      videoRef.current.currentTime = initialTime
      
      // Se autoGenerate está ativo, gerar thumbnail automaticamente
      if (autoGenerate && !isGeneratingRef.current && !lastGeneratedTime.current) {
        isGeneratingRef.current = true
        setTimeout(() => {
          generateThumbnail(initialTime).finally(() => {
            isGeneratingRef.current = false
            lastGeneratedTime.current = initialTime
          })
        }, 500)
      }
    }
  }, [autoGenerate, generateThumbnail])

  // Handler para mudança de tempo no slider
  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
    
    onTimeSelect(newTime)
    
    // Gerar thumbnail automaticamente ao mover o slider se autoGenerate está ativo
    if (autoGenerate) {
      // Cancelar geração anterior
      if (generateTimeoutRef.current) {
        clearTimeout(generateTimeoutRef.current)
      }
      
      // Verificar se já foi gerado para este tempo (com tolerância de 0.1s)
      if (lastGeneratedTime.current !== null && Math.abs(lastGeneratedTime.current - newTime) < 0.1) {
        return
      }
      
      // Verificar se já está gerando
      if (isGeneratingRef.current) {
        return
      }
      
      // Agendar geração com debounce
      generateTimeoutRef.current = setTimeout(() => {
        if (!isGeneratingRef.current) {
          isGeneratingRef.current = true
          generateThumbnail(newTime).finally(() => {
            isGeneratingRef.current = false
            lastGeneratedTime.current = newTime
          })
        }
      }, 300)
    }
  }, [onTimeSelect, autoGenerate, generateThumbnail])

  // Handler para quando o vídeo faz seek
  const handleSeeked = useCallback(() => {
    if (videoRef.current) {
      const seekTime = videoRef.current.currentTime
      setCurrentTime(seekTime)
      // Não gerar automaticamente no seek para evitar duplicação
      // A geração já é feita no handleTimeChange
    }
  }, [])

  // Formatar tempo em mm:ss
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Pular para porcentagens específicas
  const handleQuickJump = useCallback((percentage: number) => {
    if (!videoRef.current || !duration) return
    
    const newTime = duration * percentage
    setCurrentTime(newTime)
    videoRef.current.currentTime = newTime
    onTimeSelect(newTime)
    
    // Gerar thumbnail automaticamente ao pular para uma posição se autoGenerate está ativo
    if (autoGenerate) {
      // Cancelar geração anterior
      if (generateTimeoutRef.current) {
        clearTimeout(generateTimeoutRef.current)
      }
      
      // Verificar se já foi gerado
      if (lastGeneratedTime.current !== null && Math.abs(lastGeneratedTime.current - newTime) < 0.1) {
        return
      }
      
      if (!isGeneratingRef.current) {
        generateTimeoutRef.current = setTimeout(() => {
          if (!isGeneratingRef.current) {
            isGeneratingRef.current = true
            generateThumbnail(newTime).finally(() => {
              isGeneratingRef.current = false
              lastGeneratedTime.current = newTime
            })
          }
        }, 300)
      }
    }
  }, [duration, onTimeSelect, autoGenerate, generateThumbnail])

  if (!videoSrc) {
    return (
      <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
        <p className="text-sm">Adicione um vídeo para selecionar a thumbnail</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Título da seção */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Selecionar Momento da Thumbnail
        </h3>
        {thumbnailGenerated && (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            Thumbnail gerada
          </span>
        )}
      </div>

      {/* Preview do Vídeo */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          src={videoSrc}
          onLoadedMetadata={handleLoadedMetadata}
          onSeeked={handleSeeked}
          muted
          className="w-full h-full object-contain"
        />
        
        {/* Canvas oculto para geração de thumbnail */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Indicador de tempo atual */}
        {isLoaded && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-md">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        )}
      </div>

      {/* Controles de Tempo */}
      {isLoaded && (
        <div className="space-y-3">
          {/* Informação do tempo selecionado */}
          <div className="text-sm text-gray-600 text-center">
            Momento da Thumbnail: <span className="font-medium">{formatTime(currentTime)}</span>
          </div>

          {/* Slider de tempo */}
          <div className="px-2">
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={currentTime}
              onChange={handleTimeChange}
              disabled={disabled}
              className="
                w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                [&::-webkit-slider-thumb]:appearance-none 
                [&::-webkit-slider-thumb]:w-4 
                [&::-webkit-slider-thumb]:h-4 
                [&::-webkit-slider-thumb]:bg-primary 
                [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-sm
                [&::-webkit-slider-thumb]:hover:bg-primary/90
                [&::-webkit-slider-thumb]:transition-colors
                [&::-moz-range-thumb]:w-4 
                [&::-moz-range-thumb]:h-4 
                [&::-moz-range-thumb]:bg-primary 
                [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:border-none 
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:shadow-sm
                [&::-moz-range-thumb]:hover:bg-primary/90
                [&::-moz-range-thumb]:transition-colors
                [&::-webkit-slider-runnable-track]:bg-gradient-to-r
                [&::-webkit-slider-runnable-track]:from-primary/20
                [&::-webkit-slider-runnable-track]:to-primary/10
                [&::-moz-range-track]:bg-gradient-to-r
                [&::-moz-range-track]:from-primary/20
                [&::-moz-range-track]:to-primary/10
              "
            />
          </div>

          {/* Botões de salto rápido - Design minimalista */}
          <div className="flex justify-between px-4">
            {[
              { label: 'Início', percentage: 0 },
              { label: '25%', percentage: 0.25 },
              { label: '50%', percentage: 0.5 },
              { label: '75%', percentage: 0.75 },
              { label: 'Final', percentage: 0.95 }
            ].map(({ label, percentage }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleQuickJump(percentage)}
                disabled={disabled}
                className="
                  inline-block text-xs text-gray-600 hover:text-primary
                  py-1 px-2 rounded transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-gray-50 font-normal
                  [&::before]:content-none [&::after]:content-none
                "
                style={{ textDecoration: 'none' }}
                title={`Ir para ${label}`}
              >
                <span className="inline-block">{label}</span>
              </button>
            ))}
          </div>

          {/* Botão para gerar thumbnail manualmente se necessário */}
          {!autoGenerate && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => generateThumbnail()}
                disabled={disabled}
                className="
                  w-full py-2 px-4 bg-primary text-white rounded-md
                  hover:bg-primary/90 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  text-sm font-medium
                "
              >
                Gerar Miniatura
              </button>
            </div>
          )}

          {/* Dica de uso */}
          <div className="text-xs text-gray-500 text-center pt-1">
            Use o controle deslizante ou os botões para escolher o melhor momento
          </div>
        </div>
      )}
    </div>
  )
})

VideoUploadFormMinimalThumbnailPicker.displayName = 'VideoUploadFormMinimalThumbnailPicker'