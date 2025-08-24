import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/production-logger';
import { supabase } from '@/lib/supabase';
import {
  GetCachedSectors, 
  SetCachedSectors,
  GetCachedUserProfile,
  SetCachedUserProfile
} from '@/lib/navbar-cache';

// Types
interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface Subsector {
  id: string;
  name: string;
  description?: string;
  sector_id: string;
}

interface Sector {
  id: string;
  name: string;
  description?: string;
  subsectors?: Subsector[];
}

interface UserProfile {
  role: string;
  isAdmin: boolean;
  isSectorAdmin: boolean;
}

/**
 * Hook otimizado para gerenciar estado do usuário
 */
/**
 * useOptimizedUser function
 * @todo Add proper documentation
 */
export function useOptimizedUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkUser = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getUser();
      
      if (!data.user) {
        setUser(null);
        setProfile(null);
        return;
      }

      setUser(data.user);

      // Verificar cache primeiro
      const cachedProfile = GetCachedUserProfile(data.user.id);
      if (cachedProfile) {
        const userProfile: UserProfile = {
          role: cachedProfile.role,
          isAdmin: cachedProfile.role === 'admin',
          isSectorAdmin: cachedProfile.role === 'sector_admin'
        };
        setProfile(userProfile);
        return;
      }

      // Buscar do banco se não estiver no cache
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const userProfile: UserProfile = {
        role: profileData?.role || 'user',
        isAdmin: profileData?.role === 'admin',
        isSectorAdmin: profileData?.role === 'sector_admin'
      };

      setProfile(userProfile);

      // Salvar no cache
      SetCachedUserProfile({
        id: data.user.id,
        role: userProfile.role,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name
      });

    } catch (error) {
      logger.error('NavbarHooks - Erro ao verificar usuário', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  }, [router]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  return {
    user,
    profile,
    loading,
    handleLogout
  };
}

/**
 * useOptimizedSectors function
 * @todo Add proper documentation
 */
export function useOptimizedSectors(
  userRole?: string, 
  userId?: string, 
  excludeAgencies: boolean = false,
  forNavigation: boolean = false
) {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSectors = useCallback(async () => {
    // Se for para navegação, sempre buscar todos os setores
    if (forNavigation) {
      try {
        // Verificar cache primeiro (cache de navegação é diferente)
        const cacheKey = `nav_sectors_all`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // Cache válido por 15 minutos
          if (Date.now() - timestamp < 900000) {
            const filteredSectors = excludeAgencies 
              ? data.filter((sector: Sector) => sector.id !== '5463d1ba-c290-428e-b39e-d7ad9c66eb71')
              : data;
            setSectors(filteredSectors);
            setLoading(false);
            return;
          }
        }

        // Buscar todos os setores para navegação
        const { data, error } = await supabase
          .from('sectors')
          .select('id, name, subsectors(id, name, sector_id)')
          .order('name', { ascending: true });

        if (!error) {
          // Salvar no cache
          localStorage.setItem(cacheKey, JSON.stringify({
            data: data || [],
            timestamp: Date.now()
          }));

          let sectorsData = data || [];
          if (excludeAgencies) {
            sectorsData = sectorsData.filter(sector => sector.id !== '5463d1ba-c290-428e-b39e-d7ad9c66eb71');
          }
          setSectors(sectorsData);
        }
      } catch (error) {

      } finally {
        setLoading(false);
      }
      return;
    }

    // Lógica original para quando não é navegação (admin panels)
    if (!userRole) return;

    try {
      // Verificar cache primeiro
      const cachedSectors = GetCachedSectors(userRole, userId);
      if (cachedSectors) {
        const filteredSectors = excludeAgencies 
          ? cachedSectors.filter((sector: Sector) => sector.id !== '5463d1ba-c290-428e-b39e-d7ad9c66eb71')
          : cachedSectors;
        setSectors(filteredSectors);
        setLoading(false);
        return;
      }

      if (userRole === 'sector_admin' && userId) {
        // Para admin de setor, buscar setores específicos
        const { data: sectorAdmins } = await supabase
          .from('sector_admins')
          .select('sector_id')
          .eq('user_id', userId);

        if (sectorAdmins && sectorAdmins.length > 0) {
          const sectorIds = sectorAdmins.map(admin => admin.sector_id);
          const { data: userSectors } = await supabase
            .from('sectors')
            .select('id, name, subsectors(id, name, sector_id)')
            .in('id', sectorIds)
            .order('name');

          let sectorsData = userSectors || [];
          if (excludeAgencies) {
            sectorsData = sectorsData.filter((sector: Sector) => sector.id !== '5463d1ba-c290-428e-b39e-d7ad9c66eb71');
          }
          setSectors(sectorsData);
          SetCachedSectors(sectorsData, userRole, userId);
        }
      } else {
        // Para outros usuários, buscar todos os setores
        const { data, error } = await supabase
          .from('sectors')
          .select('id, name, subsectors(id, name, sector_id)')
          .order('name', { ascending: true });

        if (!error) {
          let sectorsData = data || [];
          if (excludeAgencies) {
            sectorsData = sectorsData.filter((sector: Sector) => sector.id !== '5463d1ba-c290-428e-b39e-d7ad9c66eb71');
          }
          setSectors(sectorsData);
          SetCachedSectors(sectorsData, userRole, userId);
        }
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  }, [userRole, userId, excludeAgencies, forNavigation]);

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  return { sectors, loading };
}

/**
 * Hook otimizado para gerenciar agências (sub-setores do setor Agências)
 */
/**
 * useOptimizedAgencies function
 * @todo Add proper documentation
 */
export function useOptimizedAgencies() {
  const [agencies, setAgencies] = useState<Subsector[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgencies = useCallback(async () => {
    try {
      // ID específico do setor "Agências" identificado na análise
      const AGENCIES_SECTOR_ID = '5463d1ba-c290-428e-b39e-d7ad9c66eb71';

      // Verificar cache primeiro
      const cacheKey = `agencies_${AGENCIES_SECTOR_ID}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache válido por 15 minutos
        if (Date.now() - timestamp < 900000) {
          setAgencies(data);
          setLoading(false);
          return;
        }
      }

      // Buscar sub-setores específicos do setor Agências
      const { data, error } = await supabase
        .from('subsectors')
        .select('id, name, sector_id')
        .eq('sector_id', AGENCIES_SECTOR_ID)
        .order('name', { ascending: true });

      if (!error && data) {
        setAgencies(data);
        // Salvar no cache
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies]);

  return { agencies, loading };
}

/**
 * Hook otimizado para gerenciar dropdowns com timeout
 */
/**
 * useOptimizedDropdown function
 * @todo Add proper documentation
 */
export function useOptimizedDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300); // 300ms delay
  }, []);

  const forceClose = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(false);
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isOpen,
    handleOpen,
    handleClose,
    forceClose
  };
}