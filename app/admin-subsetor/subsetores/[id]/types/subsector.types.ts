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

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TabType = 'events' | 'news' | 'systems' | 'groups' | 'messages';

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