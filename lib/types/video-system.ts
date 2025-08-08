/**
 * Video System TypeScript Interfaces
 * Enterprise-grade type definitions for video upload system
 */

export interface VideoUploadFormData {
  id?: string
  title: string
  video_url: string
  thumbnail_url?: string
  thumbnail_timestamp?: number
  is_active: boolean
  order_index: number
  upload_type: 'youtube' | 'direct'
  file_size?: number
  original_filename?: string
  videoFile: File | null
  thumbnailFile: File | null
}

export interface VideoUploadState {
  // Form data
  formData: VideoUploadFormData
  
  // Upload states  
  uploadStatus: 'idle' | 'uploading' | 'processing' | 'success' | 'error'
  uploadProgress: number
  
  // UI states
  dragActive: boolean
  showThumbnailCrop: boolean
  thumbnailMode: 'auto' | 'custom' | 'none'
  
  // Error states
  errors: Record<string, string>
  fieldErrors: Record<string, string[]>
}

export type VideoUploadAction = 
  | { type: 'SET_FORM_DATA'; payload: Partial<VideoUploadFormData> }
  | { type: 'SET_UPLOAD_STATUS'; payload: VideoUploadState['uploadStatus'] }
  | { type: 'SET_UPLOAD_PROGRESS'; payload: number }
  | { type: 'SET_DRAG_ACTIVE'; payload: boolean }
  | { type: 'SET_THUMBNAIL_MODE'; payload: VideoUploadState['thumbnailMode'] }
  | { type: 'SET_SHOW_THUMBNAIL_CROP'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { field?: string; message: string } }
  | { type: 'SET_FIELD_ERROR'; payload: { field: string; errors: string[] } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'CLEAR_FIELD_ERROR'; payload: string }
  | { type: 'RESET_FORM' }

export interface VideoFormProps {
  initialData?: Partial<VideoUploadFormData>
  onSave: () => void
  onCancel: () => void
}

export interface ValidationResult {
  valid: boolean
  error?: string
  errors?: Record<string, string[]>
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface VideoSystemError extends Error {
  code: string
  details?: Record<string, any>
  timestamp?: Date
}

// Component-specific props interfaces
export interface VideoUploadHeaderProps {
  title: string
  isEditing: boolean
}

export interface VideoTypeSelectProps {
  uploadType: 'youtube' | 'direct'
  onChange: (type: 'youtube' | 'direct') => void
  disabled?: boolean
}

export interface YouTubeInputProps {
  value: string
  onChange: (url: string) => void
  error?: string
  disabled?: boolean
}

export interface FileUploadProps {
  videoFile: File | null
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  dragActive: boolean
  onDragStateChange: (active: boolean) => void
  uploadProgress?: number
  error?: string
  disabled?: boolean
  existingVideoInfo?: {
    filename?: string
    fileSize?: number
  }
}

export interface ThumbnailConfigProps {
  mode: 'auto' | 'custom' | 'none'
  onModeChange: (mode: 'auto' | 'custom' | 'none') => void
  uploadType: 'youtube' | 'direct'
  videoUrl?: string
  videoFile?: File | null
  thumbnailFile?: File | null
  onThumbnailSelect: (file: File) => void
  thumbnailPreview?: string | null
  showCrop: boolean
  onShowCropChange: (show: boolean) => void
  disabled?: boolean
  onTimestampChange?: (timestamp: number) => void
}

export interface VideoSettingsProps {
  isActive: boolean
  orderIndex: number
  onActiveChange: (active: boolean) => void
  onOrderChange: (order: number) => void
  disabled?: boolean
}

export interface VideoActionsProps {
  onSave: () => void
  onCancel: () => void
  isUploading: boolean
  isProcessing: boolean
  canSave: boolean
  disabled?: boolean
}

// Thumbnail generator interfaces
export interface ThumbnailResult {
  blob: Blob
  url: string
  timestamp: number
}

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export interface CropSettings {
  crop: { x: number; y: number }
  zoom: number
  rotation: number
  aspect: number
}