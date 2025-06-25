'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface WorkLocation {
  id: string;
  name: string;
}

interface UserFormProps {
  workLocations: WorkLocation[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UserForm({ workLocations, onSuccess, onCancel }: UserFormProps) {
  const [formLoading, setFormLoading] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPosition, setNewUserPosition] = useState('');
  const [newUserWorkLocationId, setNewUserWorkLocationId] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'sector_admin' | 'subsector_admin' | 'admin'>('user');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [newUserAvatarFile, setNewUserAvatarFile] = useState<File | null>(null);
  const [newUserAvatarPreview, setNewUserAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleNewUserAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        setFormError('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        setFormError('A imagem deve ter menos de 2MB.');
        return;
      }
      
      setNewUserAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setNewUserAvatarPreview(previewUrl);
      setFormError(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);
    
    if (!newUserEmail.endsWith('@cresol.com.br')) {
      setFormError('Por favor, utilize um e-mail corporativo da Cresol.');
      setFormLoading(false);
      return;
    }

    try {
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
      
      if (newUserAvatarFile) {
        try {
          setIsUploading(true);
          
          const fileExt = newUserAvatarFile.name.split('.').pop();
          const fileName = `new-user-${Date.now()}.${fileExt}`;
          const filePath = `avatars/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, newUserAvatarFile, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (uploadError) {
            throw uploadError;
          }
          
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

      const { data: { session } } = await supabase.auth.getSession();
      const adminToken = session?.access_token;

      if (!adminToken) {
        setFormError('Sessão de administrador inválida. Faça login novamente.');
        setFormLoading(false);
        return;
      }

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
          adminToken: adminToken
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao criar usuário');
      }

      setFormSuccess(`Usuário criado com sucesso! Senha temporária: ${data.tempPassword}`);
      
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
      
      onSuccess();
    } catch (error: unknown) {
      console.error('Erro ao criar usuário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setFormError(`Falha ao criar usuário: ${errorMessage}`);
    } finally {
      setFormLoading(false);
    }
  };

  return (
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
          
          <div className="md:col-span-2">
            <label htmlFor="newUserRole" className="block text-sm font-medium text-cresol-gray mb-1">
              Papel no Sistema
            </label>
            <select
              id="newUserRole"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as 'user' | 'sector_admin' | 'subsector_admin' | 'admin')}
              required
              className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="user">Usuário</option>
              <option value="sector_admin">Administrador de Setor</option>
              <option value="subsector_admin">Admin. Subsetorial</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-cresol-gray-light rounded-md text-cresol-gray hover:bg-gray-50"
          >
            Cancelar
          </button>
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
  );
} 