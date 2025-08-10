"use client";

import { useState } from "react";
import OptimizedImage from "./OptimizedImage";
import { StandardizedButton } from "@/app/components/admin";
import Cropper from "react-easy-crop";
import { supabase } from "@/lib/supabase";
import { getCroppedImg } from "./getCroppedImg";

interface ImageUploadFormProps {
  initialData?: {
    id?: string;
    title?: string;
    image_url?: string;
    is_active?: boolean;
    order_index?: number;
  };
  onSave: () => void;
  onCancel: () => void;
}

export default function ImageUploadForm({ initialData, onSave, onCancel }: ImageUploadFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [orderIndex, setOrderIndex] = useState(initialData?.order_index || 0);
  const [file, setFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isCropping, setIsCropping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setOriginalImage(url);
    setImageUrl(url); // Preview local temporário
    setIsCropping(true);
  };

  const onCropComplete = (_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleApplyCrop = async () => {
    if (!originalImage || !croppedAreaPixels) return;
    setLoading(true);
    try {
      const { url, file: croppedFile } = await getCroppedImg(originalImage, croppedAreaPixels);
      setFile(new File([croppedFile], file?.name || "imagem.jpg", { type: "image/jpeg" }));
      setImageUrl(url); // Preview local do crop
      setIsCropping(false);
    } catch (err) {
      setError("Erro ao recortar imagem");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      let finalImageUrl = initialData?.image_url || "";
      
      // Se há um novo arquivo para upload
      if (file) {
        const ext = file.name.split('.').pop();
        const fileName = `gallery-${Date.now()}.${ext}`;
        const filePath = `gallery/${fileName}`;
        
        // Upload para Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file, { upsert: false });
          
        if (uploadError) throw uploadError;
        
        // Obter URL pública
        const { data: publicUrlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
          
        finalImageUrl = publicUrlData.publicUrl;
      }

      if (initialData?.id) {
        // Update
        const { error: updateError } = await supabase
          .from('gallery_images')
          .update({
            title,
            image_url: finalImageUrl,
            is_active: isActive,
            order_index: orderIndex,
          })
          .eq('id', initialData.id);
          
        if (updateError) throw updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('gallery_images')
          .insert({
            title,
            image_url: finalImageUrl,
            is_active: isActive,
            order_index: orderIndex,
          });
          
        if (insertError) throw insertError;
      }
      
      onSave();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar imagem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">{initialData ? "Editar Imagem" : "Nova Imagem"}</h3>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Título</label>
        <input 
          type="text" 
          className="input w-full" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Imagem</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
        
        {isCropping && originalImage && (
          <div className="mt-2">
            <div className="relative w-full h-64 bg-gray-100">
              <Cropper
                image={originalImage}
                crop={crop}
                zoom={zoom}
                aspect={4/3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="flex gap-2 mt-2 justify-end">
              <StandardizedButton 
                type="button" 
                variant="secondary"
                onClick={() => setIsCropping(false)} 
                disabled={loading}
              >
                Cancelar
              </StandardizedButton>
              <StandardizedButton 
                type="button" 
                variant="primary"
                onClick={handleApplyCrop} 
                disabled={loading}
              >
                Aplicar
              </StandardizedButton>
            </div>
          </div>
        )}
        
        {imageUrl && !isCropping && (
          <div className="mt-2 relative w-full h-40">
            <OptimizedImage 
              src={imageUrl} 
              alt="Preview" 
              fill 
              className="object-contain rounded-sm border"
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={80}
              fallbackText="Preview"
            />
          </div>
        )}
      </div>
      
      <div className="mb-4 flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={isActive} 
            onChange={e => setIsActive(e.target.checked)} 
          /> 
          Ativo
        </label>
        <label className="flex items-center gap-2">
          Ordem:
          <input 
            type="number" 
            className="input w-20" 
            value={orderIndex} 
            onChange={e => setOrderIndex(Number(e.target.value))} 
          />
        </label>
      </div>
      
      <div className="flex gap-2 mt-4">
        <StandardizedButton 
          variant="primary"
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? "Salvando..." : (initialData ? "Salvar" : "Adicionar")}
        </StandardizedButton>
        <StandardizedButton 
          variant="secondary"
          onClick={onCancel} 
          disabled={loading}
        >
          Cancelar
        </StandardizedButton>
      </div>
    </div>
  );
} 