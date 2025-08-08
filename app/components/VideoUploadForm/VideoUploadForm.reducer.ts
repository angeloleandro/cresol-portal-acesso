/**
 * VideoUploadForm State Reducer
 * Centralized state management using useReducer pattern
 */

import { VideoUploadState, VideoUploadAction, VideoUploadFormData } from './VideoUploadForm.types'

export const initialVideoUploadState: VideoUploadState = {
  formData: {
    title: '',
    video_url: '',
    thumbnail_url: '',
    is_active: true,
    order_index: 0,
    upload_type: 'youtube',
    videoFile: null,
    thumbnailFile: null,
  },
  uploadStatus: 'idle',
  uploadProgress: 0,
  dragActive: false,
  showThumbnailCrop: false,
  thumbnailMode: 'auto',
  errors: {},
  fieldErrors: {},
}

export function videoUploadReducer(
  state: VideoUploadState,
  action: VideoUploadAction
): VideoUploadState {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
      }
    
    case 'SET_UPLOAD_STATUS':
      return {
        ...state,
        uploadStatus: action.payload,
      }
    
    case 'SET_UPLOAD_PROGRESS':
      return {
        ...state,
        uploadProgress: action.payload,
      }
    
    case 'SET_DRAG_ACTIVE':
      return {
        ...state,
        dragActive: action.payload,
      }
    
    case 'SET_THUMBNAIL_MODE':
      return {
        ...state,
        thumbnailMode: action.payload,
        // Clear existing thumbnail data when switching modes
        formData: {
          ...state.formData,
          thumbnailFile: action.payload === 'custom' ? state.formData.thumbnailFile : null,
        },
      }
    
    case 'SET_SHOW_THUMBNAIL_CROP':
      return {
        ...state,
        showThumbnailCrop: action.payload,
      }
    
    case 'SET_ERROR':
      const { field, message } = action.payload
      if (field) {
        return {
          ...state,
          fieldErrors: {
            ...state.fieldErrors,
            [field]: [message],
          },
        }
      }
      return {
        ...state,
        errors: {
          ...state.errors,
          general: message,
        },
      }
    
    case 'SET_FIELD_ERROR':
      return {
        ...state,
        fieldErrors: {
          ...state.fieldErrors,
          [action.payload.field]: action.payload.errors,
        },
      }
    
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {},
        fieldErrors: {},
      }
    
    case 'CLEAR_FIELD_ERROR':
      const { [action.payload]: _, ...restFieldErrors } = state.fieldErrors
      return {
        ...state,
        fieldErrors: restFieldErrors,
      }
    
    case 'RESET_FORM':
      return {
        ...initialVideoUploadState,
        formData: {
          ...initialVideoUploadState.formData,
          upload_type: state.formData.upload_type, // Preserve upload type
        },
      }
    
    default:
      return state
  }
}

// Selector functions for computed state
export const videoUploadSelectors = {
  hasErrors: (state: VideoUploadState): boolean => {
    return Object.keys(state.errors).length > 0 || Object.keys(state.fieldErrors).length > 0
  },
  
  isUploading: (state: VideoUploadState): boolean => {
    return state.uploadStatus === 'uploading' || state.uploadStatus === 'processing'
  },
  
  canSave: (state: VideoUploadState): boolean => {
    const { formData, uploadStatus } = state
    
    // Can't save while uploading
    if (uploadStatus === 'uploading' || uploadStatus === 'processing') {
      return false
    }
    
    // Must have title
    if (!formData.title.trim()) {
      return false
    }
    
    // YouTube type must have URL
    if (formData.upload_type === 'youtube' && !formData.video_url.trim()) {
      return false
    }
    
    // Direct upload must have file (for new uploads) or existing video
    if (formData.upload_type === 'direct' && !formData.videoFile && !formData.id) {
      return false
    }
    
    return true
  },
  
  getErrorsForField: (state: VideoUploadState, field: string): string[] => {
    return state.fieldErrors[field] || []
  },
  
  getGeneralError: (state: VideoUploadState): string | null => {
    return state.errors.general || null
  },
}

// Action creators for type safety
export const videoUploadActions = {
  setFormData: (payload: Partial<VideoUploadFormData>): VideoUploadAction => ({
    type: 'SET_FORM_DATA',
    payload,
  }),
  
  setUploadStatus: (payload: VideoUploadState['uploadStatus']): VideoUploadAction => ({
    type: 'SET_UPLOAD_STATUS',
    payload,
  }),
  
  setUploadProgress: (payload: number): VideoUploadAction => ({
    type: 'SET_UPLOAD_PROGRESS',
    payload,
  }),
  
  setDragActive: (payload: boolean): VideoUploadAction => ({
    type: 'SET_DRAG_ACTIVE',
    payload,
  }),
  
  setThumbnailMode: (payload: VideoUploadState['thumbnailMode']): VideoUploadAction => ({
    type: 'SET_THUMBNAIL_MODE',
    payload,
  }),
  
  setShowThumbnailCrop: (payload: boolean): VideoUploadAction => ({
    type: 'SET_SHOW_THUMBNAIL_CROP',
    payload,
  }),
  
  setError: (field: string | undefined, message: string): VideoUploadAction => ({
    type: 'SET_ERROR',
    payload: { field, message },
  }),
  
  setFieldError: (field: string, errors: string[]): VideoUploadAction => ({
    type: 'SET_FIELD_ERROR',
    payload: { field, errors },
  }),
  
  clearErrors: (): VideoUploadAction => ({
    type: 'CLEAR_ERRORS',
  }),
  
  clearFieldError: (field: string): VideoUploadAction => ({
    type: 'CLEAR_FIELD_ERROR',
    payload: field,
  }),
  
  resetForm: (): VideoUploadAction => ({
    type: 'RESET_FORM',
  }),
}