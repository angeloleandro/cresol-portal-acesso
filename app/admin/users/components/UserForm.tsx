'use client';

import { Button, Input, Menu } from '@chakra-ui/react';
import { useState, useMemo } from 'react';

import { useAlert } from '@/app/components/alerts';
import { FormSelect } from '@/app/components/forms';
import { Icon } from '@/app/components/icons/Icon';
import OptimizedImage from '@/app/components/OptimizedImage';
import { Button as CButton } from '@/app/components/ui/Button';
import { StandardizedInput } from '@/app/components/ui/StandardizedInput';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

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

interface UserFormProps {
  workLocations: WorkLocation[];
  positions: Position[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UserForm({ workLocations, positions, onSuccess, onCancel }: UserFormProps) {
  const alert = useAlert();
  const [formLoading, setFormLoading] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPositionId, setNewUserPositionId] = useState('');
  const [newUserWorkLocationId, setNewUserWorkLocationId] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'sector_admin' | 'subsector_admin' | 'admin'>('user');
  const [newUserAvatarFile, setNewUserAvatarFile] = useState<File | null>(null);
  const [newUserAvatarPreview, setNewUserAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [positionSearch, setPositionSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');

  // Filtrar posições com base na busca
  const filteredPositions = useMemo(() => {
    if (!positionSearch.trim()) return positions;
    return positions.filter(position =>
      position.name.toLowerCase().includes(positionSearch.toLowerCase()) ||
      (position.department && position.department.toLowerCase().includes(positionSearch.toLowerCase()))
    );
  }, [positions, positionSearch]);

  // Filtrar locais com base na busca
  const filteredLocations = useMemo(() => {
    if (!locationSearch.trim()) return workLocations;
    return workLocations.filter(location =>
      location.name.toLowerCase().includes(locationSearch.toLowerCase())
    );
  }, [workLocations, locationSearch]);

  // Label do cargo selecionado
  const selectedPositionLabel = useMemo(() => {
    const position = positions.find(p => p.id === newUserPositionId);
    if (!position) return 'Selecione um cargo';
    return position.department ? `${position.name} - ${position.department}` : position.name;
  }, [positions, newUserPositionId]);

  // Label do local selecionado
  const selectedLocationLabel = useMemo(() => {
    const location = workLocations.find(l => l.id === newUserWorkLocationId);
    return location?.name || 'Selecione o local';
  }, [workLocations, newUserWorkLocationId]);

  const handleNewUserAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        alert.form.validationError();
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        alert.showWarning('Arquivo muito grande', 'A imagem deve ter menos de 2MB.');
        return;
      }
      
      setNewUserAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setNewUserAvatarPreview(previewUrl);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    if (!newUserEmail.endsWith('@cresol.com.br')) {
      alert.showError('E-mail inválido', 'Por favor, utilize um e-mail corporativo da Cresol.');
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
        alert.showError('E-mail duplicado', 'Este e-mail já está cadastrado no sistema.');
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

          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          alert.showError('Erro no upload', `Erro ao fazer upload da imagem: ${errorMessage}`);
          setFormLoading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      const adminToken = session?.access_token;

      if (!adminToken) {
        alert.showError('Erro de autenticação', 'Token de administrador inválido. Faça login novamente.');
        setFormLoading(false);
        return;
      }

      const response = await fetch('/api/admin/create-user', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUserEmail,
          fullName: newUserName,
          positionId: newUserPositionId || null,
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

      alert.users.created();
      alert.showInfo('Senha temporária', `Senha temporária: ${data.tempPassword}`);
      
      setNewUserEmail('');
      setNewUserName('');
      setNewUserPositionId('');
      setNewUserWorkLocationId('');
      setNewUserRole('user');
      setNewUserAvatarFile(null);
      if (newUserAvatarPreview) {
        URL.revokeObjectURL(newUserAvatarPreview);
        setNewUserAvatarPreview(null);
      }
      
      onSuccess();
    } catch (error: unknown) {

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert.showError('Falha ao criar usuário', errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="card mb-6">
      <h3 className="heading-4 text-primary mb-4">Cadastrar Novo Usuário</h3>

      <form onSubmit={handleCreateUser} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-4">
          <div className="flex-shrink-0">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-50 border border-cresol-gray-light">
              {newUserAvatarPreview ? (
                <OptimizedImage
                  src={newUserAvatarPreview}
                  alt="Preview de avatar"
                  fill
                  sizes="96px"
                  className="object-cover"
                  quality={80}
                  fallbackText="Avatar"
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
            <label className="form-label" htmlFor="newUserAvatar">
              Foto de Perfil
            </label>
            <div className="flex items-center">
              <label className="btn-outline text-sm" htmlFor="newUserAvatar">
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
                <CButton
                  type="button"
                  variant="plain"
                  colorPalette="red"
                  size="sm"
                  className="ml-2"
                  onClick={() => {
                    URL.revokeObjectURL(newUserAvatarPreview);
                    setNewUserAvatarPreview(null);
                    setNewUserAvatarFile(null);
                  }}
                >
                  Remover
                </CButton>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">
              Recomendado: JPG, PNG. Máximo 2MB.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="newUserName" className="form-label">
              Nome Completo
            </label>
            <StandardizedInput
              id="newUserName"
              type="text"
              value={newUserName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserName(e.target.value)}
              required
              placeholder="Nome completo do usuário"
              startIcon="user"
              variant="outline"
              size="md"
            />
          </div>
          
          <div>
            <label htmlFor="newUserEmail" className="form-label">
              E-mail Corporativo
            </label>
            <StandardizedInput
              id="newUserEmail"
              type="email"
              value={newUserEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserEmail(e.target.value)}
              required
              placeholder="email@cresol.com.br"
              startIcon="mail"
              variant="outline"
              size="md"
            />
          </div>
          
          <div>
            <label className="form-label">
              Cargo
            </label>
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  variant="outline"
                  w="full"
                  justifyContent="space-between"
                  fontWeight="normal"
                  borderColor="gray.300"
                  _hover={{ borderColor: 'gray.500' }}
                  _focus={{ borderColor: 'gray.500', outline: 'none', boxShadow: 'none' }}
                >
                  <span className="truncate">{selectedPositionLabel}</span>
                  <Icon name="chevron-down" className="h-4 w-4 text-default-400" />
                </Button>
              </Menu.Trigger>
              <Menu.Positioner>
                <Menu.Content minW="350px" maxH="300px" overflowY="auto" className="scrollbar-branded">
                  <div className="p-2">
                    <Input
                      autoFocus
                      placeholder="Buscar cargo..."
                      value={positionSearch}
                      onChange={(e) => setPositionSearch(e.target.value)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    />
                  </div>
                  <Menu.Separator />
                  <Menu.Item
                    value="empty"
                    onClick={() => {
                      setNewUserPositionId('');
                      setPositionSearch('');
                    }}
                    bg={!newUserPositionId ? 'orange.50' : undefined}
                    _hover={{ bg: 'gray.100' }}
                  >
                    <span className="text-gray-500">Nenhum cargo</span>
                  </Menu.Item>
                  {filteredPositions.length === 0 && positionSearch ? (
                    <Menu.Item value="no-results" disabled>
                      <span className="text-gray-500 italic">Nenhum cargo encontrado</span>
                    </Menu.Item>
                  ) : (
                    filteredPositions.map((position) => (
                      <Menu.Item
                        key={position.id}
                        value={position.id}
                        onClick={() => {
                          setNewUserPositionId(position.id);
                          setPositionSearch('');
                        }}
                        bg={newUserPositionId === position.id ? 'orange.50' : undefined}
                        _hover={{ bg: 'gray.100' }}
                      >
                        <div>
                          <span className="font-medium">{position.name}</span>
                          {position.department && (
                            <span className="text-gray-500 text-sm ml-2">- {position.department}</span>
                          )}
                        </div>
                      </Menu.Item>
                    ))
                  )}
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          </div>
          
          <div>
            <label className="form-label">
              Local de Atuação <span className="text-red-500">*</span>
            </label>
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  variant="outline"
                  w="full"
                  justifyContent="space-between"
                  fontWeight="normal"
                  borderColor="gray.300"
                  _hover={{ borderColor: 'gray.500' }}
                  _focus={{ borderColor: 'gray.500', outline: 'none', boxShadow: 'none' }}
                >
                  <span className="truncate">{selectedLocationLabel}</span>
                  <Icon name="chevron-down" className="h-4 w-4 text-default-400" />
                </Button>
              </Menu.Trigger>
              <Menu.Positioner>
                <Menu.Content minW="300px" maxH="300px" overflowY="auto" className="scrollbar-branded">
                  <div className="p-2">
                    <Input
                      autoFocus
                      placeholder="Buscar local..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    />
                  </div>
                  <Menu.Separator />
                  {filteredLocations.length === 0 && locationSearch ? (
                    <Menu.Item value="no-results" disabled>
                      <span className="text-gray-500 italic">Nenhum local encontrado</span>
                    </Menu.Item>
                  ) : (
                    filteredLocations.map((location) => (
                      <Menu.Item
                        key={location.id}
                        value={location.id}
                        onClick={() => {
                          setNewUserWorkLocationId(location.id);
                          setLocationSearch('');
                        }}
                        bg={newUserWorkLocationId === location.id ? 'orange.50' : undefined}
                        _hover={{ bg: 'gray.100' }}
                      >
                        <span className="truncate">{location.name}</span>
                      </Menu.Item>
                    ))
                  )}
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="newUserRole" className="form-label">
              Papel no Sistema
            </label>
            <FormSelect
              value={newUserRole}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewUserRole(e.currentTarget.value as 'user' | 'sector_admin' | 'subsector_admin' | 'admin')}
              placeholder="Selecione o papel no sistema"
              options={[
                { value: 'user', label: 'Usuário' },
                { value: 'sector_admin', label: 'Administrador de Setor' },
                { value: 'subsector_admin', label: 'Administrador de Subsetor' },
                { value: 'admin', label: 'Administrador Geral' }
              ]}
              required
              fullWidth
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <CButton
            type="button"
            onClick={onCancel}
            variant="outline"
            colorPalette="gray"
            size="md"
          >
            Cancelar
          </CButton>
          <CButton
            type="submit"
            variant="solid"
            colorPalette="orange"
            size="md"
            disabled={formLoading}
            loading={formLoading}
            loadingText="Cadastrando..."
          >
            Cadastrar Usuário
          </CButton>
        </div>
      </form>
    </div>
  );
} 