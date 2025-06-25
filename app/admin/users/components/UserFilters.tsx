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
  return (
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
            <option value="subsector_admin">Admin. Subsetorial</option>
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