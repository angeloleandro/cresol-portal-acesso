/**
 * VideoUploadForm Clean Settings Component
 * Minimalist active status and order configuration
 */

import { memo, useCallback } from 'react'
import { VideoSettingsProps } from './VideoUploadForm.types'
import { VIDEO_UI_CLASSES } from '@/lib/constants/video-ui'

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
    <div className={VIDEO_UI_CLASSES.GRID.TWO_COLUMN}>
      {/* Active Checkbox */}
      <div className={VIDEO_UI_CLASSES.FLEX.ITEMS_CENTER}>
        <input
          id="video-active-checkbox"
          type="checkbox"
          checked={isActive}
          onChange={handleActiveChange}
          disabled={disabled}
          className="
            w-4 h-4 text-neutral-600 border-neutral-300 rounded 
            focus:ring-2 focus:ring-neutral-500/20
            disabled:opacity-60 disabled:cursor-not-allowed
          "
          aria-describedby="active-help"
        />
        <label 
          htmlFor="video-active-checkbox"
          className={VIDEO_UI_CLASSES.TEXT.LABEL_CLICKABLE}
        >
          Vídeo ativo
        </label>
      </div>
      
      {/* Order Input */}
      <div className={VIDEO_UI_CLASSES.FLEX.ITEMS_CENTER}>
        <label 
          htmlFor="video-order-input"
          className={VIDEO_UI_CLASSES.TEXT.LABEL}
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
          className="
            w-20 border border-neutral-300 rounded-lg px-3 py-2 text-sm text-center
            bg-white focus:outline-none focus:ring-2 focus:ring-neutral-500/20 
            focus:border-neutral-500 hover:border-neutral-400 transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-50
          "
          aria-describedby="order-help"
          aria-label="Número da ordem de exibição"
        />
      </div>
      
      {/* Help text */}
      <div className={VIDEO_UI_CLASSES.CONTAINERS.HELP_SPAN}>
        <div id="active-help" className="mb-1">
          {isActive ? 'Vídeo público' : 'Vídeo oculto'}
        </div>
        <div id="order-help">
          Ordem de exibição (0 = primeiro)
        </div>
      </div>
    </div>
  )
})

VideoUploadFormSettings.displayName = 'VideoUploadFormSettings'