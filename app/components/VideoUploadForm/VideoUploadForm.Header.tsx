/**
 * VideoUploadForm Header Component
 * Enterprise-grade header with accessibility and responsive design
 */

import { memo } from 'react'
import { VideoUploadHeaderProps } from './VideoUploadForm.types'
import { videoUploadStyles } from './VideoUploadForm.styles'
import { a11yTokens } from '@/lib/design-tokens/video-system'

export const VideoUploadFormHeader = memo(({ 
  title, 
  isEditing 
}: VideoUploadHeaderProps) => {
  return (
    <header className={videoUploadStyles.header.title}>
      <h3 
        id="video-upload-title"
        className="flex items-center gap-2"
        role="heading" 
        aria-level={3}
      >
        {/* Icon based on editing state */}
        {isEditing ? (
          <svg 
            className="w-5 h-5 text-primary flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
            />
          </svg>
        ) : (
          <svg 
            className="w-5 h-5 text-primary flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
        )}
        
        <span className="min-w-0">
          {title}
        </span>
        
        {/* Status indicator for screen readers */}
        <span className={a11yTokens.screenReader.hide}>
          {isEditing ? 'Modo de edição' : 'Novo vídeo'}
        </span>
      </h3>
      
      {/* Optional subtitle */}
      <p className={videoUploadStyles.header.subtitle}>
        {isEditing 
          ? 'Edite as informações do vídeo abaixo'
          : 'Preencha as informações para adicionar um novo vídeo'
        }
      </p>
    </header>
  )
})

VideoUploadFormHeader.displayName = 'VideoUploadFormHeader'