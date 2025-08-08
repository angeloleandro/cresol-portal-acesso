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
    
    console.log('📝 [UPLOAD_FORM] Iniciando submissão do formulário');
    console.log('📋 [UPLOAD_FORM] Dados do formulário:', {
      id: initialData?.id,
      title: state.formData.title,
      upload_type: state.formData.upload_type,
      video_url: state.formData.video_url,
      is_active: state.formData.is_active,
      order_index: state.formData.order_index,
      thumbnailMode: state.thumbnailMode,
      thumbnailFile: !!state.formData.thumbnailFile
    });
    
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
        console.log('🎬 [UPLOAD_FORM] Processando vídeo do YouTube');
        console.log('🔗 [UPLOAD_FORM] URL do vídeo:', state.formData.video_url);
        console.log('🖼️ [UPLOAD_FORM] Modo de thumbnail:', state.thumbnailMode);
        
        // Handle YouTube video
        let thumbUrl = initialData?.thumbnail_url || ""

        // Handle thumbnail upload
        if (state.thumbnailMode === 'custom' && state.formData.thumbnailFile) {
          console.log('🖼️ [UPLOAD_FORM] Upload de thumbnail personalizada para YouTube');
          thumbUrl = await uploadThumbnail()
          console.log('🖼️ [UPLOAD_FORM] URL da thumbnail personalizada:', thumbUrl);
        } else if (state.thumbnailMode === 'auto' && state.formData.video_url) {
          console.log('🖼️ [UPLOAD_FORM] Usando thumbnail automática do YouTube');
          thumbUrl = getYouTubeThumbnail(state.formData.video_url) || ""
          console.log('🖼️ [UPLOAD_FORM] URL da thumbnail automática:', thumbUrl);
        }

        const requestBody = {
          title: state.formData.title, 
          video_url: state.formData.video_url, 
          is_active: state.formData.is_active, 
          order_index: state.formData.order_index, 
          thumbnail_url: thumbUrl,
          upload_type: 'youtube'
        }

        console.log('📋 [UPLOAD_FORM] Dados do request body completo:', requestBody);

        if (initialData?.id) {
          console.log('✏️ [UPLOAD_FORM] Editando vídeo do YouTube existente');
          console.log('🌐 [UPLOAD_FORM] Enviando PUT para API de vídeos');
          
          const response = await makeAuthenticatedRequest('/api/admin/videos', {
            method: 'PUT',
            body: JSON.stringify({
              id: initialData.id,
              ...requestBody
            })
          })
          
          console.log('📡 [UPLOAD_FORM] Status da resposta PUT:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json()
            console.error('❌ [UPLOAD_FORM] Erro na resposta PUT:', errorData);
            throw new Error(errorData.error || 'Erro ao atualizar vídeo')
          }
          
          videoId = initialData.id
          console.log('✅ [UPLOAD_FORM] Vídeo do YouTube atualizado com sucesso:', videoId);
        } else {
          console.log('🆕 [UPLOAD_FORM] Criando novo vídeo do YouTube');
          console.log('📋 [UPLOAD_FORM] Dados do request body para POST:', requestBody);
          console.log('🌐 [UPLOAD_FORM] Enviando POST para API de vídeos');
          
          const response = await makeAuthenticatedRequest('/api/admin/videos', {
            method: 'POST',
            body: JSON.stringify(requestBody)
          })
          
          console.log('📡 [UPLOAD_FORM] Status da resposta POST:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json()
            console.error('❌ [UPLOAD_FORM] Erro na resposta POST:', errorData);
            throw new Error(errorData.error || 'Erro ao criar vídeo')
          }
          
          const result = await response.json()
          videoId = result.video.id
          console.log('✅ [UPLOAD_FORM] Novo vídeo do YouTube criado:', videoId);
        }
        finalVideoUrl = state.formData.video_url
      } else {
        console.error('❌ [UPLOAD_FORM] Configuração de upload inválida');
        console.error('❌ [UPLOAD_FORM] Estado atual:', {
          upload_type: state.formData.upload_type,
          video_url: state.formData.video_url,
          videoFile: !!state.formData.videoFile
        });
        throw new Error('Configuração de upload inválida')
      }

      console.log('🎉 [UPLOAD_FORM] Formulário processado com sucesso');
      dispatch(videoUploadActions.setUploadProgress(100))
      dispatch(videoUploadActions.setUploadStatus('success'))
      onSave()
      
    } catch (err: any) {
      console.error('💥 [UPLOAD_FORM] Erro durante submissão:', err);
      console.error('💥 [UPLOAD_FORM] Message:', err.message);
      console.error('💥 [UPLOAD_FORM] Stack:', err.stack);
      dispatch(videoUploadActions.setError(undefined, err.message || 'Erro ao salvar vídeo'))
      dispatch(videoUploadActions.setUploadStatus('error'))
    }
  }, [state, initialData, uploadVideoFile, uploadThumbnail, getYouTubeThumbnail, onSave])
  
  const handleCancel = useCallback(() => {
    dispatch(videoUploadActions.resetForm())
    onCancel()
  }, [onCancel])
  
  return (
    <div className={videoUploadStyles.container}>
      {/* Form */}
      <form onSubmit={handleSubmit} className={videoUploadStyles.form.root} noValidate>
        {/* Header */}
        <VideoUploadFormHeader 
          title={initialData?.id ? 'Editar Vídeo' : 'Novo Vídeo'}
          isEditing={!!initialData?.id}
        />
        
        {/* General Error */}
        {generalError && (
          <div 
            className={videoUploadStyles.alert.error}
            role="alert"
            aria-live="polite"
          >
            <div className={videoUploadStyles.alert.content}>
              <svg 
                className={videoUploadStyles.alert.icon}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <div>
                <div className={videoUploadStyles.alert.title}>
                  Erro
                </div>
                <div className={videoUploadStyles.alert.description}>
                  {generalError}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Title Input */}
        <div className={videoUploadStyles.form.section}>
          <label 
            htmlFor="video-title-input"
            className={videoUploadStyles.form.label}
          >
            Título
            <span className={videoUploadStyles.form.required} aria-label="obrigatório">
              *
            </span>
          </label>
          <input
            id="video-title-input"
            type="text"
            required
            value={state.formData.title}
            onChange={handleTitleChange}
            placeholder="Digite o título do vídeo"
            disabled={isUploading}
            className={videoUploadStyles.input.base}
            aria-describedby="title-help"
          />
          <div id="title-help" className={videoUploadStyles.form.helpText}>
            Digite um título descritivo para o vídeo
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
        
        {/* Actions */}
        <VideoUploadFormActions
          onSave={handleSubmit}
          onCancel={handleCancel}
          isUploading={state.uploadStatus === 'uploading'}
          isProcessing={state.uploadStatus === 'processing'}
          canSave={canSave}
          disabled={isUploading}
        />
      </form>
    </div>
  )
})

VideoUploadFormRoot.displayName = 'VideoUploadFormRoot'