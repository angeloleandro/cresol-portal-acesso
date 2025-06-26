'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface SearchResult {
  id: string;
  title: string;
  type: 'system' | 'event' | 'news' | 'sector' | 'document' | 'user' | 'location';
  description?: string;
  url: string;
  icon?: string;
  thumbnail?: string;
  score: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

interface SearchFilter {
  types: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  sectors: string[];
  locations: string[];
  tags: string[];
}

interface SearchHistory {
  id: string;
  query: string;
  filters: SearchFilter;
  timestamp: string;
  resultCount: number;
}

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onResultClick?: (result: SearchResult) => void;
}

export default function AdvancedSearch({ 
  isOpen, 
  onClose, 
  initialQuery = '',
  onResultClick 
}: AdvancedSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<SearchFilter>({
    types: [],
    dateRange: {},
    sectors: [],
    locations: [],
    tags: []
  });
  
  // Referências
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Estados auxiliares
  const [sectors, setSectors] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);

  // Configurações de paginação
  const resultsPerPage = 10;

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      loadSearchHistory();
      loadFilterOptions();
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    if (query.trim()) {
      const debounceTimer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setResults([]);
      setTotalResults(0);
    }
  }, [query, selectedFilter, currentPage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedResultIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedResultIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedResultIndex >= 0 && results[selectedResultIndex]) {
            handleResultClick(results[selectedResultIndex]);
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose, results, selectedResultIndex]);

  const loadSearchHistory = () => {
    try {
      const stored = localStorage.getItem('search_history');
      if (stored) {
        const history = JSON.parse(stored);
        setSearchHistory(Array.isArray(history) ? history.slice(0, 10) : []);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de busca:', error);
    }
  };

  const saveToHistory = (searchQuery: string, filterUsed: SearchFilter, resultCount: number) => {
    try {
      const newEntry: SearchHistory = {
        id: Date.now().toString(),
        query: searchQuery,
        filters: filterUsed,
        timestamp: new Date().toISOString(),
        resultCount
      };

      const updated = [newEntry, ...searchHistory.filter(h => h.query !== searchQuery)].slice(0, 10);
      setSearchHistory(updated);
      localStorage.setItem('search_history', JSON.stringify(updated));
    } catch (error) {
      console.error('Erro ao salvar no histórico:', error);
    }
  };

  const loadFilterOptions = async () => {
    try {
      // Carregar setores
      const { data: sectorsData } = await supabase
        .from('sectors')
        .select('id, name')
        .order('name');
      setSectors(sectorsData || []);

      // Carregar localizações
      const { data: locationsData } = await supabase
        .from('work_locations')
        .select('id, name')
        .order('name');
      setLocations(locationsData || []);

      // Tags populares (mockup - implementar com dados reais)
      setPopularTags(['treinamento', 'cooperativismo', 'sustentabilidade', 'tecnologia', 'inovação']);
    } catch (error) {
      console.error('Erro ao carregar opções de filtro:', error);
    }
  };

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];
      let totalCount = 0;

      // Buscar em sistemas
      if (selectedFilter.types.length === 0 || selectedFilter.types.includes('system')) {
        const { data: systems, count } = await supabase
          .from('systems')
          .select('*', { count: 'exact' })
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .range((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage - 1);

        if (systems) {
          searchResults.push(...systems.map(system => ({
            id: system.id,
            title: system.name,
            type: 'system' as const,
            description: system.description,
            url: system.url,
            icon: system.icon,
            score: calculateRelevanceScore(system.name, system.description, query),
            metadata: { sector_id: system.sector_id }
          })));
        }
        totalCount += count || 0;
      }

      // Buscar em eventos
      if (selectedFilter.types.length === 0 || selectedFilter.types.includes('event')) {
        const { data: events, count } = await supabase
          .from('sector_events')
          .select('*, sectors(name)', { count: 'exact' })
          .eq('is_published', true)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
          .range((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage - 1);

        if (events) {
          searchResults.push(...events.map(event => ({
            id: event.id,
            title: event.title,
            type: 'event' as const,
            description: event.description,
            url: `/eventos/${event.id}`,
            score: calculateRelevanceScore(event.title, event.description, query),
            metadata: { 
              start_date: event.start_date, 
              location: event.location,
              sector_name: event.sectors?.name 
            }
          })));
        }
        totalCount += count || 0;
      }

      // Buscar em notícias
      if (selectedFilter.types.length === 0 || selectedFilter.types.includes('news')) {
        const { data: news, count } = await supabase
          .from('sector_news')
          .select('*, sectors(name)', { count: 'exact' })
          .eq('is_published', true)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
          .range((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage - 1);

        if (news) {
          searchResults.push(...news.map(article => ({
            id: article.id,
            title: article.title,
            type: 'news' as const,
            description: article.summary,
            url: `/noticias/${article.id}`,
            thumbnail: article.image_url,
            score: calculateRelevanceScore(article.title, article.content, query),
            metadata: { 
              created_at: article.created_at,
              sector_name: article.sectors?.name 
            }
          })));
        }
        totalCount += count || 0;
      }

      // Buscar em setores
      if (selectedFilter.types.length === 0 || selectedFilter.types.includes('sector')) {
        const { data: sectorsResult, count } = await supabase
          .from('sectors')
          .select('*', { count: 'exact' })
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .range((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage - 1);

        if (sectorsResult) {
          searchResults.push(...sectorsResult.map(sector => ({
            id: sector.id,
            title: sector.name,
            type: 'sector' as const,
            description: sector.description,
            url: `/setores/${sector.id}`,
            score: calculateRelevanceScore(sector.name, sector.description, query)
          })));
        }
        totalCount += count || 0;
      }

      // Aplicar filtros adicionais
      let filteredResults = searchResults;

      // Filtro por data
      if (selectedFilter.dateRange.start || selectedFilter.dateRange.end) {
        filteredResults = filteredResults.filter(result => {
          const date = result.metadata?.created_at || result.metadata?.start_date;
          if (!date) return true;
          
          const resultDate = new Date(date);
          const startDate = selectedFilter.dateRange.start ? new Date(selectedFilter.dateRange.start) : null;
          const endDate = selectedFilter.dateRange.end ? new Date(selectedFilter.dateRange.end) : null;
          
          if (startDate && resultDate < startDate) return false;
          if (endDate && resultDate > endDate) return false;
          return true;
        });
      }

      // Ordenar por relevância
      filteredResults.sort((a, b) => b.score - a.score);

      setResults(filteredResults);
      setTotalResults(totalCount);
      setSelectedResultIndex(-1);

      // Salvar no histórico
      if (query.trim()) {
        saveToHistory(query, selectedFilter, filteredResults.length);
      }

    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRelevanceScore = (title: string, content: string, searchQuery: string): number => {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    const queryLower = searchQuery.toLowerCase();
    
    let score = 0;
    
    // Pontuação por correspondência exata no título
    if (titleLower.includes(queryLower)) {
      score += 10;
      if (titleLower.startsWith(queryLower)) score += 5;
    }
    
    // Pontuação por correspondência no conteúdo
    if (contentLower.includes(queryLower)) {
      score += 3;
    }
    
    // Pontuação por palavras-chave individuais
    const queryWords = queryLower.split(/\s+/);
    queryWords.forEach(word => {
      if (word.length > 2) {
        if (titleLower.includes(word)) score += 2;
        if (contentLower.includes(word)) score += 1;
      }
    });
    
    return score;
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      // Navegação padrão
      if (result.url.startsWith('http')) {
        window.open(result.url, '_blank');
      } else {
        window.location.href = result.url;
      }
    }
    onClose();
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    const icons = {
      system: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      event: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      news: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      sector: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      document: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      user: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      location: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
      )
    };
    return icons[type] || icons.document;
  };

  const getTypeColor = (type: SearchResult['type']) => {
    const colors = {
      system: 'bg-blue-100 text-blue-800',
      event: 'bg-green-100 text-green-800',
      news: 'bg-purple-100 text-purple-800',
      sector: 'bg-orange-100 text-orange-800',
      document: 'bg-gray-100 text-gray-800',
      user: 'bg-indigo-100 text-indigo-800',
      location: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || colors.document;
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    const labels = {
      system: 'Sistema',
      event: 'Evento',
      news: 'Notícia',
      sector: 'Setor',
      document: 'Documento',
      user: 'Usuário',
      location: 'Local'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <div className="fixed inset-0 flex items-start justify-center pt-16 px-4">
        <div 
          ref={modalRef}
          className="w-full max-w-4xl bg-white rounded-lg shadow-xl max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {/* Campo de busca principal */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar sistemas, eventos, notícias, setores..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {loading && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>

              {/* Botões de ação */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 border rounded-md font-medium transition-colors ${
                  showFilters
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Filtros
              </button>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`px-4 py-3 border rounded-md font-medium transition-colors ${
                  showHistory
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Histórico
              </button>

              <button
                onClick={onClose}
                className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Painel de filtros */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Tipos de conteúdo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de conteúdo</label>
                    <div className="space-y-1">
                      {['system', 'event', 'news', 'sector'].map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedFilter.types.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFilter(prev => ({
                                  ...prev,
                                  types: [...prev.types, type]
                                }));
                              } else {
                                setSelectedFilter(prev => ({
                                  ...prev,
                                  types: prev.types.filter(t => t !== type)
                                }));
                              }
                            }}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {getTypeLabel(type as SearchResult['type'])}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Período */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={selectedFilter.dateRange.start || ''}
                        onChange={(e) => setSelectedFilter(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, start: e.target.value }
                        }))}
                        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Data inicial"
                      />
                      <input
                        type="date"
                        value={selectedFilter.dateRange.end || ''}
                        onChange={(e) => setSelectedFilter(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, end: e.target.value }
                        }))}
                        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Data final"
                      />
                    </div>
                  </div>

                  {/* Setores */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Setores</label>
                    <select
                      multiple
                      value={selectedFilter.sectors}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setSelectedFilter(prev => ({ ...prev, sectors: values }));
                      }}
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm h-20"
                    >
                      {sectors.map((sector) => (
                        <option key={sector.id} value={sector.id}>
                          {sector.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tags populares */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-1">
                      {popularTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            if (selectedFilter.tags.includes(tag)) {
                              setSelectedFilter(prev => ({
                                ...prev,
                                tags: prev.tags.filter(t => t !== tag)
                              }));
                            } else {
                              setSelectedFilter(prev => ({
                                ...prev,
                                tags: [...prev.tags, tag]
                              }));
                            }
                          }}
                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                            selectedFilter.tags.includes(tag)
                              ? 'bg-primary text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ações dos filtros */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
                  </span>
                  
                  <button
                    onClick={() => setSelectedFilter({
                      types: [],
                      dateRange: {},
                      sectors: [],
                      locations: [],
                      tags: []
                    })}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>
            )}

            {/* Painel de histórico */}
            {showHistory && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Buscas recentes</h4>
                {searchHistory.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma busca recente</p>
                ) : (
                  <div className="space-y-2">
                    {searchHistory.slice(0, 5).map((historyItem) => (
                      <button
                        key={historyItem.id}
                        onClick={() => {
                          setQuery(historyItem.query);
                          setSelectedFilter(historyItem.filters);
                          setShowHistory(false);
                        }}
                        className="flex items-center justify-between w-full p-2 text-left text-sm bg-white rounded border hover:bg-gray-50"
                      >
                        <div>
                          <span className="text-gray-900">{historyItem.query}</span>
                          <span className="text-gray-500 ml-2">
                            ({historyItem.resultCount} resultado{historyItem.resultCount !== 1 ? 's' : ''})
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {formatDate(historyItem.timestamp)}
                        </span>
                      </button>
                    ))}
                    
                    {searchHistory.length > 0 && (
                      <button
                        onClick={() => {
                          setSearchHistory([]);
                          localStorage.removeItem('search_history');
                        }}
                        className="text-xs text-red-600 hover:text-red-800 mt-2"
                      >
                        Limpar histórico
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resultados */}
          <div className="flex-1 overflow-y-auto max-h-96">
            {query.trim() === '' ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-lg font-medium mb-2">Digite algo para buscar</p>
                <p className="text-sm">Procure por sistemas, eventos, notícias, setores e muito mais</p>
              </div>
            ) : results.length === 0 && !loading ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium mb-2">Nenhum resultado encontrado</p>
                <p className="text-sm">Tente usar termos diferentes ou ajustar os filtros</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      index === selectedResultIndex ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Thumbnail ou ícone */}
                      <div className="flex-shrink-0">
                        {result.thumbnail ? (
                          <img 
                            src={result.thumbnail} 
                            alt={result.title}
                            className="h-12 w-12 object-cover rounded"
                          />
                        ) : (
                          <div className={`h-12 w-12 flex items-center justify-center rounded ${getTypeColor(result.type)}`}>
                            {getTypeIcon(result.type)}
                          </div>
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(result.type)}`}>
                            {getTypeLabel(result.type)}
                          </span>
                        </div>

                        {result.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {result.description}
                          </p>
                        )}

                        {/* Metadados */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {result.metadata?.sector_name && (
                            <span>📁 {result.metadata.sector_name}</span>
                          )}
                          {result.metadata?.location && (
                            <span>📍 {result.metadata.location}</span>
                          )}
                          {result.metadata?.start_date && (
                            <span>📅 {formatDate(result.metadata.start_date)}</span>
                          )}
                          {result.metadata?.created_at && (
                            <span>🕒 {formatDate(result.metadata.created_at)}</span>
                          )}
                        </div>
                      </div>

                      {/* Score de relevância (apenas para debug) */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="flex-shrink-0 text-xs text-gray-400">
                          {result.score}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer com paginação */}
          {totalResults > resultsPerPage && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Mostrando {((currentPage - 1) * resultsPerPage) + 1} a {Math.min(currentPage * resultsPerPage, totalResults)} de {totalResults} resultados
              </span>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * resultsPerPage >= totalResults}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 