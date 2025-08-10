/**
 * VideoUploadForm Clean YouTube Input Component
 * Minimalist URL input without decorative elements
 */

import { memo, useCallback, useState, useEffect } from 'react'
import Image from 'next/image'
import { YouTubeInputProps } from './VideoUploadForm.types'
import { VIDEO_HELPERS } from '@/lib/constants/video-ui'

// Consolidated YouTube helper functions using VIDEO_HELPERS
function getYouTubeThumbnail(url: string): string | null {
  const videoId = VIDEO_HELPERS.extractYouTubeId(url)
  return videoId ? VIDEO_HELPERS.getYouTubeThumbnail(videoId) : null
}

function isValidYouTubeUrl(url: string): boolean {
  return VIDEO_HELPERS.extractYouTubeId(url) !== null
}

export const VideoUploadFormYouTubeInput = memo(({ 
  value, 
  onChange, 
  error, 
  disabled = false 
}: YouTubeInputProps) => {
  
  const [localValue, setLocalValue] = useState(value)
  const [isValidUrl, setIsValidUrl] = useState(false)
  
  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value)
    const valid = value ? isValidYouTubeUrl(value) : false
    setIsValidUrl(valid)
  }, [value])
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    
    // Validate URL
    const valid = newValue ? isValidYouTubeUrl(newValue) : false
    setIsValidUrl(valid)
    
    // Call parent onChange
    onChange(newValue)
  }, [onChange])
  
  const thumbnailUrl = useCallback(() => {
    return localValue ? getYouTubeThumbnail(localValue) : null
  }, [localValue])
  
  return (
    <div className="space-y-4">
      {/* Input Label */}
      <div>
        <label 
          htmlFor="youtube-url-input"
          className="block text-sm font-medium text-neutral-700"
        >
          URL do YouTube
          <span className="text-red-500 ml-1" aria-label="obrigatório">*</span>
        </label>
        
        {/* URL Input */}
        <input
          id="youtube-url-input"
          type="url"
          required
          value={localValue}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder="https://www.youtube.com/watch?v=..."
          className={`
            mt-1 w-full border rounded-lg px-4 py-3 text-sm placeholder-neutral-400 bg-white
            focus:outline-none focus:ring-2 focus:ring-neutral-500/20 focus:border-neutral-500 
            hover:border-neutral-400 transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-50
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-neutral-300'}
          `}
          aria-describedby={`youtube-url-help ${error ? 'youtube-url-error' : ''}`}
          aria-invalid={!!error}
        />
        
        {/* Help text */}
        <div id="youtube-url-help" className="text-xs text-neutral-500 mt-1">
          Cole o link do vídeo público do YouTube
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div 
          id="youtube-url-error"
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"
          role="alert"
          aria-live="polite"
        >
          <div className="font-medium mb-1">URL inválida</div>
          <div>{error}</div>
        </div>
      )}
      
      {/* Simple thumbnail preview */}
      {isValidUrl && thumbnailUrl() && (
        <div className="mt-4">
          <div className="relative w-full aspect-video bg-neutral-100 rounded-lg overflow-hidden">
            <Image
              src={thumbnailUrl()!}
              alt="Thumbnail do vídeo do YouTube"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-sm">
              YouTube
            </div>
          </div>
          
          <div className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>URL válida</span>
          </div>
        </div>
      )}
    </div>
  )
})

VideoUploadFormYouTubeInput.displayName = 'VideoUploadFormYouTubeInput'