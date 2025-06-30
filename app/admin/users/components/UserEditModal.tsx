'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  position?: string;
  position_id?: string;
  work_location_id?: string;
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user';
  created_at?: string;
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

interface UserEditModalProps {
  user: UserProfile;
  workLocations: WorkLocation[];
  positions: Position[];
  sectors: Sector[];
  subsectors: Subsector[];
  userSectors: string[];
  userSubsectors: string[];
  onClose: () => void;
  onSave: () => void;
  onRefreshUserSectors: (userId: string) => void;
  onRefreshUserSubsectors: (userId: string) => void;
}

export default function UserEditModal({
  user,
  workLocations,
  positions,
  sectors,
  subsectors,
  userSectors,
  userSubsectors,
  onClose,
  onSave,
  onRefreshUserSectors,
  onRefreshUserSubsectors
}: UserEditModalProps) {
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [positionId, setPositionId] = useState(user.position_id || '');
  const [workLocationId, setWorkLocationId] = useState(user.work_location_id || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedUserSectors, setSelectedUserSectors] = useState<string[]>(userSectors);
  const [selectedUserSubsectors, setSelectedUserSubsectors] = useState<string[]>(userSubsectors);
  const [selectedSectorForSubsectors, setSelectedSectorForSubsectors] = useState<string>('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState<string | null>(null);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user.role === 'sector_admin') {
      onRefreshUserSectors(user.id);
    } else if (user.role === 'subsector_admin') {
      onRefreshUserSubsectors(user.id);
    }
  }, [user.role, user.id, onRefreshUserSectors, onRefreshUserSubsectors]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter menos de 2MB.');
        return;
      }
      
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;
    
    try {
      setIsUploading(true);
      
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
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

  const handleResetPassword = async () => {
    setResetPasswordLoading(true);
    setResetPasswordError(null);
    setResetPasswordSuccess(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const adminToken = session?.access_token;
      
      if (!adminToken) {
        throw new Error('Token de administrador inválido. Faça login novamente.');
      }
      
      const newPassword = Math.random().toString(36).slice(-10);
      
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          newPassword,
          adminToken
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao redefinir senha');
      }
      
      setResetPasswordSuccess(newPassword);
    } catch (error: unknown) {
      console.error('Erro ao resetar senha:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setResetPasswordError(`Erro ao resetar senha: ${errorMessage}`);
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updateData: Record<string, unknown> = {
        full_name: fullName,
        email: email,
        position_id: positionId || null,
        work_location_id: workLocationId || null,
      };

      if (avatarFile) {
        try {
          const newAvatarUrl = await uploadAvatar();
          if (newAvatarUrl) {
            updateData.avatar_url = newAvatarUrl;
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          alert(`Erro ao fazer upload da imagem: ${errorMessage}`);
          return;
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
      
      if (updateError) {
        throw new Error(`Erro ao atualizar usuário: ${updateError.message}`);
      }
      
      // Atualizar setores ou sub-setores administrados pelo usuário
      if (user.role === 'sector_admin') {
        await supabase
          .from('sector_admins')
          .delete()
          .eq('user_id', user.id);
        
        if (selectedUserSectors.length > 0) {
          const sectorInserts = selectedUserSectors.map(sectorId => ({
            user_id: user.id,
            sector_id: sectorId
          }));
          
          const { error: insertError } = await supabase
            .from('sector_admins')
            .insert(sectorInserts);
          
          if (insertError) {
            console.error('Erro ao atualizar setores administrados:', insertError);
          }
        }
      } else if (user.role === 'subsector_admin') {
        await supabase
          .from('subsector_admins')
          .delete()
          .eq('user_id', user.id);
        
        if (selectedUserSubsectors.length > 0) {
          const subsectorInserts = selectedUserSubsectors.map(subsectorId => ({
            user_id: user.id,
            subsector_id: subsectorId
          }));
          
          const { error: insertError } = await supabase
            .from('subsector_admins')
            .insert(subsectorInserts);
          
          if (insertError) {
            console.error('Erro ao atualizar sub-setores administrados:', insertError);
          }
        }
      }
    
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      
      onSave();
      onClose();
    } catch (error: unknown) {
      console.error('Erro ao salvar edição:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao salvar alterações: ${errorMessage}`);
    }
  };

  const handleSectorChange = (sectorId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedUserSectors(prev => [...prev, sectorId].filter((v, i, a) => a.indexOf(v) === i));
    } else {
      setSelectedUserSectors(prev => prev.filter(id => id !== sectorId));
    }
  };

  const handleSubsectorChange = (subsectorId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedUserSubsectors(prev => [...prev, subsectorId].filter((v, i, a) => a.indexOf(v) === i));
    } else {
      setSelectedUserSubsectors(prev => prev.filter(id => id !== subsectorId));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-cresol-gray-light">
          <h3 className="heading-4 text-primary">Editar Usuário</h3>
          <button
            type="button"
            className="text-cresol-gray hover:text-cresol-gray-dark"
            onClick={onClose}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="mb-6 flex justify-center">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-50 border border-cresol-gray-light">
              {(avatarPreview || user.avatar_url) ? (
                <Image
                  src={avatarPreview || user.avatar_url || ''}
                  alt={`Avatar de ${user.full_name}`}
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
            <label className="btn-outline text-sm" htmlFor={`avatarUpload-${user.id}`}>
              {isUploading ? 'Carregando...' : 'Alterar foto'}
              <input
                type="file"
                id={`avatarUpload-${user.id}`}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUploading}
              />
            </label>
            
            {avatarPreview && (
              <button
                type="button"
                className="ml-2 text-sm hover:underline"
                style={{ color: 'var(--color-error-text)' }}
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
          
          <div className="space-y-4">
            <div>
              <label htmlFor={`name-${user.id}`} className="form-label">
                Nome Completo
              </label>
              <input
                id={`name-${user.id}`}
                type="text"
                className="input"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor={`email-${user.id}`} className="form-label">
                E-mail
              </label>
              <input
                id={`email-${user.id}`}
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor={`position-${user.id}`} className="form-label">
                Cargo
              </label>
              <select
                id={`position-${user.id}`}
                className="input"
                value={positionId}
                onChange={e => setPositionId(e.target.value)}
              >
                <option value="">Selecione um cargo</option>
                {positions.map(position => (
                  <option key={position.id} value={position.id}>
                    {position.name}
                    {position.department && ` - ${position.department}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor={`location-${user.id}`} className="form-label">
                Local de Atuação
              </label>
              <select
                id={`location-${user.id}`}
                className="input"
                value={workLocationId}
                onChange={e => setWorkLocationId(e.target.value)}
              >
                <option value="">Selecione</option>
                {workLocations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            
            {user.role === 'sector_admin' && (
              <div className="border-t border-cresol-gray-light pt-4 mt-4">
                <label className="block text-sm font-medium text-cresol-gray mb-2">
                  Setores administrados
                </label>
                
                <div className="max-h-40 overflow-y-auto border border-cresol-gray-light rounded-md p-3">
                  {sectors.length === 0 ? (
                    <p className="text-sm text-cresol-gray">Nenhum setor disponível</p>
                  ) : (
                    <div className="space-y-2">
                      {sectors.map(sector => (
                        <div key={sector.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`sector-${user.id}-${sector.id}`}
                            checked={selectedUserSectors.includes(sector.id)}
                            onChange={(e) => handleSectorChange(sector.id, e.target.checked)}
                            className="h-4 w-4 text-primary border-cresol-gray-light rounded focus:ring-primary"
                          />
                          <label 
                            htmlFor={`sector-${user.id}-${sector.id}`}
                            className="ml-2 body-text-small text-body"
                          >
                            {sector.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-cresol-gray mt-2">
                  Selecione os setores que este administrador setorial irá gerenciar.
                </p>
              </div>
            )}

            {user.role === 'subsector_admin' && (
              <div className="border-t border-cresol-gray-light pt-4 mt-4">
                <label className="block text-sm font-medium text-cresol-gray mb-2">
                  Sub-setores administrados
                </label>
                
                <div className="mb-4">
                  <label className="block text-xs font-medium text-cresol-gray mb-1">
                    Filtrar por setor
                  </label>
                  <select
                    value={selectedSectorForSubsectors}
                    onChange={(e) => setSelectedSectorForSubsectors(e.target.value)}
                    className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  >
                    <option value="">Todos os setores</option>
                    {sectors.map(sector => (
                      <option key={sector.id} value={sector.id}>{sector.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="max-h-40 overflow-y-auto border border-cresol-gray-light rounded-md p-3">
                  {subsectors.length === 0 ? (
                    <p className="text-sm text-cresol-gray">
                      {selectedSectorForSubsectors 
                        ? 'Nenhum sub-setor encontrado para este setor' 
                        : 'Nenhum sub-setor disponível'
                      }
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {subsectors
                        .filter(subsector => 
                          !selectedSectorForSubsectors || 
                          subsector.sector_id === selectedSectorForSubsectors
                        )
                        .map(subsector => {
                          const sector = sectors.find(s => s.id === subsector.sector_id);
                          return (
                            <div key={subsector.id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`subsector-${user.id}-${subsector.id}`}
                                checked={selectedUserSubsectors.includes(subsector.id)}
                                onChange={(e) => handleSubsectorChange(subsector.id, e.target.checked)}
                                className="h-4 w-4 text-primary border-cresol-gray-light rounded focus:ring-primary"
                              />
                              <label 
                                htmlFor={`subsector-${user.id}-${subsector.id}`}
                                className="ml-2 body-text-small text-body"
                              >
                                {subsector.name}
                                {sector && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({sector.name})
                                  </span>
                                )}
                              </label>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-cresol-gray mt-2">
                  Selecione os sub-setores que este administrador de sub-setor irá gerenciar.
                </p>
              </div>
            )}
            
            <div className="border-t border-cresol-gray-light pt-4 mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-cresol-gray">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-xs text-primary hover:underline"
                  disabled={resetPasswordLoading}
                >
                  {resetPasswordLoading ? 'Gerando...' : 'Redefinir senha'}
                </button>
              </div>
              
              {resetPasswordSuccess && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm">
                  <p>Nova senha gerada: <strong>{resetPasswordSuccess}</strong></p>
                  <p className="text-xs mt-1">Anote esta senha e forneça ao usuário de forma segura.</p>
                </div>
              )}
              
              {resetPasswordError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                  {resetPasswordError}
                </div>
              )}
              
              <p className="text-xs text-cresol-gray">
                Ao redefinir a senha, uma nova senha aleatória será gerada e exibida aqui.
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-cresol-gray-light p-6 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 