import Image from 'next/image'
import { memo, useCallback, useState, useEffect } from 'react'


import { StandardizedInput } from '@/app/components/ui/StandardizedInput'
import { VIDEO_HELPERS } from '@/lib/constants/video-ui'

import { YouTubeInputProps } from './VideoUploadForm.types'




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
      {/* URL Input using StandardizedInput */}
      <StandardizedInput
        id="youtube-url-input"
        label="URL do YouTube"
        type="url"
        variant="outline"
        size="md"
        required
        value={localValue}
        onChange={handleInputChange}
        isDisabled={disabled}
        isInvalid={!!error}
        placeholder="https://www.youtube.com/watch?v=..."
        startIcon="video"
        help="Cole o link do vídeo público do YouTube"
        error={error}
      />
      
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