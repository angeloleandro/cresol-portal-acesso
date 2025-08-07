/**
 * Video utility functions for Supabase Storage integration
 * 
 * This module provides comprehensive video file handling including:
 * - URL generation with fallback strategies
 * - File validation and accessibility checks
 * - Error recovery and graceful degradation
 * - Performance-optimized caching for URL resolution
 * 
 * Architecture Notes:
 * - Videos bucket is configured as public for direct access
 * - All functions include error handling with meaningful messages
 * - URL resolution includes accessibility validation to prevent broken links
 * - Fallback mechanisms ensure UI remains functional even with storage issues
 */

import { createClient } from '@/lib/supabase/client';
import { VIDEO_CONFIG, STORAGE_CONFIG } from '@/lib/constants';

// Performance optimization: URL validation cache
// Prevents redundant accessibility checks for recently validated URLs
const urlAccessibilityCache = new Map<string, { isAccessible: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Types
export interface VideoUrlResult {
  url: string | null;
  error: string | null;
  isValid: boolean;
}

export interface VideoValidationResult {
  isValid: boolean;
  fileExists: boolean;
  hasContent: boolean;
  fileSize: number;
  error?: string;
}

/**
 * Generate public or signed URL for video files
 * 
 * Uses public URLs since videos bucket is configured as public for optimal performance.
 * This approach eliminates the need for signed URL generation and reduces latency.
 * 
 * @param filePath - Path to the video file in Supabase Storage
 * @returns Promise<VideoUrlResult> - Object containing URL, error status, and validity
 */
export async function getVideoUrl(filePath: string): Promise<VideoUrlResult> {
  if (!filePath) {
    return {
      url: null,
      error: 'File path is required',
      isValid: false
    };
  }

  try {
    const supabase = createClient();
    
    // Since we've made the bucket public, use public URL
    const { data } = supabase.storage
      .from(STORAGE_CONFIG.BUCKETS.VIDEOS)
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      return {
        url: null,
        error: 'Failed to generate public URL',
        isValid: false
      };
    }

    return {
      url: data.publicUrl,
      error: null,
      isValid: true
    };

  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      isValid: false
    };
  }
}

/**
 * Validate video file exists and has content
 * 
 * Performs comprehensive validation including:
 * - File existence in Supabase Storage
 * - Content validation (non-zero file size)
 * - Metadata retrieval for size information
 * 
 * @param filePath - Path to the video file in Supabase Storage
 * @returns Promise<VideoValidationResult> - Detailed validation results with metrics
 */
export async function validateVideoFile(filePath: string): Promise<VideoValidationResult> {
  if (!filePath) {
    return {
      isValid: false,
      fileExists: false,
      hasContent: false,
      fileSize: 0,
      error: 'File path is required'
    };
  }

  try {
    const supabase = createClient();
    
    // Check if file exists in storage
    const { data: fileData, error: listError } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKETS.VIDEOS)
      .list('', {
        search: filePath.split('/').pop() // Get filename for search
      });

    if (listError) {
      return {
        isValid: false,
        fileExists: false,
        hasContent: false,
        fileSize: 0,
        error: listError.message
      };
    }

    // Find the specific file
    const file = fileData?.find(f => 
      filePath.endsWith(f.name) || filePath.includes(f.name)
    );

    if (!file) {
      return {
        isValid: false,
        fileExists: false,
        hasContent: false,
        fileSize: 0,
        error: 'File not found in storage'
      };
    }

    const fileSize = file.metadata?.size || 0;
    const hasContent = fileSize > 0;

    return {
      isValid: hasContent,
      fileExists: true,
      hasContent,
      fileSize,
      error: hasContent ? undefined : 'File exists but has no content (size: 0)'
    };

  } catch (error) {
    return {
      isValid: false,
      fileExists: false,
      hasContent: false,
      fileSize: 0,
      error: error instanceof Error ? error.message : 'Validation failed'
    };
  }
}

/**
 * Generate fallback URL for failed videos
 * Returns a placeholder or alternative URL
 */
export function getVideoFallbackUrl(originalUrl?: string): string {
  // For now, return a data URL with a simple SVG placeholder
  return 'data:image/svg+xml;base64,' + Buffer.from(`
    <svg width="320" height="180" xmlns="http://www.w3.org/2000/svg" style="background:#f5f5f5;">
      <rect width="100%" height="100%" fill="#e5e5e5"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16" fill="#666">
        Vídeo indisponível
      </text>
      <text x="50%" y="65%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="#999">
        Clique para tentar novamente
      </text>
    </svg>
  `).toString('base64');
}

/**
 * Check if URL is accessible (can be loaded)
 * 
 * Performance-optimized with 5-minute cache to prevent redundant network requests.
 * Uses HEAD requests for minimal bandwidth usage.
 * 
 * @param url - URL to validate
 * @returns Promise<boolean> - Whether the URL is accessible
 */
export async function checkVideoUrlAccessibility(url: string): Promise<boolean> {
  if (!url || url.startsWith('data:')) {
    return false;
  }

  // Check cache first for performance optimization
  const cached = urlAccessibilityCache.get(url);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.isAccessible;
  }

  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      cache: 'no-cache',
      // Performance: Set timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    const isAccessible = response.ok;
    
    // Cache the result for performance
    urlAccessibilityCache.set(url, { isAccessible, timestamp: now });
    
    // Performance: Clean old cache entries periodically
    if (urlAccessibilityCache.size > 100) {
      cleanupCache();
    }
    
    return isAccessible;
  } catch (error) {
    // Cache negative results too, but for shorter duration
    const isAccessible = false;
    urlAccessibilityCache.set(url, { isAccessible, timestamp: now - (CACHE_DURATION * 0.8) });
    return isAccessible;
  }
}

/**
 * Clean up expired cache entries for memory management
 * Called automatically when cache grows large
 */
function cleanupCache(): void {
  const now = Date.now();
  const urlsToDelete: string[] = [];
  
  urlAccessibilityCache.forEach((entry, url) => {
    if ((now - entry.timestamp) >= CACHE_DURATION) {
      urlsToDelete.push(url);
    }
  });
  
  urlsToDelete.forEach(url => urlAccessibilityCache.delete(url));
}

/**
 * Comprehensive video URL resolver with fallbacks
 */
export async function resolveVideoUrl(
  filePath: string | null, 
  fallbackUrl?: string
): Promise<string> {
  // If no file path, return fallback or placeholder
  if (!filePath) {
    return fallbackUrl || getVideoFallbackUrl();
  }

  // Try to get public URL
  const urlResult = await getVideoUrl(filePath);
  
  if (urlResult.isValid && urlResult.url) {
    // Validate that the URL is actually accessible
    const isAccessible = await checkVideoUrlAccessibility(urlResult.url);
    
    if (isAccessible) {
      return urlResult.url;
    }
  }

  // Fallback to provided URL or placeholder
  return fallbackUrl || getVideoFallbackUrl(urlResult.url || undefined);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Validate video MIME type against allowed types
 * 
 * @param mimeType - MIME type to validate
 * @returns boolean - Whether the MIME type is supported
 */
export function isValidVideoMimeType(mimeType: string): boolean {
  return VIDEO_CONFIG.ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase() as any);
}

/**
 * Get authenticated session for API calls
 * Centralized authentication helper to avoid code duplication
 */
export async function getAuthenticatedSession(): Promise<{ token: string; error: null } | { token: null; error: string }> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    return { token: null, error: 'Sessão não encontrada. Faça login novamente.' };
  }
  
  return { token: session.access_token, error: null };
}

/**
 * Make authenticated API request
 * Centralized request helper with error handling
 */
export async function makeAuthenticatedRequest(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const authResult = await getAuthenticatedSession();
  
  if (authResult.error) {
    throw new Error(authResult.error);
  }
  
  const headers = {
    'Authorization': `Bearer ${authResult.token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  return fetch(url, {
    ...options,
    headers
  });
}

/* 
 * ROADMAP: Future Video Compression Implementation
 * 
 * For future development, consider implementing client-side video compression:
 * 
 * Libraries to evaluate:
 * - ffmpeg.wasm: Full FFmpeg functionality in browser (large bundle ~20MB)
 * - videojs-contrib-hls: HLS streaming support for adaptive bitrate
 * - MediaRecorder API: Native browser compression for new recordings
 * 
 * Implementation considerations:
 * - Bundle size impact vs. compression benefits
 * - Client-side processing time and CPU usage
 * - Progressive upload with compression chunks
 * - Fallback to direct upload for unsupported browsers
 * - Quality presets (mobile, standard, high quality)
 * 
 * Recommended approach:
 * 1. Implement optional client-side compression as enhancement
 * 2. Maintain direct upload as primary method for reliability
 * 3. Add server-side processing queue for post-upload optimization
 * 4. Implement adaptive streaming for large video files
 */