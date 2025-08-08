/**
 * VideoUploadForm Type Selection Component
 * YouTube vs Direct upload selection with accessibility
 */

import { memo, useCallback } from 'react'
import { VideoTypeSelectProps } from './VideoUploadForm.types'
import { videoUploadStyles } from './VideoUploadForm.styles'
import { a11yTokens } from '@/lib/design-tokens/video-system'

export const VideoUploadFormTypeSelect = memo(({ 
  uploadType, 
  onChange, 
  disabled = false 
}: VideoTypeSelectProps) => {
  
  const handleYouTubeSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (!disabled && e.target.checked) {
      onChange('youtube')
    }
  }, [disabled, onChange])
  
  const handleDirectSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (!disabled && e.target.checked) {
      onChange('direct')
    }
  }, [disabled, onChange])
  
  return (
    <fieldset className={videoUploadStyles.form.section} disabled={disabled}>
      <legend className={videoUploadStyles.form.label}>
        Tipo de Vídeo
        <span className={a11yTokens.screenReader.hide}>
          Escolha entre upload do YouTube ou upload direto de arquivo
        </span>
      </legend>
      
      <div 
        className={videoUploadStyles.radioGroup.container}
        role="radiogroup"
        aria-labelledby="upload-type-legend"
        aria-describedby="upload-type-help"
      >
        {/* YouTube Option */}
        <label 
          className={videoUploadStyles.radioGroup.option}
          htmlFor="upload-type-youtube"
        >
          <input
            id="upload-type-youtube"
            type="radio"
            name="uploadType"
            value="youtube"
            checked={uploadType === 'youtube'}
            onChange={handleYouTubeSelect}
            disabled={disabled}
            className={videoUploadStyles.radioGroup.input}
            aria-describedby="youtube-help"
          />
          <span className="flex items-center gap-2">
            <svg 
              className="w-5 h-5 text-red-600" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>YouTube</span>
          </span>
        </label>
        
        {/* Direct Upload Option */}
        <label 
          className={videoUploadStyles.radioGroup.option}
          htmlFor="upload-type-direct"
        >
          <input
            id="upload-type-direct"
            type="radio"
            name="uploadType"
            value="direct"
            checked={uploadType === 'direct'}
            onChange={handleDirectSelect}
            disabled={disabled}
            className={videoUploadStyles.radioGroup.input}
            aria-describedby="direct-help"
          />
          <span className="flex items-center gap-2">
            <svg 
              className="w-5 h-5 text-primary" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            <span>Upload Direto</span>
          </span>
        </label>
      </div>
      
      {/* Help text */}
      <div id="upload-type-help" className={videoUploadStyles.form.helpText}>
        <div id="youtube-help" className={uploadType === 'youtube' ? 'block' : 'hidden'}>
          Insira a URL de um vídeo público do YouTube
        </div>
        <div id="direct-help" className={uploadType === 'direct' ? 'block' : 'hidden'}>
          Faça upload de um arquivo de vídeo (MP4, WebM, MOV, AVI - máx. 500MB)
        </div>
      </div>
    </fieldset>
  )
})

VideoUploadFormTypeSelect.displayName = 'VideoUploadFormTypeSelect'