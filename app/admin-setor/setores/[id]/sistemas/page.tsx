'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Sector {
  id: string;
  name: string;
  description: string;
}

interface System {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  sector_id: string;
  created_at: string;
}

export default function SectorSystemsManagement() {
  const router = useRouter();
  const params = useParams();
  const sectorId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState<Sector | null>(null);
  const [systems, setSystems] = useState<System[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Estados para o formulário de sistemas
  const [showSystemForm, setShowSystemForm] = useState(false);
  const [systemForm, setSystemForm] = useState({
    id: '',
    name: '',
    description: '',
    url: '',
    icon: '/icons/default-app.svg'
  });
  
  // Lista de ícones disponíveis
  const availableIcons = [
    '/icons/default-app.svg',
    '/icons/app-1.svg',
    '/icons/app-2.svg',
    '/icons/app-3.svg',
    '/icons/app-4.svg',
    '/icons/app-5.svg'
  ];

  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        router.replace('/login');
        return;
      }

      setUser(userData.user);

      // Verificar se o usuário é admin ou admin do setor
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (profile?.role === 'admin') {
        setIsAuthorized(true);
      } else if (profile?.role === 'sector_admin') {
        // Verificar se é admin deste setor específico
        const { data: sectorAdmin } = await supabase
          .from('sector_admins')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('sector_id', sectorId);
        
        if (sectorAdmin && sectorAdmin.length > 0) {
          setIsAuthorized(true);
        } else {
          // Redirecionar usuários não autorizados para o dashboard
          router.replace('/admin-setor');
          return;
        }
      } else {
        // Redirecionar usuários regulares para o dashboard
        router.replace('/dashboard');
        return;
      }

      await Promise.all([
        fetchSector(),
        fetchSystems()
      ]);
      
      setLoading(false);
    };

    checkUser();
  }, [sectorId, router]);

  const fetchSector = async () => {
    const { data, error } = await supabase
      .from('sectors')
      .select('id, name, description')
      .eq('id', sectorId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar setor:', error);
      return;
    }
    
    setSector(data);
  };

  const fetchSystems = async () => {
    const { data, error } = await supabase
      .from('systems')
      .select('*')
      .eq('sector_id', sectorId)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar sistemas:', error);
      return;
    }
    
    setSystems(data || []);
  };

  const handleSystemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const systemData = {
        sector_id: sectorId,
        name: systemForm.name,
        description: systemForm.description,
        url: systemForm.url,
        icon: systemForm.icon
      };
      
      if (systemForm.id) {
        // Atualizar sistema existente
        const { error } = await supabase
          .from('systems')
          .update(systemData)
          .eq('id', systemForm.id);
        
        if (error) throw error;
      } else {
        // Criar novo sistema
        const { error } = await supabase
          .from('systems')
          .insert([systemData]);
        
        if (error) throw error;
      }
      
      // Limpar formulário e atualizar lista
      setSystemForm({ id: '', name: '', description: '', url: '', icon: '/icons/default-app.svg' });
      setShowSystemForm(false);
      fetchSystems();
    } catch (error) {
      console.error('Erro ao salvar sistema:', error);
      alert('Erro ao salvar sistema. Tente novamente.');
    }
  };

  const editSystem = (system: System) => {
    setSystemForm({
      id: system.id,
      name: system.name,
      description: system.description || '',
      url: system.url,
      icon: system.icon
    });
    
    setShowSystemForm(true);
  };

  const deleteSystem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este sistema?')) return;
    
    try {
      const { error } = await supabase
        .from('systems')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      fetchSystems();
    } catch (error) {
      console.error('Erro ao excluir sistema:', error);
      alert('Erro ao excluir sistema. Tente novamente.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-cresol-gray">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!sector) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Setor não encontrado.</p>
          <Link href="/admin-setor" className="mt-4 text-primary hover:underline block">
            Voltar para o Painel
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Você não tem autorização para acessar esta página.</p>
          <Link href="/admin-setor" className="mt-4 text-primary hover:underline block">
            Voltar para o Painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative h-10 w-24 mr-4">
              <Image 
                src="/logo-cresol.png" 
                alt="Logo Cresol" 
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Painel Admin Setorial</h1>
          </div>
          
          <div className="flex items-center">
            <Link href="/admin-setor" className="text-sm text-gray-600 mr-4 hover:text-primary">
              Painel
            </Link>
            <Link href={`/admin-setor/setores/${sectorId}`} className="text-sm text-gray-600 mr-4 hover:text-primary">
              Conteúdo
            </Link>
            <Link href="/dashboard" className="text-sm text-gray-600 mr-4 hover:text-primary">
              Dashboard
            </Link>
            <span className="text-sm text-gray-600 mr-4">
              Olá, {user?.user_metadata?.full_name || user?.email}
            </span>
            <button 
              onClick={handleLogout}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link 
            href="/admin-setor" 
            className="inline-flex items-center text-sm text-cresol-gray hover:text-primary mb-4"
          >
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para o Painel
          </Link>
          
          <h2 className="text-2xl font-bold text-primary">Gerenciar Sistemas do Setor</h2>
          <p className="text-cresol-gray mt-1">Setor: {sector.name}</p>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Adicione e gerencie os sistemas/aplicativos que serão exibidos para os usuários deste setor.
            </p>
            <button
              onClick={() => {
                setSystemForm({ id: '', name: '', description: '', url: '', icon: '/icons/default-app.svg' });
                setShowSystemForm(true);
              }}
              className="bg-primary text-white px-3 py-2 rounded hover:bg-primary-dark text-sm"
            >
              Adicionar Sistema
            </button>
          </div>
        </div>
        
        {showSystemForm && (
          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-lg font-medium mb-4">
              {systemForm.id ? 'Editar Sistema' : 'Novo Sistema'}
            </h3>
            <form onSubmit={handleSystemSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Sistema
                </label>
                <input
                  type="text"
                  id="name"
                  value={systemForm.name}
                  onChange={(e) => setSystemForm({...systemForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  id="description"
                  value={systemForm.description}
                  onChange={(e) => setSystemForm({...systemForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded h-24"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Sistema
                </label>
                <input
                  type="url"
                  id="url"
                  value={systemForm.url}
                  onChange={(e) => setSystemForm({...systemForm, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="https://example.com"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ícone
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                  {availableIcons.map((icon) => (
                    <div 
                      key={icon}
                      onClick={() => setSystemForm({...systemForm, icon})}
                      className={`
                        cursor-pointer p-2 rounded border
                        ${systemForm.icon === icon ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-400'}
                      `}
                    >
                      <div className="relative h-16 w-full">
                        <Image
                          src={icon}
                          alt="Ícone"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSystemForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        )}
        
        {systems.length === 0 ? (
          <div className="bg-white p-8 rounded shadow text-center">
            <p className="text-gray-500">Nenhum sistema cadastrado para este setor.</p>
            <p className="text-gray-500 mt-2">Clique em &quot;Adicionar Sistema&quot; para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systems.map((system) => (
              <div key={system.id} className="bg-white p-6 rounded shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="relative h-12 w-12 mr-3">
                      <Image
                        src={system.icon || '/icons/default-app.svg'}
                        alt={system.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <h3 className="text-lg font-medium">{system.name}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editSystem(system)}
                      className="text-primary hover:text-primary-dark"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteSystem(system.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3">{system.description}</p>
                
                <div className="flex justify-between items-center mt-4 text-sm">
                  <a 
                    href={system.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Abrir sistema →
                  </a>
                  <span className="text-gray-500">
                    Adicionado em: {new Date(system.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 