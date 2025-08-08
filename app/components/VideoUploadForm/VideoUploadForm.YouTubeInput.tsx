/**
 * VideoUploadForm YouTube Input Component
 * URL input with live preview and validation
 */

import { memo, useCallback, useState, useEffect } from 'react'
import OptimizedImage from '../OptimizedImage'
import { YouTubeInputProps } from './VideoUploadForm.types'
import { videoUploadStyles } from './VideoUploadForm.styles'
import { a11yTokens } from '@/lib/design-tokens/video-system'

// YouTube URL validation and ID extraction
function getYouTubeId(url: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
  return match ? match[1] : null
}

function getYouTubeThumbnail(url: string): string | null {
  const videoId = getYouTubeId(url)
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null
}

function isValidYouTubeUrl(url: string): boolean {
  return getYouTubeId(url) !== null
}

export const VideoUploadFormYouTubeInput = memo(({ 
  value, 
  onChange, 
  error, 
  disabled = false 
}: YouTubeInputProps) => {
  
  const [localValue, setLocalValue] = useState(value)
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value)
    const valid = value ? isValidYouTubeUrl(value) : false
    setIsValidUrl(valid)
    setShowPreview(valid)
  }, [value])
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    
    // Validate URL
    const valid = newValue ? isValidYouTubeUrl(newValue) : false
    setIsValidUrl(valid)
    
    // Call parent onChange
    onChange(newValue)
    
    // Show preview only for valid URLs
    setShowPreview(valid)
  }, [onChange])
  
  const handleInputBlur = useCallback(() => {
    // Additional validation on blur if needed
    if (localValue && !isValidUrl) {
      // Could trigger validation error here
    }
  }, [localValue, isValidUrl])
  
  const embedUrl = useCallback(() => {
    if (!isValidUrl || !localValue) return ''
    
    const videoId = getYouTubeId(localValue)
    return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
  }, [isValidUrl, localValue])
  
  const thumbnailUrl = useCallback(() => {
    return localValue ? getYouTubeThumbnail(localValue) : null
  }, [localValue])
  
  return (
    <div className={videoUploadStyles.form.section}>
      {/* Input Label */}
      <label 
        htmlFor="youtube-url-input"
        className={videoUploadStyles.form.label}
      >
        URL do YouTube
        <span className={videoUploadStyles.form.required} aria-label="obrigatório">
          *
        </span>
      </label>
      
      {/* URL Input */}
      <div className="relative">
        <input
          id="youtube-url-input"
          type="url"
          required
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={disabled}
          placeholder="https://www.youtube.com/watch?v=..."
          className={`${videoUploadStyles.input.base} ${
            error ? videoUploadStyles.input.error : 
            isValidUrl && localValue ? videoUploadStyles.input.success : ''
          }`}
          aria-describedby={`youtube-url-help ${error ? 'youtube-url-error' : ''}`}
          aria-invalid={!!error}
        />
        
        {/* URL validation icon */}
        {localValue && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValidUrl ? (
              <svg 
                className="w-5 h-5 text-success" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            ) : (
              <svg 
                className="w-5 h-5 text-error" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            )}
          </div>
        )}
      </div>
      
      {/* Help text */}
      <div id="youtube-url-help" className={videoUploadStyles.form.helpText}>
        Cole aqui o link do vídeo público do YouTube (ex: https://www.youtube.com/watch?v=abc123)
      </div>
      
      {/* Error message */}
      {error && (
        <div 
          id="youtube-url-error"
          className={videoUploadStyles.alert.error}
          role="alert"
          aria-live="polite"
        >
          <div className={videoUploadStyles.alert.content}>
            <svg 
              className={videoUploadStyles.alert.icon}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <div>
              <div className={videoUploadStyles.alert.title}>
                URL inválida
              </div>
              <div className={videoUploadStyles.alert.description}>
                {error}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Video Preview */}
      {showPreview && embedUrl() && (
        <div className={videoUploadStyles.embed.container}>
          <iframe
            src={embedUrl()}
            className={videoUploadStyles.embed.iframe}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Preview do vídeo do YouTube"
            loading="lazy"
          />
          
          {/* Accessibility description */}
          <div className={a11yTokens.screenReader.hide}>
            Preview do vídeo do YouTube. O vídeo será incorporado com este URL.
          </div>
        </div>
      )}
      
      {/* Alternative: Thumbnail preview (lighter) */}
      {!showPreview && isValidUrl && thumbnailUrl() && (
        <div className="mt-3">
          <div className={videoUploadStyles.thumbnail.container}>
            <OptimizedImage
              src={thumbnailUrl()!}
              alt="Thumbnail do vídeo do YouTube"
              fill
              className={videoUploadStyles.thumbnail.image}
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={80}
              fallbackText="Thumbnail YouTube"
            />
            
            {/* Play overlay */}
            <div className={videoUploadStyles.thumbnail.overlay}>
              <svg 
                className="w-16 h-16 text-white" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          
          <p className={videoUploadStyles.form.helpText}>
            Preview da thumbnail. Clique em &quot;Salvar&quot; para incorporar o vídeo.
          </p>
        </div>
      )}
    </div>
  )
})

VideoUploadFormYouTubeInput.displayName = 'VideoUploadFormYouTubeInput'