'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OptimizedImage from '../components/OptimizedImage';
import { Button } from '@/app/components/ui/Button';
import { StandardizedInput } from '@/app/components/ui/StandardizedInput';
import { getSupabaseClient } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import Navbar from '../components/Navbar';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import Footer from '../components/Footer';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  position?: string;
  position_id?: string;
  work_location_id?: string;
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user';
  avatar_url?: string;
  phone?: string;
  bio?: string;
  created_at?: string;
  last_login?: string;
}

interface WorkLocation {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

interface Position {
  id: string;
  name: string;
  description?: string;
  department?: string;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  created_at: string;
  ip_address?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity' | 'privacy'>('profile');
  
  // Campos editáveis
  const [fullName, setFullName] = useState('');
  const [positionId, setPositionId] = useState('');
  const [workLocationId, setWorkLocationId] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Estados para upload de imagem
  const [isUploading, setIsUploading] = useState(false);

  // Estados para alteração de senha
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Estados para atividade recente
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Estados para configurações de privacidade
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: true,
    showPhone: false,
    showPosition: true,
    allowNotifications: true,
    allowDirectMessages: true
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkUser = async () => {
      try {
        const { data } = await getSupabaseClient().auth.getUser();
        if (!data.user) {
          router.replace('/login');
          return;
        }
        setUser(data.user);
        await Promise.all([
          fetchProfile(data.user.id),
          fetchWorkLocations(),
          fetchPositions(),
          fetchActivityLogs(data.user.id)
        ]);
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        router.replace('/login');
      }
    };

    checkUser();
  }, [router]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await getSupabaseClient()
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
        setPositionId(data.position_id || '');
        setWorkLocationId(data.work_location_id || '');
        setPhone(data.phone || '');
        setBio(data.bio || '');
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
      const { data, error } = await getSupabaseClient()
        .from('work_locations')
        .select('id, name, address, phone')
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

  const fetchPositions = async () => {
    try {
      const { data, error } = await getSupabaseClient()
        .from('positions')
        .select('id, name, description, department')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setPositions(data);
      }
    } catch (error) {
      console.error('Erro ao buscar cargos:', error);
    }
  };

  const fetchActivityLogs = async (userId: string) => {
    setLoadingActivity(true);
    try {
      // Simulação de logs de atividade (implementar com dados reais depois)
      const mockLogs = [
        {
          id: '1',
          action: 'Login',
          description: 'Login realizado com sucesso',
          created_at: new Date().toISOString(),
          ip_address: '192.168.1.100'
        },
        {
          id: '2',
          action: 'Perfil atualizado',
          description: 'Informações do perfil foram atualizadas',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          ip_address: '192.168.1.100'
        },
        {
          id: '3',
          action: 'Senha alterada',
          description: 'Senha foi alterada com sucesso',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          ip_address: '192.168.1.101'
        }
      ];
      setActivityLogs(mockLogs);
    } catch (error) {
      console.error('Erro ao buscar logs de atividade:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        setError('A imagem deve ter menos de 2MB.');
        return;
      }
      
      setAvatarFile(file);
      
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      
      setError(null);
      setSuccess(null);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null;
    
    try {
      setIsUploading(true);
      
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await getSupabaseClient().storage
        .from('images')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: { publicUrl } } = getSupabaseClient().storage
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
      
      const updateData: Record<string, unknown> = {
        full_name: fullName,
        position_id: positionId || null,
        phone,
        bio,
        work_location_id: workLocationId || null,
        updated_at: new Date().toISOString()
      };
      
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
      
      const { error: updateError } = await getSupabaseClient()
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      setSuccess('Perfil atualizado com sucesso!');
      
      if (avatarFile) {
        setAvatarFile(null);
        if (avatarPreview) {
          URL.revokeObjectURL(avatarPreview);
          setAvatarPreview(null);
        }
      }
      
      await fetchProfile(user.id);
    } catch (error: unknown) {
      console.error('Erro ao atualizar perfil:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Falha ao atualizar perfil: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

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
      
      const { error } = await getSupabaseClient().auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      setPasswordSuccess('Senha alterada com sucesso!');
      
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

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
<LoadingSpinner 
            fullScreen={true}
            size="lg" 
            message="Carregando perfil..."
          />
          <p className="mt-4 text-muted">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />
        
        {/* Header do Perfil */}
        <div className="card mb-6 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary to-primary"></div>
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-16 left-6">
              <div className="relative h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                {(avatarPreview || avatarUrl) ? (
                  <OptimizedImage
                    src={avatarPreview || avatarUrl || ''}
                    alt="Avatar do usuário"
                    fill
                    className="object-cover"
                    sizes="128px"
                    quality={85}
                    priority
                    fallbackText="Avatar"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                    <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            {/* Info do Usuário */}
            <div className="ml-40 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="heading-1">{profile?.full_name || 'Nome não informado'}</h1>
                  <p className="body-text text-muted">{profile?.position || 'Cargo não informado'}</p>
                  <p className="body-text-small text-muted">
                    {workLocations.find(loc => loc.id === profile?.work_location_id)?.name || 'Local não informado'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-medium ${
                    profile?.role === 'admin' ? 'badge-error' :
                    profile?.role === 'sector_admin' ? 'badge-info' :
                    profile?.role === 'subsector_admin' ? 'badge-warning' :
                    'badge-success'
                  }`}>
                    {profile?.role === 'admin' && 'Administrador'}
                    {profile?.role === 'sector_admin' && 'Admin. de Setor'}
                    {profile?.role === 'subsector_admin' && 'Admin. de Sub-setor'}
                    {profile?.role === 'user' && 'Usuário'}
                  </span>
                  {profile?.created_at && (
                    <p className="badge-text text-muted mt-2">
                      Membro desde {formatDate(profile.created_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="alert-error mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Tabs de Navegação */}
        <div className="card mb-6">
          <div className="border-b" style={{ borderColor: 'var(--color-gray-light)' }}>
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'profile', label: 'Informações Pessoais', icon: 'user' },
                { id: 'security', label: 'Segurança', icon: 'shield' },
                { id: 'activity', label: 'Atividade Recente', icon: 'clock' },
                { id: 'privacy', label: 'Privacidade', icon: 'eye' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted hover:text-title hover:border-gray-300'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {tab.icon === 'user' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    )}
                    {tab.icon === 'shield' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                    {tab.icon === 'clock' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                    {tab.icon === 'eye' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Conteúdo das Tabs */}
          <div className="p-6">
            {/* Tab: Informações Pessoais */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Upload de Avatar */}
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                      {(avatarPreview || avatarUrl) ? (
                        <OptimizedImage
                          src={avatarPreview || avatarUrl || ''}
                          alt="Avatar do usuário"
                          fill
                          className="object-cover"
                          sizes="96px"
                          quality={80}
                          fallbackText="Avatar"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                          <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <label className="form-label">
                      Foto de Perfil
                    </label>
                    <div className="flex items-center space-x-3">
                      <label className="cursor-pointer bg-white border border-gray-300 rounded-md px-4 py-2 text-sm text-muted hover:bg-gray-50 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
                        {isUploading ? 'Carregando...' : 'Escolher arquivo'}
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          disabled={isUploading}
                        />
                      </label>
                      {avatarPreview && (
                        <button
                          type="button"
                          className="text-sm text-red-600 hover:text-red-800"
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
                    <p className="mt-1 badge-text text-muted">
                      Formatos aceitos: JPG, PNG. Máximo: 2MB.
                    </p>
                  </div>
                </div>

                {/* Campos do Formulário */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="form-label">
                      E-mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profile?.email || ''}
                      disabled
                      className="input bg-gray-50 text-muted cursor-not-allowed"
                    />
                    <p className="mt-1 badge-text text-muted">
                      O e-mail não pode ser alterado.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="fullName" className="form-label">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="input bg-gray-50 text-muted"
                    />
                  </div>

                  <div>
                    <label htmlFor="position" className="form-label">
                      Cargo
                    </label>
                    <select
                      id="position"
                      value={positionId}
                      onChange={(e) => setPositionId(e.target.value)}
                      className="input bg-gray-50 text-muted"
                    >
                      <option value="">Selecione um cargo</option>
                      {positions.map((position) => (
                        <option key={position.id} value={position.id}>
                          {position.name}
                          {position.department && ` - ${position.department}`}
                        </option>
                      ))}
                    </select>
                    
                    {positionId && (() => {
                      const selectedPosition = positions.find(pos => pos.id === positionId);
                      return selectedPosition && selectedPosition.description && (
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          <div className="font-medium">{selectedPosition.name}</div>
                          {selectedPosition.department && (
                            <div className="flex items-center mt-1">
                              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span>{selectedPosition.department}</span>
                            </div>
                          )}
                          {selectedPosition.description && (
                            <div className="mt-1 text-gray-600">
                              {selectedPosition.description}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div>
                    <label htmlFor="phone" className="form-label">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input bg-gray-50 text-muted"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="workLocation" className="form-label">
                      Local de Trabalho
                    </label>
                    <select
                      id="workLocation"
                      value={workLocationId}
                      onChange={(e) => setWorkLocationId(e.target.value)}
                      className="input bg-gray-50 text-muted"
                    >
                      <option value="">Selecione um local</option>
                      {workLocations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                    
                    {workLocationId && (() => {
                      const selectedLocation = workLocations.find(loc => loc.id === workLocationId);
                      return selectedLocation && (
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          <div className="font-medium">{selectedLocation.name}</div>
                          {selectedLocation.address && (
                            <div className="flex items-center mt-1">
                              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span>{selectedLocation.address}</span>
                            </div>
                          )}
                          {selectedLocation.phone && (
                            <div className="flex items-center mt-1">
                              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <a href={`tel:${selectedLocation.phone}`} className="text-primary hover:underline">
                                {selectedLocation.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="bio" className="form-label">
                      Biografia
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="input bg-gray-50 text-muted"
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="form-label">
                      Tipo de Conta
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600">
                      {profile?.role === 'admin' && 'Administrador'}
                      {profile?.role === 'sector_admin' && 'Administrador de Setor'}
                      {profile?.role === 'subsector_admin' && 'Administrador de Sub-setor'}
                      {profile?.role === 'user' && 'Usuário'}
                    </div>
                    <p className="mt-1 badge-text text-muted">
                      O tipo de conta só pode ser alterado por um administrador.
                    </p>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    variant="secondary"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={updating}
                    variant="primary"
                  >
                    {updating ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            )}

            {/* Tab: Segurança */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Segurança</h3>
                  
                  {/* Seção de Alteração de Senha */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-md font-medium text-gray-900">Alterar Senha</h4>
                        <p className="text-sm text-gray-600">Mantenha sua conta segura com uma senha forte</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        variant="ghost"
                        size="sm"
                      >
                        {showPasswordForm ? 'Cancelar' : 'Alterar Senha'}
                      </Button>
                    </div>

                    {passwordError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4 text-sm">
                        {passwordError}
                      </div>
                    )}
                    
                    {passwordSuccess && (
                      <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-4 text-sm">
                        {passwordSuccess}
                      </div>
                    )}

                    {showPasswordForm && (
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Nova Senha
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Mínimo de 6 caracteres"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nova Senha
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Digite novamente a nova senha"
                          />
                        </div>
                        
                        <div className="pt-2">
                          <Button
                            type="submit"
                            disabled={changingPassword}
                            variant="primary"
                            className="w-full"
                          >
                            {changingPassword ? 'Alterando...' : 'Salvar Nova Senha'}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Atividade Recente */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Atividade Recente</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Histórico de ações realizadas em sua conta nos últimos 30 dias.
                  </p>
                  
                  {loadingActivity ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-100 h-16 rounded-lg"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activityLogs.map((log) => (
                        <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900">{log.action}</h4>
                                <span className="text-xs text-gray-500">{formatDate(log.created_at)}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                              {log.ip_address && (
                                <p className="text-xs text-gray-500 mt-2">IP: {log.ip_address}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Privacidade */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Privacidade</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Controle quais informações são visíveis para outros usuários.
                  </p>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'showEmail', label: 'Mostrar e-mail no perfil público', description: 'Outros usuários poderão ver seu endereço de e-mail' },
                      { key: 'showPhone', label: 'Mostrar telefone no perfil público', description: 'Outros usuários poderão ver seu número de telefone' },
                      { key: 'showPosition', label: 'Mostrar cargo no perfil público', description: 'Outros usuários poderão ver seu cargo atual' },
                      { key: 'allowNotifications', label: 'Receber notificações por e-mail', description: 'Receba atualizações importantes por e-mail' },
                      { key: 'allowDirectMessages', label: 'Permitir mensagens diretas', description: 'Outros usuários podem enviar mensagens para você' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-start justify-between py-4 border-b border-gray-200 last:border-b-0">
                        <div className="flex-grow">
                          <h4 className="text-sm font-medium text-gray-900">{setting.label}</h4>
                          <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <button
                            type="button"
                            onClick={() => setPrivacySettings(prev => ({
                              ...prev,
                              [setting.key]: !prev[setting.key as keyof typeof prev]
                            }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              privacySettings[setting.key as keyof typeof privacySettings]
                                ? 'bg-primary'
                                : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                privacySettings[setting.key as keyof typeof privacySettings]
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="primary"
                    >
                      Salvar Configurações
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 