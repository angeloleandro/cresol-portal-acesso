'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import Image from 'next/image';

interface User {
  id: string;
  full_name: string;
  email: string;
  position?: string;
  work_location_id?: string;
  role: 'admin' | 'sector_admin' | 'user';
  created_at: string;
  avatar_url?: string;
}

interface WorkLocation {
  id: string;
  name: string;
}

export default function UsersManagement() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, Partial<User>>>({});
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Estados para o formulário de novo usuário
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPosition, setNewUserPosition] = useState('');
  const [newUserWorkLocationId, setNewUserWorkLocationId] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'sector_admin' | 'admin'>('user');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [newUserAvatarFile, setNewUserAvatarFile] = useState<File | null>(null);
  const [newUserAvatarPreview, setNewUserAvatarPreview] = useState<string | null>(null);

  // Estados para o upload de avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState<string | null>(null);
  const [avatarFileForUser, setAvatarFileForUser] = useState<Record<string, File | null>>({});
  const [avatarPreviewForUser, setAvatarPreviewForUser] = useState<Record<string, string | null>>({});

  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null);
  const [roleUpdateError, setRoleUpdateError] = useState<string | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState<{userId: string, password: string} | null>(null);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

  const [sectors, setSectors] = useState<{ id: string, name: string }[]>([]);
  const [userSectors, setUserSectors] = useState<Record<string, string[]>>({});
  const [loadingSectors, setLoadingSectors] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        router.replace('/login');
        return;
      }

      setUser(userData.user);

      // Verificar se o usuário é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (profile?.role === 'admin') {
        setIsAdmin(true);
        fetchUsers();
        fetchWorkLocations();
        fetchSectors();
      } else {
        // Redirecionar usuários não-admin para o dashboard
        router.replace('/dashboard');
      }
    };

    checkUser();
  }, [router]);

  // Função para tratar erros de autenticação
  const handleAuthError = (error: string) => {
    // Verificar se o erro está relacionado à autenticação
    if (
      error.includes('não autenticado') || 
      error.includes('token inválido') || 
      error.includes('sessão inválida') ||
      error.includes('fazer login novamente')
    ) {
      alert('Sua sessão expirou. Você será redirecionado para a página de login.');
      router.replace('/login');
      return true;
    }
    return false;
  };

  const fetchUsers = async () => {
    setLoading(true);
    
    // Primeiro, buscar emails de usuários rejeitados na tabela access_requests
    const { data: rejectedRequests, error: rejectedError } = await supabase
      .from('access_requests')
      .select('email')
      .eq('status', 'rejected');
    
    if (rejectedError) {
      console.error('Erro ao buscar solicitações rejeitadas:', rejectedError);
    }
    
    // Criar um conjunto de emails rejeitados para fácil verificação
    const rejectedEmails = new Set((rejectedRequests || []).map(req => req.email.toLowerCase()));
    
    // Buscar todos os perfis
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar usuários:', error);
    } else {
      // Filtrar para excluir usuários rejeitados
      const filteredUsers = (data || []).filter(profile => 
        !rejectedEmails.has(profile.email.toLowerCase())
      );
      
      setUsers(filteredUsers);
      console.log('Usuários encontrados:', filteredUsers.length);
    }
    
    setLoading(false);
  };

  const fetchWorkLocations = async () => {
    const { data, error } = await supabase
      .from('work_locations')
      .select('id, name')
      .order('name');
    
    if (!error && data) setWorkLocations(data);
  };

  const fetchSectors = async () => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setSectors(data || []);
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
    }
  };

  const fetchUserSectors = async (userId: string) => {
    try {
      setLoadingSectors(true);
      const { data, error } = await supabase
        .from('sector_admins')
        .select('sector_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Armazenar os setores associados ao usuário
      const sectorIds = data ? data.map(item => item.sector_id) : [];
      setUserSectors({
        ...userSectors,
        [userId]: sectorIds
      });
    } catch (error) {
      console.error('Erro ao buscar setores do usuário:', error);
    } finally {
      setLoadingSectors(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);
    
    // Validar domínio de e-mail da Cresol
    if (!newUserEmail.endsWith('@cresol.com.br')) {
      setFormError('Por favor, utilize um e-mail corporativo da Cresol.');
      setFormLoading(false);
      return;
    }

    try {
      // Verificar se o email já existe localmente antes de chamar a API
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', newUserEmail)
        .maybeSingle();
      
      if (existingUser) {
        setFormError('Este e-mail já está cadastrado no sistema.');
        setFormLoading(false);
        return;
      }

      let avatarUrl = null;
      
      // Se houver um avatar, fazer o upload primeiro
      if (newUserAvatarFile) {
        try {
          setIsUploading(true);
          
          // Gerar um nome único para o arquivo
          const fileExt = newUserAvatarFile.name.split('.').pop();
          const fileName = `new-user-${Date.now()}.${fileExt}`;
          const filePath = `avatars/${fileName}`;
          
          // Fazer upload para o bucket 'images' no Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, newUserAvatarFile, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (uploadError) {
            throw uploadError;
          }
          
          // Obter a URL pública da imagem
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);
          
          avatarUrl = publicUrl;
        } catch (error) {
          console.error('Erro ao fazer upload da imagem:', error);
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          setFormError(`Erro ao fazer upload da imagem: ${errorMessage}`);
          setFormLoading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // Obter o token de acesso atual para autenticação
      const { data: { session } } = await supabase.auth.getSession();
      const adminToken = session?.access_token;

      if (!adminToken) {
        setFormError('Sessão de administrador inválida. Faça login novamente.');
        setFormLoading(false);
        return;
      }

      // Chamar a API para criar usuário
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUserEmail,
          fullName: newUserName,
          position: newUserPosition,
          workLocationId: newUserWorkLocationId || null,
          role: newUserRole,
          avatarUrl: avatarUrl,
          adminToken: adminToken // Enviar o token para autenticação
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao criar usuário');
      }

      setFormSuccess(`Usuário criado com sucesso! Senha temporária: ${data.tempPassword}`);
      
      // Limpar o formulário
      setNewUserEmail('');
      setNewUserName('');
      setNewUserPosition('');
      setNewUserWorkLocationId('');
      setNewUserRole('user');
      setNewUserAvatarFile(null);
      if (newUserAvatarPreview) {
        URL.revokeObjectURL(newUserAvatarPreview);
        setNewUserAvatarPreview(null);
      }
      
      // Recarregar a lista de usuários
      fetchUsers();
    } catch (error: unknown) {
      console.error('Erro ao criar usuário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Verificar se é um erro de autenticação
      if (errorMessage && !handleAuthError(errorMessage)) {
        setFormError(`Falha ao criar usuário: ${errorMessage}`);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    setEditingUserId(id);
    const user = users.find(u => u.id === id);
    if (user) {
      setEditData({
        [id]: {
          full_name: user.full_name,
          email: user.email,
          position: user.position || '',
          work_location_id: user.work_location_id || '',
          role: user.role, // Adicionar a role para que possa ser usada nas condições de renderização
        },
      });
      
      // Buscar os setores administrados pelo usuário
      fetchUserSectors(id);
    }
  };

  const handleEditChange = (id: string, field: keyof User, value: string) => {
    setEditData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>, userId: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Verificar o tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Verificar o tamanho do arquivo (limite de 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter menos de 2MB.');
        return;
      }
      
      // Armazenar o arquivo para o usuário específico
      setAvatarFileForUser(prev => ({
        ...prev,
        [userId]: file
      }));
      
      // Criar URL temporária para preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreviewForUser(prev => ({
        ...prev,
        [userId]: previewUrl
      }));
      
      // Definir o usuário que está editando o avatar
      setEditingAvatar(userId);
    }
  };

  const uploadAvatar = async (userId: string, file: File) => {
    if (!file) return null;
    
    try {
      setIsUploading(true);
      
      // Gerar um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Fazer upload para o bucket 'images' no Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Obter a URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditSave = async (id: string) => {
    const data = editData[id];
    if (!data) return;

    try {
      const updateData = {
        full_name: data.full_name,
        email: data.email,
        position: data.position,
        work_location_id: data.work_location_id,
      };

      // Se houver um novo avatar, fazer o upload e incluir a URL
      if (avatarFileForUser[id]) {
        try {
          const newAvatarUrl = await uploadAvatar(id, avatarFileForUser[id]!);
          if (newAvatarUrl) {
            // Adicionar a URL do avatar aos dados que serão atualizados
            Object.assign(updateData, { avatar_url: newAvatarUrl });
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          if (!handleAuthError(errorMessage)) {
            alert(`Erro ao fazer upload da imagem: ${errorMessage}`);
          }
          return;
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
      .eq('id', id);
      
      if (updateError) {
        if (!handleAuthError(updateError.message)) {
          throw new Error(`Erro ao atualizar usuário: ${updateError.message}`);
        }
        return;
      }
      
      // Atualizar os setores administrados pelo usuário
      const existingSectors = userSectors[id] || [];
      const selectedSectors = userSectors[id] || [];
      
      // Primeiro remover todos os setores deste usuário
      await supabase
        .from('sector_admins')
        .delete()
        .eq('user_id', id);
      
      // Depois adicionar os setores selecionados
      if (selectedSectors.length > 0) {
        const sectorInserts = selectedSectors.map(sectorId => ({
          user_id: id,
          sector_id: sectorId
        }));
        
        const { error: insertError } = await supabase
          .from('sector_admins')
          .insert(sectorInserts);
        
        if (insertError) {
          console.error('Erro ao atualizar setores administrados:', insertError);
        }
      }
    
      // Limpar estados de avatar após salvar
      if (avatarFileForUser[id]) {
        if (avatarPreviewForUser[id]) {
          URL.revokeObjectURL(avatarPreviewForUser[id]!);
        }
        
        setAvatarFileForUser(prev => {
          const newState = {...prev};
          delete newState[id];
          return newState;
        });
        
        setAvatarPreviewForUser(prev => {
          const newState = {...prev};
          delete newState[id];
          return newState;
        });
      }
      
    setEditingUserId(null);
      setEditingAvatar(null);
    fetchUsers();
    } catch (error: unknown) {
      console.error('Erro ao salvar edição:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      if (!handleAuthError(errorMessage)) {
        alert(`Erro ao salvar alterações: ${errorMessage}`);
      }
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleEditSave(id);
    } else if (e.key === 'Escape') {
      setEditingUserId(null);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'sector_admin' | 'admin') => {
    setUpdatingRoleUserId(userId);
    setRoleUpdateError(null);
    
    try {
      // Obter o email do usuário para verificar se não é o próprio admin atual
      const userToUpdate = users.find(u => u.id === userId);
      
      if (!userToUpdate) {
        throw new Error('Usuário não encontrado');
      }
      
      // Se o usuário for o próprio admin logado, impedir a alteração
      if (userToUpdate.id === user?.id) {
        throw new Error('Não é possível alterar seu próprio papel como administrador');
      }
      
      // Verificar se há algum problema de permissão
      const { data: userSession } = await supabase.auth.getSession();
      
      if (!userSession?.session) {
        throw new Error('Sua sessão expirou. Faça login novamente.');
      }
      
      const adminToken = userSession.session?.access_token;
      
      if (!adminToken) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }
      
      // Primeiro tentar atualizar diretamente
      let success = false;
      let apiError: Error | null = null;
      
      try {
        const directUpdateResult = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
        if (!directUpdateResult.error) {
          // Verificar se a atualização realmente aconteceu
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
          
          if (updatedProfile && updatedProfile.role === newRole) {
            success = true;
          } else {
            success = false;
          }
        } else {
          apiError = new Error(`${directUpdateResult.error.message}`);
        }
      } catch (directError) {
        apiError = directError instanceof Error 
          ? directError 
          : new Error('Erro desconhecido na atualização direta');
      }
      
      // Se o método direto falhar, tentar via API
      if (!success) {
        const apiPayload = {
          userId,
          newRole,
          adminId: user?.id,
          adminToken: adminToken
        };
        
        const response = await fetch('/api/admin/update-user-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiPayload),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          const errorMessage = result.error || 'Falha ao atualizar papel via API';
          if (handleAuthError(errorMessage)) {
            return;
          }
          throw new Error(errorMessage);
        }
        
        // Verificar novamente se a atualização realmente aconteceu
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (updatedProfile && updatedProfile.role === newRole) {
          success = true;
        }
      }
      
      // Recarregar a lista de usuários para refletir as mudanças
      await fetchUsers();
      
      if (success) {
        const roleDisplay = newRole === 'admin' ? 'Administrador' : newRole === 'sector_admin' ? 'Admin. Setorial' : 'Usuário';
        alert(`Papel do usuário ${userToUpdate.full_name} alterado para ${roleDisplay}`);
      } else {
        throw new Error('Não foi possível confirmar a alteração do papel do usuário após múltiplas tentativas');
      }
    } catch (error: unknown) {
      console.error('Erro ao atualizar papel do usuário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (!handleAuthError(errorMessage)) {
        setRoleUpdateError(errorMessage);
        alert(`Erro ao atualizar papel: ${errorMessage}`);
      }
    } finally {
      setUpdatingRoleUserId(null);
    }
  };

  // Função para deletar um usuário e marcá-lo como rejeitado
  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      // Primeiro obter o email do usuário
      const userToDelete = users.find(u => u.id === userId);
      if (!userToDelete) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se existe uma solicitação de acesso para este email
      const { data: accessRequests, error: requestError } = await supabase
        .from('access_requests')
        .select('id, status')
        .eq('email', userToDelete.email);
      
      if (requestError) {
        if (!handleAuthError(requestError.message)) {
          throw new Error(`Erro ao verificar solicitações: ${requestError.message}`);
        }
        return;
      }

      // Se houver solicitação, atualizar para rejeitado
      if (accessRequests && accessRequests.length > 0) {
        for (const request of accessRequests) {
          if (request.status !== 'rejected') {
            // Obter token para enviar à API
            const { data: { session } } = await supabase.auth.getSession();
            const adminToken = session?.access_token;
            
            if (!adminToken) {
              if (!handleAuthError('Sessão inválida')) {
                throw new Error('Sessão de administrador inválida');
              }
              return;
            }
            
            // Chamar a API para marcar como rejeitado
            const response = await fetch('/api/admin/approve-access-request', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                accessRequestId: request.id,
                adminUserId: user?.id,
                adminToken: adminToken,
                editedUserData: {
                  email: userToDelete.email,
                  full_name: userToDelete.full_name,
                  position: userToDelete.position || '',
                  work_location_id: userToDelete.work_location_id || '',
                },
                targetStatus: 'rejected',
              }),
            });

            if (!response.ok) {
              const result = await response.json();
              const errorMsg = result.error || 'Erro desconhecido';
              if (!handleAuthError(errorMsg)) {
                throw new Error(`Erro ao rejeitar solicitação: ${errorMsg}`);
              }
              return;
            }
          }
        }
      } else {
        // Se não houver solicitação existente, criar uma nova como rejeitada
        const { error: createError } = await supabase
          .from('access_requests')
          .insert({
            email: userToDelete.email,
            full_name: userToDelete.full_name,
            position: userToDelete.position,
            work_location_id: userToDelete.work_location_id,
            status: 'rejected',
            processed_by: user?.id,
          });
        
        if (createError) {
          if (!handleAuthError(createError.message)) {
            throw new Error(`Erro ao criar registro de rejeição: ${createError.message}`);
          }
          return;
        }
      }

      // Deletar o usuário
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (deleteError) {
        if (!handleAuthError(deleteError.message)) {
          throw new Error(`Erro ao deletar usuário: ${deleteError.message}`);
        }
        return;
      }

      alert('Usuário removido com sucesso e acesso bloqueado');
      fetchUsers();
    } catch (error: unknown) {
      console.error('Erro ao deletar usuário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      if (!handleAuthError(errorMessage)) {
        alert(`Erro ao deletar usuário: ${errorMessage}`);
      }
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleNewUserAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Verificar o tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setFormError('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Verificar o tamanho do arquivo (limite de 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setFormError('A imagem deve ter menos de 2MB.');
        return;
      }
      
      setNewUserAvatarFile(file);
      
      // Criar URL temporária para preview
      const previewUrl = URL.createObjectURL(file);
      setNewUserAvatarPreview(previewUrl);
      
      // Limpar mensagens de erro
      setFormError(null);
    }
  };

  const handleSectorChange = (userId: string, sectorId: string, isChecked: boolean) => {
    setUserSectors(prev => {
      const currentSectors = prev[userId] || [];
      
      if (isChecked) {
        // Adicionar setor se não estiver já incluído
        return {
          ...prev,
          [userId]: [...currentSectors, sectorId].filter((v, i, a) => a.indexOf(v) === i)
        };
      } else {
        // Remover setor
        return {
          ...prev,
          [userId]: currentSectors.filter(id => id !== sectorId)
        };
      }
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesLocation = locationFilter === 'all' || user.work_location_id === locationFilter;
    
    return matchesSearch && matchesRole && matchesLocation;
  });

  // Função para resetar a senha de um usuário
  const handleResetPassword = async (userId: string) => {
    if (!userId) return;
    
    setResetPasswordUserId(userId);
    setResetPasswordLoading(true);
    setResetPasswordError(null);
    setResetPasswordSuccess(null);
    
    try {
      // Obter o token de acesso atual para autenticação
      const { data: { session } } = await supabase.auth.getSession();
      const adminToken = session?.access_token;
      
      if (!adminToken) {
        throw new Error('Sessão de administrador inválida. Faça login novamente.');
      }
      
      // Gerar nova senha aleatória
      const newPassword = Math.random().toString(36).slice(-10);
      
      // Chamar a API do Next.js para resetar a senha
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newPassword,
          adminToken
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao redefinir senha');
      }
      
      setResetPasswordSuccess({
        userId,
        password: newPassword
      });
      
    } catch (error: unknown) {
      console.error('Erro ao resetar senha:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Verificar se é um erro de autenticação
      if (!handleAuthError(errorMessage)) {
        setResetPasswordError(`Erro ao resetar senha: ${errorMessage}`);
      }
    } finally {
      setResetPasswordLoading(false);
    }
  };

  if (loading && !users.length) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-cresol-gray">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 border-b border-cresol-gray-light pb-4 flex flex-col md:flex-row md:justify-between md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Gestão de Usuários</h2>
            <p className="text-cresol-gray mb-4 md:mb-0">Gerencie os usuários do portal.</p>
          </div>
          
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
          >
            {showForm ? 'Cancelar' : 'Adicionar Usuário'}
          </button>
        </div>
        
        {/* Formulário de cadastro de usuário */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-6 mb-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Cadastrar Novo Usuário</h3>
            
            {formError && (
              <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">
                {formSuccess}
              </div>
            )}
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row items-start gap-6 mb-4">
                <div className="flex-shrink-0">
                  <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 border border-cresol-gray-light">
                    {newUserAvatarPreview ? (
                      <Image
                        src={newUserAvatarPreview}
                        alt="Preview de avatar"
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                        <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-cresol-gray mb-2" htmlFor="newUserAvatar">
                    Foto de Perfil
                  </label>
                  <div className="flex items-center">
                    <label className="cursor-pointer bg-white border border-cresol-gray-light px-3 py-2 rounded-md text-sm text-cresol-gray hover:bg-gray-50 transition-colors" htmlFor="newUserAvatar">
                      {isUploading ? 'Carregando...' : 'Escolher arquivo'}
                      <input
                        type="file"
                        id="newUserAvatar"
                        className="hidden"
                        accept="image/*"
                        onChange={handleNewUserAvatarChange}
                        disabled={isUploading}
                      />
                    </label>
                    {newUserAvatarPreview && (
                      <button
                        type="button"
                        className="ml-2 text-sm text-red-500 hover:text-red-700"
                        onClick={() => {
                          URL.revokeObjectURL(newUserAvatarPreview);
                          setNewUserAvatarPreview(null);
                          setNewUserAvatarFile(null);
                        }}
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-cresol-gray">
                    Recomendado: JPG, PNG. Máximo 2MB.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="newUserName" className="block text-sm font-medium text-cresol-gray mb-1">
                    Nome Completo
                  </label>
                  <input
                    id="newUserName"
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Nome completo do usuário"
                  />
                </div>
                
                <div>
                  <label htmlFor="newUserEmail" className="block text-sm font-medium text-cresol-gray mb-1">
                    E-mail Corporativo
                  </label>
                  <input
                    id="newUserEmail"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="email@cresol.com.br"
                  />
                </div>
                
                <div>
                  <label htmlFor="newUserPosition" className="block text-sm font-medium text-cresol-gray mb-1">
                    Cargo
                  </label>
                  <input
                    id="newUserPosition"
                    type="text"
                    value={newUserPosition}
                    onChange={(e) => setNewUserPosition(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Cargo"
                  />
                </div>
                
                <div>
                  <label htmlFor="newUserWorkLocation" className="block text-sm font-medium text-cresol-gray mb-1">
                    Local de Atuação
                  </label>
                  <select
                    id="newUserWorkLocation"
                    value={newUserWorkLocationId}
                    onChange={(e) => setNewUserWorkLocationId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Selecione o local</option>
                    {workLocations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="newUserRole" className="block text-sm font-medium text-cresol-gray mb-1">
                    Papel no Sistema
                  </label>
                  <select
                    id="newUserRole"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as 'user' | 'sector_admin' | 'admin')}
                    required
                    className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="user">Usuário</option>
                    <option value="sector_admin">Administrador de Setor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
                  disabled={formLoading}
                >
                  {formLoading ? 'Cadastrando...' : 'Cadastrar Usuário'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Controles de busca e filtro */}
        <div className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="searchTerm" className="block text-xs font-medium text-cresol-gray mb-1">
                Buscar usuários
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-cresol-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="searchTerm"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome, e-mail ou cargo"
                  className="w-full pl-10 pr-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="roleFilter" className="block text-xs font-medium text-cresol-gray mb-1">
                Filtrar por papel
              </label>
              <select
                id="roleFilter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">Todos</option>
                <option value="admin">Administrador</option>
                <option value="sector_admin">Admin. Setorial</option>
                <option value="user">Usuário</option>
              </select>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="locationFilter" className="block text-xs font-medium text-cresol-gray mb-1">
                Filtrar por local
              </label>
              <select
                id="locationFilter"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">Todos os locais</option>
                {workLocations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Estatísticas e resultados */}
          <div className="mt-4 flex flex-wrap items-center justify-between">
            <div className="text-sm text-cresol-gray">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}
            </div>
            
            {(searchTerm || roleFilter !== 'all' || locationFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setLocationFilter('all');
                }}
                className="text-sm text-primary hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
        
        {/* Lista de usuários */}
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-8 text-center">
            <p className="text-cresol-gray">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map(u => (
              <div key={u.id} className="bg-white rounded-lg shadow-sm border border-cresol-gray-light overflow-hidden hover:shadow-md transition-shadow">
                {/* Cabeçalho do card com avatar e nome */}
                <div className="flex items-center p-4 border-b border-cresol-gray-light">
                  <div className="relative h-14 w-14 rounded-full overflow-hidden bg-gray-100 border border-cresol-gray-light mr-3">
                    {u.avatar_url ? (
                      <Image
                        src={u.avatar_url}
                        alt={`Avatar de ${u.full_name}`}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                        <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-cresol-gray truncate">{u.full_name}</h3>
                    <p className="text-xs text-cresol-gray-dark truncate">{u.email}</p>
                  </div>
                  <div>
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/10 text-primary min-w-[90px] justify-center">
                      {u.role === 'admin' ? 'Administrador' : u.role === 'sector_admin' ? 'Admin. Setorial' : 'Usuário'}
                    </span>
                  </div>
                </div>
                
                {/* Corpo do card com informações */}
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex">
                      <span className="text-xs font-medium text-cresol-gray-dark w-28">Cargo:</span>
                      <span className="text-xs text-cresol-gray flex-1">{u.position || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-xs font-medium text-cresol-gray-dark w-28">Local:</span>
                      <span className="text-xs text-cresol-gray flex-1">
                        {workLocations.find(loc => loc.id === u.work_location_id)?.name || '-'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Rodapé do card com ações */}
                <div className="p-4 bg-gray-50 border-t border-cresol-gray-light flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="text-primary text-sm hover:underline"
                      onClick={() => handleEdit(u.id)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="text-red-600 text-sm hover:underline"
                      onClick={() => {
                        if (window.confirm(`Tem certeza que deseja excluir o usuário ${u.full_name}? Isso bloqueará o acesso permanentemente.`)) {
                          handleDeleteUser(u.id);
                        }
                      }}
                      disabled={deletingUserId === u.id}
                    >
                      {deletingUserId === u.id ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </div>
                  
                  <div className="relative">
                    {updatingRoleUserId === u.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                        <div className="w-4 h-4 border-t-2 border-b-2 border-primary rounded-full animate-spin" />
                      </div>
                    )}
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateUserRole(u.id, e.target.value as 'user' | 'sector_admin' | 'admin')}
                      className="text-xs border border-cresol-gray-light rounded py-1 px-2"
                      disabled={updatingRoleUserId === u.id || u.id === user?.id}
                    >
                      <option value="user">Usuário</option>
                      <option value="sector_admin">Admin. Setorial</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                
                {/* Modal de edição se estiver editando */}
                {editingUserId === u.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 mx-4 relative">
                      <button
                        type="button"
                        className="absolute top-4 right-4 text-cresol-gray hover:text-cresol-gray-dark"
                        onClick={() => setEditingUserId(null)}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      
                      <h3 className="text-lg font-semibold text-primary mb-4">Editar Usuário</h3>
                      
                      <div className="mb-6 flex justify-center">
                        <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 border border-cresol-gray-light">
                          {(avatarPreviewForUser[u.id] || u.avatar_url) ? (
                            <Image
                              src={avatarPreviewForUser[u.id] || u.avatar_url || ''}
                              alt={`Avatar de ${u.full_name}`}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                              <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4 flex justify-center">
                        <label className="cursor-pointer bg-white border border-cresol-gray-light px-3 py-2 rounded-md text-sm text-cresol-gray hover:bg-gray-50 transition-colors" htmlFor={`avatarUpload-${u.id}`}>
                          {isUploading && editingAvatar === u.id ? 'Carregando...' : 'Alterar foto'}
                        <input
                            type="file"
                            id={`avatarUpload-${u.id}`}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleAvatarChange(e, u.id)}
                            disabled={isUploading}
                          />
                        </label>
                        
                        {avatarPreviewForUser[u.id] && (
                          <button
                            type="button"
                            className="ml-2 text-sm text-red-500 hover:text-red-700"
                            onClick={() => {
                              if (avatarPreviewForUser[u.id]) {
                                URL.revokeObjectURL(avatarPreviewForUser[u.id]!);
                              }
                              setAvatarPreviewForUser(prev => ({
                                ...prev,
                                [u.id]: null
                              }));
                              setAvatarFileForUser(prev => ({
                                ...prev,
                                [u.id]: null
                              }));
                            }}
                          >
                            Remover
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor={`name-${u.id}`} className="block text-sm font-medium text-cresol-gray mb-1">
                            Nome Completo
                          </label>
                          <input
                            id={`name-${u.id}`}
                          type="text"
                            className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          value={editData[u.id]?.full_name || ''}
                          onChange={e => handleEditChange(u.id, 'full_name', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor={`email-${u.id}`} className="block text-sm font-medium text-cresol-gray mb-1">
                            E-mail
                          </label>
                        <input
                            id={`email-${u.id}`}
                          type="email"
                            className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          value={editData[u.id]?.email || ''}
                          onChange={e => handleEditChange(u.id, 'email', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor={`position-${u.id}`} className="block text-sm font-medium text-cresol-gray mb-1">
                            Cargo
                          </label>
                        <input
                            id={`position-${u.id}`}
                          type="text"
                            className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          value={editData[u.id]?.position || ''}
                          onChange={e => handleEditChange(u.id, 'position', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor={`location-${u.id}`} className="block text-sm font-medium text-cresol-gray mb-1">
                            Local de Atuação
                          </label>
                        <select
                            id={`location-${u.id}`}
                            className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          value={editData[u.id]?.work_location_id || ''}
                          onChange={e => handleEditChange(u.id, 'work_location_id', e.target.value)}
                        >
                          <option value="">Selecione</option>
                          {workLocations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                          ))}
                        </select>
                        </div>
                        
                        {/* Setores administrados - apenas para admins de setor */}
                        {editData[u.id]?.role === 'sector_admin' && (
                          <div className="border-t border-cresol-gray-light pt-4 mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium text-cresol-gray">
                                Setores administrados
                              </label>
                            </div>
                            
                            {loadingSectors ? (
                              <div className="text-center py-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary mx-auto"></div>
                              </div>
                            ) : (
                              <div className="max-h-40 overflow-y-auto">
                                {sectors.length === 0 ? (
                                  <p className="text-sm text-cresol-gray">Nenhum setor disponível</p>
                                ) : (
                                  <div className="space-y-2">
                                    {sectors.map(sector => (
                                      <div key={sector.id} className="flex items-center">
                                        <input
                                          type="checkbox"
                                          id={`sector-${u.id}-${sector.id}`}
                                          checked={userSectors[u.id]?.includes(sector.id) || false}
                                          onChange={(e) => handleSectorChange(u.id, sector.id, e.target.checked)}
                                          className="h-4 w-4 text-primary border-cresol-gray-light rounded focus:ring-primary"
                                        />
                                        <label 
                                          htmlFor={`sector-${u.id}-${sector.id}`}
                                          className="ml-2 text-sm text-cresol-gray"
                                        >
                                          {sector.name}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <p className="text-xs text-cresol-gray mt-2">
                              Selecione os setores que este administrador setorial irá gerenciar.
                            </p>
                          </div>
                        )}
                        
                        {/* Redefinição de senha */}
                        <div className="border-t border-cresol-gray-light pt-4 mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-cresol-gray">
                              Senha
                            </label>
                        <button
                              type="button"
                              onClick={() => handleResetPassword(u.id)}
                              className="text-xs text-primary hover:underline"
                              disabled={resetPasswordLoading && resetPasswordUserId === u.id}
                            >
                              {resetPasswordLoading && resetPasswordUserId === u.id ? 'Gerando...' : 'Redefinir senha'}
                            </button>
                          </div>
                          
                          {resetPasswordSuccess && resetPasswordSuccess.userId === u.id && (
                            <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm">
                              <p>Nova senha gerada: <strong>{resetPasswordSuccess.password}</strong></p>
                              <p className="text-xs mt-1">Anote esta senha e forneça ao usuário de forma segura.</p>
                            </div>
                          )}
                          
                          {resetPasswordError && resetPasswordUserId === u.id && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                              {resetPasswordError}
                            </div>
                          )}
                          
                          <p className="text-xs text-cresol-gray">
                            Ao redefinir a senha, uma nova senha aleatória será gerada e exibida aqui.
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          className="px-4 py-2 border border-cresol-gray-light rounded-md text-cresol-gray hover:bg-gray-50"
                          onClick={() => setEditingUserId(null)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                          onClick={() => handleEditSave(u.id)}
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 