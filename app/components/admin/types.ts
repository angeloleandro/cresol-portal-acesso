import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { IconName } from '../icons/Icon';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: IconName;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface Filter {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: 'search' | 'select';
  placeholder?: string;
  options?: FilterOption[];
}

export interface Stats {
  total: number;
  filtered: number;
}

export interface Tab {
  id: string;
  label: string;
  icon?: IconName;
  count?: number;
}

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

// Tipos comuns para entidades administrativas
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUser extends SupabaseUser {
  profile?: {
    role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user';
    full_name?: string;
  };
}