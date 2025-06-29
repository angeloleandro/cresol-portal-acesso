'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import AdvancedSearch from './AdvancedSearch';
import { Icon } from './icons/Icon';

interface QuickResult {
  id: string;
  title: string;
  type: 'system' | 'event' | 'news' | 'sector';
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
  placeholder = 'Buscar sistemas, eventos, notícias...',
  showAdvancedButton = true,
  autoFocus = false,
  compact = false
}: GlobalSearchProps) {
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

  // Carregar buscas recentes do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recent_searches');
      if (stored) {
        const recent = JSON.parse(stored);
        setRecentSearches(Array.isArray(recent) ? recent.slice(0, 5) : []);
      }
    } catch (error) {
      console.error('Erro ao carregar buscas recentes:', error);
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
  }, [query]);

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
  }, [showResults, quickResults, selectedIndex, query]);

  const performQuickSearch = async () => {
    setLoading(true);
    try {
      const results: QuickResult[] = [];

      // Buscar sistemas (limite 3)
      const { data: systems } = await supabase
        .from('systems')
        .select('id, name, description, url, icon')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(3);

      if (systems) {
        results.push(...systems.map(system => ({
          id: system.id,
          title: system.name,
          type: 'system' as const,
          description: system.description,
          url: system.url,
          icon: system.icon
        })));
      }

      // Buscar eventos (limite 2)
      const { data: events } = await supabase
        .from('sector_events')
        .select('id, title, description')
        .eq('is_published', true)
        .gte('start_date', new Date().toISOString())
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(2);

      if (events) {
        results.push(...events.map(event => ({
          id: event.id,
          title: event.title,
          type: 'event' as const,
          description: event.description,
          url: `/eventos/${event.id}`
        })));
      }

      // Buscar notícias (limite 2)
      const { data: news } = await supabase
        .from('sector_news')
        .select('id, title, summary')
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
        .limit(2);

      if (news) {
        results.push(...news.map(article => ({
          id: article.id,
          title: article.title,
          type: 'news' as const,
          description: article.summary,
          url: `/noticias/${article.id}`
        })));
      }

      // Buscar setores (limite 2)
      const { data: sectors } = await supabase
        .from('sectors')
        .select('id, name, description')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(2);

      if (sectors) {
        results.push(...sectors.map(sector => ({
          id: sector.id,
          title: sector.name,
          type: 'sector' as const,
          description: sector.description,
          url: `/setores/${sector.id}`
        })));
      }

      setQuickResults(results);
      setShowResults(true);
      setSelectedIndex(-1);

    } catch (error) {
      console.error('Erro na busca rápida:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRecentSearch = (searchQuery: string) => {
    try {
      const cleaned = searchQuery.trim();
      if (!cleaned) return;

      const updated = [cleaned, ...recentSearches.filter(s => s !== cleaned)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
    } catch (error) {
      console.error('Erro ao salvar busca recente:', error);
    }
  };

  const handleResultClick = (result: QuickResult) => {
    saveRecentSearch(query);
    setShowResults(false);
    setQuery('');
    setSelectedIndex(-1);
    
    if (result.url.startsWith('http')) {
      window.open(result.url, '_blank');
    } else {
      window.location.href = result.url;
    }
  };

  const openAdvancedSearch = () => {
    saveRecentSearch(query);
    setShowAdvanced(true);
    setShowResults(false);
  };

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
      sector: <Icon name="building-1" className="h-4 w-4" />
    };
    return icons[type];
  };

  const getTypeColor = (type: QuickResult['type']) => {
    const colors = {
      system: 'text-blue-600',
      event: 'text-green-600',
      news: 'text-purple-600',
      sector: 'text-orange-600'
    };
    return colors[type];
  };

  const getTypeLabel = (type: QuickResult['type']) => {
    const labels = {
      system: 'Sistema',
      event: 'Evento',
      news: 'Notícia',
      sector: 'Setor'
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
          className={`block w-full pl-9 pr-3 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-gray-400 transition-all duration-200 ${
            compact ? 'py-2 w-48' : 'py-2.5'
          }`}
        />
        
        {/* Indicador de carregamento */}
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-primary rounded-full" />
          </div>
        )}
      </div>

      {/* Resultados da busca */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {/* Sugestões de pesquisa recente */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-2">Pesquisas recentes</div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(search)}
                    className="block text-left w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
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
                  className={`block px-4 py-2.5 hover:bg-gray-50 transition-colors ${
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
                    className="w-full text-left px-2 py-1.5 text-sm text-primary hover:bg-primary/5 rounded transition-colors"
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
                  className="text-xs text-primary hover:underline mt-1"
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