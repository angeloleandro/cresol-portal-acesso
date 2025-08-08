/**
 * Optimized Navbar Hooks
 * Hooks otimizados para o Navbar com memoização inteligente e cache
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  getCachedSectors, 
  setCachedSectors,
  getCachedNotifications,
  setCachedNotifications,
  updateCachedNotification,
  getCachedUserProfile,
  setCachedUserProfile
} from '@/lib/navbar-cache';

// Types
interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface Sector {
  id: string;
  name: string;
  description?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface UserProfile {
  role: string;
  isAdmin: boolean;
  isSectorAdmin: boolean;
}

/**
 * Hook otimizado para gerenciar estado do usuário
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
      const cachedProfile = getCachedUserProfile(data.user.id);
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
      setCachedUserProfile({
        id: data.user.id,
        role: userProfile.role,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name
      });

    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
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
 * Hook otimizado para gerenciar setores
 */
export function useOptimizedSectors(userRole?: string, userId?: string) {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSectors = useCallback(async () => {
    if (!userRole) return;

    try {
      // Verificar cache primeiro
      const cachedSectors = getCachedSectors(userRole, userId);
      if (cachedSectors) {
        setSectors(cachedSectors);
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
            .select('id, name, description')
            .in('id', sectorIds)
            .order('name');

          const sectorsData = userSectors || [];
          setSectors(sectorsData);
          setCachedSectors(sectorsData, userRole, userId);
        }
      } else {
        // Para outros usuários, buscar todos os setores
        const { data, error } = await supabase
          .from('sectors')
          .select('id, name, description')
          .order('name', { ascending: true });

        if (!error) {
          const sectorsData = data || [];
          setSectors(sectorsData);
          setCachedSectors(sectorsData, userRole, userId);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
    } finally {
      setLoading(false);
    }
  }, [userRole, userId]);

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  return { sectors, loading };
}

/**
 * Hook otimizado para gerenciar notificações
 */
export function useOptimizedNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastFetchRef = useRef<number>(0);
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    const now = Date.now();
    // Throttle: não buscar mais que 1x por 10 segundos
    if (now - lastFetchRef.current < 10000) return;

    try {
      // Verificar cache primeiro
      const cachedNotifications = getCachedNotifications(userId);
      if (cachedNotifications) {
        setNotifications(cachedNotifications);
        setUnreadCount(cachedNotifications.filter(n => !n.read).length);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
        setCachedNotifications(data, userId);
        lastFetchRef.current = now;
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Atualizar cache
      updateCachedNotification(userId, notificationId, { read: true });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
      setCachedNotifications(updatedNotifications, userId);
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  }, [userId, notifications]);

  // Fetch inicial
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling inteligente (apenas se há notificações não lidas)
  useEffect(() => {
    if (!userId) return;

    // Se há notificações não lidas, fazer polling mais frequente
    const interval = unreadCount > 0 ? 30000 : 60000; // 30s se há não lidas, 60s caso contrário

    fetchIntervalRef.current = setInterval(fetchNotifications, interval);

    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, [userId, fetchNotifications, unreadCount]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
}

/**
 * Hook otimizado para formatação de tempo relativo (memoizado)
 */
export function useRelativeTime() {
  const formatRelativeTime = useCallback((date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  }, []);

  return { formatRelativeTime };
}

/**
 * Hook otimizado para gerenciar dropdowns com timeout
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