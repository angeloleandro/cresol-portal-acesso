"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
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
  };
  onSave: () => void;
  onCancel: () => void;
}

function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

export default function VideoUploadForm({ initialData, onSave, onCancel }: VideoFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url || "");
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [orderIndex, setOrderIndex] = useState(initialData?.order_index || 0);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.thumbnail_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCustomThumb, setUseCustomThumb] = useState(false);

  // Crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUploading(true);
    let thumbUrl = initialData?.thumbnail_url || "";

    try {
      if (useCustomThumb && thumbnailFile) {
        const fileExt = thumbnailFile.name.split('.').pop();
        const fileName = `video-thumb-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('banners') // Reutilizando bucket banners para thumbs
          .upload(filePath, thumbnailFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(filePath);
        thumbUrl = publicUrl;
      } else if (!useCustomThumb && videoUrl) {
        thumbUrl = getYoutubeThumbnail(videoUrl) || "";
      }

      if (initialData?.id) {
        // update
        const { error: updateError } = await supabase
          .from('dashboard_videos')
          .update({ title, video_url: videoUrl, is_active: isActive, order_index: orderIndex, thumbnail_url: thumbUrl })
          .eq('id', initialData.id);
        if (updateError) throw updateError;
      } else {
        // insert
        const { error: insertError } = await supabase
          .from('dashboard_videos')
          .insert([{ title, video_url: videoUrl, is_active: isActive, order_index: orderIndex, thumbnail_url: thumbUrl }]);
        if (insertError) throw insertError;
      }
      onSave();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar vídeo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-lg mx-auto">
      <h3 className="text-lg font-semibold mb-4">{initialData?.id ? 'Editar Vídeo' : 'Novo Vídeo'}</h3>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Título</label>
        <input type="text" className="w-full border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">URL do Vídeo (YouTube ou Vimeo)</label>
        <input type="text" className="w-full border rounded px-3 py-2" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
        {videoUrl && (
          <div className="mt-2">
            <iframe
              src={videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
              className="w-full h-48 rounded border"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Preview do vídeo"
            />
          </div>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Thumbnail</label>
        <div className="flex items-center gap-4 mb-2">
          <label className="flex items-center gap-2">
            <input type="radio" checked={!useCustomThumb} onChange={() => setUseCustomThumb(false)} />
            Automática (YouTube)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={useCustomThumb} onChange={() => setUseCustomThumb(true)} />
            Enviar imagem
          </label>
        </div>
        {useCustomThumb && (
          <>
            <input type="file" accept="image/*" onChange={handleThumbnailChange} />
            {isCropping && originalImage && (
              <div className="mt-2">
                <div className="relative w-full h-40 bg-gray-100">
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
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-xs">Zoom:</label>
                  <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} />
                  <label className="text-xs">Rotação:</label>
                  <input type="range" min={0} max={360} step={1} value={rotation} onChange={e => setRotation(Number(e.target.value))} />
                </div>
                <div className="flex gap-2 mt-2 justify-end">
                  <button type="button" className="px-4 py-2 rounded border" onClick={handleCancelCrop} disabled={isUploading}>Cancelar</button>
                  <button type="button" className="px-4 py-2 rounded bg-primary text-white" onClick={handleApplyCrop} disabled={isUploading}>Aplicar</button>
                </div>
              </div>
            )}
            {thumbnailPreview && !isCropping && (
              <div className="mt-2 relative w-full h-32">
                <Image src={thumbnailPreview} alt="Preview" fill className="object-contain rounded border" />
              </div>
            )}
          </>
        )}
        {!useCustomThumb && videoUrl && (
          <div className="mt-2 relative w-full h-32">
            <img src={getYoutubeThumbnail(videoUrl) || undefined} alt="Thumbnail automática" className="object-contain rounded border w-full h-full" />
          </div>
        )}
      </div>
      <div className="mb-4 flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} /> Ativo
        </label>
        <label className="flex items-center gap-2">
          Ordem:
          <input type="number" className="w-16 border rounded px-2 py-1" value={orderIndex} onChange={e => setOrderIndex(Number(e.target.value))} />
        </label>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" className="px-4 py-2 rounded border" onClick={onCancel} disabled={isUploading}>Cancelar</button>
        <button type="submit" className="px-4 py-2 rounded bg-primary text-white" disabled={isUploading}>{isUploading ? 'Salvando...' : 'Salvar'}</button>
      </div>
    </form>
  );
} 