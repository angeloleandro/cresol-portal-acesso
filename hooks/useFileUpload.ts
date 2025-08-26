// Hook reutilizável para upload de arquivos
// Centraliza lógica de upload, validação e gerenciamento de estado

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAlert } from '@/app/components/alerts';

interface UseFileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  bucket?: string;
  folder?: string;
  generateUniqueName?: boolean;
}

interface UseFileUploadReturn {
  file: File | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: () => void;
  uploadFile: () => Promise<string | null>;
  validateFile: (file: File) => boolean;
  resetUpload: () => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    bucket = 'images',
    folder = 'uploads',
    generateUniqueName = true,
  } = options;

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const { showError } = useAlert();
  const supabase = createClient();

  const validateFile = (fileToValidate: File): boolean => {
    // Reset error
    setError(null);

    // Validate size
    if (fileToValidate.size > maxSize) {
      const errorMsg = `Arquivo muito grande. Máximo: ${formatFileSize(maxSize)}`;
      setError(errorMsg);
      showError('Arquivo inválido', errorMsg);
      return false;
    }

    // Validate type
    if (allowedTypes.length > 0 && !allowedTypes.includes(fileToValidate.type)) {
      const errorMsg = 'Tipo de arquivo não permitido';
      setError(errorMsg);
      showError('Arquivo inválido', errorMsg);
      return false;
    }

    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }

    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      setError(null);
    } else {
      // Reset input
      event.target.value = '';
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setUploadProgress(0);
  };

  const generateFileName = (originalName: string): string => {
    if (!generateUniqueName) {
      return originalName;
    }

    // Extract extension
    const lastDotIndex = originalName.lastIndexOf('.');
    let extension = '';
    
    if (lastDotIndex > 0 && lastDotIndex < originalName.length - 1) {
      extension = originalName.substring(lastDotIndex + 1).toLowerCase();
      // Sanitize extension
      extension = extension.replace(/[^a-z0-9]/gi, '');
    }

    // Generate unique ID
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    // Create filename
    const prefix = folder.replace(/\//g, '-');
    return `${prefix}-${uniqueId}${extension ? `.${extension}` : ''}`;
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!file) {
      setError('Nenhum arquivo selecionado');
      return null;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      const fileName = generateFileName(file.name);
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase Storage
      // Note: Supabase doesn't support onUploadProgress natively
      // Setting progress to indeterminate state
      setUploadProgress(50);
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          upsert: false,
        });
      
      // Upload complete
      setUploadProgress(100);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setUploadProgress(100);
      return publicUrl;

    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao fazer upload do arquivo';
      setError(errorMsg);
      showError('Erro no upload', errorMsg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  };

  return {
    file,
    isUploading,
    uploadProgress,
    error,
    handleFileChange,
    removeFile,
    uploadFile,
    validateFile,
    resetUpload,
  };
}

// Utility function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}