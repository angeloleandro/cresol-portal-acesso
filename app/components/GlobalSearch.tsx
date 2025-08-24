'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

import { supabase } from '@/lib/supabase';


import AdvancedSearch from './AdvancedSearch';
import { Icon } from './icons/Icon';
import UnifiedLoadingSpinner from './ui/UnifiedLoadingSpinner';

interface QuickResult {
  id: string;
  title: string;
  type: 'system' | 'event' | 'news' | 'sector' | 'subsector' | 'message' | 'video' | 'gallery' | 'collection' | 'document';
  description?: string;
  url: string;
  icon?: string;
}

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
  showAdvancedButton?: boolean;
  autoFocus?: boolean;
  compact?: boolean;
}

export default function GlobalSearch({ 
  className = '',
  placeholder = 'Buscar sistemas, eventos, notícias, documentos, setores, mensagens...',
  showAdvancedButton = true,
  autoFocus = false,
  compact = false
}: GlobalSearchProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [quickResults, setQuickResults] = useState<QuickResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const performQuickSearch = useCallback(async () => {
    setLoading(true);
    try {
      // Executar todas as queries em paralelo usando Promise.allSettled para não falhar se uma der erro
      const searchPromises = [
        // Buscar sistemas (limite 3)
        supabase
          .from('system_links')
          .select('id, name, description, url')
          .eq('is_active', true)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .order('display_order', { ascending: true })
          .limit(3),
        
        // Buscar eventos (limite 2)
        supabase
          .from('sector_events')
          .select('id, title, description')
          .eq('is_published', true)
          .gte('start_date', new Date().toISOString())
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(2),
        
        // Buscar notícias (limite 2)
        supabase
          .from('sector_news')
          .select('id, title, summary')
          .eq('is_published', true)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
          .limit(2),
        
        // Buscar documentos de setores (limite 1)
        supabase
          .from('sector_documents')
          .select('id, title, description')
          .eq('is_published', true)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(1),
        
        // Buscar documentos de subsetores (limite 1)
        supabase
          .from('subsector_documents')
          .select('id, title, description')
          .eq('is_published', true)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(1),
        
        // Buscar setores (limite 2)
        supabase
          .from('sectors')
          .select('id, name, description')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(2),
        
        // Buscar subsetores (limite 2)
        supabase
          .from('subsectors')
          .select('id, name, description, sector_id')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(2),
        
        // Buscar mensagens de setores (limite 1)
        supabase
          .from('sector_messages')
          .select('id, title, content')
          .eq('is_published', true)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .limit(1),
        
        // Buscar vídeos (limite 1)
        supabase
          .from('dashboard_videos')
          .select('id, title')
          .eq('is_active', true)
          .ilike('title', `%${query}%`)
          .limit(1)
      ];

      const searchResults = await Promise.allSettled(searchPromises);
      const results: QuickResult[] = [];

      // Processar sistemas
      if (searchResults[0].status === 'fulfilled' && searchResults[0].value.data) {
        results.push(...searchResults[0].value.data.map((system: any) => ({
          id: system.id,
          title: system.name,
          type: 'system' as const,
          description: system.description,
          url: system.url
        })));
      }

      // Processar eventos
      if (searchResults[1].status === 'fulfilled' && searchResults[1].value.data) {
        results.push(...searchResults[1].value.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          type: 'event' as const,
          description: event.description,
          url: `/eventos/${event.id}`
        })));
      }

      // Processar notícias
      if (searchResults[2].status === 'fulfilled' && searchResults[2].value.data) {
        results.push(...searchResults[2].value.data.map((article: any) => ({
          id: article.id,
          title: article.title,
          type: 'news' as const,
          description: article.summary,
          url: `/noticias/${article.id}`
        })));
      }

      // Processar setores
      if (searchResults[3].status === 'fulfilled' && searchResults[3].value.data) {
        results.push(...searchResults[3].value.data.map((sector: any) => ({
          id: sector.id,
          title: sector.name,
          type: 'sector' as const,
          description: sector.description,
          url: `/setores/${sector.id}`
        })));
      }

      // Processar subsetores
      if (searchResults[4].status === 'fulfilled' && searchResults[4].value.data) {
        results.push(...searchResults[4].value.data.map((subsector: any) => ({
          id: subsector.id,
          title: subsector.name,
          type: 'subsector' as const,
          description: subsector.description,
          url: `/subsetores/${subsector.id}`
        })));
      }

      // Processar documentos de setores
      if (searchResults[5].status === 'fulfilled' && searchResults[5].value.data) {
        results.push(...searchResults[5].value.data.map((document: any) => ({
          id: document.id,
          title: document.title,
          type: 'document' as const,
          description: document.description,
          url: `/documentos/${document.id}`
        })));
      }

      // Processar documentos de subsetores
      if (searchResults[6].status === 'fulfilled' && searchResults[6].value.data) {
        results.push(...searchResults[6].value.data.map((document: any) => ({
          id: document.id,
          title: document.title,
          type: 'document' as const,
          description: document.description,
          url: `/documentos/${document.id}`
        })));
      }

      // Processar mensagens
      if (searchResults[7].status === 'fulfilled' && searchResults[7].value.data) {
        results.push(...searchResults[7].value.data.map((message: any) => ({
          id: message.id,
          title: message.title,
          type: 'message' as const,
          description: message.content?.substring(0, 100) + '...',
          url: `/mensagens/${message.id}`
        })));
      }

      // Processar vídeos
      if (searchResults[8].status === 'fulfilled' && searchResults[8].value.data) {
        results.push(...searchResults[8].value.data.map((video: any) => ({
          id: video.id,
          title: video.title,
          type: 'video' as const,
          description: 'Vídeo',
          url: `/videos/${video.id}`
        })));
      }

      // Log de debugging para queries que falharam
      if (process.env.NODE_ENV === 'development') {
        searchResults.forEach((result, index) => {
          if (result.status === 'rejected') {

          }
        });
      }

      setQuickResults(results);
      setShowResults(true);
      setSelectedIndex(-1);

    } catch (error) {

      // Em caso de erro, limpar resultados e mostrar estado adequado
      setQuickResults([]);
      setShowResults(false);
      
      // Log do erro para debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Detalhes do erro na busca:', {
          query,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date().toISOString()
        });
      }
    } finally {
      setLoading(false);
    }
  }, [query]);

  const saveRecentSearch = useCallback((searchQuery: string) => {
    try {
      const cleaned = searchQuery.trim();
      if (!cleaned) return;

      const updated = [cleaned, ...recentSearches.filter(s => s !== cleaned)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
    } catch (error) {

    }
  }, [recentSearches]);

  const handleResultClick = useCallback((result: QuickResult) => {
    saveRecentSearch(query);
    setShowResults(false);
    setQuery('');
    setSelectedIndex(-1);
    
    if (result.url.startsWith('http')) {
      window.open(result.url, '_blank');
    } else {
      window.location.href = result.url;
    }
  }, [query, saveRecentSearch]);

  const openAdvancedSearch = useCallback(() => {
    saveRecentSearch(query);
    setShowAdvanced(true);
    setShowResults(false);
  }, [query, saveRecentSearch]);

  // Carregar buscas recentes do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recent_searches');
      if (stored) {
        const recent = JSON.parse(stored);
        setRecentSearches(Array.isArray(recent) ? recent.slice(0, 5) : []);
      }
    } catch (error) {

    }
  }, []);

  // Focus automático
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Busca com debounce
  useEffect(() => {
    if (query.length >= 2) {
      const debounceTimer = setTimeout(() => {
        performQuickSearch();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setQuickResults([]);
      setShowResults(false);
    }
  }, [query, performQuickSearch]);

  // Controle de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Atalho Ctrl+K ou Cmd+K para focar na busca
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
        return;
      }

      if (!showResults) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < quickResults.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && quickResults[selectedIndex]) {
            handleResultClick(quickResults[selectedIndex]);
          } else if (query.trim()) {
            openAdvancedSearch();
          }
          break;
        case 'Escape':
          setShowResults(false);
          setSelectedIndex(-1);
          if (inputRef.current) {
            inputRef.current.blur();
          }
          break;
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults, quickResults, selectedIndex, query, handleResultClick, openAdvancedSearch]);

  const handleInputFocus = () => {
    if (query.length >= 2) {
      setShowResults(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Gerar sugestões simples
    if (value.length >= 1) {
      const simpleSuggestions = [
        'sistemas', 'eventos', 'notícias', 'setores', 'cooperativismo',
        'treinamento', 'sustentabilidade', 'financeiro', 'tecnologia'
      ].filter(s => s.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(simpleSuggestions.slice(0, 3));
    } else {
      setSuggestions([]);
    }
  };

  const getTypeIcon = (type: QuickResult['type']) => {
    const icons = {
      system: <Icon name="monitor" className="h-4 w-4" />,
      event: <Icon name="clock" className="h-4 w-4" />,
      news: <Icon name="chat-line" className="h-4 w-4" />,
      sector: <Icon name="building-1" className="h-4 w-4" />,
      subsector: <Icon name="building-1" className="h-4 w-4" />,
      message: <Icon name="chat-line" className="h-4 w-4" />,
      video: <Icon name="play" className="h-4 w-4" />,
      gallery: <Icon name="image" className="h-4 w-4" />,
      collection: <Icon name="folder" className="h-4 w-4" />,
      document: <Icon name="file-text" className="h-4 w-4" />
    };
    return icons[type];
  };

  const getTypeColor = (type: QuickResult['type']) => {
    const colors = {
      system: 'text-blue-600',
      event: 'text-green-600',
      news: 'text-purple-600',
      sector: 'text-orange-600',
      subsector: 'text-orange-500',
      message: 'text-indigo-600',
      video: 'text-red-600',
      gallery: 'text-pink-600',
      collection: 'text-teal-600',
      document: 'text-gray-600'
    };
    return colors[type];
  };

  const getTypeLabel = (type: QuickResult['type']) => {
    const labels = {
      system: 'Sistema',
      event: 'Evento',
      news: 'Notícia',
      sector: 'Setor',
      subsector: 'Subsetor',
      message: 'Mensagem',
      video: 'Vídeo',
      gallery: 'Galeria',
      collection: 'Coleção',
      document: 'Documento'
    };
    return labels[type];
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Campo de busca principal */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name="search" className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={compact ? 'Buscar...' : placeholder}
          className={`block w-full pl-9 pr-3 text-sm bg-white border border-gray-200/40 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-gray-400 transition-all duration-150 ${
            compact ? 'py-2 w-48' : 'py-2.5'
          }`}
        />
        
        {/* Indicador de carregamento */}
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <UnifiedLoadingSpinner size="small" />
          </div>
        )}
      </div>

      {/* Resultados da busca */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200/40 rounded-md max-h-96 overflow-y-auto z-50">
          {/* Sugestões de pesquisa recente */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-2">Pesquisas recentes</div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(search)}
                    className="block text-left w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-150"
                  >
                    <Icon name="clock" className="inline h-3 w-3 text-gray-400 mr-2" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resultados da busca */}
          {quickResults.length > 0 ? (
            <div className="py-2">
              {quickResults.map((result, index) => (
                <Link
                  key={result.id}
                  href={result.url}
                  onClick={() => handleResultClick(result)}
                  className={`block px-4 py-2.5 hover:bg-gray-50 transition-colors duration-150 ${
                    selectedIndex === index ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </div>
                      {result.description && (
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {result.description}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {getTypeLabel(result.type)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              {showAdvancedButton && query.trim() && (
                <div className="border-t border-gray-100 p-2">
                  <button
                    onClick={openAdvancedSearch}
                    className="w-full text-left px-2 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-md transition-colors duration-150"
                  >
                    Ver todos os resultados para &quot;{query}&quot;
                  </button>
                </div>
              )}
            </div>
          ) : query.length >= 2 && !loading ? (
            <div className="p-4 text-center text-gray-500">
              <Icon name="search" className="mx-auto h-6 w-6 text-gray-300 mb-2" />
              <div className="text-sm">Nenhum resultado encontrado</div>
              {showAdvancedButton && (
                <button
                  onClick={openAdvancedSearch}
                  className="text-xs text-primary hover:underline mt-1 rounded-md px-2 py-1"
                >
                  Tentar busca avançada
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}

              {/* Modal de busca avançada */}
        {showAdvanced && (
          <AdvancedSearch
            isOpen={showAdvanced}
            initialQuery={query}
            onClose={() => setShowAdvanced(false)}
          />
        )}
    </div>
  );
} 