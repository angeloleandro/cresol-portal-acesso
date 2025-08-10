'use client';

import { useState, useMemo } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Input
} from '@nextui-org/react';
import { Icon } from '@/app/components/icons/Icon';
import OptimizedImage from '@/app/components/OptimizedImage';
import { supabase } from '@/lib/supabase';
import { StandardizedButton } from '@/app/components/admin';

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
  const [formLoading, setFormLoading] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPositionId, setNewUserPositionId] = useState('');
  const [newUserWorkLocationId, setNewUserWorkLocationId] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'sector_admin' | 'subsector_admin' | 'admin'>('user');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
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
        setFormError('Token de administrador inválido. Faça login novamente.');
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

      setFormSuccess(`Usuário criado com sucesso! Senha temporária: ${data.tempPassword}`);
      
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
      console.error('Erro ao criar usuário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setFormError(`Falha ao criar usuário: ${errorMessage}`);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="card mb-6">
      <h3 className="heading-4 text-primary mb-4">Cadastrar Novo Usuário</h3>
      
      {formError && (
        <div className="alert-error body-text-small">
          {formError}
        </div>
      )}

      {formSuccess && (
        <div className="alert-success body-text-small">
          {formSuccess}
        </div>
      )}
      
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
                <StandardizedButton
                  type="button"
                  variant="link"
                  size="sm"
                  className="ml-2 text-red-600 hover:text-red-700"
                  onClick={() => {
                    URL.revokeObjectURL(newUserAvatarPreview);
                    setNewUserAvatarPreview(null);
                    setNewUserAvatarFile(null);
                  }}
                >
                  Remover
                </StandardizedButton>
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
            <input
              id="newUserName"
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              required
              className="input"
              placeholder="Nome completo do usuário"
            />
          </div>
          
          <div>
            <label htmlFor="newUserEmail" className="form-label">
              E-mail Corporativo
            </label>
            <input
              id="newUserEmail"
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              required
              className="input"
              placeholder="email@cresol.com.br"
            />
          </div>
          
          <div>
            <label className="form-label">
              Cargo
            </label>
            <Dropdown placement="bottom-start">
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  className="w-full justify-between font-normal border-cresol-gray-light hover:border-primary focus:border-primary focus:outline-none focus:ring-0"
                  endContent={
                    <Icon name="chevron-down" className="h-4 w-4 text-default-400" />
                  }
                >
                  <span className="truncate text-left">{selectedPositionLabel}</span>
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Selecionar cargo"
                className="min-w-[350px] max-h-[300px] overflow-y-auto scrollbar-branded"
                selectedKeys={newUserPositionId ? [newUserPositionId] : []}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setNewUserPositionId(selected || '');
                  setPositionSearch('');
                }}
                items={[
                  { id: 'header', type: 'header' },
                  { id: 'empty-option', type: 'empty-option', name: 'Nenhum cargo' },
                  ...(filteredPositions.length === 0 && positionSearch 
                    ? [{ id: 'no-results', type: 'no-results', name: 'Nenhum cargo encontrado' }]
                    : filteredPositions.map(position => ({ ...position, type: 'position' }))
                  )
                ]}
                itemClasses={{
                  base: [
                    "rounded-md",
                    "text-default-700",
                    "transition-colors",
                    "data-[hover=true]:bg-primary",
                    "data-[hover=true]:text-white",
                    "data-[selectable=true]:focus:bg-primary",
                    "data-[selectable=true]:focus:text-white",
                  ]
                }}
              >
                {(item) => {
                  if (item.type === 'header') {
                    return (
                      <DropdownItem key="header" isReadOnly className="h-14 gap-2">
                        <Input
                          autoFocus
                          placeholder="Buscar cargo..."
                          startContent={<Icon name="search" className="h-4 w-4" />}
                          value={positionSearch}
                          onValueChange={setPositionSearch}
                          variant="bordered"
                          className="w-full dropdown-search-override"
                          classNames={{
                            input: "text-sm bg-white",
                            inputWrapper: [
                              "h-10",
                              "bg-white",
                              "border-gray-300",
                              "border",
                              "rounded-md",
                              "hover:border-gray-300",
                              "focus-within:border-primary",
                              "focus-within:ring-1",
                              "focus-within:ring-primary/20",
                              "data-[hover=true]:border-gray-300",
                              "data-[focus=true]:border-primary",
                              "data-[focus=true]:ring-1",
                              "data-[focus=true]:ring-primary/20"
                            ]
                          }}
                        />
                      </DropdownItem>
                    );
                  }
                  
                  if (item.type === 'empty-option') {
                    return (
                      <DropdownItem key="empty-option" textValue="Nenhum cargo">
                        <span className="text-gray-500">Nenhum cargo</span>
                      </DropdownItem>
                    );
                  }
                  
                  if (item.type === 'no-results') {
                    return (
                      <DropdownItem key="no-results" isReadOnly>
                        <span className="text-gray-500 italic">Nenhum cargo encontrado</span>
                      </DropdownItem>
                    );
                  }
                  
                  return (
                    <DropdownItem 
                      key={item.id} 
                      textValue={`${'name' in item ? item.name : ''} ${'department' in item && item.department ? item.department : ''}`}
                    >
                      <div>
                        <span className="font-medium">{'name' in item ? item.name : ''}</span>
                        {'department' in item && item.department && (
                          <span className="text-gray-500 text-sm ml-2">- {item.department}</span>
                        )}
                      </div>
                    </DropdownItem>
                  );
                }}
              </DropdownMenu>
            </Dropdown>
          </div>
          
          <div>
            <label className="form-label">
              Local de Atuação <span className="text-red-500">*</span>
            </label>
            <Dropdown placement="bottom-start">
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  className="w-full justify-between font-normal border-cresol-gray-light hover:border-primary focus:border-primary focus:outline-none focus:ring-0"
                  endContent={
                    <Icon name="chevron-down" className="h-4 w-4 text-default-400" />
                  }
                >
                  <span className="truncate text-left">{selectedLocationLabel}</span>
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Selecionar local de atuação"
                className="min-w-[300px] max-h-[300px] overflow-y-auto scrollbar-branded"
                selectedKeys={newUserWorkLocationId ? [newUserWorkLocationId] : []}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setNewUserWorkLocationId(selected || '');
                  setLocationSearch('');
                }}
                items={[
                  { id: 'header', type: 'header' },
                  ...(filteredLocations.length === 0 && locationSearch 
                    ? [{ id: 'no-results', type: 'no-results', name: 'Nenhum local encontrado' }]
                    : filteredLocations.map(location => ({ ...location, type: 'location' }))
                  )
                ]}
                itemClasses={{
                  base: [
                    "rounded-md",
                    "text-default-700",
                    "transition-colors",
                    "data-[hover=true]:bg-primary",
                    "data-[hover=true]:text-white",
                    "data-[selectable=true]:focus:bg-primary",
                    "data-[selectable=true]:focus:text-white",
                  ]
                }}
              >
                {(item) => {
                  if (item.type === 'header') {
                    return (
                      <DropdownItem key="header" isReadOnly className="h-14 gap-2">
                        <Input
                          autoFocus
                          placeholder="Buscar local..."
                          startContent={<Icon name="search" className="h-4 w-4" />}
                          value={locationSearch}
                          onValueChange={setLocationSearch}
                          variant="bordered"
                          className="w-full dropdown-search-override"
                          classNames={{
                            input: "text-sm bg-white",
                            inputWrapper: [
                              "h-10",
                              "bg-white",
                              "border-gray-300",
                              "border",
                              "rounded-md",
                              "hover:border-gray-300",
                              "focus-within:border-primary",
                              "focus-within:ring-1",
                              "focus-within:ring-primary/20",
                              "data-[hover=true]:border-gray-300",
                              "data-[focus=true]:border-primary",
                              "data-[focus=true]:ring-1",
                              "data-[focus=true]:ring-primary/20"
                            ]
                          }}
                        />
                      </DropdownItem>
                    );
                  }
                  
                  if (item.type === 'no-results') {
                    return (
                      <DropdownItem key="no-results" isReadOnly>
                        <span className="text-gray-500 italic">Nenhum local encontrado</span>
                      </DropdownItem>
                    );
                  }
                  
                  return (
                    <DropdownItem key={item.id} textValue={'name' in item ? item.name : ''}>
                      <span className="truncate">{'name' in item ? item.name : ''}</span>
                    </DropdownItem>
                  );
                }}
              </DropdownMenu>
            </Dropdown>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="newUserRole" className="form-label">
              Papel no Sistema
            </label>
            <select
              id="newUserRole"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as 'user' | 'sector_admin' | 'subsector_admin' | 'admin')}
              required
              className="input"
            >
              <option value="user">Usuário</option>
              <option value="sector_admin">Administrador de Setor</option>
              <option value="subsector_admin">Admin. Subsetorial</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <StandardizedButton
            type="button"
            onClick={onCancel}
            variant="secondary"
          >
            Cancelar
          </StandardizedButton>
          <StandardizedButton
            type="submit"
            variant="primary"
            disabled={formLoading}
            loading={formLoading}
          >
            {formLoading ? 'Cadastrando...' : 'Cadastrar Usuário'}
          </StandardizedButton>
        </div>
      </form>
    </div>
  );
} 