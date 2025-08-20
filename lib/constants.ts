// Application constants

// Email validation
export const CRESOL_EMAIL_DOMAIN = '@cresol.com.br';

// Password generation
export const TEMP_PASSWORD_LENGTH = 10;
export const TEMP_PASSWORD_CHARSET = '36'; // Base36

// Admin configuration
export const ADMIN_EMAIL = 'comunicacao.fronteiras@cresol.com.br';
export const KNOWN_ADMIN_ID = '67552259-be23-4c9c-bd06-6d57a6c041eb';

// Helper functions
export function generateTemporaryPassword(): string {
  return Math.random().toString(36).slice(-TEMP_PASSWORD_LENGTH);
}

export function validateCrescolEmail(email: string): boolean {
  return email.endsWith(CRESOL_EMAIL_DOMAIN);
}

// File Size Limits (in bytes)
export const FILE_SIZE_LIMITS = {
  AVATAR_IMAGE: 2 * 1024 * 1024,     // 2MB
  SECTOR_IMAGE: 5 * 1024 * 1024,     // 5MB
  VIDEO_FILE: 500 * 1024 * 1024,     // 500MB
} as const;

// Video Configuration
export const VIDEO_CONFIG = {
  MAX_FILE_SIZE: FILE_SIZE_LIMITS.VIDEO_FILE,
  ALLOWED_MIME_TYPES: [
    'video/mp4',
    'video/webm', 
    'video/quicktime',
    'video/x-msvideo',
    'video/mov',
    'video/avi'
  ] as const,
  ALLOWED_EXTENSIONS: ['.mp4', '.webm', '.mov', '.avi'] as const,
  CACHE_CONTROL: '3600', // 1 hour
  UPLOAD_TYPE: {
    YOUTUBE: 'youtube' as const,
    DIRECT: 'direct' as const
  }
} as const;

// Image Configuration
export const IMAGE_CONFIG = {
  MAX_AVATAR_SIZE: FILE_SIZE_LIMITS.AVATAR_IMAGE,
  MAX_SECTOR_SIZE: FILE_SIZE_LIMITS.SECTOR_IMAGE,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

// Storage Configuration
export const STORAGE_CONFIG = {
  BUCKETS: {
    IMAGES: 'images' as const,
    VIDEOS: 'videos' as const,
  },
  FOLDERS: {
    AVATARS: 'avatars' as const,
    SECTOR_NEWS: 'sector-news' as const,
    BANNERS: 'banners' as const,
    VIDEO_UPLOADS: 'uploads' as const,
  }
} as const;