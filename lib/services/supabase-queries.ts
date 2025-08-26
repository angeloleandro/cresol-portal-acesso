// Serviço centralizado de queries Supabase
// Elimina duplicação de queries em todo o projeto

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// ========== SECTORS ==========
export const sectorsQueries = {
  // Buscar setor por ID
  async getById(id: string) {
    return supabase
      .from('sectors')
      .select('*')
      .eq('id', id)
      .single();
  },

  // Buscar todos os setores
  async getAll() {
    return supabase
      .from('sectors')
      .select('*')
      .order('name');
  },

  // Buscar setores publicados
  async getPublished() {
    return supabase
      .from('sectors')
      .select('*')
      .eq('is_published', true)
      .order('name');
  },

  // Documentos do setor
  async getDocuments(sectorId: string, published = true) {
    const query = supabase
      .from('sector_documents')
      .select('*')
      .eq('sector_id', sectorId);
    
    if (published !== null) {
      query.eq('is_published', published);
    }
    
    return query.order('created_at', { ascending: false });
  },

  // Notícias do setor
  async getNews(sectorId: string, published = true) {
    const query = supabase
      .from('sector_news')
      .select('*')
      .eq('sector_id', sectorId);
    
    if (published !== null) {
      query.eq('is_published', published);
    }
    
    return query.order('created_at', { ascending: false });
  },

  // Eventos do setor
  async getEvents(sectorId: string, published = true) {
    const query = supabase
      .from('sector_events')
      .select('*')
      .eq('sector_id', sectorId);
    
    if (published !== null) {
      query.eq('is_published', published);
    }
    
    return query.order('event_date', { ascending: false });
  },

  // Imagens do setor
  async getImages(sectorId: string, published = true) {
    const query = supabase
      .from('sector_images')
      .select('*')
      .eq('sector_id', sectorId);
    
    if (published !== null) {
      query.eq('is_published', published);
    }
    
    return query.order('created_at', { ascending: false });
  },

  // Vídeos do setor
  async getVideos(sectorId: string, published = true) {
    const query = supabase
      .from('sector_videos')
      .select('*')
      .eq('sector_id', sectorId);
    
    if (published !== null) {
      query.eq('is_published', published);
    }
    
    return query.order('created_at', { ascending: false });
  },

  // Mensagens do setor
  async getMessages(sectorId: string, published = true) {
    const query = supabase
      .from('sector_messages')
      .select('*')
      .eq('sector_id', sectorId);
    
    if (published !== null) {
      query.eq('is_published', published);
    }
    
    return query.order('created_at', { ascending: false });
  },

  // Subsetores do setor
  async getSubsectors(sectorId: string) {
    return supabase
      .from('subsectors')
      .select('*')
      .eq('sector_id', sectorId)
      .order('name');
  },

  // Grupos do setor
  async getGroups(sectorId: string) {
    return supabase
      .from('message_groups')
      .select('*')
      .eq('sector_id', sectorId)
      .order('name');
  }
};

// ========== SUBSECTORS ==========
export const subsectorsQueries = {
  // Buscar subsetor por ID
  async getById(id: string) {
    return supabase
      .from('subsectors')
      .select('*, sector:sectors(*)')
      .eq('id', id)
      .single();
  },

  // Buscar todos os subsetores
  async getAll() {
    return supabase
      .from('subsectors')
      .select('*, sector:sectors(*)')
      .order('name');
  },

  // Documentos do subsetor
  async getDocuments(subsectorId: string, published = true) {
    const query = supabase
      .from('subsector_documents')
      .select('*')
      .eq('subsector_id', subsectorId);
    
    if (published !== null) {
      query.eq('is_published', published);
    }
    
    return query.order('created_at', { ascending: false });
  },

  // Notícias do subsetor
  async getNews(subsectorId: string, published = true) {
    const query = supabase
      .from('subsector_news')
      .select('*')
      .eq('subsector_id', subsectorId);
    
    if (published !== null) {
      query.eq('is_published', published);
    }
    
    return query.order('created_at', { ascending: false });
  },

  // Eventos do subsetor
  async getEvents(subsectorId: string, published = true) {
    const query = supabase
      .from('subsector_events')
      .select('*')
      .eq('subsector_id', subsectorId);
    
    if (published !== null) {
      query.eq('is_published', published);
    }
    
    return query.order('event_date', { ascending: false });
  },

  // Imagens do subsetor
  async getImages(subsectorId: string, published = true) {
    const query = supabase
      .from('subsector_images')
      .select('*')
      .eq('subsector_id', subsectorId);
    
    if (published !== null) {
      query.eq('is_published', published);
    }
    
    return query.order('created_at', { ascending: false });
  },

  // Vídeos do subsetor
  async getVideos(subsectorId: string, published = true) {
    const query = supabase
      .from('subsector_videos')
      .select('*')
      .eq('subsector_id', subsectorId);
    
    if (published !== null) {
      query.eq('is_published', published);
    }
    
    return query.order('created_at', { ascending: false });
  },

  // Mensagens do subsetor
  async getMessages(subsectorId: string, published = true) {
    const query = supabase
      .from('subsector_messages')
      .select('*')
      .eq('subsector_id', subsectorId);
    
    if (published !== null) {
      query.eq('is_published', published);
    }
    
    return query.order('created_at', { ascending: false });
  },

  // Membros da equipe do subsetor
  async getTeamMembers(subsectorId: string) {
    return supabase
      .from('subsector_team_members')
      .select('*')
      .eq('subsector_id', subsectorId)
      .order('order_index');
  },

  // Grupos do subsetor
  async getGroups(subsectorId: string) {
    return supabase
      .from('message_groups')
      .select('*')
      .eq('subsector_id', subsectorId)
      .order('name');
  }
};

// ========== STORAGE ==========
export const storageQueries = {
  // Upload de imagem
  async uploadImage(file: File, path: string, bucket = 'images') {
    return supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: false
      });
  },

  // Deletar imagem
  async deleteImage(path: string, bucket = 'images') {
    return supabase.storage
      .from(bucket)
      .remove([path]);
  },

  // Obter URL pública
  getPublicUrl(path: string, bucket = 'images') {
    return supabase.storage
      .from(bucket)
      .getPublicUrl(path);
  },

  // Upload com progress callback
  async uploadWithProgress(
    file: File,
    path: string,
    onProgress?: (progress: number) => void,
    bucket = 'images'
  ) {
    // Note: Supabase doesn't support onUploadProgress natively
    // Simulating progress feedback
    if (onProgress) {
      onProgress(50); // Indicate upload in progress
    }
    
    const result = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: false,
      });
    
    if (onProgress && !result.error) {
      onProgress(100); // Upload complete
    }
    
    return result;
  }
};

// ========== AUTH ==========
export const authQueries = {
  // Obter usuário atual
  async getCurrentUser() {
    return supabase.auth.getUser();
  },

  // Obter sessão
  async getSession() {
    return supabase.auth.getSession();
  },

  // Login com email
  async signInWithEmail(email: string, password: string) {
    return supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  // Logout
  async signOut() {
    return supabase.auth.signOut();
  },

  // Resetar senha
  async resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email);
  },

  // Atualizar senha
  async updatePassword(newPassword: string) {
    return supabase.auth.updateUser({
      password: newPassword
    });
  }
};

// ========== PROFILES ==========
export const profilesQueries = {
  // Buscar perfil por ID
  async getById(id: string) {
    return supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
  },

  // Buscar perfil por email
  async getByEmail(email: string) {
    return supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
  },

  // Atualizar perfil
  async update(id: string, data: any) {
    return supabase
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  // Buscar todos os perfis
  async getAll() {
    return supabase
      .from('profiles')
      .select('*')
      .order('full_name');
  },

  // Buscar perfis por role
  async getByRole(role: string) {
    return supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('full_name');
  },

  // Buscar perfis por setor
  async getBySector(sectorId: string) {
    return supabase
      .from('profiles')
      .select('*')
      .eq('sector_id', sectorId)
      .order('full_name');
  },

  // Buscar perfis por subsetor
  async getBySubsector(subsectorId: string) {
    return supabase
      .from('profiles')
      .select('*')
      .eq('subsector_id', subsectorId)
      .order('full_name');
  }
};

// ========== GENERIC CRUD ==========
export function createGenericQueries<T>(tableName: string) {
  return {
    // Create
    async create(data: Partial<T>) {
      return supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();
    },

    // Read (single)
    async getById(id: string) {
      return supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
    },

    // Read (all)
    async getAll() {
      return supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });
    },

    // Update
    async update(id: string, data: Partial<T>) {
      return supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
    },

    // Delete
    async delete(id: string) {
      return supabase
        .from(tableName)
        .delete()
        .eq('id', id);
    },

    // Bulk delete
    async bulkDelete(ids: string[]) {
      return supabase
        .from(tableName)
        .delete()
        .in('id', ids);
    },

    // Search
    async search(column: string, query: string) {
      return supabase
        .from(tableName)
        .select('*')
        .ilike(column, `%${query}%`)
        .order('created_at', { ascending: false });
    },

    // Paginated
    async getPaginated(page: number, limit = 10) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      return supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });
    }
  };
}

// Export tudo como queries padrão
export const queries = {
  sectors: sectorsQueries,
  subsectors: subsectorsQueries,
  storage: storageQueries,
  auth: authQueries,
  profiles: profilesQueries,
  generic: createGenericQueries
};