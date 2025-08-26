// Tipos para o painel de administração de setores

export interface Sector {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at?: string;
}

export interface Subsector {
  id: string;
  sector_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface SectorNews {
  id: string;
  sector_id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface SectorEvent {
  id: string;
  sector_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface SectorMessage {
  id: string;
  sector_id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  is_published: boolean;
  created_at: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface SectorDocument {
  id: string;
  sector_id: string;
  title: string;
  description: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface SectorVideo {
  id: string;
  sector_id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  thumbnail_timestamp?: number;
  upload_type: 'youtube' | 'direct';
  is_published: boolean;
  created_at: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface SectorImage {
  id: string;
  sector_id: string;
  title: string;
  description?: string;
  image_url: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface MessageGroup {
  id: string;
  name: string;
  description?: string;
  user_ids: string[];
  created_at: string;
  updated_at?: string;
}

export interface GroupWithUsers extends MessageGroup {
  users?: Array<{
    id: string;
    email: string;
    full_name: string;
  }>;
  [key: string]: unknown;
}

export interface TeamMember {
  id: string;
  sector_id?: string;
  subsector_id?: string;
  user_id: string;
  position?: string;
  is_from_subsector?: boolean;
  profiles?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    position?: string;
  };
  subsectors?: {
    id: string;
    name: string;
  };
}

export interface WorkLocation {
  id: string;
  name: string;
  city?: string;
  state?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user';
  work_location_id?: string;
  work_locations?: WorkLocation;
}

// Tipos para tabs de navegação
export type TabType = 
  | 'news' 
  | 'events' 
  | 'messages' 
  | 'documents' 
  | 'videos' 
  | 'images' 
  | 'groups' 
  | 'subsectors'
  | 'team';

// Tipos para configuração de API
export interface ApiConfig {
  entityType: 'sector';
  apiEndpoint: string;
  entityIdField: string;
  useAlerts: boolean;
  requestStructure: 'admin' | 'sector';
}