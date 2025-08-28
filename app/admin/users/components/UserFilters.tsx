import { Button, Menu } from '@chakra-ui/react';
import { useMemo, useCallback } from 'react';

import { Icon } from '@/app/components/icons/Icon';

interface WorkLocation {
  id: string;
  name: string;
}

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;
  workLocations: WorkLocation[];
  totalUsers: number;
  filteredCount: number;
}

export default function UserFilters({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  locationFilter,
  setLocationFilter,
  workLocations,
  totalUsers,
  filteredCount
}: UserFiltersProps) {
  
  // Role options with labels
  const roleOptions = useMemo(() => [
    { value: 'all', label: 'Todos' },
    { value: 'admin', label: 'Administrador Geral' },
    { value: 'sector_admin', label: 'Administrador de Setor' },
    { value: 'subsector_admin', label: 'Administrador de Subsetor' },
    { value: 'user', label: 'Usuário' }
  ], []);
  
  // Location options with "all" option
  const locationOptions = useMemo(() => [
    { id: 'all', name: 'Todos os locais' },
    ...workLocations
  ], [workLocations]);
  
  // Get selected role label
  const selectedRoleLabel = useMemo(() =>
    roleOptions.find(role => role.value === roleFilter)?.label || 'Todos',
    [roleFilter, roleOptions]
  );
  
  // Get selected location label
  const selectedLocationLabel = useMemo(() =>
    locationOptions.find(loc => loc.id === locationFilter)?.name || 'Todos os locais',
    [locationFilter, locationOptions]
  );
  
  // Handle role selection
  const handleRoleSelect = useCallback((role: string) => {
    setRoleFilter(role);
  }, [setRoleFilter]);
  
  // Handle location selection
  const handleLocationSelect = useCallback((location: string) => {
    setLocationFilter(location);
  }, [setLocationFilter]);
  return (
    <div className="bg-white rounded-lg border border-cresol-gray-light p-4 mb-6">
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
          <label className="block text-xs font-medium text-cresol-gray mb-1">
            Filtrar por papel
          </label>
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button
                variant="outline"
                w="full"
                justifyContent="space-between"
                fontWeight="normal"
                borderColor="gray.300"
                _hover={{ borderColor: 'orange.500' }}
                _focus={{ borderColor: 'orange.500' }}
              >
                <span className="truncate">{selectedRoleLabel}</span>
                <Icon name="chevron-down" className="h-4 w-4 text-default-400" />
              </Button>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content minW="200px">
                {roleOptions.map((role) => (
                  <Menu.Item
                    key={role.value}
                    value={role.value}
                    onClick={() => handleRoleSelect(role.value)}
                    bg={roleFilter === role.value ? 'orange.50' : undefined}
                    _hover={{ bg: 'orange.100' }}
                  >
                    {role.label}
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </div>
        
        <div className="w-full md:w-48">
          <label className="block text-xs font-medium text-cresol-gray mb-1">
            Filtrar por local
          </label>
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button
                variant="outline"
                w="full"
                justifyContent="space-between"
                fontWeight="normal"
                borderColor="gray.300"
                _hover={{ borderColor: 'orange.500' }}
                _focus={{ borderColor: 'orange.500' }}
              >
                <span className="truncate">{selectedLocationLabel}</span>
                <Icon name="chevron-down" className="h-4 w-4 text-default-400" />
              </Button>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content minW="250px" maxH="300px" overflowY="auto" className="scrollbar-branded">
                {locationOptions.map((location) => (
                  <Menu.Item
                    key={location.id}
                    value={location.id}
                    onClick={() => handleLocationSelect(location.id)}
                    bg={locationFilter === location.id ? 'orange.50' : undefined}
                    _hover={{ bg: 'orange.100' }}
                  >
                    <span className="truncate">{location.name}</span>
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap items-center justify-between">
        <div className="text-sm text-cresol-gray">
          {filteredCount} {filteredCount === 1 ? 'usuário encontrado' : 'usuários encontrados'}
          {filteredCount !== totalUsers && ` de ${totalUsers} total`}
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
  );
} 