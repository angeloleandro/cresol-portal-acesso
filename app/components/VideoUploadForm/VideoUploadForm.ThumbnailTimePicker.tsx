/**
 * Seletor de tempo para thumbnail automática
 * Permite visualizar o vídeo e escolher o frame específico
 */

import { memo, useState, useRef, useCallback, useEffect } from 'react'
import { Icon } from '../icons/Icon'

interface ThumbnailTimePickerProps {
  videoFile: File | null
  videoUrl?: string
  onTimeSelect: (timestamp: number) => void
  disabled?: boolean
}

export const VideoUploadFormThumbnailTimePicker = memo(({
  videoFile,
  videoUrl,
  onTimeSelect,
  disabled = false
}: ThumbnailTimePickerProps) => {
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(1.0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

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

  // Handler para quando o vídeo carrega
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration
      setDuration(videoDuration)
      setIsLoaded(true)
      
      // Definir tempo inicial (1 segundo ou 5% da duração, o que for menor)
      const initialTime = Math.min(1.0, videoDuration * 0.05)
      setCurrentTime(initialTime)
      videoRef.current.currentTime = initialTime
    }
  }, [])

  // Handler para mudança de tempo no slider
  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
    
    onTimeSelect(newTime)
  }, [onTimeSelect])

  // Handler para play/pause
  const handlePlayPause = useCallback(async () => {
    if (!videoRef.current) return
    
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      try {
        await videoRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        // Error should be handled by proper error boundary
      }
    }
  }, [isPlaying])

  // Handler para quando o vídeo faz seek
  const handleSeeked = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }, [])

  // Handler para timeupdate durante reprodução
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && isPlaying) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }, [isPlaying])

  // Formatar tempo em mm:ss
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Pular para tempos pré-definidos
  const handleQuickJump = useCallback((percentage: number) => {
    if (!videoRef.current || !duration) return
    
    const newTime = duration * percentage
    setCurrentTime(newTime)
    videoRef.current.currentTime = newTime
    onTimeSelect(newTime)
  }, [duration, onTimeSelect])

  if (!videoSrc) {
    return (
      <div className="text-center text-neutral-500 py-8">
        <Icon name="video" className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
        <p>Selecione um vídeo para escolher o momento da thumbnail</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Preview do Vídeo */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          src={videoSrc}
          onLoadedMetadata={handleLoadedMetadata}
          onSeeked={handleSeeked}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          muted
          className="w-full h-full object-contain"
        />
        
        {/* Controles de Play/Pause */}
        {isLoaded && (
          <button
            type="button"
            onClick={handlePlayPause}
            disabled={disabled}
            className="
              absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              w-16 h-16 bg-black/70 hover:bg-black/90 text-white rounded-full
              flex items-center justify-center transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            title={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            <Icon 
              name={isPlaying ? 'pause' : 'play'} 
              className="w-6 h-6" 
            />
          </button>
        )}

        {/* Indicador de tempo atual */}
        {isLoaded && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        )}
      </div>

      {/* Controles de Tempo */}
      {isLoaded && (
        <div className="space-y-3">
          {/* Slider de tempo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">
              Momento da Thumbnail: {formatTime(currentTime)}
            </label>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={currentTime}
              onChange={handleTimeChange}
              disabled={disabled}
              className="
                w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
                [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer
              "
            />
          </div>

          {/* Botões de salto rápido */}
          <div className="flex gap-2 justify-center">
            {[
              { label: 'Início', percentage: 0, icon: 'skip-back' },
              { label: '25%', percentage: 0.25, icon: 'chevron-left' },
              { label: '50%', percentage: 0.5, icon: 'circle' },
              { label: '75%', percentage: 0.75, icon: 'chevron-right' },
              { label: 'Final', percentage: 0.95, icon: 'skip-forward' }
            ].map(({ label, percentage, icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleQuickJump(percentage)}
                disabled={disabled}
                className="
                  flex flex-col items-center gap-1 px-3 py-2 text-xs
                  bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                title={`Ir para ${label}`}
              >
                <Icon name={icon as any} className="w-3 h-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Informações adicionais */}
          <div className="text-xs text-neutral-500 text-center">
            Use o controle deslizante ou os botões para escolher o momento exato da thumbnail
          </div>
        </div>
      )}
    </div>
  )
})

VideoUploadFormThumbnailTimePicker.displayName = 'VideoUploadFormThumbnailTimePicker'