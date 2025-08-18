'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';
import UnifiedLoadingSpinner from '../components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import Navbar from '../components/Navbar';

interface MessageItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  sector_id?: string;
  subsector_id?: string;
  sector_name?: string;
  subsector_name?: string;
  type: 'sector' | 'subsector';
}

export default function MensagensPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<MessageItem[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }
      setUser(data.user);

      try {
        // Carregar setores para filtro
        const { data: sectorsData } = await supabase
          .from('sectors')
          .select('id, name')
          .order('name');
        
        setSectors(sectorsData || []);

        // Carregar mensagens de setores
        const { data: sectorMessages, error: sectorError } = await supabase
          .from('sector_messages')
          .select(`
            id,
            title,
            content,
            created_at,
            sector_id,
            sectors (name)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        // Carregar mensagens de subsetores
        const { data: subsectorMessages, error: subsectorError } = await supabase
          .from('subsector_messages')
          .select(`
            id,
            title,
            content,
            created_at,
            subsector_id,
            subsectors (
              name,
              sector_id
            )
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        // Combinar e formatar mensagens
        let allMessages: MessageItem[] = [];
        
        if (sectorMessages && !sectorError) {
          const formattedSectorMessages = sectorMessages.map((msg: any) => ({
            ...msg,
            sector_name: msg.sectors?.name,
            type: 'sector' as const
          }));
          allMessages = [...allMessages, ...formattedSectorMessages];
        }

        if (subsectorMessages && !subsectorError) {
          const formattedSubsectorMessages = subsectorMessages.map((msg: any) => ({
            ...msg,
            subsector_name: msg.subsectors?.name,
            sector_id: msg.subsectors?.sector_id,
            type: 'subsector' as const
          }));
          allMessages = [...allMessages, ...formattedSubsectorMessages];
        }

        // Ordenar por data
        allMessages.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setMessages(allMessages);
        setFilteredMessages(allMessages);
      } catch (err) {
        console.error('Erro:', err);
        setMessages([]);
        setFilteredMessages([]);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...messages];

    // Filtrar por setor
    if (selectedSector !== 'all') {
      filtered = filtered.filter(msg => msg.sector_id === selectedSector);
    }

    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.title.toLowerCase().includes(term) ||
        msg.content.toLowerCase().includes(term) ||
        msg.sector_name?.toLowerCase().includes(term) ||
        msg.subsector_name?.toLowerCase().includes(term)
      );
    }

    setFilteredMessages(filtered);
  }, [messages, selectedSector, searchTerm]);

  // Formatador de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <UnifiedLoadingSpinner 
              size="default" 
              message="Carregando mensagens..."
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Conteúdo principal */}
      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Mensagens' }
            ]} 
          />
        </div>

        <div className="mb-8">
          <h1 className="heading-1 mb-2">Mensagens</h1>
          <p className="body-text text-muted">Comunicados e avisos importantes da administração.</p>
        </div>

        {/* Filtros */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar mensagens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input w-full pl-10"
                />
              </div>
            </div>

            {/* Filtro por setor */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="input"
            >
              <option value="all">Todos os setores</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>

            {/* Contador */}
            <div className="flex items-center text-sm text-muted">
              {filteredMessages.length} mensage{filteredMessages.length !== 1 ? 'ns' : 'm'}
            </div>
          </div>
        </div>

        {/* Lista de mensagens */}
        {filteredMessages.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="heading-3 mb-2">Nenhuma mensagem encontrada</h3>
            <p className="body-text text-muted">
              {searchTerm || selectedSector !== 'all'
                ? 'Tente ajustar os filtros de busca.' 
                : 'Não há mensagens publicadas no momento.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <Link 
                key={message.id} 
                href={`/mensagens/${message.id}`}
                className="card transition-all duration-200 block hover:shadow-md"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="badge-info">
                        Mensagem
                      </span>
                      {message.type === 'sector' && message.sector_name && (
                        <span className="text-xs text-muted">
                          Setor: {message.sector_name}
                        </span>
                      )}
                      {message.type === 'subsector' && message.subsector_name && (
                        <span className="text-xs text-muted">
                          Subsetor: {message.subsector_name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                  
                  <h2 className="heading-3 mb-3">{message.title}</h2>
                  <p className="body-text text-muted mb-4 line-clamp-3">{message.content}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted">
                      {message.sector_name || message.subsector_name || 'Administração'}
                    </span>
                    <span className="text-primary font-medium text-sm">
                      Ler mensagem completa →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}