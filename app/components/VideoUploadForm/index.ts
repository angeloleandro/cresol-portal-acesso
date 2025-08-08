/**
 * VideoUploadForm Component Export
 * Modular video upload form with enterprise-grade architecture
 */

export { VideoUploadFormRoot as VideoUploadForm } from './VideoUploadForm.Root'

// Export individual components for advanced usage
export { VideoUploadFormHeader } from './VideoUploadForm.Header'
export { VideoUploadFormTypeSelect } from './VideoUploadForm.TypeSelect'
export { VideoUploadFormYouTubeInput } from './VideoUploadForm.YouTubeInput'
export { VideoUploadFormFileUpload } from './VideoUploadForm.FileUpload'
export { VideoUploadFormThumbnailConfig } from './VideoUploadForm.ThumbnailConfig'
export { VideoUploadFormSettings } from './VideoUploadForm.Settings'
export { VideoUploadFormActions } from './VideoUploadForm.Actions'

// Export types and utilities
export * from './VideoUploadForm.types'
export { videoUploadStyles } from './VideoUploadForm.styles'
export { 
  videoUploadReducer, 
  videoUploadSelectors, 
  videoUploadActions 
} from './VideoUploadForm.reducer'