// Types centralizados para o módulo de gerenciamento de subsetores

export interface Profile {
  id: string;
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user';
  full_name: string;
  email: string;
}

export interface Subsector {
  id: string;
  name: string;
  description?: string;
  sector_id: string;
  sector_name?: string;
}

export interface SubsectorEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  subsector_id: string;
}

export interface SubsectorNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  subsector_id: string;
}

export interface SubsectorDocument {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  subsector_id: string;
}

export interface SubsectorVideo {
  id: string;
  subsector_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  thumbnail_timestamp: number | null;
  upload_type: 'youtube' | 'upload';
  file_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  duration: number | null;
  order_index: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface SubsectorImage {
  id: string;
  subsector_id: string;
  title: string;
  description: string | null;
  image_url: string;
  thumbnail_url: string | null;
  file_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  is_featured: boolean;
  is_published: boolean;
  order_index: number;
  processing_status: 'pending' | 'processing' | 'ready' | 'failed';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface System {
  id: string;
  name: string;
  description?: string;
  url: string;
  icon?: string;
}

export interface MessageGroup {
  id: string;
  name: string;
  description: string;
  color_theme: string;
  sector_id: string | null;
  subsector_id: string | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Campos relacionados
  sectors?: { name: string };
  subsectors?: { name: string; sectors: { name: string } };
  profiles?: { full_name: string };
}

// Mantendo interface Group para compatibilidade com código existente
export interface Group extends MessageGroup {
  is_automatic: boolean;
  members: string[];
}

export type MessageType = 'general' | 'urgent' | 'announcement';

export interface Message {
  title: string;
  message: string;
  type: MessageType;
  groups: string[];
  users: string[];
}

export interface SubsectorMessage {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  subsector_id: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  work_location_id: string | null;
}

export interface WorkLocation {
  id: string;
  name: string;
}

export type TabType = 'events' | 'news' | 'documents' | 'videos' | 'images' | 'systems' | 'groups' | 'messages' | 'team';

// Interface para dados do grupo no modal
export interface GroupData {
  name: string;
  description: string;
  members: string[];
}

// Estados dos modais
export interface ModalState<T> {
  isOpen: boolean;
  isEditing: boolean;
  currentItem: Partial<T>;
}

// Estados de confirmação de exclusão
export interface DeleteConfirmationState<T> {
  isOpen: boolean;
  itemToDelete: T | null;
  isDeleting: boolean;
}