/**
 * VideoUploadForm Root Component
 * Enterprise-grade video upload form with modular architecture
 */

"use client";

import { useReducer, useCallback, useEffect, useMemo, memo } from 'react'
import type { VideoFormProps, VideoUploadFormInternalState } from './VideoUploadForm.types'
import { 
  videoUploadReducer, 
  initialVideoUploadState, 
  videoUploadSelectors, 
  videoUploadActions 
} from './VideoUploadForm.reducer'
import { videoUploadStyles } from './VideoUploadForm.styles'

// Import subcomponents
import { VideoUploadFormHeader } from './VideoUploadForm.Header'
import { VideoUploadFormTypeSelect } from './VideoUploadForm.TypeSelect'
import { VideoUploadFormYouTubeInput } from './VideoUploadForm.YouTubeInput'
import { VideoUploadFormFileUpload } from './VideoUploadForm.FileUpload'
import { VideoUploadFormThumbnailConfig } from './VideoUploadForm.ThumbnailConfig'
import { VideoUploadFormSettings } from './VideoUploadForm.Settings'
import { VideoUploadFormActions } from './VideoUploadForm.Actions'

// API functions
import { supabase } from '@/lib/supabase'
import { getAuthenticatedSession, makeAuthenticatedRequest } from '@/lib/video-utils'

export const VideoUploadFormRoot = memo(({ 
  initialData, 
  onSave, 
  onCancel 
}: VideoFormProps) => {
  
  // State management with useReducer
  const [state, dispatch] = useReducer(videoUploadReducer, initialVideoUploadState)
  
  // Internal cropper state (not in main reducer to keep it simple)
  const [internalState, setInternalState] = useReducer(
    (prevState: VideoUploadFormInternalState, updates: Partial<VideoUploadFormInternalState>) => ({
      ...prevState,
      ...updates
    }),
    {
      crop: { x: 0, y: 0 },
      zoom: 1,
      rotation: 0,
      croppedAreaPixels: null,
      originalImage: null,
      useCustomThumb: false,
      thumbnailPreview: initialData?.thumbnail_url || null,
    }
  )
  
  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      dispatch(videoUploadActions.setFormData({
        id: initialData.id,
        title: initialData.title || '',
        video_url: initialData.video_url || '',
        thumbnail_url: initialData.thumbnail_url,
        is_active: initialData.is_active ?? true,
        order_index: initialData.order_index || 0,
        upload_type: initialData.upload_type || 'youtube',
        file_size: initialData.file_size,
        original_filename: initialData.original_filename,
      }))
      
      // Set thumbnail mode based on existing data
      const thumbnailMode = initialData.thumbnail_url ? 'custom' : 'auto'
      dispatch(videoUploadActions.setThumbnailMode(thumbnailMode))
      
      // Update internal thumbnail preview
      setInternalState({
        thumbnailPreview: initialData.thumbnail_url || null
      })
    }
  }, [initialData])
  
  // YouTube thumbnail helper
  const getYouTubeThumbnail = useCallback((url: string): string | null => {
    if (!url) return null
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null
  }, [])
  
  // Memoized selectors
  const hasErrors = useMemo(() => videoUploadSelectors.hasErrors(state), [state])
  const isUploading = useMemo(() => videoUploadSelectors.isUploading(state), [state])
  const canSave = useMemo(() => videoUploadSelectors.canSave(state), [state])
  const generalError = useMemo(() => videoUploadSelectors.getGeneralError(state), [state])
  
  
  // Form handlers
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(videoUploadActions.setFormData({ title: e.target.value }))
    dispatch(videoUploadActions.clearFieldError('title'))
  }, [])
  
  const handleUploadTypeChange = useCallback((type: 'youtube' | 'direct') => {
    dispatch(videoUploadActions.setFormData({ 
      upload_type: type,
      video_url: '',
      videoFile: null,
      thumbnailFile: null,
    }))
    dispatch(videoUploadActions.setThumbnailMode(type === 'youtube' ? 'auto' : 'auto'))
    dispatch(videoUploadActions.clearErrors())
    
    // Reset internal state
    setInternalState({
      thumbnailPreview: null,
      useCustomThumb: false,
      originalImage: null,
    })
  }, [])
  
  const handleVideoUrlChange = useCallback((url: string) => {
    dispatch(videoUploadActions.setFormData({ video_url: url }))
    dispatch(videoUploadActions.clearFieldError('video_url'))
  }, [])
  
  const handleFileSelect = useCallback((file: File) => {
    dispatch(videoUploadActions.setFormData({ videoFile: file }))
    dispatch(videoUploadActions.clearFieldError('videoFile'))
  }, [])
  
  const handleFileRemove = useCallback(() => {
    dispatch(videoUploadActions.setFormData({ videoFile: null }))
    dispatch(videoUploadActions.setUploadProgress(0))
  }, [])
  
  const handleDragStateChange = useCallback((active: boolean) => {
    dispatch(videoUploadActions.setDragActive(active))
  }, [])
  
  const handleThumbnailModeChange = useCallback((mode: 'auto' | 'custom' | 'none') => {
    dispatch(videoUploadActions.setThumbnailMode(mode))
    
    if (mode !== 'custom') {
      setInternalState({
        thumbnailPreview: mode === 'auto' && state.formData.upload_type === 'youtube' 
          ? getYouTubeThumbnail(state.formData.video_url) 
          : null,
        useCustomThumb: false,
      })
      dispatch(videoUploadActions.setFormData({ thumbnailFile: null }))
    }
  }, [state.formData.upload_type, state.formData.video_url, getYouTubeThumbnail])
  
  const handleThumbnailSelect = useCallback((file: File) => {
    dispatch(videoUploadActions.setFormData({ thumbnailFile: file }))
    setInternalState({
      thumbnailPreview: URL.createObjectURL(file),
      useCustomThumb: true,
    })
  }, [])
  
  const handleShowCropChange = useCallback((show: boolean) => {
    dispatch(videoUploadActions.setShowThumbnailCrop(show))
    
    if (!show) {
      setInternalState({
        originalImage: null,
        crop: { x: 0, y: 0 },
        zoom: 1,
        rotation: 0,
        croppedAreaPixels: null,
      })
    }
  }, [])
  
  const handleActiveChange = useCallback((active: boolean) => {
    dispatch(videoUploadActions.setFormData({ is_active: active }))
  }, [])
  
  const handleOrderChange = useCallback((order: number) => {
    dispatch(videoUploadActions.setFormData({ order_index: order }))
  }, [])
  
  // Upload video file
  const uploadVideoFile = useCallback(async (file: File): Promise<{ id: string; url: string }> => {
    const formData = new FormData()
    formData.append('video', file)
    formData.append('title', state.formData.title)
    formData.append('isActive', state.formData.is_active.toString())
    formData.append('orderIndex', state.formData.order_index.toString())

    const session = await getAuthenticatedSession()
    
    const response = await fetch('/api/videos/simple-upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Erro ao fazer upload')
    }

    const result = await response.json()
    return {
      id: result.video.id,
      url: result.video.url
    }
  }, [state.formData.title, state.formData.is_active, state.formData.order_index])
  
  // Upload thumbnail helper
  const uploadThumbnail = useCallback(async (videoId?: string): Promise<string> => {
    if (!state.formData.thumbnailFile) return ''
    
    const fileExt = state.formData.thumbnailFile.name.split('.').pop()
    const fileName = `video-thumb-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`
    
    const { error: uploadError } = await supabase.storage
      .from('banners')
      .upload(filePath, state.formData.thumbnailFile, { upsert: true })
    
    if (uploadError) throw uploadError
    
    const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(filePath)
    
    // Update video record with thumbnail if videoId provided
    if (videoId) {
      await supabase
        .from('dashboard_videos')
        .update({ thumbnail_url: publicUrl })
        .eq('id', videoId)
    }
    
    return publicUrl
  }, [state.formData.thumbnailFile])
  
  // Main form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    
    dispatch(videoUploadActions.clearErrors())
    dispatch(videoUploadActions.setUploadStatus('uploading'))
    dispatch(videoUploadActions.setUploadProgress(0))

    try {
      let videoId: string
      let finalVideoUrl: string

      if (state.formData.upload_type === 'direct') {
        if (state.formData.videoFile) {
          // Upload new video file
          const uploadResult = await uploadVideoFile(state.formData.videoFile)
          videoId = uploadResult.id
          finalVideoUrl = uploadResult.url
          
          // Handle thumbnail for new direct uploads
          if (state.thumbnailMode === 'custom' && state.formData.thumbnailFile) {
            await uploadThumbnail(videoId)
          }
        } else if (initialData?.id && initialData?.upload_type === 'direct') {
          // Editing existing direct upload without changing the video file
          videoId = initialData.id
          finalVideoUrl = initialData.video_url || ''
          
          // Handle thumbnail updates for existing direct uploads
          let thumbUrl = initialData.thumbnail_url || ""
          if (state.thumbnailMode === 'custom' && state.formData.thumbnailFile) {
            thumbUrl = await uploadThumbnail()
          }
          
          const response = await makeAuthenticatedRequest('/api/admin/videos', {
            method: 'PUT',
            body: JSON.stringify({
              id: initialData.id,
              title: state.formData.title, 
              video_url: finalVideoUrl,
              is_active: state.formData.is_active, 
              order_index: state.formData.order_index, 
              thumbnail_url: thumbUrl,
              upload_type: 'direct'
            })
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Erro ao atualizar vídeo')
          }
        } else {
          throw new Error('Arquivo de vídeo é obrigatório para upload direto')
        }
        
      } else if (state.formData.upload_type === 'youtube' && state.formData.video_url) {
        
        // Handle YouTube video
        let thumbUrl = initialData?.thumbnail_url || ""

        // Handle thumbnail upload
        if (state.thumbnailMode === 'custom' && state.formData.thumbnailFile) {
          thumbUrl = await uploadThumbnail()
        } else if (state.thumbnailMode === 'auto' && state.formData.video_url) {
          thumbUrl = getYouTubeThumbnail(state.formData.video_url) || ""
        }

        const requestBody = {
          title: state.formData.title, 
          video_url: state.formData.video_url, 
          is_active: state.formData.is_active, 
          order_index: state.formData.order_index, 
          thumbnail_url: thumbUrl,
          upload_type: 'youtube'
        }


        if (initialData?.id) {
          
          const response = await makeAuthenticatedRequest('/api/admin/videos', {
            method: 'PUT',
            body: JSON.stringify({
              id: initialData.id,
              ...requestBody
            })
          })
          
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Erro ao atualizar vídeo')
          }
          
          videoId = initialData.id
        } else {
          
          const response = await makeAuthenticatedRequest('/api/admin/videos', {
            method: 'POST',
            body: JSON.stringify(requestBody)
          })
          
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Erro ao criar vídeo')
          }
          
          const result = await response.json()
          videoId = result.video.id
        }
        finalVideoUrl = state.formData.video_url
      } else {
        throw new Error('Configuração de upload inválida')
      }

      dispatch(videoUploadActions.setUploadProgress(100))
      dispatch(videoUploadActions.setUploadStatus('success'))
      onSave()
      
    } catch (err: any) {
      dispatch(videoUploadActions.setError(undefined, err.message || 'Erro ao salvar vídeo'))
      dispatch(videoUploadActions.setUploadStatus('error'))
    }
  }, [state, initialData, uploadVideoFile, uploadThumbnail, getYouTubeThumbnail, onSave])
  
  const handleCancel = useCallback(() => {
    dispatch(videoUploadActions.resetForm())
    onCancel()
  }, [onCancel])
  
  return (
    <div className="bg-white rounded-xl border border-neutral-200 max-w-3xl mx-auto shadow-lg overflow-hidden max-h-[85vh] flex flex-col">
      {/* Header */}
      <VideoUploadFormHeader 
        title={initialData?.id ? 'Editar Vídeo' : 'Novo Vídeo'}
        isEditing={!!initialData?.id}
      />
      
      {/* Scrollable Form Body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 min-h-0" noValidate>
        {/* General Error */}
        {generalError && (
          <div 
            className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"
            role="alert"
            aria-live="polite"
          >
            <div className="font-medium mb-1">Erro</div>
            <div>{generalError}</div>
          </div>
        )}
        
        {/* Title Input Section */}
        <div className="space-y-4">
          <div>
            <label 
              htmlFor="video-title-input"
              className="block text-sm font-medium text-neutral-700"
            >
              Título
              <span className="text-red-500 ml-1" aria-label="obrigatório">*</span>
            </label>
            <input
              id="video-title-input"
              type="text"
              required
              value={state.formData.title}
              onChange={handleTitleChange}
              placeholder="Digite o título do vídeo"
              disabled={isUploading}
              className="
                mt-1 w-full border border-neutral-300 rounded-lg px-4 py-3 text-sm 
                placeholder-neutral-400 bg-white focus:outline-none focus:ring-2 
                focus:ring-neutral-500/20 focus:border-neutral-500 hover:border-neutral-400 
                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed 
                disabled:bg-neutral-50
              "
              aria-describedby="title-help"
            />
            <div id="title-help" className="text-xs text-neutral-500 mt-1">
              Digite um título descritivo para o vídeo
            </div>
          </div>
        </div>
        
        {/* Upload Type Selection */}
        <VideoUploadFormTypeSelect
          uploadType={state.formData.upload_type}
          onChange={handleUploadTypeChange}
          disabled={isUploading}
        />
        
        {/* YouTube URL Input */}
        {state.formData.upload_type === 'youtube' && (
          <VideoUploadFormYouTubeInput
            value={state.formData.video_url}
            onChange={handleVideoUrlChange}
            disabled={isUploading}
          />
        )}
        
        {/* Direct File Upload */}
        {state.formData.upload_type === 'direct' && (
          <VideoUploadFormFileUpload
            videoFile={state.formData.videoFile}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            dragActive={state.dragActive}
            onDragStateChange={handleDragStateChange}
            uploadProgress={state.uploadProgress}
            disabled={isUploading}
            existingVideoInfo={initialData?.id && initialData?.upload_type === 'direct' ? {
              filename: initialData.original_filename,
              fileSize: initialData.file_size
            } : undefined}
          />
        )}
        
        {/* Thumbnail Configuration */}
        <VideoUploadFormThumbnailConfig
          mode={state.thumbnailMode}
          onModeChange={handleThumbnailModeChange}
          uploadType={state.formData.upload_type}
          videoUrl={state.formData.video_url}
          videoFile={state.formData.videoFile}
          thumbnailFile={state.formData.thumbnailFile}
          onThumbnailSelect={handleThumbnailSelect}
          thumbnailPreview={internalState.thumbnailPreview}
          showCrop={state.showThumbnailCrop}
          onShowCropChange={handleShowCropChange}
          disabled={isUploading}
        />
        
        {/* Settings */}
        <VideoUploadFormSettings
          isActive={state.formData.is_active}
          orderIndex={state.formData.order_index}
          onActiveChange={handleActiveChange}
          onOrderChange={handleOrderChange}
          disabled={isUploading}
        />
      </form>
      
      {/* Fixed Footer Actions */}
      <VideoUploadFormActions
        onSave={handleSubmit}
        onCancel={handleCancel}
        isUploading={state.uploadStatus === 'uploading'}
        isProcessing={state.uploadStatus === 'processing'}
        canSave={canSave}
        disabled={isUploading}
      />
    </div>
  )
})

VideoUploadFormRoot.displayName = 'VideoUploadFormRoot'