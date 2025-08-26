// Constantes relacionadas a arquivos e upload
// Centraliza tipos, tamanhos e validações de arquivos

export const FILE_TYPES = {
  // Documentos
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT: 'application/vnd.ms-powerpoint',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  TXT: 'text/plain',
  
  // Arquivos compactados
  ZIP: 'application/zip',
  RAR: 'application/x-rar-compressed',
  
  // Imagens
  JPEG: 'image/jpeg',
  JPG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  SVG: 'image/svg+xml',
  
  // Vídeos
  MP4: 'video/mp4',
  WEBM: 'video/webm',
  OGG: 'video/ogg',
  MOV: 'video/quicktime',
  AVI: 'video/x-msvideo',
} as const;

// Tipos permitidos por categoria
export const ALLOWED_DOCUMENT_TYPES = [
  FILE_TYPES.PDF,
  FILE_TYPES.DOC,
  FILE_TYPES.DOCX,
  FILE_TYPES.XLS,
  FILE_TYPES.XLSX,
  FILE_TYPES.PPT,
  FILE_TYPES.PPTX,
  FILE_TYPES.TXT,
  FILE_TYPES.ZIP,
  FILE_TYPES.RAR,
];

export const ALLOWED_IMAGE_TYPES = [
  FILE_TYPES.JPEG,
  FILE_TYPES.PNG,
  FILE_TYPES.GIF,
  FILE_TYPES.WEBP,
];

export const ALLOWED_VIDEO_TYPES = [
  FILE_TYPES.MP4,
  FILE_TYPES.WEBM,
  FILE_TYPES.OGG,
  FILE_TYPES.MOV,
];

// Alias para compatibilidade com código existente
export const ALLOWED_FILE_TYPES = ALLOWED_DOCUMENT_TYPES;

// Extensões permitidas
export const ALLOWED_EXTENSIONS = {
  documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar'],
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  videos: ['mp4', 'webm', 'ogg', 'mov', 'avi'],
};

// Mapeamento de extensão para MIME type
export const EXTENSION_TO_MIME: Record<string, string> = {
  pdf: FILE_TYPES.PDF,
  doc: FILE_TYPES.DOC,
  docx: FILE_TYPES.DOCX,
  xls: FILE_TYPES.XLS,
  xlsx: FILE_TYPES.XLSX,
  ppt: FILE_TYPES.PPT,
  pptx: FILE_TYPES.PPTX,
  txt: FILE_TYPES.TXT,
  zip: FILE_TYPES.ZIP,
  rar: FILE_TYPES.RAR,
  jpg: FILE_TYPES.JPEG,
  jpeg: FILE_TYPES.JPEG,
  png: FILE_TYPES.PNG,
  gif: FILE_TYPES.GIF,
  webp: FILE_TYPES.WEBP,
  mp4: FILE_TYPES.MP4,
  webm: FILE_TYPES.WEBM,
  ogg: FILE_TYPES.OGG,
  mov: FILE_TYPES.MOV,
  avi: FILE_TYPES.AVI,
};

// Funções utilitárias
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex > 0 && lastDotIndex < filename.length - 1) {
    return filename.substring(lastDotIndex + 1).toLowerCase();
  }
  return '';
}

export function isAllowedFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function isAllowedExtension(filename: string, allowedExtensions: string[]): boolean {
  const extension = getFileExtension(filename);
  return allowedExtensions.includes(extension);
}

export function getMimeTypeFromExtension(extension: string): string | undefined {
  return EXTENSION_TO_MIME[extension.toLowerCase()];
}