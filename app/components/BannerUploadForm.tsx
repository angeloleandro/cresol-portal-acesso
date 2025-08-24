"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Cropper from 'react-easy-crop';

import { StandardizedButton } from "@/app/components/admin";
import { supabase } from "@/lib/supabase";

import { getCroppedImg } from './getCroppedImg';
import OptimizedImage from "./OptimizedImage";

interface BannerFormProps {
  initialData?: {
    id?: string;
    title?: string;
    image_url?: string;
    link?: string;
    is_active?: boolean;
    order_index?: number;
  };
  onSave: () => void;
  onCancel: () => void;
}

export default function BannerUploadForm({ initialData, onSave, onCancel }: BannerFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [link, setLink] = useState(initialData?.link || "");
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [orderIndex, setOrderIndex] = useState(initialData?.order_index || 0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [positionInfo, setPositionInfo] = useState<{
    nextAvailable: number;
    usedPositions: number[];
    gaps: number[];
  } | null>(null);
  const [positionWarning, setPositionWarning] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // Buscar informações de posicionamento quando o componente carrega
  useEffect(() => {
    const fetchPositionInfo = async () => {
      try {
        const response = await fetch('/api/admin/banners/positions');
        if (response.ok) {
          const data = await response.json();
          setPositionInfo({
            nextAvailable: data.data.positioning.nextAvailablePosition,
            usedPositions: data.data.positioning.usedPositions,
            gaps: data.data.positioning.availableGaps
          });
          
          // Se for um novo banner e não tem posição definida, usar a próxima disponível
          if (!initialData?.id && orderIndex === 0) {
            setOrderIndex(data.data.positioning.nextAvailablePosition);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar informações de posicionamento:', err);
      }
    };

    fetchPositionInfo();
  }, [initialData?.id, orderIndex]);

  // Verificar conflitos de posição quando orderIndex muda
  useEffect(() => {
    if (!positionInfo) return;

    // Não verificar para banners existentes na sua posição atual
    if (initialData?.id && orderIndex === initialData.order_index) {
      setPositionWarning(null);
      return;
    }

    if (positionInfo.usedPositions.includes(orderIndex)) {
      if (positionInfo.gaps.length > 0) {
        setPositionWarning(
          `⚠️ Posição ${orderIndex} está ocupada. Posições disponíveis: ${positionInfo.gaps.join(', ')} ou ${positionInfo.nextAvailable}`
        );
      } else {
        setPositionWarning(
          `⚠️ Posição ${orderIndex} está ocupada. Próxima disponível: ${positionInfo.nextAvailable}`
        );
      }
    } else {
      setPositionWarning(null);
    }
  }, [orderIndex, positionInfo, initialData]);

  const handleOrderIndexChange = (newValue: number) => {
    setOrderIndex(newValue);
  };

  const useSuggestedPosition = () => {
    if (positionInfo) {
      if (positionInfo.gaps.length > 0) {
        setOrderIndex(positionInfo.gaps[0]);
      } else {
        setOrderIndex(positionInfo.nextAvailable);
      }
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setOriginalImage(url);
      setIsCropping(true);
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
      setImageFile(new File([file], 'cropped-banner.jpg', { type: 'image/jpeg' }));
      setImagePreview(url);
      setIsCropping(false);
    } catch (err: any) {
      setError('Erro ao recortar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setImageFile(null);
    setImagePreview(null);
    setOriginalImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUploading(true);
    let imageUrl = initialData?.image_url || "";

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `banner-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('banners')
          .upload(filePath, imageFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      // Inserir ou atualizar banner
      if (initialData?.id) {
        // update
        const { error: updateError } = await supabase
          .from('banners')
          .update({ title, link, is_active: isActive, order_index: orderIndex, image_url: imageUrl })
          .eq('id', initialData.id);
        if (updateError) throw updateError;
      } else {
        // insert
        const { error: insertError } = await supabase
          .from('banners')
          .insert([{ title, link, is_active: isActive, order_index: orderIndex, image_url: imageUrl }]);
        if (insertError) throw insertError;
      }
      onSave();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar banner');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200/60 hover:border-gray-200 transition-colors duration-150 p-6 max-w-lg mx-auto">
      <h3 className="text-lg font-semibold mb-4">{initialData?.id ? 'Editar Banner' : 'Novo Banner'}</h3>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Título</label>
        <input type="text" className="w-full border rounded-md px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Link (opcional)</label>
        <input type="text" className="w-full border rounded-md px-3 py-2" value={link} onChange={e => setLink(e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Imagem</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {isCropping && originalImage && (
          <div className="mt-2">
            <div className="relative w-full h-64 bg-gray-100">
              <Cropper
                image={originalImage}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={16/4}
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
              <StandardizedButton type="button" variant="secondary" onClick={handleCancelCrop} disabled={isUploading}>Cancelar</StandardizedButton>
              <StandardizedButton type="button" variant="primary" onClick={handleApplyCrop} disabled={isUploading}>Aplicar</StandardizedButton>
            </div>
          </div>
        )}
        {imagePreview && !isCropping && (
          <div className="mt-2 relative w-full h-40">
            <OptimizedImage 
              src={imagePreview} 
              alt="Preview" 
              fill 
              className="object-contain rounded-md border"
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={80}
              fallbackText="Preview"
            />
          </div>
        )}
      </div>
      <div className="mb-4">
        <div className="flex gap-4 items-center mb-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} /> Ativo
          </label>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Posição do Banner</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              className={`w-20 border rounded-md px-2 py-1 ${positionWarning ? 'border-orange-400' : 'border-gray-300'}`}
              value={orderIndex} 
              onChange={e => handleOrderIndexChange(Number(e.target.value))}
              min="0"
            />
            {positionWarning && (
              <StandardizedButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={useSuggestedPosition}
                className="text-xs"
              >
                Usar Sugerida
              </StandardizedButton>
            )}
          </div>
          
          {positionWarning && (
            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded-md">
              {positionWarning}
            </div>
          )}
          
          {positionInfo && (
            <div className="text-xs text-gray-500">
              Posições ocupadas: {positionInfo.usedPositions.join(', ')}
              {positionInfo.gaps.length > 0 && (
                <span> • Lacunas: {positionInfo.gaps.join(', ')}</span>
              )}
              <span> • Próxima: {positionInfo.nextAvailable}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <StandardizedButton type="button" variant="secondary" onClick={onCancel} disabled={isUploading}>Cancelar</StandardizedButton>
        <StandardizedButton type="submit" variant="primary" disabled={isUploading}>{isUploading ? 'Salvando...' : 'Salvar'}</StandardizedButton>
      </div>
    </form>
  );
} 