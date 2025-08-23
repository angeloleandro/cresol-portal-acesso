// Centralized hook for image upload and cropping functionality
// Used across admin panels for consistent image handling

import { useState, useRef, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase';
import { useAlert } from '@/app/components/alerts';
import { getCroppedImg, uploadImageToSupabase, validateImageFile } from '@/lib/utils/imageProcessing';
import { CropArea } from '@/lib/types/common';

interface UseImageUploadOptions {
  bucket?: string;
  folder?: string;
  useClientSupabase?: boolean;
}

interface UseImageUploadReturn {
  // States
  uploadingImage: boolean;
  imagePreview: string | null;
  originalImage: string | null;
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
  croppedAreaPixels: CropArea | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  
  // Actions
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

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const {
    bucket = 'images',
    folder = 'uploads',
    useClientSupabase = false
  } = options;

  const { showError, showWarning } = useAlert();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Refs to track created object URLs for proper cleanup
  const originalImageUrlRef = useRef<string | null>(null);
  const imagePreviewUrlRef = useRef<string | null>(null);

  // Select appropriate Supabase client
  const supabaseClient = useClientSupabase ? createClient() : supabase;

  const uploadImage = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const imageUrl = await uploadImageToSupabase(file, supabaseClient, bucket, folder);
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

      // Create a File from the Blob
      const croppedFile = new File([file], 'cropped-image.jpg', { type: 'image/jpeg' });
      
      // Upload cropped image
      const uploadedUrl = await uploadImage(croppedFile);
      
      // Revoke original URL after crop
      if (originalImageUrlRef.current) {
        URL.revokeObjectURL(originalImageUrlRef.current);
        originalImageUrlRef.current = null;
      }
      
      // Clear states
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
    // Revoke original URL if exists
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

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      showWarning(validation.error || 'Arquivo inválido');
      return;
    }

    // Revoke previous URL if exists
    if (originalImageUrlRef.current) {
      URL.revokeObjectURL(originalImageUrlRef.current);
    }

    // Create preview for cropping
    const fileUrl = URL.createObjectURL(file);
    originalImageUrlRef.current = fileUrl;
    setOriginalImage(fileUrl);
    setImagePreview(null);
  };

  const handleRemoveImage = () => {
    // Revoke object URLs
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

  // Cleanup effect to revoke URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up object URLs on unmount
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