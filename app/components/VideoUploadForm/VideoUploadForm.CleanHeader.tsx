/**
 * VideoUploadForm Clean Header Component
 * Redesigned for minimal visual noise and clear hierarchy
 */

import { memo } from 'react'
import { VideoUploadHeaderProps } from './VideoUploadForm.types'
import { Icon } from '../icons/Icon'

export const VideoUploadFormCleanHeader = memo(({ 
  title, 
  isEditing 
}: VideoUploadHeaderProps) => {
  return (
    <header className="mb-8 pb-6 border-b border-neutral-100">
      <div className="flex items-center gap-3 mb-2">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center 
          ${isEditing ? 'bg-amber-50 text-amber-600' : 'bg-primary/10 text-primary'}
        `}>
          <Icon 
            name={isEditing ? "pencil" : "plus"} 
            className="w-5 h-5" 
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            {title}
          </h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            {isEditing 
              ? 'Atualize as informações do vídeo'
              : 'Adicione um novo vídeo ao sistema'
            }
          </p>
        </div>
      </div>
    </header>
  )
})

VideoUploadFormCleanHeader.displayName = 'VideoUploadFormCleanHeader'