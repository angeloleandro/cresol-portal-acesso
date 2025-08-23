/**
 * Common TypeScript interfaces used across the application
 */

/**
 * Interface for crop area coordinates
 * Used for image and video cropping functionality
 */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Interface for file validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Interface for upload progress tracking
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}