import { CreateClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import UsersClient from './components/UsersClient';

interface ProfileUser {
  id: string;
  full_name: string;
  email: string;
  position?: string;
  position_id?: string;
  work_location_id?: string;
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user';
  created_at: string;
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

export default async function UsersManagement() {
  const supabase = CreateClient();
  
  // Verificar autenticação e permissões
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (!user || authError) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (!profile || profile.role !== 'admin') {
    redirect('/home');
  }

  // Buscar dados em paralelo no servidor
  const [usersResult, workLocationsResult, positionsResult, sectorsResult, subsectorsResult] = await Promise.all([
    // Usuários
    supabase
      .from('profiles')
      .select('id, full_name, email, position, position_id, work_location_id, role, avatar_url, created_at')
      .order('full_name'),
    
    // Locais de trabalho
    supabase
      .from('work_locations')
      .select('id, name')
      .order('name'),
    
    // Posições
    supabase
      .from('positions')
      .select('id, name, description, department')
      .order('name'),
    
    // Setores
    supabase
      .from('sectors')
      .select('id, name')
      .order('name'),
    
    // Subsetores
    supabase
      .from('subsectors')
      .select('id, name, sector_id')
      .order('name')
  ]);

  // Processar usuários
  const users: ProfileUser[] = usersResult.data?.map((profile: any) => ({
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    position: profile.position,
    position_id: profile.position_id,
    work_location_id: profile.work_location_id,
    role: profile.role,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at ? new Date(profile.created_at).toISOString() : new Date().toISOString()
  })) || [];

  const workLocations: WorkLocation[] = workLocationsResult.data || [];
  const positions: Position[] = positionsResult.data || [];
  const sectors: Sector[] = sectorsResult.data || [];
  const subsectors: Subsector[] = subsectorsResult.data || [];

  return (
    <UsersClient
      initialUsers={users}
      initialWorkLocations={workLocations}
      initialPositions={positions}
      initialSectors={sectors}
      initialSubsectors={subsectors}
    />
  );
}