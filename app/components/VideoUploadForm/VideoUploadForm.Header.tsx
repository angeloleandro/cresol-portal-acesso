/**
 * VideoUploadForm Clean Header Component
 * Ultra-minimalist header design without unnecessary visual elements
 */

import { memo } from 'react'
import { VideoUploadHeaderProps } from './VideoUploadForm.types'

export const VideoUploadFormHeader = memo(({ 
  title, 
  isEditing 
}: VideoUploadHeaderProps) => {
  return (
    <header className="px-6 py-4 border-b border-neutral-200 bg-white flex-shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <h3 
            id="video-upload-title"
            className="text-lg font-medium text-neutral-900"
            role="heading" 
            aria-level={3}
          >
            {title}
          </h3>
        </div>
        
        {/* Minimal status indicator */}
        <div className="text-xs text-neutral-500 px-2 py-1 bg-neutral-50 rounded">
          {isEditing ? 'Editando' : 'Novo'}
        </div>
      </div>
    </header>
  )
})

VideoUploadFormHeader.displayName = 'VideoUploadFormHeader'