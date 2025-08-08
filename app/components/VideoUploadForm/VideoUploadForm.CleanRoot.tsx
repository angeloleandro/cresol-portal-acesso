/**
 * VideoUploadForm Clean Root Component  
 * Redesigned with simplified layout and progressive disclosure
 */

"use client";

import { useReducer, useCallback, useEffect, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { VideoFormProps, VideoUploadFormInternalState } from './VideoUploadForm.types'
import { 
  videoUploadReducer, 
  initialVideoUploadState, 
  videoUploadSelectors, 
  videoUploadActions 
} from './VideoUploadForm.reducer'

// Import clean subcomponents
import { VideoUploadFormCleanHeader } from './VideoUploadForm.CleanHeader'
import { VideoUploadFormTypeSelect } from './VideoUploadForm.TypeSelect'
import { VideoUploadFormYouTubeInput } from './VideoUploadForm.YouTubeInput'
import { VideoUploadFormFileUpload } from './VideoUploadForm.FileUpload'
import { VideoUploadFormSimpleThumbnail } from './VideoUploadForm.SimpleThumbnail'
import { VideoUploadFormSettings } from './VideoUploadForm.Settings'

// API functions
import { supabase } from '@/lib/supabase'
import { getAuthenticatedSession, makeAuthenticatedRequest } from '@/lib/video-utils'
import { Icon } from '../icons/Icon'

export const VideoUploadFormCleanRoot = memo(({ 
  initialData, 
  onSave, 
  onCancel 
}: VideoFormProps) => {
  
  // State management with useReducer
  const [state, dispatch] = useReducer(videoUploadReducer, initialVideoUploadState)
  
  // Internal cropper state (simplified)
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
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} noValidate className="p-6 space-y-8">
        {/* Clean Header */}
        <VideoUploadFormCleanHeader 
          title={initialData?.id ? 'Editar Vídeo' : 'Novo Vídeo'}
          isEditing={!!initialData?.id}
        />
        
        {/* Global Error Display */}
        <AnimatePresence>
          {generalError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <Icon name="triangle-alert" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">
                    Erro ao processar
                  </h4>
                  <p className="text-red-600 text-sm">
                    {generalError}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Progress Bar */}
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="font-medium text-blue-800">
                  {state.uploadStatus === 'uploading' ? 'Fazendo upload...' : 'Processando...'}
                </p>
                <p className="text-blue-600 text-sm">
                  Por favor, não feche esta janela
                </p>
              </div>
            </div>
            
            {state.uploadProgress > 0 && (
              <div className="bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.uploadProgress}%` }}
                />
              </div>
            )}
          </motion.div>
        )}
        
        {/* Video Title - Always First */}
        <div className="space-y-2">
          <label 
            htmlFor="video-title-input"
            className="block text-sm font-medium text-neutral-700"
          >
            Título do Vídeo
            <span className="text-red-500 ml-1" aria-label="obrigatório">*</span>
          </label>
          <input
            id="video-title-input"
            type="text"
            required
            value={state.formData.title}
            onChange={handleTitleChange}
            placeholder="Ex: Tutorial de configuração do sistema"
            disabled={isUploading}
            className={`
              w-full px-4 py-3 border rounded-lg text-base
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              disabled:bg-neutral-50 disabled:text-neutral-500
              transition-colors
              ${state.errors.title 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                : 'border-neutral-300'
              }
            `}
          />
          {state.errors.title && (
            <p className="text-red-600 text-sm flex items-center gap-1">
              <Icon name="triangle-alert" className="w-4 h-4" />
              {state.errors.title}
            </p>
          )}
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
        
        {/* Simple Thumbnail Configuration */}
        <VideoUploadFormSimpleThumbnail
          mode={state.thumbnailMode}
          onModeChange={handleThumbnailModeChange}
          uploadType={state.formData.upload_type}
          videoUrl={state.formData.video_url}
          videoFile={state.formData.videoFile}
          thumbnailFile={state.formData.thumbnailFile}
          onThumbnailSelect={handleThumbnailSelect}
          thumbnailPreview={internalState.thumbnailPreview}
          showCrop={false} // Removed cropper for simplicity
          onShowCropChange={() => {}} // Disabled
          disabled={isUploading}
        />
        
        {/* Settings - Collapsed by default */}
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
            <span className="font-medium text-neutral-700">Configurações Avançadas</span>
            <Icon name="chevron-down" className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" />
          </summary>
          
          <div className="mt-4 p-4 border border-neutral-200 rounded-lg bg-neutral-50/50">
            <VideoUploadFormSettings
              isActive={state.formData.is_active}
              orderIndex={state.formData.order_index}
              onActiveChange={handleActiveChange}
              onOrderChange={handleOrderChange}
              disabled={isUploading}
            />
          </div>
        </details>
        
        {/* Actions */}
        <div className="flex gap-3 justify-end pt-6 border-t border-neutral-100">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isUploading}
            className="
              px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg 
              font-medium hover:bg-neutral-50 focus:outline-none focus:ring-2 
              focus:ring-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isUploading || !canSave}
            className="
              px-6 py-3 bg-primary text-white rounded-lg font-medium 
              hover:bg-primary/90 focus:outline-none focus:ring-2 
              focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors min-w-[120px]
            "
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>
                  {state.uploadStatus === 'uploading' ? 'Enviando...' : 'Processando...'}
                </span>
              </div>
            ) : (
              initialData?.id ? 'Atualizar Vídeo' : 'Salvar Vídeo'
            )}
          </button>
        </div>
      </form>
    </div>
  )
})

VideoUploadFormCleanRoot.displayName = 'VideoUploadFormCleanRoot'