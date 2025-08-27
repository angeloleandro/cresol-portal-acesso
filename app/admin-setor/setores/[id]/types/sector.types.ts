// Tipos para o painel de administração de setores

// Domain interfaces - strict typing without index signatures
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
}

// DTO interfaces - for API responses with potential extra fields
export interface SubsectorDTO extends Subsector {
  [key: string]: unknown;
}

export interface SectorNewsDTO extends SectorNews {
  [key: string]: unknown;
}

export interface SectorEventDTO extends SectorEvent {
  [key: string]: unknown;
}

export interface SectorMessageDTO extends SectorMessage {
  [key: string]: unknown;
}

export interface SectorDocumentDTO extends SectorDocument {
  [key: string]: unknown;
}

export interface SectorVideoDTO extends SectorVideo {
  [key: string]: unknown;
}

export interface SectorImageDTO extends SectorImage {
  [key: string]: unknown;
}

export interface GroupWithUsersDTO extends GroupWithUsers {
  [key: string]: unknown;
}

// Mapper functions to convert DTOs to domain models
export function mapSubsectorFromDTO(dto: SubsectorDTO): Subsector {
  return {
    id: dto.id,
    sector_id: dto.sector_id,
    name: dto.name,
    description: dto.description,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

export function mapSectorNewsFromDTO(dto: SectorNewsDTO): SectorNews {
  return {
    id: dto.id,
    sector_id: dto.sector_id,
    title: dto.title,
    summary: dto.summary,
    content: dto.content,
    image_url: dto.image_url,
    is_published: dto.is_published,
    is_featured: dto.is_featured,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

export function mapSectorEventFromDTO(dto: SectorEventDTO): SectorEvent {
  return {
    id: dto.id,
    sector_id: dto.sector_id,
    title: dto.title,
    description: dto.description,
    start_date: dto.start_date,
    end_date: dto.end_date,
    location: dto.location,
    is_published: dto.is_published,
    is_featured: dto.is_featured,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

export function mapSectorMessageFromDTO(dto: SectorMessageDTO): SectorMessage {
  return {
    id: dto.id,
    sector_id: dto.sector_id,
    title: dto.title,
    content: dto.content,
    priority: dto.priority,
    is_published: dto.is_published,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

export function mapSectorDocumentFromDTO(dto: SectorDocumentDTO): SectorDocument {
  return {
    id: dto.id,
    sector_id: dto.sector_id,
    title: dto.title,
    description: dto.description,
    file_url: dto.file_url,
    file_size: dto.file_size,
    file_type: dto.file_type,
    is_published: dto.is_published,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

export function mapSectorVideoFromDTO(dto: SectorVideoDTO): SectorVideo {
  return {
    id: dto.id,
    sector_id: dto.sector_id,
    title: dto.title,
    description: dto.description,
    video_url: dto.video_url,
    thumbnail_url: dto.thumbnail_url,
    thumbnail_timestamp: dto.thumbnail_timestamp,
    upload_type: dto.upload_type,
    is_published: dto.is_published,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

export function mapSectorImageFromDTO(dto: SectorImageDTO): SectorImage {
  return {
    id: dto.id,
    sector_id: dto.sector_id,
    title: dto.title,
    description: dto.description,
    image_url: dto.image_url,
    is_published: dto.is_published,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

export function mapGroupWithUsersFromDTO(dto: GroupWithUsersDTO): GroupWithUsers {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    user_ids: dto.user_ids,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
    users: dto.users,
  };
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