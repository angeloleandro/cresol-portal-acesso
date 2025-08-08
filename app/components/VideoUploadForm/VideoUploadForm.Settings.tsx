/**
 * VideoUploadForm Settings Component
 * Active status and order configuration
 */

import { memo, useCallback } from 'react'
import { VideoSettingsProps } from './VideoUploadForm.types'
import { videoUploadStyles } from './VideoUploadForm.styles'

export const VideoUploadFormSettings = memo(({ 
  isActive,
  orderIndex,
  onActiveChange,
  onOrderChange,
  disabled = false
}: VideoSettingsProps) => {
  
  const handleActiveChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onActiveChange(e.target.checked)
    }
  }, [disabled, onActiveChange])
  
  const handleOrderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      const value = Math.max(0, Number(e.target.value))
      onOrderChange(value)
    }
  }, [disabled, onOrderChange])
  
  return (
    <div className={videoUploadStyles.form.fieldGroup}>
      {/* Active Checkbox */}
      <div className={videoUploadStyles.checkbox.container}>
        <input
          id="video-active-checkbox"
          type="checkbox"
          checked={isActive}
          onChange={handleActiveChange}
          disabled={disabled}
          className={videoUploadStyles.checkbox.input}
          aria-describedby="active-help"
        />
        <label 
          htmlFor="video-active-checkbox"
          className={videoUploadStyles.checkbox.label}
        >
          Ativo
        </label>
      </div>
      
      {/* Order Input */}
      <div className="flex items-center gap-2">
        <label 
          htmlFor="video-order-input"
          className={videoUploadStyles.form.label}
        >
          Ordem:
        </label>
        <input
          id="video-order-input"
          type="number"
          min="0"
          step="1"
          value={orderIndex}
          onChange={handleOrderChange}
          disabled={disabled}
          className={`${videoUploadStyles.input.base} w-20 text-center`}
          aria-describedby="order-help"
          aria-label="Número da ordem de exibição"
        />
      </div>
      
      {/* Help text */}
      <div className={videoUploadStyles.form.helpText}>
        <div id="active-help" className="mb-1">
          {isActive ? 'Vídeo será exibido publicamente' : 'Vídeo ficará oculto'}
        </div>
        <div id="order-help">
          Ordem de exibição (0 = primeiro)
        </div>
      </div>
    </div>
  )
})

VideoUploadFormSettings.displayName = 'VideoUploadFormSettings'