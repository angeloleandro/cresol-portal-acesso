// Tipos e interfaces para o sistema de notificações

export interface NotificationGroup {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  sector_id?: string;
  subsector_id?: string;
  created_at: string;
  sectors?: { name: string };
  subsectors?: { name: string };
  profiles?: { full_name?: string; email: string };
}

export interface User {
  id: string;
  full_name?: string;
  email: string;
  role: string;
  sector_id?: string;
  subsector_id?: string;
}

export interface NotificationFormData {
  title: string;
  message: string;
  type: string;
  priority: string;
  isGlobal: boolean;
  groups: string[];
  users: string[];
  expiresAt: string;
}

export interface GroupFormData {
  name: string;
  description: string;
  sectorId: string;
  subsectorId: string;
  members: string[];
}

export interface Sector {
  id: string;
  name: string;
}

export interface Subsector {
  id: string;
  name: string;
}

export type TabType = 'send' | 'groups' | 'history';

export type PriorityType = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationType = 'message' | 'system' | 'news' | 'event';

export interface PriorityOption {
  value: PriorityType;
  label: string;
  color: string;
  icon: string;
}