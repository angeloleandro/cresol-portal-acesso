// Upload Utilities - Portal Cresol
// Utilitários para gerenciamento de upload de arquivos

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { COLLECTION_CONFIG, ERROR_MESSAGES } from '@/lib/constants/collections';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

// Cliente Supabase para componentes
const supabase = createClientComponentClient();

// Upload de capa de coleção com progress
export async function uploadCollectionCover(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Validar arquivo
    if (file.size > COLLECTION_CONFIG.MAX_FILE_SIZE) {
      return { success: false, error: ERROR_MESSAGES.FILE_TOO_LARGE };
    }

    if (!COLLECTION_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type as (typeof COLLECTION_CONFIG.ALLOWED_IMAGE_TYPES)[number])) {
      return { success: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE };
    }

    // Simular progress inicial
    onProgress?.({ loaded: 0, total: file.size, percentage: 0 });

    // Get auth session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Preparar FormData
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    // Fazer upload via API endpoint
    const response = await fetch('/api/collections/upload/cover', {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    // Simular progress de 100%
    onProgress?.({ loaded: file.size, total: file.size, percentage: 100 });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Erro no upload' };
    }

    const result = await response.json();
    return {
      success: true,
      url: result.file_url,
      path: result.file_path,
    };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR 
    };
  }
}

// Remover arquivo de capa
export async function removeCollectionCover(filePath: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`/api/collections/upload/cover?file_path=${encodeURIComponent(filePath)}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

// Upload direto para Supabase Storage (para casos específicos)
export async function uploadToSupabaseStorage(
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Simular progress inicial
    onProgress?.({ loaded: 0, total: file.size, percentage: 0 });

    // Converter arquivo para formato adequado
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);

    // Upload
    const { data: _data, error } = await supabase.storage
      .from(bucket)
      .upload(path, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    // Simular progress final
    onProgress?.({ loaded: file.size, total: file.size, percentage: 100 });

    return {
      success: true,
      url: publicUrl,
      path,
    };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR 
    };
  }
}

// Validar múltiplos arquivos
export function ValidateFiles(files: File[]): { valid: File[]; invalid: { file: File; error: string }[] } {
  const valid: File[] = [];
  const invalid: { file: File; error: string }[] = [];

  files.forEach(file => {
    // Validar tamanho
    if (file.size > COLLECTION_CONFIG.MAX_FILE_SIZE) {
      invalid.push({ file, error: ERROR_MESSAGES.FILE_TOO_LARGE });
      return;
    }

    // Validar tipo (imagens e vídeos)
    const allAllowedTypes = [
      ...COLLECTION_CONFIG.ALLOWED_IMAGE_TYPES,
      ...COLLECTION_CONFIG.ALLOWED_VIDEO_TYPES,
    ];

    if (!allAllowedTypes.includes(file.type as (typeof allAllowedTypes)[number])) {
      invalid.push({ file, error: ERROR_MESSAGES.INVALID_FILE_TYPE });
      return;
    }

    valid.push(file);
  });

  return { valid, invalid };
}

// Gerar nome único de arquivo
export function GenerateUniqueFileName(originalName: string, prefix = ''): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop() || '';
  
  const baseName = originalName
    .replace(/\.[^/.]+$/, '') // Remove extensão
    .replace(/[^a-zA-Z0-9]/g, '_') // Substitui caracteres especiais
    .substring(0, 50); // Limita tamanho

  return `${prefix}${baseName}_${timestamp}_${randomString}.${extension}`;
}

// Obter informações do arquivo
export function GetFileInfo(file: File) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    sizeFormatted: FormatFileSize(file.size),
    isImage: file.type.startsWith('image/'),
    isVideo: file.type.startsWith('video/'),
  };
}

// Formatar tamanho do arquivo
export function FormatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Criar preview de imagem
export function CreateImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Erro ao criar preview'));
    reader.readAsDataURL(file);
  });
}

// Verificar se arquivo é suportado
export function IsSupportedFile(file: File): boolean {
  const supportedTypes = [
    ...COLLECTION_CONFIG.ALLOWED_IMAGE_TYPES,
    ...COLLECTION_CONFIG.ALLOWED_VIDEO_TYPES,
  ];

  return supportedTypes.includes(file.type as (typeof supportedTypes)[number]) && 
         file.size <= COLLECTION_CONFIG.MAX_FILE_SIZE;
}