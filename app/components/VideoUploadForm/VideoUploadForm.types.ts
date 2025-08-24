

export * from '@/lib/types/video-system'

// Additional local component interfaces
export interface VideoUploadFormInternalState {
  // Cropper state
  crop: { x: number; y: number }
  zoom: number
  rotation: number
  croppedAreaPixels: any
  originalImage: string | null
  
  // Internal flags
  useCustomThumb: boolean
  thumbnailPreview: string | null
}