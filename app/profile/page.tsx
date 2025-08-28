'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import AuthGuard from '@/app/components/AuthGuard';
import { useAuth } from '@/app/providers/AuthProvider';
import { FormSelect } from '@/app/components/forms/FormSelect';
import { Icon } from '@/app/components/icons/Icon';
import { Button } from '@/app/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

import Footer from '../components/Footer';
// import Navbar from '../components/Navbar' // NextUI version
import ChakraNavbar from '../components/ChakraNavbar' // Chakra UI version;
import OptimizedImage from '../components/OptimizedImage';


import type { SelectOption } from '@/app/components/forms/FormSelect';
import type { User as SupabaseUser } from '@supabase/supabase-js';



import { FormatDate } from '@/lib/utils/formatters';
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

function ProfileContent() {
  const router = useRouter();
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadData = async () => {
      try {
        if (user) {
          await loadProfile(user.id);
          await loadWorkLocations();
          await loadPositions();
        }
      } catch (error) {
        setError('Erro ao carregar informações do usuário');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const loadProfile = async (userId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setProfile(data);
      setFullName(data.full_name || '');
      setPositionId(data.position_id || '');
      setWorkLocationId(data.work_location_id || '');
      setPhone(data.phone || '');
      setBio(data.bio || '');
      setAvatarUrl(data.avatar_url || null);
    } catch (error) {

      setError('Erro ao carregar informações do perfil');
    }
  };

  const loadWorkLocations = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('work_locations')
        .select('*')
        .order('name');

      if (error) throw error;
      setWorkLocations(data || []);
    } catch (error) {

    }
  };

  const loadPositions = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .order('name');

      if (error) throw error;
      setPositions(data || []);
    } catch (error) {

    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const truncated = numbers.substring(0, 11);
    
    // Aplica a formatação
    if (truncated.length === 0) {
      return '';
    } else if (truncated.length <= 2) {
      return `(${truncated}`;
    } else if (truncated.length <= 6) {
      return `(${truncated.substring(0, 2)}) ${truncated.substring(2)}`;
    } else if (truncated.length <= 10) {
      return `(${truncated.substring(0, 2)}) ${truncated.substring(2, 6)}-${truncated.substring(6)}`;
    } else {
      return `(${truncated.substring(0, 2)}) ${truncated.substring(2, 7)}-${truncated.substring(7)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 2MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return avatarUrl;

    setIsUploading(true);
    try {
      const supabase = createClient();
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase
        .storage
        .from('images')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      try {
        const { data: urlData } = supabase
          .storage
          .from('images')
          .getPublicUrl(filePath);

        if (!urlData || !urlData.publicUrl) {

          throw new Error('URL da imagem não disponível');
        }

        return urlData.publicUrl;
      } catch (urlError) {

        setError('Erro ao processar URL da imagem. Verifique se o bucket existe e está acessível.');
        return null;
      }
    } catch (error) {

      setError('Erro ao fazer upload da imagem');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      // Validar senha se for preenchida
      if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
          setError('As senhas não coincidem');
          setUpdating(false);
          return;
        }
        if (newPassword.length < 8) {
          setError('A nova senha deve ter pelo menos 8 caracteres');
          setUpdating(false);
          return;
        }
      }

      // Upload de avatar se houver
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) newAvatarUrl = uploadedUrl;
      }

      const selectedPosition = positions.find(p => p.id === positionId);

      // Atualizar perfil
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          position: selectedPosition?.name || null,
          position_id: positionId || null,
          work_location_id: workLocationId || null,
          phone: phone || null,
          bio: bio || null,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Atualizar senha se fornecida
      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (passwordError) throw passwordError;
      }

      await loadProfile(user.id);
      setSuccess('Perfil atualizado com sucesso!');
      setAvatarFile(null);
      setAvatarPreview(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const getRoleName = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'sector_admin': return 'Administrador de Setor';
      case 'subsector_admin': return 'Administrador de Subsetor';
      default: return 'Usuário';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ChakraNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const selectedWorkLocation = workLocations.find(loc => loc.id === workLocationId);

  // Converter para formato do FormSelect
  const positionOptions: SelectOption[] = positions.map(pos => ({
    value: pos.id,
    label: pos.name,
    description: pos.department
  }));

  const workLocationOptions: SelectOption[] = workLocations.map(loc => ({
    value: loc.id,
    label: loc.name,
    description: loc.address
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <ChakraNavbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Simples */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Configurações da Conta</h1>
          <p className="text-sm text-gray-600 mt-1">Gerencie suas informações pessoais e segurança</p>
        </div>

        {/* Alertas */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Formulário Único */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleUpdateProfile} className="p-6 space-y-8">
              {/* Foto de Perfil */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                    {avatarPreview || avatarUrl ? (
                      <OptimizedImage
                        src={avatarPreview || avatarUrl || ''}
                        alt="Avatar"
                        fill
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Icon name="user" className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <Icon name="camera" className="h-4 w-4 text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* E-mail (não editável) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                    {profile?.email}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">O e-mail não pode ser alterado.</p>
                </div>

                {/* Nome Completo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  />
                </div>

                {/* Cargo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo
                  </label>
                  <FormSelect
                    value={positionId}
                    onChange={(e) => setPositionId(e.target.value)}
                    options={positionOptions}
                    placeholder="Selecione um cargo"
                    fullWidth={true}
                    size="md"
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-500">Digite apenas números</p>
                </div>

                {/* Local de Trabalho */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Local de Trabalho
                  </label>
                  <FormSelect
                    value={workLocationId}
                    onChange={(e) => setWorkLocationId(e.target.value)}
                    options={workLocationOptions}
                    placeholder="Selecione um local"
                    fullWidth={true}
                    size="md"
                  />
                  {selectedWorkLocation && selectedWorkLocation.address && (
                    <div className="mt-2 text-sm text-gray-600 flex items-start gap-2">
                      <Icon name="map-pin" className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span>{selectedWorkLocation.address}</span>
                    </div>
                  )}
                </div>

                {/* Biografia */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografia
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Conte um pouco sobre você..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Seção de Segurança */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Segurança</h3>
                
                {/* Informações da Conta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Função
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                      {getRoleName(profile?.role)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conta criada em
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                      {FormatDate(profile?.created_at)}
                    </div>
                  </div>
                </div>

                {/* Campos de Alteração de Senha */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Alterar Senha</h4>
                  <p className="text-sm text-gray-500">Deixe em branco se não quiser alterar a senha</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        minLength={8}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a nova senha"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        minLength={8}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de Salvar */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  variant="solid"
                  colorPalette="orange"
                  size="md"
                  loading={updating || isUploading}
                  disabled={updating || isUploading}
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}