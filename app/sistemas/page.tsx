'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OptimizedImage from '@/app/components/OptimizedImage';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';

interface System {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  sector_id: string | null;
  sector_name?: string;
}

interface Sector {
  id: string;
  name: string;
}

export default function SistemasPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [systems, setSystems] = useState<System[]>([]);
  const [filteredSystems, setFilteredSystems] = useState<System[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const applyFilters = useCallback(() => {
    let filtered = [...systems];

    // Filtrar por setor
    if (sectorFilter !== 'all') {
      filtered = filtered.filter(system => system.sector_id === sectorFilter);
    }

    // Filtrar por termo de busca
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        system => 
          system.name.toLowerCase().includes(term) ||
          system.description.toLowerCase().includes(term) ||
          (system.sector_name && system.sector_name.toLowerCase().includes(term))
      );
    }

    // Ordenar: favoritos primeiro, depois por nome
    filtered.sort((a, b) => {
      const aIsFavorite = favorites.has(a.id);
      const bIsFavorite = favorites.has(b.id);
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      return a.name.localeCompare(b.name);
    });

    setFilteredSystems(filtered);
  }, [systems, sectorFilter, searchTerm, favorites]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }
      
      setUser(data.user);
      await Promise.all([
        fetchUserSystems(data.user.id),
        fetchSectors(),
        loadFavorites(data.user.id)
      ]);
      
      setLoading(false);
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchUserSystems = async (userId: string) => {
    try {
      // Tentar usar a função RPC primeiro
      const { data: userSystemsData, error: userSystemsError } = await supabase
        .rpc('get_user_systems', { user_uuid: userId });

      if (userSystemsError) {
        console.error('Erro RPC, tentando método alternativo:', userSystemsError);
        
        // Método alternativo: buscar todos os sistemas se o RPC falhar
        const { data: allSystems, error: allSystemsError } = await supabase
          .from('systems')
          .select(`
            id,
            name,
            description,
            url,
            icon,
            sector_id,
            sectors(name)
          `)
          .order('name');

        if (allSystemsError) {
          console.error('Erro ao buscar sistemas:', allSystemsError);
          return;
        }

        // Formatar dados dos sistemas
        const formattedSystems = (allSystems || []).map(system => {
          let sectorName = '';
          if (system.sectors) {
            if (Array.isArray(system.sectors)) {
              sectorName = system.sectors[0]?.name || '';
            } else {
              sectorName = (system.sectors as any)?.name || '';
            }
          }
          
          return {
            ...system,
            sector_name: sectorName
          };
        });

        setSystems(formattedSystems);
      } else {
        setSystems(userSystemsData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar sistemas do usuário:', error);
    }
  };

  const fetchSectors = async () => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Erro ao buscar setores:', error);
        return;
      }

      setSectors(data || []);
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
    }
  };

  const loadFavorites = async (userId: string) => {
    try {
      // Implementar lógica de favoritos quando necessário
      // Por enquanto, usar localStorage como fallback
      const savedFavorites = localStorage.getItem(`favorites_${userId}`);
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const toggleFavorite = (systemId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(systemId)) {
      newFavorites.delete(systemId);
    } else {
      newFavorites.add(systemId);
    }
    
    setFavorites(newFavorites);
    
    // Salvar no localStorage
    try {
      localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(Array.from(newFavorites)));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="body-text text-muted">Carregando sistemas...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Sistemas' }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex-1">
              <h1 className="heading-1 text-title mb-2">Sistemas e Aplicações</h1>
              <p className="body-text text-muted">
                Acesse todos os sistemas disponíveis para sua função
              </p>
            </div>
            
            {/* Contador de sistemas */}
            <div className="card-status min-w-[160px]">
              <div className="body-text-small text-muted">Total de sistemas</div>
              <div className="text-2xl font-bold text-primary">{filteredSystems.length}</div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Busca */}
              <div className="md:col-span-2">
                <label htmlFor="search" className="form-label block mb-2">
                  Buscar sistemas
                </label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    placeholder="Digite o nome do sistema ou descrição..."
                    className="input w-full pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Filtro por setor */}
              <div>
                <label htmlFor="sector-filter" className="form-label block mb-2">
                  Filtrar por setor
                </label>
                <select
                  id="sector-filter"
                  className="input w-full"
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                >
                  <option value="all">Todos os setores</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Controles de visualização */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="body-text-small text-muted">Visualização:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-muted hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Visualização em grade"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-muted hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Visualização em lista"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="body-text-small text-muted">
                {filteredSystems.length} sistema{filteredSystems.length !== 1 ? 's' : ''} encontrado{filteredSystems.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de sistemas */}
        {filteredSystems.length === 0 ? (
          <div className="card text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-16 w-16 text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="heading-3 text-title mb-2">Nenhum sistema encontrado</h3>
              <p className="body-text text-muted">
                {searchTerm || sectorFilter !== 'all' 
                  ? 'Tente ajustar os filtros para encontrar os sistemas desejados.'
                  : 'Ainda não há sistemas cadastrados para o seu perfil.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid-responsive' 
              : 'space-y-4'
          }>
            {filteredSystems.map((system) => (
              <div key={system.id} className="card group">
                <div className={`${viewMode === 'list' ? 'flex items-start gap-4' : ''}`}>
                  {/* Ícone do sistema */}
                  <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}`}>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-primary/20">
                      {system.icon ? (
                        <OptimizedImage
                          src={system.icon}
                          alt={`Ícone ${system.name}`}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      ) : (
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="heading-4 text-title group-hover:text-primary transition-colors duration-200 truncate">
                        {system.name}
                      </h3>
                      <button
                        onClick={() => toggleFavorite(system.id)}
                        className={`flex-shrink-0 p-1 rounded-md transition-all duration-200 ${
                          favorites.has(system.id)
                            ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50'
                            : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-50'
                        }`}
                        title={favorites.has(system.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      >
                        <svg className="w-5 h-5" fill={favorites.has(system.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>
                    
                    {system.sector_name && (
                      <div className="mb-3">
                        <span className="badge-success">
                          {system.sector_name}
                        </span>
                      </div>
                    )}
                    
                    <p className="body-text-small text-muted mb-4 line-clamp-2">
                      {system.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Link
                        href={system.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center gap-2 text-sm"
                      >
                        Acessar Sistema
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      
                      {favorites.has(system.id) && (
                        <span className="badge-warning">
                          ⭐ Favorito
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}