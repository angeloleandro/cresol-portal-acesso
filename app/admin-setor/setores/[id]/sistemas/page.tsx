'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import OptimizedImage from '@/app/components/OptimizedImage';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

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

  const fetchSector = useCallback(async () => {
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
  }, [sectorId]);

  const fetchSystems = useCallback(async () => {
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
  }, [sectorId]);

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
  }, [sectorId, router, fetchSector, fetchSystems]);

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
<UnifiedLoadingSpinner 
        fullScreen
        size="large" 
        message={LOADING_MESSAGES.systems}
      />
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
      <header className="bg-white border border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative h-10 w-24 mr-4">
              <OptimizedImage 
                src="/logo-horizontal-laranja.svg" 
                alt="Logo Cresol" 
                fill
                className="object-contain"
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
          
          <h2 className="text-2xl font-bold text-primary">{sector.name}</h2>
          <p className="text-cresol-gray">Gerenciar sistemas do setor</p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Sistemas</h3>
            <p className="text-sm text-gray-600">Gerencie os sistemas associados a este setor</p>
          </div>
          <button
            onClick={() => setShowSystemForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
          >
            Adicionar Sistema
          </button>
        </div>

        {/* Lista de sistemas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {systems.map((system) => (
            <div key={system.id} className="bg-white rounded-lg  p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 mr-4">
                  <OptimizedImage 
                    src={system.icon} 
                    alt={system.name}
                    width={48}
                    height={48}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{system.name}</h4>
                  <p className="text-sm text-gray-600">{system.description}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => editSystem(system)}
                  className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm hover:bg-blue-100"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteSystem(system.id)}
                  className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm hover:bg-red-100"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        {systems.length === 0 && (
          <div className="bg-white rounded-lg  p-8 text-center">
            <p className="text-gray-600">Nenhum sistema cadastrado para este setor.</p>
          </div>
        )}

        {/* Modal do formulário de sistema */}
        {showSystemForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {systemForm.id ? 'Editar Sistema' : 'Adicionar Sistema'}
              </h3>
              
              <form onSubmit={handleSystemSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={systemForm.name}
                    onChange={(e) => setSystemForm({ ...systemForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={systemForm.description}
                    onChange={(e) => setSystemForm({ ...systemForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={systemForm.url}
                    onChange={(e) => setSystemForm({ ...systemForm, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ícone
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {availableIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSystemForm({ ...systemForm, icon })}
                        className={`p-2 border rounded-md ${
                          systemForm.icon === icon 
                            ? 'border-primary bg-primary bg-opacity-10' 
                            : 'border-gray-300'
                        }`}
                      >
                        <OptimizedImage src={icon} alt="Ícone" width={24} height={24} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSystemForm(false);
                      setSystemForm({ id: '', name: '', description: '', url: '', icon: '/icons/default-app.svg' });
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                  >
                    {systemForm.id ? 'Atualizar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 