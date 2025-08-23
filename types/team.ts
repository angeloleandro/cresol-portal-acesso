/**
 * Tipos compartilhados para funcionalidade de membros do time
 * Centraliza as definições de interface para evitar duplicação
 */

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  position?: string;
  work_location_id?: string;
  phone?: string;
  bio?: string;
  work_locations?: { 
    id?: string;
    name: string;
  };
}

export interface User extends Profile {
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user';
}

export interface SectorTeamMember {
  id: string;
  user_id: string;
  sector_id: string;
  position?: string;
  is_from_subsector: boolean;
  subsector_id?: string;
  created_at: string;
  profiles: Profile;
  subsectors?: {
    id: string;
    name: string;
  };
}

export interface SubsectorTeamMember {
  id: string;
  user_id: string;
  subsector_id: string;
  position?: string;
  created_at: string;
  profiles: Profile;
}

export interface Position {
  id: string;
  name: string;
  department?: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
}

export interface Subsector {
  id: string;
  name: string;
  description?: string;
  sector_id: string;
  sectors?: Sector | Sector[];
}