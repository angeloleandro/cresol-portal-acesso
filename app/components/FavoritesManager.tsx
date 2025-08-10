'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import OptimizedImage from './OptimizedImage';
import { supabase } from '@/lib/supabase';

interface FavoriteItem {
  id: string;
  type: 'system' | 'event' | 'news' | 'sector' | 'document' | 'page';
  title: string;
  description?: string;
  url: string;
  icon?: string;
  thumbnail?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  loading: boolean;
  addToFavorites: (item: Omit<FavoriteItem, 'id' | 'created_at'>) => Promise<boolean>;
  removeFromFavorites: (itemId: string) => Promise<boolean>;
  isFavorite: (itemUrl: string) => boolean;
  getFavoritesByType: (type: FavoriteItem['type']) => FavoriteItem[];
  clearAllFavorites: () => Promise<boolean>;
  exportFavorites: () => void;
  importFavorites: (data: FavoriteItem[]) => Promise<boolean>;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

interface FavoritesProviderProps {
  children: ReactNode;
  userId?: string;
}

export function FavoritesProvider({ children, userId }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLocalFavorites = () => {
    try {
      const stored = localStorage.getItem('cresol_favorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos do localStorage:', error);
      setFavorites([]);
    }
  };

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      if (userId) {
        // Carregar do Supabase
        const { data, error } = await supabase
          .from('user_favorites')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao carregar favoritos do Supabase:', error);
          loadLocalFavorites();
        } else {
          setFavorites(data || []);
        }
      } else {
        loadLocalFavorites();
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      loadLocalFavorites();
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadFavorites();
    } else {
      loadLocalFavorites();
    }
  }, [userId, loadFavorites]);

  const saveToLocal = (newFavorites: FavoriteItem[]) => {
    try {
      localStorage.setItem('cresol_favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Erro ao salvar favoritos locais:', error);
    }
  };

  const addToFavorites = async (item: Omit<FavoriteItem, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      const newFavorite: FavoriteItem = {
        ...item,
        id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString()
      };

      if (userId) {
        // Salvar no Supabase
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: userId,
            ...newFavorite
          });

        if (error) {
          console.error('Erro ao salvar favorito no Supabase:', error);
          throw error;
        }
      }

      // Atualizar estado local
      const newFavorites = [newFavorite, ...favorites];
      setFavorites(newFavorites);
      saveToLocal(newFavorites);

      return true;
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      return false;
    }
  };

  const removeFromFavorites = async (itemId: string): Promise<boolean> => {
    try {
      if (userId) {
        // Remover do Supabase
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('id', itemId);

        if (error) {
          console.error('Erro ao remover favorito do Supabase:', error);
          throw error;
        }
      }

      // Atualizar estado local
      const newFavorites = favorites.filter(fav => fav.id !== itemId);
      setFavorites(newFavorites);
      saveToLocal(newFavorites);

      return true;
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      return false;
    }
  };

  const isFavorite = (itemUrl: string): boolean => {
    return favorites.some(fav => fav.url === itemUrl);
  };

  const getFavoritesByType = (type: FavoriteItem['type']): FavoriteItem[] => {
    return favorites.filter(fav => fav.type === type);
  };

  const clearAllFavorites = async (): Promise<boolean> => {
    try {
      if (userId) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userId);

        if (error) {
          console.error('Erro ao limpar favoritos do Supabase:', error);
          throw error;
        }
      }

      setFavorites([]);
      saveToLocal([]);
      return true;
    } catch (error) {
      console.error('Erro ao limpar favoritos:', error);
      return false;
    }
  };

  const exportFavorites = () => {
    try {
      const dataStr = JSON.stringify(favorites, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `cresol_favoritos_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar favoritos:', error);
    }
  };

  const importFavorites = async (data: FavoriteItem[]): Promise<boolean> => {
    try {
      if (!Array.isArray(data)) {
        throw new Error('Dados inválidos para importação');
      }

      // Filtrar duplicatas por URL
      const existingUrls = new Set(favorites.map(fav => fav.url));
      const newFavorites = data.filter(item => !existingUrls.has(item.url));

      if (newFavorites.length === 0) {
        return true; // Nada para importar
      }

      if (userId) {
        // Salvar no Supabase
        const { error } = await supabase
          .from('user_favorites')
          .insert(
            newFavorites.map(item => ({
              user_id: userId,
              ...item,
              id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              created_at: new Date().toISOString()
            }))
          );

        if (error) {
          console.error('Erro ao importar favoritos no Supabase:', error);
          throw error;
        }
      }

      // Atualizar estado local
      const updatedFavorites = [...favorites, ...newFavorites];
      setFavorites(updatedFavorites);
      saveToLocal(updatedFavorites);

      return true;
    } catch (error) {
      console.error('Erro ao importar favoritos:', error);
      return false;
    }
  };

  const value: FavoritesContextType = {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoritesByType,
    clearAllFavorites,
    exportFavorites,
    importFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider');
  }
  return context;
};

// Componente de botão de favorito
interface FavoriteButtonProps {
  item: Omit<FavoriteItem, 'id' | 'created_at'>;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({ 
  item, 
  className = '', 
  showLabel = false, 
  size = 'md' 
}: FavoriteButtonProps) {
  const { addToFavorites, removeFromFavorites, isFavorite, favorites } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);
  
  const favorite = isFavorite(item.url);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      if (favorite) {
        // Encontrar o favorito para remover
        const favToRemove = favorites.find(fav => fav.url === item.url);
        if (favToRemove) {
          await removeFromFavorites(favToRemove.id);
        }
      } else {
        await addToFavorites(item);
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const buttonClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${buttonClasses[size]} rounded-md transition-colors ${
        favorite 
          ? 'text-yellow-500 hover:text-yellow-600' 
          : 'text-gray-400 hover:text-yellow-500'
      } ${className}`}
      title={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      {isLoading ? (
        <div className={`${sizeClasses[size]} animate-spin border-2 border-current border-t-transparent rounded-full`} />
      ) : (
        <svg 
          className={sizeClasses[size]} 
          fill={favorite ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
          />
        </svg>
      )}
      
      {showLabel && (
        <span className="ml-1 text-sm">
          {favorite ? 'Favorito' : 'Favoritar'}
        </span>
      )}
    </button>
  );
}

// Componente de lista de favoritos
interface FavoritesListProps {
  type?: FavoriteItem['type'];
  limit?: number;
  showType?: boolean;
  compact?: boolean;
  className?: string;
}

export function FavoritesList({ 
  type, 
  limit, 
  showType = true, 
  compact = false, 
  className = '' 
}: FavoritesListProps) {
  const { favorites, loading, getFavoritesByType, removeFromFavorites } = useFavorites();
  
  const displayFavorites = type 
    ? getFavoritesByType(type).slice(0, limit) 
    : favorites.slice(0, limit);

  const getTypeLabel = (type: FavoriteItem['type']) => {
    const labels = {
      system: 'Sistema',
      event: 'Evento',
      news: 'Notícia',
      sector: 'Setor',
      document: 'Documento',
      page: 'Página'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: FavoriteItem['type']) => {
    const colors = {
      system: 'bg-blue-100 text-blue-800',
      event: 'bg-green-100 text-green-800',
      news: 'bg-purple-100 text-purple-800',
      sector: 'bg-orange-100 text-orange-800',
      document: 'bg-gray-100 text-gray-800',
      page: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className={`animate-pulse space-y-2 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-md"></div>
        ))}
      </div>
    );
  }

  if (displayFavorites.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <p>Nenhum favorito encontrado</p>
        {type && <p className="text-sm mt-1">Adicione {getTypeLabel(type).toLowerCase()}s aos seus favoritos</p>}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {displayFavorites.map((favorite) => (
        <div 
          key={favorite.id} 
          className={`flex items-center space-x-3 ${
            compact ? 'p-2' : 'p-3'
          } bg-white border border-gray-200 rounded-md hover:border-primary/30 transition-colors`}
        >
          {/* Ícone ou thumbnail */}
          <div className="flex-shrink-0">
            {favorite.thumbnail ? (
              <OptimizedImage 
                src={favorite.thumbnail} 
                alt={favorite.title}
                width={compact ? 32 : 40}
                height={compact ? 32 : 40}
                className={`${compact ? 'h-8 w-8' : 'h-10 w-10'} object-cover rounded-md`}
              />
            ) : favorite.icon ? (
              <div className={`${compact ? 'h-8 w-8' : 'h-10 w-10'} flex items-center justify-center bg-gray-100 rounded-md`}>
                <span className="text-lg">{favorite.icon}</span>
              </div>
            ) : (
              <div className={`${compact ? 'h-8 w-8' : 'h-10 w-10'} flex items-center justify-center bg-primary/10 rounded-md`}>
                <svg className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className={`font-medium text-gray-900 truncate ${compact ? 'text-sm' : ''}`}>
                <a 
                  href={favorite.url} 
                  className="hover:text-primary transition-colors"
                  target={favorite.url.startsWith('http') ? '_blank' : '_self'}
                  rel={favorite.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {favorite.title}
                </a>
              </h4>
              
              {showType && (
                <span className={`px-1.5 py-0.5 text-xs font-medium rounded-sm ${getTypeColor(favorite.type)}`}>
                  {getTypeLabel(favorite.type)}
                </span>
              )}
            </div>
            
            {!compact && favorite.description && (
              <p className="text-sm text-gray-600 truncate mt-1">
                {favorite.description}
              </p>
            )}
          </div>
          
          {/* Ação de remover */}
          <button
            onClick={() => removeFromFavorites(favorite.id)}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Remover dos favoritos"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
} 