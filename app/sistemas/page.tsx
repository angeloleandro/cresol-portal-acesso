'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { StandardizedButton } from '@/app/components/admin';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import ErrorMessage from '../components/ui/ErrorMessage';
import { Icon } from '../components/icons';
import { handleComponentError, devLog } from '@/lib/error-handler';

interface SystemLink {
  id: string;
  name: string;
  url: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export default function SistemasPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [systems, setSystems] = useState<SystemLink[]>([]);
  const [filteredSystems, setFilteredSystems] = useState<SystemLink[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const applyFilters = useCallback(() => {
    let filtered = [...systems];

    // Filtrar por termo de busca
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        system => 
          system.name.toLowerCase().includes(term) ||
          (system.description && system.description.toLowerCase().includes(term))
      );
    }

    // Ordenar: favoritos primeiro, depois por display_order e nome
    filtered.sort((a, b) => {
      const aIsFavorite = favorites.has(a.id);
      const bIsFavorite = favorites.has(b.id);
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      // Se ambos são favoritos ou não são favoritos, ordenar por display_order primeiro
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      
      return a.name.localeCompare(b.name);
    });

    setFilteredSystems(filtered);
  }, [systems, searchTerm, favorites]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }
      
      setUser(data.user);
      await Promise.all([
        fetchSystemLinks(),
        loadFavorites(data.user.id)
      ]);
      
      setLoading(false);
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchSystemLinks = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/admin/system-links?active_only=true');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar sistemas');
      }

      setSystems(data.links || []);
      devLog.info('Sistemas carregados na página', { count: data.links?.length });

    } catch (error: any) {
      const errorMessage = handleComponentError(error, 'fetchSystemLinks');
      setError(errorMessage);
      devLog.error('Erro ao buscar sistemas na página', { error });
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
        <UnifiedLoadingSpinner fullScreen message={LOADING_MESSAGES.systems} />
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
                Acesse todos os sistemas corporativos disponíveis
              </p>
            </div>
            
            {/* Contador de sistemas */}
            <div className="bg-white rounded-md border border-gray-200/40 hover:border-gray-200/70 transition-colors duration-150 p-4 min-w-[160px]">
              <div className="body-text-small text-muted">Total de sistemas</div>
              <div className="text-2xl font-bold text-primary">{filteredSystems.length}</div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white rounded-md border border-gray-200/40 hover:border-gray-200/70 transition-colors duration-150 p-6">
            {error && (
              <div className="mb-6">
                <ErrorMessage
                  title="Erro ao Carregar Sistemas"
                  message={error}
                  type="error"
                  showRetry
                  onRetry={fetchSystemLinks}
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Busca */}
              <div>
                <label htmlFor="search" className="form-label block mb-2">
                  Buscar sistemas
                </label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    placeholder="Digite o nome do sistema ou descrição..."
                    className="input w-full pl-14"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon name="search" className="h-4 w-4 text-muted" />
                  </div>
                </div>
              </div>

              {/* Limpar busca */}
              <div className="flex items-end">
                {searchTerm && (
                  <StandardizedButton
                    onClick={() => setSearchTerm('')}
                    variant="secondary"
                    size="sm"
                  >
                    <Icon name="x" className="w-4 h-4 mr-1" />
                    Limpar busca
                  </StandardizedButton>
                )}
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
                        ? 'bg-primary text-white ' 
                        : 'text-muted hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Visualização em grade"
                  >
                    <Icon name="grid" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-primary text-white ' 
                        : 'text-muted hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Visualização em lista"
                  >
                    <Icon name="list" className="h-4 w-4" />
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
        {!error && filteredSystems.length === 0 ? (
          <div className="bg-white rounded-md border border-gray-200/40 hover:border-gray-200/70 transition-colors duration-150 p-12 text-center">
            <div className="max-w-md mx-auto">
              <Icon name="monitor" className="mx-auto h-16 w-16 text-muted mb-4" />
              <h3 className="heading-3 text-title mb-2">Nenhum sistema encontrado</h3>
              <p className="body-text text-muted">
                {searchTerm 
                  ? 'Tente ajustar o termo de busca para encontrar os sistemas desejados.'
                  : 'Ainda não há sistemas cadastrados.'
                }
              </p>
              {searchTerm && (
                <StandardizedButton
                  onClick={() => setSearchTerm('')}
                  variant="primary"
                  className="mt-4"
                >
                  Ver todos os sistemas
                </StandardizedButton>
              )}
            </div>
          </div>
        ) : !error && (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
              : 'space-y-4'
          }>
            {filteredSystems.map((system) => (
              <div key={system.id} className="bg-white rounded-md border border-gray-200/40 hover:border-gray-200/70 transition-colors duration-150 p-6 group">
                <div className={`${viewMode === 'list' ? 'flex items-start gap-4' : ''}`}>
                  {/* Ícone do sistema */}
                  <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}`}>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-primary/20">
                      <Icon name="monitor" className="w-6 h-6 text-primary" />
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
                        <Icon 
                          name="star" 
                          className={`w-5 h-5 ${favorites.has(system.id) ? 'fill-current' : ''}`} 
                        />
                      </button>
                    </div>
                    
                    {system.description && (
                      <p className="body-text-small text-muted mb-4 line-clamp-2">
                        {system.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <StandardizedButton
                        as="a"
                        href={system.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="primary"
                        size="sm"
                        className="inline-flex items-center gap-2"
                      >
                        Acessar Sistema
                        <Icon name="external-link" className="w-4 h-4" />
                      </StandardizedButton>
                      
                      {favorites.has(system.id) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Icon name="star" className="w-3 h-3 mr-1 fill-current" />
                          Favorito
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