

export interface DashboardVideo {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  thumbnail_timestamp?: number | null;
  is_active: boolean;
  order_index: number;
  upload_type: 'youtube' | 'direct';
  file_path?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  original_filename?: string | null;
  processing_status?: string;
  upload_progress?: number;
  created_at?: string;
  updated_at?: string;
}

export interface VideoFormData {
  id?: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  thumbnail_timestamp?: number;
  is_active: boolean;
  order_index: number;
  upload_type: 'youtube' | 'direct';
  file_size?: number;
  original_filename?: string;
}

export interface VideoUploadProgress {
  id: string;
  progress: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  error?: string;
}

export interface VideoFilters {
  search: string;
  type: 'all' | 'youtube' | 'direct';
  status?: 'all' | 'active' | 'inactive' | 'processing';
}

export interface VideoStats {
  total: number;
  youtube: number;
  direct: number;
  active: number;
  inactive: number;
  processing: number;
}