import { memo, useCallback, useRef, useState } from 'react'

import {
  VIDEO_MESSAGES,
  VIDEO_FILE_CONFIG,
  VIDEO_UI_CONFIG,
  VIDEO_HELPERS
} from '@/lib/constants/video-ui'
import { a11yTokens } from '@/lib/design-tokens/video-system'
import { FormatFileSize, IsValidVideoMimeType } from '@/lib/video-utils'

import { videoUploadStyles } from './VideoUploadForm.styles'
import { FileUploadProps } from './VideoUploadForm.types'


// File validation function
function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
  
  if (!IsValidVideoMimeType(file.type) && !VIDEO_FILE_CONFIG.supportedFormats.includes(fileExt.slice(1) as any)) {
    return { 
      valid: false, 
      error: VIDEO_MESSAGES.ERRORS.UNSUPPORTED_FORMAT
    }
  }
  
  if (file.size > VIDEO_FILE_CONFIG.maxSize) {
    return { 
      valid: false, 
      error: `${VIDEO_MESSAGES.ERRORS.FILE_TOO_LARGE} Máximo: ${VIDEO_HELPERS.formatFileSize(VIDEO_FILE_CONFIG.maxSize)}` 
    }
  }
  
  return { valid: true }
}

export const VideoUploadFormFileUpload = memo(({ 
  videoFile,
  onFileSelect,
  onFileRemove,
  dragActive,
  onDragStateChange,
  uploadProgress = 0,
  error,
  disabled = false,
  existingVideoInfo
}: FileUploadProps) => {
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isClickHandled, setIsClickHandled] = useState(false)
  
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateVideoFile(file)
      if (!validation.valid) {
        setLocalError(validation.error || VIDEO_MESSAGES.ERRORS.INVALID_FILE)
        return
      }
      
      setLocalError(null)
      onFileSelect(file)
    }
  }, [onFileSelect])
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      onDragStateChange(true)
    }
  }, [disabled, onDragStateChange])
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    onDragStateChange(false)
  }, [onDragStateChange])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    onDragStateChange(false)
    
    if (disabled) return
    
    const files = Array.from(e.dataTransfer.files)
    const videoFile = files.find(file => file.type.startsWith('video/'))
    
    if (videoFile) {
      const validation = validateVideoFile(videoFile)
      if (!validation.valid) {
        setLocalError(validation.error || VIDEO_MESSAGES.ERRORS.INVALID_FILE)
        return
      }
      
      setLocalError(null)
      onFileSelect(videoFile)
    } else {
      setLocalError('Por favor, selecione um arquivo de vídeo válido')
    }
  }, [disabled, onDragStateChange, onFileSelect])
  
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current && !isClickHandled) {
      setIsClickHandled(true)
      fileInputRef.current.click()
      
      // Reset click handler after a short delay to prevent double clicks
      setTimeout(() => {
        setIsClickHandled(false)
      }, VIDEO_UI_CONFIG.delays.clickPrevent)
    }
  }, [disabled, isClickHandled])
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault()
      handleClick()
    }
  }, [disabled, handleClick])
  
  const handleRemoveFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onFileRemove()
    setLocalError(null)
    setIsClickHandled(false)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onFileRemove])
  
  const displayError = error || localError
  const showProgress = uploadProgress > 0 && uploadProgress < 100
  
  return (
    <div className={videoUploadStyles.form.section}>
      {/* Label */}
      <label className={videoUploadStyles.form.label}>
        {VIDEO_MESSAGES.LABELS.VIDEO_FILE}
        <span className={videoUploadStyles.form.required} aria-label={VIDEO_MESSAGES.LABELS.REQUIRED}>
          *
        </span>
      </label>
      
      {/* Existing video info */}
      {existingVideoInfo && !videoFile && (
        <div className="mb-4 p-3 bg-gray-50 border rounded-md">
          <div className="text-sm font-medium text-gray-900 mb-1">
            {VIDEO_MESSAGES.LABELS.CURRENT_FILE}
          </div>
          {existingVideoInfo.filename && (
            <div className="text-sm text-gray-700 truncate">
              {existingVideoInfo.filename}
            </div>
          )}
          {existingVideoInfo.fileSize && (
            <div className="text-xs text-gray-500 mb-2">
              {FormatFileSize(existingVideoInfo.fileSize)}
            </div>
          )}
          <div className="text-xs text-gray-600">
            {VIDEO_MESSAGES.INFO.KEEP_CURRENT}
          </div>
        </div>
      )}
      
      {/* Upload Area or File Preview */}
      {!videoFile ? (
        <div 
          className={`${videoUploadStyles.uploadArea.base} ${
            dragActive ? videoUploadStyles.uploadArea.active : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={a11yTokens.ariaLabels.videoUpload}
          aria-describedby="file-upload-help file-upload-error"
          aria-disabled={disabled}
        >
          <div className={videoUploadStyles.uploadArea.content}>
            {/* Upload icon */}
            <svg 
              className={videoUploadStyles.uploadArea.icon} 
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
            
            {/* Upload text */}
            <p className={videoUploadStyles.uploadArea.text}>
              {existingVideoInfo 
                ? VIDEO_MESSAGES.INFO.REPLACE_CURRENT 
                : VIDEO_MESSAGES.INFO.DRAG_DROP.split(' ou')[0] + ' ou'
              }{' '}
              <span className={videoUploadStyles.uploadArea.highlight}>
                {VIDEO_MESSAGES.LABELS.CLICK_SELECT}
              </span>
            </p>
            
            {/* Help text */}
            <p className={videoUploadStyles.uploadArea.helpText}>
              {VIDEO_MESSAGES.INFO.SUPPORTED_FORMATS.replace('Formatos suportados: ', '')} • Máximo: {VIDEO_HELPERS.formatFileSize(VIDEO_FILE_CONFIG.maxSize)}
            </p>
          </div>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={VIDEO_FILE_CONFIG.acceptAttribute}
            onChange={handleFileInputChange}
            disabled={disabled}
            className={videoUploadStyles.uploadArea.input}
            aria-describedby="file-upload-help"
          />
        </div>
      ) : (
        /* Selected File Preview */
        <div className={videoUploadStyles.filePreview.container}>
          <div className={videoUploadStyles.filePreview.header}>
            <div className={videoUploadStyles.filePreview.info}>
              {/* Video icon */}
              <svg 
                className={videoUploadStyles.filePreview.icon}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                />
              </svg>
              
              <div className={videoUploadStyles.filePreview.details}>
                <p className={videoUploadStyles.filePreview.name}>
                  {videoFile.name}
                </p>
                <p className={videoUploadStyles.filePreview.size}>
                  {FormatFileSize(videoFile.size)}
                </p>
              </div>
            </div>
            
            {/* Remove button */}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className={videoUploadStyles.filePreview.removeButton}
                aria-label={`${VIDEO_MESSAGES.LABELS.REMOVE_FILE} ${videoFile.name}`}
                title={VIDEO_MESSAGES.LABELS.REMOVE_FILE}
              >
                <svg 
                  className="w-5 h-5" 
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
              </button>
            )}
          </div>
          
          {/* Upload Progress */}
          {showProgress && (
            <div className={videoUploadStyles.progressBar.container}>
              <div 
                className={videoUploadStyles.progressBar.track}
                role="progressbar"
                aria-valuenow={uploadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={a11yTokens.ariaLabels.progressBar}
              >
                <div 
                  className={videoUploadStyles.progressBar.fill}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className={videoUploadStyles.progressBar.label}>
                {uploadProgress}{VIDEO_MESSAGES.INFO.FILE_PROGRESS}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Help text */}
      <div id="file-upload-help" className={videoUploadStyles.form.helpText}>
        {VIDEO_MESSAGES.INFO.SUPPORTED_FORMATS}. Tamanho máximo: {VIDEO_HELPERS.formatFileSize(VIDEO_FILE_CONFIG.maxSize)}
      </div>
      
      {/* Error message */}
      {displayError && (
        <div 
          id="file-upload-error"
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
                Erro no arquivo
              </div>
              <div className={videoUploadStyles.alert.description}>
                {displayError}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

VideoUploadFormFileUpload.displayName = 'VideoUploadFormFileUpload'