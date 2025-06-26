'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
  }, [systems, searchTerm, sectorFilter]);

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

  const applyFilters = () => {
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
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-cresol-gray">Carregando sistemas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-cresol-gray">Sistemas e Aplicações</h1>
              <p className="text-cresol-gray mt-2">
                Acesse todos os sistemas disponíveis para sua função
              </p>
            </div>
            
            {/* Contador de sistemas */}
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Total de sistemas</div>
              <div className="text-2xl font-bold text-primary">{filteredSystems.length}</div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar sistemas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Filtro por Setor */}
              <div className="w-full lg:w-64">
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="all">Todos os setores</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modo de Visualização */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sistemas */}
        {filteredSystems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum sistema encontrado</h3>
            <p className="text-gray-500">
              {searchTerm || sectorFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Você ainda não tem acesso a nenhum sistema.'}
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredSystems.map((system) => (
              <div 
                key={system.id} 
                className={`
                  bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200
                  ${viewMode === 'list' ? 'flex items-center p-4' : 'p-6'}
                `}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Card Grid */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="relative h-12 w-12 mr-3 flex-shrink-0">
                          <Image 
                            src={system.icon || '/icons/default-app.svg'} 
                            alt={system.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{system.name}</h3>
                          {system.sector_name && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1">
                              {system.sector_name}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleFavorite(system.id)}
                        className={`p-2 rounded-full transition-colors ${
                          favorites.has(system.id) 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <svg className="h-5 w-5" fill={favorites.has(system.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{system.description}</p>
                    
                    <a
                      href={system.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                    >
                      Acessar Sistema
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </>
                ) : (
                  <>
                    {/* Lista */}
                    <div className="flex items-center flex-1">
                      <div className="relative h-10 w-10 mr-4 flex-shrink-0">
                        <Image 
                          src={system.icon || '/icons/default-app.svg'} 
                          alt={system.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate mr-2">{system.name}</h3>
                          {system.sector_name && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {system.sector_name}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">{system.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => toggleFavorite(system.id)}
                        className={`p-2 rounded-full transition-colors ${
                          favorites.has(system.id) 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <svg className="h-5 w-5" fill={favorites.has(system.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                      
                      <a
                        href={system.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                      >
                        Acessar
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 