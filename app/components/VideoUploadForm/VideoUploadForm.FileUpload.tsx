/**
 * VideoUploadForm File Upload Component
 * Drag & drop area with progress and existing file info
 */

import { memo, useCallback, useRef, useState } from 'react'
import { FileUploadProps } from './VideoUploadForm.types'
import { videoUploadStyles } from './VideoUploadForm.styles'
import { a11yTokens } from '@/lib/design-tokens/video-system'
import { formatFileSize, isValidVideoMimeType } from '@/lib/video-utils'
import { VIDEO_CONFIG } from '@/lib/constants'

// File validation function
function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
  
  if (!isValidVideoMimeType(file.type) && !VIDEO_CONFIG.ALLOWED_EXTENSIONS.includes(fileExt as any)) {
    return { 
      valid: false, 
      error: 'Formato não suportado. Use MP4, WebM, MOV ou AVI.' 
    }
  }
  
  if (file.size > VIDEO_CONFIG.MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `Arquivo muito grande. Máximo: ${formatFileSize(VIDEO_CONFIG.MAX_FILE_SIZE)}` 
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
  
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateVideoFile(file)
      if (!validation.valid) {
        setLocalError(validation.error || 'Arquivo inválido')
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
        setLocalError(validation.error || 'Arquivo inválido')
        return
      }
      
      setLocalError(null)
      onFileSelect(videoFile)
    } else {
      setLocalError('Por favor, selecione um arquivo de vídeo válido')
    }
  }, [disabled, onDragStateChange, onFileSelect])
  
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])
  
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
        Arquivo de Vídeo
        <span className={videoUploadStyles.form.required} aria-label="obrigatório">
          *
        </span>
      </label>
      
      {/* Existing video info */}
      {existingVideoInfo && !videoFile && (
        <div className="mb-4 p-3 bg-gray-50 border rounded-md">
          <div className="text-sm font-medium text-gray-900 mb-1">
            Arquivo Atual
          </div>
          {existingVideoInfo.filename && (
            <div className="text-sm text-gray-700 truncate">
              {existingVideoInfo.filename}
            </div>
          )}
          {existingVideoInfo.fileSize && (
            <div className="text-xs text-gray-500 mb-2">
              {formatFileSize(existingVideoInfo.fileSize)}
            </div>
          )}
          <div className="text-xs text-gray-600">
            Deixe vazio para manter atual ou selecione novo arquivo para substituir.
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
                ? 'Substituir vídeo atual (opcional)' 
                : 'Arraste o arquivo aqui ou'
              }{' '}
              <span className={videoUploadStyles.uploadArea.highlight}>
                clique para selecionar
              </span>
            </p>
            
            {/* Help text */}
            <p className={videoUploadStyles.uploadArea.helpText}>
              MP4, WebM, MOV, AVI • Máximo: {formatFileSize(VIDEO_CONFIG.MAX_FILE_SIZE)}
            </p>
          </div>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.webm,.mov,.avi"
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
                  {formatFileSize(videoFile.size)}
                </p>
              </div>
            </div>
            
            {/* Remove button */}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className={videoUploadStyles.filePreview.removeButton}
                aria-label={`Remover arquivo ${videoFile.name}`}
                title="Remover arquivo"
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
                {uploadProgress}% enviado
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Help text */}
      <div id="file-upload-help" className={videoUploadStyles.form.helpText}>
        Formatos suportados: MP4, WebM, MOV, AVI. Tamanho máximo: {formatFileSize(VIDEO_CONFIG.MAX_FILE_SIZE)}
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