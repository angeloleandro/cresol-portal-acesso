"use client";

/**
 * VideoUploadForm Root Component
 * Enterprise-grade video upload form with modular architecture
 */

import { useReducer, useCallback, useEffect, useMemo, memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { VideoFormProps, VideoUploadFormInternalState } from './VideoUploadForm.types'
import { 
  videoUploadReducer, 
  initialVideoUploadState, 
  videoUploadSelectors, 
  videoUploadActions 
} from './VideoUploadForm.reducer'
// Import subcomponents
import { VideoUploadFormHeader } from './VideoUploadForm.Header'
import { VideoUploadFormTypeSelect } from './VideoUploadForm.TypeSelect'
import { VideoUploadFormYouTubeInput } from './VideoUploadForm.YouTubeInput'
import { VideoUploadFormFileUpload } from './VideoUploadForm.FileUpload'
import { VideoUploadFormSimpleThumbnail } from './VideoUploadForm.SimpleThumbnail'
import { VideoUploadFormAsyncThumbnailStatus } from './VideoUploadForm.AsyncThumbnailStatus'
import { VideoUploadFormSettings } from './VideoUploadForm.Settings'

// API functions
import { supabase } from '@/lib/supabase'
import { getAuthenticatedSession, makeAuthenticatedRequest } from '@/lib/video-utils'
import { Icon } from '../icons/Icon'
import {
  VIDEO_API_CONFIG,
  VIDEO_UI_CONFIG,
  VIDEO_MESSAGES,
  VIDEO_HELPERS
} from '@/lib/constants/video-ui'

export const VideoUploadFormRoot = memo(({ 
  initialData, 
  onSave, 
  onCancel,
  customContext
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

  // Estado para controlar geração assíncrona de thumbnail
  const [asyncThumbnailState, setAsyncThumbnailState] = useState<{
    show: boolean
    videoId: string | null
    videoUrl: string | null
  }>({
    show: false,
    videoId: null,
    videoUrl: null
  })

  // Estado para timestamp personalizado de thumbnail
  const [thumbnailTimestamp, setThumbnailTimestamp] = useState<number>(1.0)
  
  // Estado para avisos (não são erros)
  const [warning, setWarning] = useState<string | null>(null)
  
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
      // If no thumbnail_url, mode is 'none'
      // If has thumbnail_timestamp, mode is 'auto' (from video frame)
      // If has thumbnail_url but no timestamp, mode is 'custom' (uploaded image)
      let mode: 'auto' | 'custom' | 'none' = 'auto'
      if (!initialData.thumbnail_url) {
        mode = 'none'
      } else if (initialData.thumbnail_timestamp !== undefined && initialData.thumbnail_timestamp !== null) {
        mode = 'auto'
      } else {
        mode = 'custom'
      }
      dispatch(videoUploadActions.setThumbnailMode(mode))
      
      // Update internal thumbnail preview
      setInternalState({
        thumbnailPreview: initialData.thumbnail_url || null
      })
      
      // Se temos thumbnail_timestamp dos dados iniciais, usar ele
      if (initialData.thumbnail_timestamp) {
        setThumbnailTimestamp(initialData.thumbnail_timestamp)
      }
    }
  }, [initialData])
  
  // YouTube thumbnail helper - consolidated to use VIDEO_HELPERS
  const getYouTubeThumbnail = useCallback((url: string): string | null => {
    if (!url) return null
    const videoId = VIDEO_HELPERS.extractYouTubeId(url)
    return videoId ? VIDEO_HELPERS.getYouTubeThumbnail(videoId) : null
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
    
    // Clear thumbnail timestamp when switching to custom or none mode
    if (mode === 'custom' || mode === 'none') {
      setThumbnailTimestamp(1.0)
    }
    
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

  // Handler para quando geração assíncrona de thumbnail completa
  const handleAsyncThumbnailComplete = useCallback((thumbnailUrl: string, timestamp: number) => {
    // Atualizar preview interno
    setInternalState({
      thumbnailPreview: thumbnailUrl
    })

    // Esconder o status após 3 segundos
    setTimeout(() => {
      setAsyncThumbnailState(prev => ({ ...prev, show: false }))
    }, VIDEO_UI_CONFIG.delays.successDisplay)
  }, [])

  // Handler para mudança de timestamp
  const handleTimestampChange = useCallback((timestamp: number) => {
    setThumbnailTimestamp(timestamp)
  }, [])
  
  // Note: Thumbnail generation removed from here - will be handled separately after upload
  // This prevents blocking the main upload process

  // Upload video file
  const uploadVideoFile = useCallback(async (file: File): Promise<{ id: string; url: string }> => {
    const formData = new FormData()
    
    // Detect context mode
    const isSectorMode = customContext?.mode === 'sector' && customContext?.sectorId
    const isSubsectorMode = customContext?.mode === 'subsector' && customContext?.subsectorId
    
    if (isSectorMode || isSubsectorMode) {
      // Use same format for both sector and subsector
      formData.append('file', file)
      formData.append('title', state.formData.title)
      formData.append('description', state.formData.description || '')
      formData.append('is_published', state.formData.is_active.toString())
      formData.append('is_featured', 'false')
      formData.append('upload_type', 'upload')
      formData.append('thumbnail_mode', state.thumbnailMode)
      if (thumbnailTimestamp !== null) {
        formData.append('thumbnail_timestamp', thumbnailTimestamp.toString())
      }
      // Add thumbnail if available
      if (state.formData.thumbnailFile) {
        formData.append('thumbnail', state.formData.thumbnailFile)
      }
    } else {
      // Gallery mode
      formData.append('video', file)
      formData.append('title', state.formData.title)
      formData.append('isActive', state.formData.is_active.toString())
      formData.append('orderIndex', state.formData.order_index.toString())
      if (thumbnailTimestamp !== null) {
        formData.append('thumbnailTimestamp', thumbnailTimestamp.toString())
      }
      // Add collection_id for automatic collection integration
      if (customContext?.collectionId) {
        formData.append('collection_id', customContext.collectionId)
      }
    }

    const session = await getAuthenticatedSession()
    
    // Dynamic endpoint selection
    const uploadEndpoint = isSectorMode 
      ? `/api/admin/sectors/${customContext.sectorId}/videos/upload`
      : isSubsectorMode
      ? `/api/admin/subsectors/${customContext.subsectorId}/videos/upload`
      : VIDEO_API_CONFIG.endpoints.simpleUpload
    
    const response = await fetch(uploadEndpoint, {
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
  }, [state.formData.title, state.formData.is_active, state.formData.order_index, state.formData.description, state.formData.thumbnailFile, state.thumbnailMode, thumbnailTimestamp, customContext?.collectionId, customContext?.mode, customContext?.sectorId, customContext?.subsectorId])
  
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

    // Determine API endpoint based on context
    const isSectorMode = customContext?.mode === 'sector' && customContext?.sectorId
    const isSubsectorMode = customContext?.mode === 'subsector' && customContext?.subsectorId
    
    const getApiEndpoint = (videoId?: string) => {
      if (isSectorMode) {
        if (videoId) {
          return `/api/admin/sectors/${customContext.sectorId}/videos/${videoId}`
        }
        return `/api/admin/sectors/${customContext.sectorId}/videos`
      }
      if (isSubsectorMode) {
        if (videoId) {
          return `/api/admin/subsectors/${customContext.subsectorId}/videos/${videoId}`
        }
        return `/api/admin/subsectors/${customContext.subsectorId}/videos`
      }
      return VIDEO_API_CONFIG.endpoints.adminVideos
    }

    try {
      let videoId: string
      let finalVideoUrl: string

      if (state.formData.upload_type === 'direct') {
        if (state.formData.videoFile) {
          // Upload new video file
          const uploadResult = await uploadVideoFile(state.formData.videoFile)
          videoId = uploadResult.id
          finalVideoUrl = uploadResult.url
          
          // Handle thumbnail for new direct uploads - SIMPLIFIED
          if (state.formData.thumbnailFile) {
            // User provided custom thumbnail - upload it
            const thumbnailUrl = await uploadThumbnail(videoId)
            
            // Update video record with custom thumbnail
            if (thumbnailUrl) {
              await makeAuthenticatedRequest(getApiEndpoint(), {
                method: 'PUT',
                body: JSON.stringify({
                  id: videoId,
                  title: state.formData.title,
                  video_url: finalVideoUrl,
                  thumbnail_url: thumbnailUrl,
                  is_active: state.formData.is_active,
                  order_index: state.formData.order_index,
                  upload_type: 'direct'
                })
              })
            }
          }
          // Note: Auto thumbnail generation is handled by the SimpleThumbnail component
          // to avoid blocking the upload process
        } else if (initialData?.id && initialData?.upload_type === 'direct') {
          // Editing existing direct upload without changing the video file
          videoId = initialData.id
          finalVideoUrl = initialData.video_url || ''
          
          // Handle thumbnail updates for existing direct uploads
          let thumbUrl = initialData.thumbnail_url || ""
          if (state.formData.thumbnailFile) {
            thumbUrl = await uploadThumbnail()
          }
          
          const requestBody = isSectorMode || isSubsectorMode 
            ? {
                id: initialData.id,
                title: state.formData.title,
                description: state.formData.description || '',
                video_url: finalVideoUrl,
                is_published: state.formData.is_active,
                is_featured: false,
                thumbnail_url: thumbUrl,
                upload_type: 'upload',
                thumbnail_timestamp: thumbnailTimestamp
              }
            : {
                id: initialData.id,
                title: state.formData.title, 
                video_url: finalVideoUrl,
                is_active: state.formData.is_active, 
                order_index: state.formData.order_index, 
                thumbnail_url: thumbUrl,
                upload_type: 'direct',
                thumbnail_timestamp: thumbnailTimestamp
              }
          
          const response = await makeAuthenticatedRequest(getApiEndpoint(), {
            method: 'PUT',
            body: JSON.stringify(requestBody)
          })
          
          const responseData = await response.json()
          
          if (!response.ok) {
            throw new Error(responseData.error || 'Erro ao atualizar vídeo')
          }
          
          // Verificar se há aviso do servidor
          if (responseData.warning) {
            setWarning(responseData.warning)
            // Limpar aviso após 5 segundos
            setTimeout(() => setWarning(null), VIDEO_UI_CONFIG.delays.warningDisplay)
          }
        } else {
          throw new Error('Arquivo de vídeo é obrigatório para upload direto')
        }
        
      } else if (state.formData.upload_type === 'youtube' && state.formData.video_url) {
        
        // Handle YouTube video
        let thumbUrl = initialData?.thumbnail_url || ""

        // Handle thumbnail upload
        if (state.formData.thumbnailFile) {
          // Se usuário forneceu/customizou thumbnail
          thumbUrl = await uploadThumbnail()
        } else if (state.thumbnailMode === 'auto' && state.formData.video_url) {
          thumbUrl = getYouTubeThumbnail(state.formData.video_url) || ""
        }

        // Determine thumbnail_timestamp based on mode
        let finalThumbnailTimestamp: number | null = null
        if (state.thumbnailMode === 'auto') {
          finalThumbnailTimestamp = thumbnailTimestamp
        }
        // For 'custom' or 'none' modes, keep it null
        
        const requestBody = isSectorMode || isSubsectorMode 
          ? {
              title: state.formData.title,
              description: state.formData.description || '',
              video_url: state.formData.video_url,
              is_published: state.formData.is_active,
              is_featured: false,
              thumbnail_url: thumbUrl,
              upload_type: 'youtube',
              thumbnail_timestamp: finalThumbnailTimestamp
            }
          : {
              title: state.formData.title, 
              video_url: state.formData.video_url, 
              is_active: state.formData.is_active, 
              order_index: state.formData.order_index, 
              thumbnail_url: thumbUrl,
              upload_type: 'youtube',
              thumbnail_timestamp: finalThumbnailTimestamp
            }


        if (initialData?.id) {
          
          const response = await makeAuthenticatedRequest(getApiEndpoint(), {
            method: 'PUT',
            body: JSON.stringify({
              id: initialData.id,
              ...requestBody
            })
          })
          
          const responseData = await response.json()
          
          if (!response.ok) {
            throw new Error(responseData.error || 'Erro ao atualizar vídeo')
          }
          
          // Verificar se há aviso do servidor (YouTube update)
          if (responseData.warning) {
            setWarning(responseData.warning)
            // Limpar aviso após 5 segundos
            setTimeout(() => setWarning(null), VIDEO_UI_CONFIG.delays.warningDisplay)
          }
          
          videoId = initialData.id
        } else {
          
          const response = await makeAuthenticatedRequest(getApiEndpoint(), {
            method: 'POST',
            body: JSON.stringify(requestBody)
          })
          
          const result = await response.json()
          
          if (!response.ok) {
            throw new Error(result.error || 'Erro ao criar vídeo')
          }
          
          // Verificar se há aviso do servidor (YouTube create)
          if (result.warning) {
            setWarning(result.warning)
            // Limpar aviso após 5 segundos
            setTimeout(() => setWarning(null), VIDEO_UI_CONFIG.delays.warningDisplay)
          }
          
          videoId = result.video.id
        }
        finalVideoUrl = state.formData.video_url
      } else {
        throw new Error('Configuração de upload inválida')
      }

      dispatch(videoUploadActions.setUploadProgress(VIDEO_UI_CONFIG.progressBar.maxValue))
      dispatch(videoUploadActions.setUploadStatus('success'))
      onSave()
      
    } catch (err: any) {
      dispatch(videoUploadActions.setError(undefined, err.message || 'Erro ao salvar vídeo'))
      dispatch(videoUploadActions.setUploadStatus('error'))
    }
  }, [state, initialData, uploadVideoFile, uploadThumbnail, getYouTubeThumbnail, onSave, thumbnailTimestamp, customContext])
  
  const handleCancel = useCallback(() => {
    dispatch(videoUploadActions.resetForm())
    onCancel()
  }, [onCancel])
  
  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} noValidate className="p-6 space-y-8">
        {/* Header */}
        <VideoUploadFormHeader 
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

        {/* Warning Display */}
        <AnimatePresence>
          {warning && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-amber-50 border border-amber-200 rounded-lg p-4"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <Icon name="info" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 mb-1">
                    Aviso
                  </h4>
                  <p className="text-amber-700 text-sm">
                    {warning}
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
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              <div>
                <p className="font-medium text-blue-800">
                  {state.uploadStatus === 'uploading' ? VIDEO_MESSAGES.INFO.UPLOADING : VIDEO_MESSAGES.INFO.PROCESSING}
                </p>
                <p className="text-blue-600 text-sm">
                  {VIDEO_MESSAGES.INFO.WAIT_PROCESSING}
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
            {VIDEO_MESSAGES.LABELS.VIDEO_TITLE}
            <span className="text-red-500 ml-1" aria-label={VIDEO_MESSAGES.LABELS.REQUIRED}>*</span>
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
        
        {/* Simple Thumbnail Configuration with Time Picker */}
        <VideoUploadFormSimpleThumbnail
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
          onTimestampChange={handleTimestampChange}
        />

        {/* Async Thumbnail Status */}
        {asyncThumbnailState.videoId && asyncThumbnailState.videoUrl && (
          <VideoUploadFormAsyncThumbnailStatus
            videoId={asyncThumbnailState.videoId}
            videoUrl={asyncThumbnailState.videoUrl}
            show={asyncThumbnailState.show}
            onComplete={handleAsyncThumbnailComplete}
          />
        )}
        
        {/* Settings - Collapsed by default */}
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
            <span className="font-medium text-neutral-700">{VIDEO_MESSAGES.LABELS.ADVANCED_SETTINGS}</span>
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
            {VIDEO_MESSAGES.LABELS.CANCEL}
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span>
                  {state.uploadStatus === 'uploading' ? VIDEO_MESSAGES.LABELS.UPLOADING : VIDEO_MESSAGES.LABELS.PROCESSING_ACTION}
                </span>
              </div>
            ) : (
              initialData?.id ? VIDEO_MESSAGES.LABELS.UPDATE : VIDEO_MESSAGES.LABELS.SAVE
            )}
          </button>
        </div>
      </form>
    </div>
  )
})

VideoUploadFormRoot.displayName = 'VideoUploadFormRoot'