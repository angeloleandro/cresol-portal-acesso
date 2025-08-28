import AuthGuard from '@/app/components/AuthGuard';
import UsersClient from './components/UsersClient';
import { CreateClient } from '@/lib/supabase/server';

interface ProfileUser {
  id: string;
  full_name: string;
  email: string;
  position?: string;
  position_id?: string;
  work_location_id?: string;
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user';
  updated_at: string | null;
  avatar_url?: string;
}

interface WorkLocation {
  id: string;
  name: string;
}

interface Position {
  id: string;
  name: string;
  description?: string;
  department?: string;
}

interface Sector {
  id: string;
  name: string;
}

interface Subsector {
  id: string;
  name: string;
  sector_id: string;
}

async function loadInitialData() {
  const supabase = CreateClient();
  
  // Carregar todos os dados necessários em paralelo
  const [users, locations, positions, sectors, subsectors] = await Promise.all([
    supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        role,
        avatar_url,
        position,
        position_id,
        work_location_id,
        phone,
        bio,
        username,
        updated_at
      `)
      .order('full_name'),
    supabase
      .from('work_locations')
      .select(`
        id,
        name,
        address,
        phone,
        created_at,
        updated_at
      `)
      .order('name'),
    supabase
      .from('positions')
      .select(`
        id,
        name,
        description,
        department,
        created_at,
        updated_at
      `)
      .order('name'),
    supabase
      .from('sectors')
      .select(`
        id,
        name,
        slug,
        description,
        image_url,
        manager_id,
        created_at
      `)
      .order('name'),
    supabase
      .from('subsectors')
      .select(`
        id,
        name,
        slug,
        description,
        sector_id,
        created_at
      `)
      .order('name')
  ]);
  
  return {
    initialUsers: users.data || [],
    initialWorkLocations: locations.data || [],
    initialPositions: positions.data || [],
    initialSectors: sectors.data || [],
    initialSubsectors: subsectors.data || []
  };
}

export default async function UsersManagement() {
  const data = await loadInitialData();
  
  return (
    <AuthGuard requireRole="admin">
      <UsersClient {...data} />
    </AuthGuard>
  );
}