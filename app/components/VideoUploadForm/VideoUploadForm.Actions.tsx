/**
 * VideoUploadForm Actions Component
 * Save and Cancel buttons with loading states
 */

import { memo, useCallback } from 'react'
import { VideoActionsProps } from './VideoUploadForm.types'
import { videoUploadStyles } from './VideoUploadForm.styles'

export const VideoUploadFormActions = memo(({ 
  onSave,
  onCancel,
  isUploading,
  isProcessing,
  canSave,
  disabled = false
}: VideoActionsProps) => {
  
  const handleSave = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!disabled && canSave && !isUploading && !isProcessing) {
      onSave()
    }
  }, [disabled, canSave, isUploading, isProcessing, onSave])
  
  const handleCancel = useCallback(() => {
    if (!disabled && !isUploading) {
      onCancel()
    }
  }, [disabled, isUploading, onCancel])
  
  const isLoading = isUploading || isProcessing
  const buttonDisabled = disabled || !canSave || isLoading
  
  return (
    <div className={videoUploadStyles.actions.container}>
      {/* Cancel Button */}
      <button
        type="button"
        onClick={handleCancel}
        disabled={disabled || isUploading}
        className={videoUploadStyles.button.secondary}
        aria-label="Cancelar operação"
      >
        Cancelar
      </button>
      
      {/* Save Button */}
      <button
        type="submit"
        onClick={handleSave}
        disabled={buttonDisabled}
        className={videoUploadStyles.button.primary}
        aria-label={isLoading ? 'Operação em andamento' : 'Salvar vídeo'}
        aria-describedby={!canSave ? 'save-button-help' : undefined}
      >
        <div className={videoUploadStyles.loading.container}>
          {/* Loading spinner */}
          {isLoading && (
            <div className={videoUploadStyles.loading.spinner} aria-hidden="true" />
          )}
          
          {/* Button text */}
          <span>
            {isUploading 
              ? 'Salvando...' 
              : isProcessing 
                ? 'Processando...' 
                : 'Salvar Vídeo'
            }
          </span>
        </div>
        
        {/* Screen reader status */}
        {isLoading && (
          <span className="sr-only" aria-live="polite">
            {isUploading 
              ? 'Upload em andamento, aguarde'
              : 'Processamento em andamento, aguarde'
            }
          </span>
        )}
      </button>
      
      {/* Help text for disabled save button */}
      {!canSave && !isLoading && (
        <div id="save-button-help" className={videoUploadStyles.form.helpText}>
          Preencha todos os campos obrigatórios para salvar
        </div>
      )}
    </div>
  )
})

VideoUploadFormActions.displayName = 'VideoUploadFormActions'