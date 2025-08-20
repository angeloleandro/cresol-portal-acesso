// Hook para gerenciamento de upload e recorte de imagens
// Padronizado com o setor para manter consistência

import { useState, useRef, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAlert } from '@/app/components/alerts';
import { getCroppedImg, uploadImageToSupabase, validateImageFile } from '../utils/imageProcessing';
import { CropArea } from '../types/subsector.types';

interface UseImageUploadReturn {
  // Estados
  uploadingImage: boolean;
  imagePreview: string | null;
  originalImage: string | null;
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
  croppedAreaPixels: CropArea | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  
  // Ações
  setCrop: (crop: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  setRotation: (rotation: number) => void;
  setCroppedAreaPixels: (area: CropArea | null) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCropImage: () => Promise<string | null>;
  handleCancelCrop: () => void;
  handleRemoveImage: () => void;
  onCropComplete: (croppedArea: any, croppedAreaPixels: CropArea) => void;
  uploadImage: (file: File) => Promise<string>;
}

export function useImageUpload(): UseImageUploadReturn {
  const { showError, showWarning } = useAlert();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Refs para rastrear URLs de objetos criados para limpeza adequada
  const originalImageUrlRef = useRef<string | null>(null);
  const imagePreviewUrlRef = useRef<string | null>(null);

  const supabase = createClient();

  const uploadImage = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const imageUrl = await uploadImageToSupabase(file, supabase);
      return imageUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropImage = async (): Promise<string | null> => {
    if (!originalImage || !croppedAreaPixels) return null;

    try {
      setUploadingImage(true);
      const { file } = await getCroppedImg(
        originalImage,
        croppedAreaPixels,
        rotation
      );

      // Criar um File a partir do Blob
      const croppedFile = new File([file], 'cropped-image.jpg', { type: 'image/jpeg' });
      
      // Fazer upload da imagem recortada
      const uploadedUrl = await uploadImage(croppedFile);
      
      // Revogar URL do original após o crop
      if (originalImageUrlRef.current) {
        URL.revokeObjectURL(originalImageUrlRef.current);
        originalImageUrlRef.current = null;
      }
      
      // Limpar estados
      setImagePreview(uploadedUrl);
      setOriginalImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      
      return uploadedUrl;
    } catch (error) {
      console.error('Erro ao recortar imagem:', error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCancelCrop = () => {
    // Revogar URL do original se existir
    if (originalImageUrlRef.current) {
      URL.revokeObjectURL(originalImageUrlRef.current);
      originalImageUrlRef.current = null;
    }
    
    setOriginalImage(null);
    setImagePreview(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      showWarning(validation.error || 'Arquivo inválido');
      return;
    }

    // Revogar URL anterior se existir
    if (originalImageUrlRef.current) {
      URL.revokeObjectURL(originalImageUrlRef.current);
    }

    // Criar preview para recorte
    const fileUrl = URL.createObjectURL(file);
    originalImageUrlRef.current = fileUrl;
    setOriginalImage(fileUrl);
    setImagePreview(null);
  };

  const handleRemoveImage = () => {
    // Revogar URLs de objetos
    if (originalImageUrlRef.current) {
      URL.revokeObjectURL(originalImageUrlRef.current);
      originalImageUrlRef.current = null;
    }
    if (imagePreviewUrlRef.current) {
      URL.revokeObjectURL(imagePreviewUrlRef.current);
      imagePreviewUrlRef.current = null;
    }
    
    setImagePreview(null);
    setOriginalImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cleanup effect para revogar URLs quando o componente desmontar
  useEffect(() => {
    return () => {
      // Limpar URLs de objetos ao desmontar
      if (originalImageUrlRef.current) {
        URL.revokeObjectURL(originalImageUrlRef.current);
      }
      if (imagePreviewUrlRef.current) {
        URL.revokeObjectURL(imagePreviewUrlRef.current);
      }
    };
  }, []);

  return {
    uploadingImage,
    imagePreview,
    originalImage,
    crop,
    zoom,
    rotation,
    croppedAreaPixels,
    fileInputRef,
    setCrop,
    setZoom,
    setRotation,
    setCroppedAreaPixels,
    handleFileChange,
    handleCropImage,
    handleCancelCrop,
    handleRemoveImage,
    onCropComplete,
    uploadImage
  };
}