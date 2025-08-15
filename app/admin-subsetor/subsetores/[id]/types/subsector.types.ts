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
  start_date: string;
  is_published: boolean;
  is_featured: boolean;
}

export interface SubsectorNews {
  id: string;
  title: string;
  summary: string;
  content?: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface System {
  id: string;
  name: string;
  description?: string;
  url: string;
  icon?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  subsector_id: string | null;
  is_automatic: boolean;
  members: string[];
  created_at: string;
}

export interface Message {
  title: string;
  message: string;
  type: string;
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