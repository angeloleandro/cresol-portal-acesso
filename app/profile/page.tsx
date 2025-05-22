'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  position?: string;
  work_location_id?: string;
  role: 'admin' | 'sector_admin' | 'user';
  avatar_url?: string;
}

interface WorkLocation {
  id: string;
  name: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Campos editáveis
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [workLocationId, setWorkLocationId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Estados para o upload de imagem
  const [isUploading, setIsUploading] = useState(false);

  // Estados para alteração de senha
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }
      setUser(data.user);
      await fetchProfile(data.user.id);
      await fetchWorkLocations();
    };

    checkUser();
  }, [router]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setPosition(data.position || '');
        setWorkLocationId(data.work_location_id || '');
        setAvatarUrl(data.avatar_url || null);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('work_locations')
        .select('id, name')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setWorkLocations(data);
      }
    } catch (error) {
      console.error('Erro ao buscar locais de trabalho:', error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Verificar o tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Verificar o tamanho do arquivo (limite de 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('A imagem deve ter menos de 2MB.');
        return;
      }
      
      setAvatarFile(file);
      
      // Criar URL temporária para preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      
      // Limpar mensagens
      setError(null);
      setSuccess(null);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null;
    
    try {
      setIsUploading(true);
      
      // Gerar um nome único para o arquivo
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Fazer upload para o bucket 'images' no Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, avatarFile, {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!user) {
      router.replace('/login');
      return;
    }
    
    try {
      setUpdating(true);
      
      // Dados a serem atualizados
      const updateData: Record<string, unknown> = {
        full_name: fullName,
        position,
        work_location_id: workLocationId || null,
        updated_at: new Date().toISOString()
      };
      
      // Se houver um novo avatar, fazer o upload e incluir a URL
      if (avatarFile) {
        try {
          const newAvatarUrl = await uploadAvatar();
          if (newAvatarUrl) {
            updateData.avatar_url = newAvatarUrl;
            setAvatarUrl(newAvatarUrl);
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          setError(`Erro ao fazer upload da imagem: ${errorMessage}`);
          return;
        }
      }
      
      // Atualizar o perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      setSuccess('Perfil atualizado com sucesso!');
      
      // Limpar o preview e o arquivo após o upload bem-sucedido
      if (avatarFile) {
        setAvatarFile(null);
        if (avatarPreview) {
          URL.revokeObjectURL(avatarPreview);
          setAvatarPreview(null);
        }
      }
      
      // Atualizar os dados do perfil local
      await fetchProfile(user.id);
    } catch (error: unknown) {
      console.error('Erro ao atualizar perfil:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Falha ao atualizar perfil: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  // Função para alterar a senha
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    
    if (!user) {
      router.replace('/login');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('As novas senhas não coincidem.');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    try {
      setChangingPassword(true);
      
      // Alterar a senha usando o Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      setPasswordSuccess('Senha alterada com sucesso!');
      
      // Limpar os campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error: unknown) {
      console.error('Erro ao alterar senha:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setPasswordError(`Falha ao alterar senha: ${errorMessage}`);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
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
      <header className="bg-white border-b border-cresol-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center"
              type="button"
            >
              <div className="relative h-10 w-24 mr-3">
                <Image 
                  src="/logo-cresol.png" 
                  alt="Logo Cresol" 
                  fill
                  sizes="(max-width: 768px) 100vw, 96px"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <h1 className="text-xl font-semibold text-cresol-gray">Portal Cresol</h1>
            </button>
          </div>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center text-sm text-cresol-gray hover:text-primary"
            type="button"
          >
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Voltar para Dashboard
          </button>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary">Meu Perfil</h2>
          <p className="text-cresol-gray mt-1">Gerencie suas informações pessoais</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
            {success}
          </div>
        )}
        
        {/* Formulário de informações pessoais */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 border border-cresol-gray-light">
                  {(avatarPreview || avatarUrl) ? (
                    <Image
                      src={avatarPreview || avatarUrl || ''}
                      alt="Avatar do usuário"
                      fill
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
                <label className="block text-sm font-medium text-cresol-gray mb-2" htmlFor="avatarUpload">
                  Foto de Perfil
                </label>
                <div className="flex items-center">
                  <label className="cursor-pointer bg-white border border-cresol-gray-light px-3 py-2 rounded-md text-sm text-cresol-gray hover:bg-gray-50 transition-colors" htmlFor="avatarUpload">
                    {isUploading ? 'Carregando...' : 'Escolher arquivo'}
                    <input
                      type="file"
                      id="avatarUpload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={isUploading}
                    />
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      className="ml-2 text-sm text-red-500 hover:text-red-700"
                      onClick={() => {
                        URL.revokeObjectURL(avatarPreview);
                        setAvatarPreview(null);
                        setAvatarFile(null);
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
            
            {/* Email (não editável) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-cresol-gray mb-2">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-cresol-gray-light rounded-md text-cresol-gray"
              />
              <p className="mt-1 text-xs text-cresol-gray">
                O e-mail não pode ser alterado.
              </p>
            </div>
            
            {/* Nome completo */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-cresol-gray mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            {/* Cargo */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-cresol-gray mb-2">
                Cargo
              </label>
              <input
                type="text"
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            {/* Local de atuação */}
            <div>
              <label htmlFor="workLocation" className="block text-sm font-medium text-cresol-gray mb-2">
                Local de Atuação
              </label>
              <select
                id="workLocation"
                value={workLocationId}
                onChange={(e) => setWorkLocationId(e.target.value)}
                className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Selecione o local</option>
                {workLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            
            {/* Tipo de conta (não editável) */}
            <div>
              <label className="block text-sm font-medium text-cresol-gray mb-2" htmlFor="accountType">
                Tipo de Conta
              </label>
              <div id="accountType" className="px-3 py-2 bg-gray-50 border border-cresol-gray-light rounded-md text-cresol-gray">
                {profile?.role === 'admin' && 'Administrador'}
                {profile?.role === 'sector_admin' && 'Administrador de Setor'}
                {profile?.role === 'user' && 'Usuário'}
              </div>
              <p className="mt-1 text-xs text-cresol-gray">
                O tipo de conta só pode ser alterado por um administrador.
              </p>
            </div>
            
            {/* Botões */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 border border-cresol-gray-light rounded-md text-cresol-gray mr-3 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-70"
                disabled={updating}
              >
                {updating ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Formulário de alteração de senha */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-primary">Alterar Senha</h3>
            <button
              type="button"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-sm text-primary hover:underline"
            >
              {showPasswordForm ? 'Cancelar' : 'Alterar minha senha'}
            </button>
          </div>
          
          {passwordError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
              {passwordError}
            </div>
          )}
          
          {passwordSuccess && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm">
              {passwordSuccess}
            </div>
          )}
          
          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-cresol-gray mb-2">
                  Nova Senha
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Mínimo de 6 caracteres"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-cresol-gray mb-2">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Digite novamente a nova senha"
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-70"
                  disabled={changingPassword}
                >
                  {changingPassword ? 'Alterando...' : 'Salvar Nova Senha'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
} 