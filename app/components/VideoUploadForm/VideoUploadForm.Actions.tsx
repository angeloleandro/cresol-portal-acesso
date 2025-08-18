/**
 * VideoUploadForm Clean Actions Component
 * Minimalist button design with neutral colors and simple loading states
 */

import { memo, useCallback } from 'react'
import { VideoActionsProps } from './VideoUploadForm.types'
import { CRESOL_UI_CONFIG } from '@/lib/design-tokens'

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
    <div className="flex gap-3 justify-end px-6 py-4 border-t border-neutral-200 bg-neutral-50/50 flex-shrink-0">
      {/* Cancel Button */}
      <button
        type="button"
        onClick={handleCancel}
        disabled={disabled || isUploading}
        className="
          px-4 py-2 border border-neutral-300 bg-white text-neutral-700 rounded-lg
          text-sm font-medium hover:bg-neutral-50 hover:border-neutral-400
          focus:outline-none focus:ring-2 focus:ring-neutral-500/20
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200
        "
        aria-label="Cancelar operação"
      >
        Cancelar
      </button>
      
      {/* Save Button */}
      <button
        type="submit"
        onClick={handleSave}
        disabled={buttonDisabled}
        className="
          px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium
          hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500/20
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200 flex items-center gap-2
        "
        aria-label={isLoading ? 'Operação em andamento' : 'Salvar vídeo'}
        aria-describedby={!canSave ? 'save-button-help' : undefined}
      >
        {/* Loading spinner */}
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" aria-hidden="true"></div>
        )}
        
        {/* Button text */}
        <span>
          {isUploading 
            ? 'Salvando...' 
            : isProcessing 
              ? 'Processando...' 
              : 'Salvar'
          }
        </span>
        
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
        <div id="save-button-help" className="text-xs text-neutral-500 mt-1">
          Preencha todos os campos obrigatórios
        </div>
      )}
    </div>
  )
})

VideoUploadFormActions.displayName = 'VideoUploadFormActions'