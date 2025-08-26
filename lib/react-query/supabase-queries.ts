import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

const supabase = createClientComponentClient<Database>()

// Query Keys para cache consistent
export const queryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  sectors: ['sectors'] as const,
  sector: (id: string) => ['sectors', id] as const,
  subsectors: (sectorId?: string) => ['subsectors', sectorId] as const,
  messages: ['messages'] as const,
  economicIndicators: ['economic-indicators'] as const,
  banners: ['banners'] as const,
  gallery: ['gallery'] as const,
  videos: ['videos'] as const,
  systemLinks: ['system-links'] as const,
} as const

// USERS QUERIES - Otimizada sem SELECT *
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          role,
          sector_id,
          avatar_url,
          position,
          position_id,
          work_location_id,
          sectors!inner (
            id,
            name,
            slug
          )
        `)
        .order('full_name')
        .limit(500) // Paginação para performance

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5, // 5 minutos para dados de usuários
  })
}

export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          role,
          sector_id,
          avatar_url,
          position,
          position_id,
          work_location_id,
          sectors!left (
            id,
            name,
            slug
          )
        `)
        .eq('id', id)
        .maybeSingle() // Usar maybeSingle para evitar erro se não encontrar

      if (error) throw error
      return data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // Cache mais longo para dados de usuário individual
  })
}

// SECTORS QUERIES - Otimizada com índices específicos
export const useSectors = () => {
  return useQuery({
    queryKey: queryKeys.sectors,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          manager_id,
          profiles!sectors_manager_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .order('name')
        .limit(100) // Limite razoável

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 15, // 15 minutos para setores (dados estáveis)
  })
}

export const useSector = (id: string) => {
  return useQuery({
    queryKey: queryKeys.sector(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          created_at,
          manager_id,
          profiles!sectors_manager_id_fkey (
            full_name,
            email,
            avatar_url
          ),
          subsectors (
            id,
            name,
            slug,
            description
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  })
}

// SUBSECTORS QUERIES
export const useSubsectors = (sectorId?: string) => {
  return useQuery({
    queryKey: queryKeys.subsectors(sectorId),
    queryFn: async () => {
      let query = supabase
        .from('subsectors')
        .select(`
          id,
          name,
          slug,
          description,
          sector_id,
          created_at,
          sectors (
            name
          )
        `)

      if (sectorId) {
        query = query.eq('sector_id', sectorId)
      }

      const { data, error } = await query.order('name')

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 10,
  })
}

// MESSAGES QUERIES
export const useMessages = () => {
  return useQuery({
    queryKey: queryKeys.messages,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sector_messages')
        .select(`
          id,
          title,
          content,
          created_at,
          author_id,
          sector_id,
          profiles!sector_messages_author_id_fkey (
            full_name,
            avatar_url
          ),
          sectors (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 1, // 1 minuto para mensagens
  })
}

// ECONOMIC INDICATORS QUERIES
export const useEconomicIndicators = () => {
  return useQuery({
    queryKey: queryKeys.economicIndicators,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('economic_indicators')
        .select('id, name, value, unit, updated_at, trend')
        .eq('is_active', true)
        .order('display_order')

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 30, // 30 minutos para indicadores
  })
}

// BANNERS QUERIES
export const useBanners = () => {
  return useQuery({
    queryKey: queryKeys.banners,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('id, title, image_url, link_url, is_active, display_order')
        .eq('is_active', true)
        .order('display_order')

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 15, // 15 minutos para banners
  })
}

// GALLERY QUERIES
export const useGallery = () => {
  return useQuery({
    queryKey: queryKeys.gallery,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('id, title, image_url, thumbnail_url, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 10,
  })
}

// VIDEOS QUERIES
export const useVideos = () => {
  return useQuery({
    queryKey: queryKeys.videos,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('id, title, description, video_url, thumbnail_url, created_at')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 10,
  })
}

// SYSTEM LINKS QUERIES
export const useSystemLinks = () => {
  return useQuery({
    queryKey: queryKeys.systemLinks,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_links')
        .select('id, name, url, description, icon, category, is_active, display_order')
        .eq('is_active', true)
        .order('category')
        .order('display_order')

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 15,
  })
}

// MUTATIONS COM OPTIMISTIC UPDATES
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users })
      await queryClient.cancelQueries({ queryKey: queryKeys.user(id) })

      // Snapshot previous values
      const previousUsers = queryClient.getQueryData(queryKeys.users)
      const previousUser = queryClient.getQueryData(queryKeys.user(id))

      // Optimistically update
      queryClient.setQueryData(queryKeys.users, (old: any) => {
        if (!old) return old
        return old.map((user: any) =>
          user.id === id ? { ...user, ...updates } : user
        )
      })

      queryClient.setQueryData(queryKeys.user(id), (old: any) => {
        if (!old) return old
        return { ...old, ...updates }
      })

      return { previousUsers, previousUser }
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.users, context.previousUsers)
      }
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.user(id), context.previousUser)
      }
    },
    onSettled: (data, error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      queryClient.invalidateQueries({ queryKey: queryKeys.user(id) })
    },
  })
}