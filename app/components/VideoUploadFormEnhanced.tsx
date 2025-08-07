"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import OptimizedImage from "./OptimizedImage";
import Cropper from "react-easy-crop";
import { supabase } from "@/lib/supabase";
import { getCroppedImg } from "./getCroppedImg";

interface VideoFormProps {
  initialData?: {
    id?: string;
    title?: string;
    video_url?: string;
    thumbnail_url?: string;
    is_active?: boolean;
    order_index?: number;
    upload_type?: 'youtube' | 'direct';
    file_size?: number;
    original_filename?: string;
  };
  onSave: () => void;
  onCancel: () => void;
}

type UploadType = 'youtube' | 'direct';

function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  const allowedExtensions = ['.mp4', '.webm', '.mov', '.avi'];
  const maxSize = 500 * 1024 * 1024; // 500MB
  
  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
    return { 
      valid: false, 
      error: 'Formato não suportado. Use MP4, WebM, MOV ou AVI.' 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `Arquivo muito grande. Máximo: ${formatFileSize(maxSize)}` 
    };
  }
  
  return { valid: true };
}

export default function VideoUploadFormEnhanced({ initialData, onSave, onCancel }: VideoFormProps) {
  // Basic form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [uploadType, setUploadType] = useState<UploadType>(initialData?.upload_type || 'youtube');
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url || "");
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [orderIndex, setOrderIndex] = useState(initialData?.order_index || 0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Direct upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Thumbnail state
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.thumbnail_url || null);
  const [useCustomThumb, setUseCustomThumb] = useState(false);
  
  // Crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // Handle upload type change
  const handleUploadTypeChange = (type: UploadType) => {
    setUploadType(type);
    setVideoFile(null);
    setVideoUrl('');
    setError(null);
    setUploadProgress(0);
  };

  // Handle video file selection
  const handleVideoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateVideoFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Arquivo inválido');
        return;
      }
      
      setVideoFile(file);
      setError(null);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      const validation = validateVideoFile(videoFile);
      if (!validation.valid) {
        setError(validation.error || 'Arquivo inválido');
        return;
      }
      
      setVideoFile(videoFile);
      setError(null);
    }
  };

  // Handle thumbnail upload
  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
      setOriginalImage(url);
      setIsCropping(true);
      setUseCustomThumb(true);
    }
  };

  const onCropComplete = (_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleApplyCrop = async () => {
    if (!originalImage || !croppedAreaPixels) return;
    setIsUploading(true);
    try {
      const { file, url } = await getCroppedImg(originalImage, croppedAreaPixels, rotation);
      setThumbnailFile(new File([file], 'cropped-thumb.jpg', { type: 'image/jpeg' }));
      setThumbnailPreview(url);
      setIsCropping(false);
    } catch (err: any) {
      setError('Erro ao recortar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setOriginalImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setUseCustomThumb(false);
  };

  // Upload video file directly
  const uploadVideoFile = async (file: File): Promise<{ id: string; url: string }> => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('isActive', isActive.toString());
    formData.append('orderIndex', orderIndex.toString());

    // Get user token for authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Não autorizado');
    }

    const response = await fetch('/api/videos/simple-upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao fazer upload');
    }

    const result = await response.json();
    return {
      id: result.video.id,
      url: result.video.url
    };
  };

  // Main form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      let videoId: string;
      let finalVideoUrl: string;

      if (uploadType === 'direct' && videoFile) {
        // Upload video file
        const uploadResult = await uploadVideoFile(videoFile);
        videoId = uploadResult.id;
        finalVideoUrl = uploadResult.url;
        
        // For direct uploads, we don't need to update the record since it's already created
        // Just handle thumbnail if needed
        if (useCustomThumb && thumbnailFile) {
          await uploadThumbnail(videoId);
        }
        
      } else if (uploadType === 'youtube' && videoUrl) {
        // Handle YouTube video
        let thumbUrl = initialData?.thumbnail_url || "";

        // Handle thumbnail upload
        if (useCustomThumb && thumbnailFile) {
          thumbUrl = await uploadThumbnail();
        } else if (!useCustomThumb && videoUrl) {
          thumbUrl = getYoutubeThumbnail(videoUrl) || "";
        }

        if (initialData?.id) {
          // Update existing YouTube video
          const { error: updateError } = await supabase
            .from('dashboard_videos')
            .update({ 
              title, 
              video_url: videoUrl, 
              is_active: isActive, 
              order_index: orderIndex, 
              thumbnail_url: thumbUrl,
              upload_type: 'youtube'
            })
            .eq('id', initialData.id);
          
          if (updateError) throw updateError;
          videoId = initialData.id;
          
        } else {
          // Create new YouTube video
          const { data: newVideo, error: insertError } = await supabase
            .from('dashboard_videos')
            .insert([{ 
              title, 
              video_url: videoUrl, 
              is_active: isActive, 
              order_index: orderIndex, 
              thumbnail_url: thumbUrl,
              upload_type: 'youtube'
            }])
            .select()
            .single();
          
          if (insertError) throw insertError;
          videoId = newVideo.id;
        }
        finalVideoUrl = videoUrl;
      } else {
        throw new Error('Configuração de upload inválida');
      }

      setUploadProgress(100);
      onSave();
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Erro ao salvar vídeo');
    } finally {
      setIsUploading(false);
    }
  };

  // Upload thumbnail helper
  const uploadThumbnail = async (videoId?: string): Promise<string> => {
    if (!thumbnailFile) return '';
    
    const fileExt = thumbnailFile.name.split('.').pop();
    const fileName = `video-thumb-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('banners')
      .upload(filePath, thumbnailFile, { upsert: true });
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(filePath);
    
    // Update video record with thumbnail if videoId provided (for direct uploads)
    if (videoId) {
      await supabase
        .from('dashboard_videos')
        .update({ thumbnail_url: publicUrl })
        .eq('id', videoId);
    }
    
    return publicUrl;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">
        {initialData?.id ? 'Editar Vídeo' : 'Novo Vídeo'}
      </h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      
      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Título *</label>
        <input 
          type="text" 
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" 
          value={title} 
          onChange={e => setTitle(e.target.value)}
          placeholder="Digite o título do vídeo"
        />
      </div>

      {/* Upload Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">Tipo de Vídeo</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="uploadType"
              value="youtube"
              checked={uploadType === 'youtube'} 
              onChange={() => handleUploadTypeChange('youtube')}
              className="text-primary focus:ring-primary"
            />
            <span>YouTube</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="uploadType"
              value="direct"
              checked={uploadType === 'direct'} 
              onChange={() => handleUploadTypeChange('direct')}
              className="text-primary focus:ring-primary"
            />
            <span>Upload Direto</span>
          </label>
        </div>
      </div>

      {/* YouTube URL Input */}
      {uploadType === 'youtube' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">URL do YouTube *</label>
          <input 
            type="url" 
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" 
            value={videoUrl} 
            onChange={e => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {videoUrl && (
            <div className="mt-3">
              <iframe
                src={videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                className="w-full h-48 rounded-md border border-gray-200"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Preview do vídeo"
              />
            </div>
          )}
        </div>
      )}

      {/* Direct Upload */}
      {uploadType === 'direct' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Arquivo de Vídeo *</label>
          
          {!videoFile ? (
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-600">
                  Arraste o arquivo aqui ou <span className="text-primary font-medium">clique para selecionar</span>
                </p>
                <p className="text-xs text-gray-500">
                  MP4, WebM, MOV, AVI • Máximo: 500MB
                </p>
              </div>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.webm,.mov,.avi"
                onChange={handleVideoFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium">{videoFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(videoFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVideoFile(null)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{uploadProgress}% enviado</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Thumbnail Section */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Thumbnail</label>
        <div className="flex items-center gap-4 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              checked={!useCustomThumb} 
              onChange={() => setUseCustomThumb(false)}
              className="text-primary focus:ring-primary"
            />
            {uploadType === 'youtube' ? 'Automática (YouTube)' : 'Sem thumbnail'}
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              checked={useCustomThumb} 
              onChange={() => setUseCustomThumb(true)}
              className="text-primary focus:ring-primary"
            />
            Enviar imagem
          </label>
        </div>

        {useCustomThumb && (
          <>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleThumbnailChange}
              className="mb-3"
            />
            {isCropping && originalImage && (
              <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                <div className="relative w-full h-40 bg-gray-100 rounded">
                  <Cropper
                    image={originalImage}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={16/9}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <div className="flex flex-col gap-3 mt-3">
                  <div>
                    <label className="text-xs text-gray-600">Zoom:</label>
                    <input 
                      type="range" 
                      min={1} max={3} step={0.01} 
                      value={zoom} 
                      onChange={e => setZoom(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Rotação:</label>
                    <input 
                      type="range" 
                      min={0} max={360} step={1} 
                      value={rotation} 
                      onChange={e => setRotation(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3 justify-end">
                  <button 
                    type="button" 
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50" 
                    onClick={handleCancelCrop} 
                    disabled={isUploading}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50" 
                    onClick={handleApplyCrop} 
                    disabled={isUploading}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
            
            {thumbnailPreview && !isCropping && (
              <div className="mt-3 relative w-full h-32 border border-gray-200 rounded-md overflow-hidden">
                <OptimizedImage 
                  src={thumbnailPreview} 
                  alt="Preview da thumbnail" 
                  fill 
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={80}
                  fallbackText="Preview"
                />
              </div>
            )}
          </>
        )}
        
        {!useCustomThumb && uploadType === 'youtube' && videoUrl && getYoutubeThumbnail(videoUrl) && (
          <div className="mt-3 relative w-full h-32 border border-gray-200 rounded-md overflow-hidden">
            <OptimizedImage 
              src={getYoutubeThumbnail(videoUrl)!} 
              alt="Thumbnail automática do YouTube" 
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={80}
              fallbackText="Thumbnail YouTube"
            />
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="mb-6 flex gap-6 items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={isActive} 
            onChange={e => setIsActive(e.target.checked)}
            className="rounded text-primary focus:ring-primary"
          /> 
          Ativo
        </label>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Ordem:</label>
          <input 
            type="number" 
            min="0"
            className="w-20 border border-gray-300 rounded-md px-2 py-1 text-center focus:ring-2 focus:ring-primary focus:border-primary" 
            value={orderIndex} 
            onChange={e => setOrderIndex(Number(e.target.value))} 
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <button 
          type="button" 
          className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50" 
          onClick={onCancel} 
          disabled={isUploading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2" 
          disabled={isUploading || (!videoUrl && uploadType === 'youtube') || (!videoFile && uploadType === 'direct')}
        >
          {isUploading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isUploading ? 'Salvando...' : 'Salvar Vídeo'}
        </button>
      </div>
    </form>
  );
}