// Types centralizados para o módulo de gerenciamento de setores

import { CropArea } from '@/lib/types/common';

export interface Sector {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Subsector {
  id: string;
  name: string;
  description: string;
  sector_id: string;
  created_at: string;
}

export interface SectorNews {
  id: string;
  sector_id: string;
  title: string;
  summary: string;
  content: string;
  image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SectorEvent {
  id: string;
  sector_id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SectorDocument {
  id: string;
  sector_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
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
  type?: 'manual' | 'automatic';
  members: string[];
  member_count: number;
}

export interface Message {
  id?: string;
  title: string;
  message: string; // Campo real no banco
  type: 'info' | 'warning' | 'success' | 'error' | 'event' | 'news';
  priority?: 'low' | 'normal' | 'high';
  sector_id?: string;
  subsector_id?: string | null;
  expires_at?: string | null;
  sent_by?: string | null;
  related_event_id?: string | null;
  related_news_id?: string | null;
  is_global?: boolean;
  created_at?: string;
  // Campos para compatibilidade com interface atual
  content?: string; // Mapeado de 'message'
  expire_at?: string; // Mapeado de 'expires_at'
  links?: Array<{
    url: string;
    text: string;
  }>;
  is_published?: boolean; // Para funcionalidade de rascunho (será simulado)
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  work_location_id: string | null;
  sector_id: string | null;
  role: string;
}

export interface WorkLocation {
  id: string;
  name: string;
  city: string;
  state: string;
}

export type TabType = 'news' | 'events' | 'documents' | 'subsectors' | 'groups' | 'messages';