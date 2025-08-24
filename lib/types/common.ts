/**
 * Common TypeScript interfaces used across the application
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

/**
 * Common database row structure
 */
export interface DatabaseRow {
  id: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Generic API response structure
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

/**
 * Form field error structure
 */
export interface FieldError {
  message: string;
  type: string;
}

/**
 * Form state interface
 */
export interface FormState {
  isSubmitting: boolean;
  errors: Record<string, FieldError>;
  touched: Record<string, boolean>;
}

/**
 * Select option interface
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

/**
 * Supabase query result
 */
export interface SupabaseQueryResult<T = unknown> {
  data: T | null;
  error: { message: string; details?: string; hint?: string; code?: string } | null;
  status: number;
  statusText: string;
}

/**
 * User profile interface
 */
export interface UserProfile extends DatabaseRow {
  email: string;
  full_name: string;
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user';
  position?: string;
  sector_id?: string;
  subsector_id?: string;
  avatar_url?: string;
  is_active: boolean;
}

/**
 * File upload interface
 */
export interface FileUpload {
  file: File;
  name: string;
  type: string;
  size: number;
  url?: string;
  progress?: number;
}

/**
 * Generic table filters
 */
export interface TableFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

/**
 * Event handler types
 */
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
export type ClickHandler = (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void | Promise<void>;
export type KeyHandler = (event: React.KeyboardEvent) => void;

/**
 * Component props with children
 */
export interface WithChildren {
  children: React.ReactNode;
}

/**
 * Component props with optional className
 */
export interface WithClassName {
  className?: string;
}

/**
 * Modal props interface
 */
export interface ModalProps extends WithChildren {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Loading state interface
 */
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  data?: unknown;
}