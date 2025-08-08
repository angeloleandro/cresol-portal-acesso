/**
 * VideoUploadForm Thumbnail Configuration Component
 * Auto/Custom thumbnail selection with cropper integration
 */

import { memo, useCallback, useState, useRef } from 'react'
import Cropper from 'react-easy-crop'
import OptimizedImage from '../OptimizedImage'
import ThumbnailPreview from '../ThumbnailPreview'
import { ThumbnailConfigProps, CropSettings } from './VideoUploadForm.types'
import { videoUploadStyles } from './VideoUploadForm.styles'
import { a11yTokens } from '@/lib/design-tokens/video-system'
import { getCroppedImg } from '../getCroppedImg'
import { useThumbnailGenerator } from '@/app/hooks/useThumbnailGenerator'

// YouTube thumbnail helper
function getYouTubeThumbnail(url: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null
}

export const VideoUploadFormThumbnailConfig = memo(({ 
  mode,
  onModeChange,
  uploadType,
  videoUrl,
  videoFile,
  thumbnailFile,
  onThumbnailSelect,
  thumbnailPreview,
  showCrop,
  onShowCropChange,
  disabled = false
}: ThumbnailConfigProps) => {
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cropSettings, setCropSettings] = useState<CropSettings>({
    crop: { x: 0, y: 0 },
    zoom: 1,
    rotation: 0,
    aspect: 16 / 9,
  })
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Auto thumbnail generator for direct uploads
  const thumbnailGenerator = useThumbnailGenerator({
    videoFile: uploadType === 'direct' ? videoFile || null : null,
    autoGenerate: uploadType === 'direct' && mode === 'auto'
  })
  
  const handleModeChange = useCallback((newMode: 'auto' | 'custom' | 'none') => {
    if (!disabled) {
      onModeChange(newMode)
      
      // Clear crop state when changing modes
      if (newMode !== 'custom') {
        onShowCropChange(false)
        setOriginalImage(null)
        setCroppedAreaPixels(null)
      }
    }
  }, [disabled, onModeChange, onShowCropChange])
  
  const handleThumbnailFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && !disabled) {
      onThumbnailSelect(file)
      
      // Set up for cropping
      const url = URL.createObjectURL(file)
      setOriginalImage(url)
      onShowCropChange(true)
      
      // Switch to custom mode
      if (mode !== 'custom') {
        onModeChange('custom')
      }
    }
  }, [disabled, onThumbnailSelect, onShowCropChange, mode, onModeChange])
  
  const handleThumbnailClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])
  
  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])
  
  const handleApplyCrop = useCallback(async () => {
    if (!originalImage || !croppedAreaPixels || disabled) return
    
    setIsProcessing(true)
    try {
      const { file, url } = await getCroppedImg(originalImage, croppedAreaPixels, cropSettings.rotation)
      const croppedFile = new File([file], 'cropped-thumb.jpg', { type: 'image/jpeg' })
      
      onThumbnailSelect(croppedFile)
      onShowCropChange(false)
    } catch (error) {
      // Error should be handled by proper error boundary or reporting service
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao recortar imagem:', error)
      }
    } finally {
      setIsProcessing(false)
    }
  }, [originalImage, croppedAreaPixels, cropSettings.rotation, disabled, onThumbnailSelect, onShowCropChange])
  
  const handleCancelCrop = useCallback(() => {
    onShowCropChange(false)
    setOriginalImage(null)
    setCroppedAreaPixels(null)
    setCropSettings({
      crop: { x: 0, y: 0 },
      zoom: 1,
      rotation: 0,
      aspect: 16 / 9,
    })
  }, [onShowCropChange])
  
  const handleManualUpload = useCallback((file: File) => {
    onThumbnailSelect(file)
    onModeChange('custom')
    
    // Set up for cropping
    const url = URL.createObjectURL(file)
    setOriginalImage(url)
    onShowCropChange(true)
  }, [onThumbnailSelect, onModeChange, onShowCropChange])
  
  return (
    <div className={videoUploadStyles.form.section}>
      {/* Label */}
      <label className={videoUploadStyles.form.label}>
        Thumbnail
      </label>
      
      {/* Mode Selection */}
      <fieldset disabled={disabled}>
        <legend className="sr-only">Modo de thumbnail</legend>
        
        <div className={videoUploadStyles.radioGroup.container}>
          <label className={videoUploadStyles.radioGroup.option}>
            <input
              type="radio"
              checked={mode === 'auto'}
              onChange={() => handleModeChange('auto')}
              disabled={disabled}
              className={videoUploadStyles.radioGroup.input}
              aria-describedby="auto-thumb-help"
            />
            <span>
              {uploadType === 'youtube' ? 'Automática (YouTube)' : 'Automática (do vídeo)'}
            </span>
          </label>
          
          <label className={videoUploadStyles.radioGroup.option}>
            <input
              type="radio"
              checked={mode === 'custom'}
              onChange={() => handleModeChange('custom')}
              disabled={disabled}
              className={videoUploadStyles.radioGroup.input}
              aria-describedby="custom-thumb-help"
            />
            <span>Enviar imagem</span>
          </label>
          
          <label className={videoUploadStyles.radioGroup.option}>
            <input
              type="radio"
              checked={mode === 'none'}
              onChange={() => handleModeChange('none')}
              disabled={disabled}
              className={videoUploadStyles.radioGroup.input}
              aria-describedby="no-thumb-help"
            />
            <span>Sem thumbnail</span>
          </label>
        </div>
      </fieldset>
      
      {/* Help text */}
      <div className={videoUploadStyles.form.helpText}>
        <div id="auto-thumb-help" className={mode === 'auto' ? 'block' : 'hidden'}>
          {uploadType === 'youtube' 
            ? 'Será usada a thumbnail padrão do YouTube'
            : 'Thumbnail será gerada automaticamente do vídeo'
          }
        </div>
        <div id="custom-thumb-help" className={mode === 'custom' ? 'block' : 'hidden'}>
          Faça upload de uma imagem personalizada (recomendado: 1280x720px)
        </div>
        <div id="no-thumb-help" className={mode === 'none' ? 'block' : 'hidden'}>
          Nenhuma thumbnail será exibida
        </div>
      </div>
      
      {/* Auto Thumbnail for Direct Upload */}
      {uploadType === 'direct' && mode === 'auto' && videoFile && (
        <div className="mt-4">
          <ThumbnailPreview
            thumbnailResult={thumbnailGenerator.thumbnail}
            videoFile={videoFile}
            onThumbnailChange={() => {}}
            onRegenerateAt={thumbnailGenerator.regenerateAt}
            onManualUpload={handleManualUpload}
            isGenerating={thumbnailGenerator.isGenerating}
            error={thumbnailGenerator.error}
            showFallback={!thumbnailGenerator.isSupported}
          />
          
          {!thumbnailGenerator.isSupported && (
            <div className={videoUploadStyles.alert.warning}>
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
                    Suporte limitado
                  </div>
                  <div className={videoUploadStyles.alert.description}>
                    Seu navegador tem suporte limitado para geração automática. Use o carregamento manual de imagem.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Custom Thumbnail Upload */}
      {mode === 'custom' && (
        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailFileChange}
            disabled={disabled}
            className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover"
            aria-describedby="custom-upload-help"
          />
          
          <div id="custom-upload-help" className={videoUploadStyles.form.helpText}>
            Formatos suportados: JPG, PNG, WebP. Recomendado: 1280x720px (16:9)
          </div>
          
          {/* Cropper */}
          {showCrop && originalImage && (
            <div className={videoUploadStyles.cropper.container}>
              <div className={videoUploadStyles.cropper.viewport}>
                <Cropper
                  image={originalImage}
                  crop={cropSettings.crop}
                  zoom={cropSettings.zoom}
                  rotation={cropSettings.rotation}
                  aspect={cropSettings.aspect}
                  onCropChange={(crop) => setCropSettings(prev => ({ ...prev, crop }))}
                  onZoomChange={(zoom) => setCropSettings(prev => ({ ...prev, zoom }))}
                  onRotationChange={(rotation) => setCropSettings(prev => ({ ...prev, rotation }))}
                  onCropComplete={onCropComplete}
                />
              </div>
              
              <div className={videoUploadStyles.cropper.controls}>
                <div className={videoUploadStyles.cropper.controlGroup}>
                  <label className={videoUploadStyles.cropper.controlLabel}>
                    Zoom:
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={cropSettings.zoom}
                    onChange={(e) => setCropSettings(prev => ({ ...prev, zoom: Number(e.target.value) }))}
                    disabled={disabled}
                    className={videoUploadStyles.cropper.slider}
                    aria-label="Controle de zoom da imagem"
                  />
                </div>
                
                <div className={videoUploadStyles.cropper.controlGroup}>
                  <label className={videoUploadStyles.cropper.controlLabel}>
                    Rotação:
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={cropSettings.rotation}
                    onChange={(e) => setCropSettings(prev => ({ ...prev, rotation: Number(e.target.value) }))}
                    disabled={disabled}
                    className={videoUploadStyles.cropper.slider}
                    aria-label="Controle de rotação da imagem"
                  />
                </div>
              </div>
              
              <div className={videoUploadStyles.cropper.actions}>
                <button
                  type="button"
                  onClick={handleCancelCrop}
                  disabled={disabled || isProcessing}
                  className={videoUploadStyles.button.secondary}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  disabled={disabled || isProcessing}
                  className={videoUploadStyles.button.primary}
                >
                  {isProcessing ? (
                    <div className={videoUploadStyles.loading.container}>
                      <div className={videoUploadStyles.loading.spinner} />
                      <span>Processando...</span>
                    </div>
                  ) : (
                    'Aplicar'
                  )}
                </button>
              </div>
            </div>
          )}
          
          {/* Thumbnail Preview */}
          {thumbnailPreview && !showCrop && (
            <div className="mt-4">
              <div className={videoUploadStyles.thumbnail.container}>
                <OptimizedImage
                  src={thumbnailPreview}
                  alt="Preview da thumbnail personalizada"
                  fill
                  className={videoUploadStyles.thumbnail.image}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={80}
                  fallbackText="Preview"
                />
              </div>
              
              <button
                type="button"
                onClick={handleThumbnailClick}
                disabled={disabled}
                className={`${videoUploadStyles.button.ghost} mt-2`}
              >
                Alterar imagem
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Auto Thumbnail for YouTube */}
      {mode === 'auto' && uploadType === 'youtube' && videoUrl && getYouTubeThumbnail(videoUrl) && (
        <div className="mt-4">
          <div className={videoUploadStyles.thumbnail.container}>
            <OptimizedImage
              src={getYouTubeThumbnail(videoUrl)!}
              alt="Thumbnail automática do YouTube"
              fill
              className={videoUploadStyles.thumbnail.image}
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={80}
              fallbackText="Thumbnail YouTube"
            />
          </div>
          
          <div className={videoUploadStyles.form.helpText}>
            Thumbnail oficial do YouTube será usada automaticamente
          </div>
        </div>
      )}
    </div>
  )
})

VideoUploadFormThumbnailConfig.displayName = 'VideoUploadFormThumbnailConfig'