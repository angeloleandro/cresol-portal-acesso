'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Sector {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface SectorAdmin {
  id: string;
  user_id: string;
  sector_id: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function SectorsManagement() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sectorAdmins, setSectorAdmins] = useState<SectorAdmin[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newSector, setNewSector] = useState({ name: '', description: '' });
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        router.replace('/login');
        return;
      }

      setUser(userData.user);

      // Verificar se o usuário é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (profile?.role === 'admin') {
        setIsAdmin(true);
        fetchSectors();
        fetchSectorAdmins();
      } else {
        // Redirecionar usuários não-admin para o dashboard
        router.replace('/dashboard');
      }
    };

    checkUser();
  }, [router]);

  const fetchSectors = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar setores:', error);
    } else {
      setSectors(data || []);
    }
    
    setLoading(false);
  };

  const fetchSectorAdmins = async () => {
    const { data, error } = await supabase
      .from('sector_admins')
      .select(`
        id,
        user_id,
        sector_id,
        profiles:profiles(full_name, email)
      `);
    
    if (error) {
      console.error('Erro ao buscar administradores de setor:', error);
    } else {
      // O Supabase retorna 'profiles' como um array mesmo para relações one-to-one/many-to-one via select aninhado.
      // Precisamos transformar os dados para que 'profiles' seja um objeto, como esperado pelo tipo SectorAdmin.
      const formattedData = (data || []).map(admin => ({
        ...admin,
        // Pega o primeiro perfil do array (se existir) ou usa um objeto padrão.
        // Garante que full_name e email sejam strings.
        profiles: admin.profiles && Array.isArray(admin.profiles) && admin.profiles.length > 0
          ? {
              full_name: String(admin.profiles[0].full_name || ''),
              email: String(admin.profiles[0].email || '')
            }
          : { full_name: '', email: '' } // Objeto padrão se profiles for nulo, não for array ou estiver vazio
      }));
      // O tipo explícito aqui pode ajudar o TypeScript, mas a transformação acima é a chave.
      setSectorAdmins(formattedData as SectorAdmin[]);
    }
  };

  const handleAddSector = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSector.name) return;
    
    try {
      // Adicionar o setor ao banco de dados
      const { data, error } = await supabase
        .from('sectors')
        .insert([
          { 
            name: newSector.name,
            description: newSector.description
          }
        ])
        .select(); // Retorna os dados inseridos
      
      if (error) throw error;
      
      // Configurar as políticas de acesso para este setor 
      // (todos os usuários poderão visualizar o setor na interface pública)
      // Essas políticas já devem estar configuradas no Supabase a nível de tabela
      
      setNewSector({ name: '', description: '' });
      setIsAddModalOpen(false);
      fetchSectors();
      
      // Exibir mensagem de sucesso
      alert(`Setor "${newSector.name}" adicionado com sucesso! Agora está disponível na interface pública.`);
    } catch (error) {
      console.error('Erro ao adicionar setor:', error);
      alert('Ocorreu um erro ao adicionar o setor.');
    }
  };

  const handleEditSector = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSector || !editingSector.name) return;
    
    try {
      await supabase
        .from('sectors')
        .update({ 
          name: editingSector.name,
          description: editingSector.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingSector.id);
      
      setIsEditModalOpen(false);
      fetchSectors();
    } catch (error) {
      console.error('Erro ao editar setor:', error);
    }
  };

  const handleDeleteSector = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este setor? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      // Primeiro remover relações com administradores de setor
      await supabase
        .from('sector_admins')
        .delete()
        .eq('sector_id', id);
      
      // Depois remover o setor
      await supabase
        .from('sectors')
        .delete()
        .eq('id', id);
      
      fetchSectors();
      fetchSectorAdmins();
    } catch (error) {
      console.error('Erro ao excluir setor:', error);
    }
  };

  const removeSectorAdmin = async (sectorAdminId: string) => {
    try {
      await supabase
        .from('sector_admins')
        .delete()
        .eq('id', sectorAdminId);
      
      fetchSectorAdmins();
    } catch (error) {
      console.error('Erro ao remover administrador de setor:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading && sectors.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
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
            <h1 className="text-xl font-semibold text-gray-800">Painel Administrativo</h1>
          </div>
          
          <div className="flex items-center">
            <Link href="/admin" className="text-sm text-gray-600 mr-4 hover:text-primary">
              Painel Admin
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Gerenciamento de Setores</h2>
            <p className="text-gray-600">Gerencie os setores da Cresol e seus administradores.</p>
          </div>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
          >
            Adicionar Setor
          </button>
        </div>
        
        {sectors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Nenhum setor cadastrado. Adicione o primeiro setor clicando no botão acima.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sector) => {
              // Filtrar administradores deste setor
              const admins = sectorAdmins.filter(admin => admin.sector_id === sector.id);
              
              return (
                <div key={sector.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{sector.name}</h3>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setEditingSector(sector);
                          setIsEditModalOpen(true);
                        }}
                        className="text-gray-500 hover:text-primary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteSector(sector.id)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{sector.description || 'Sem descrição'}</p>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Administradores do Setor:</h4>
                    {admins.length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhum administrador atribuído</p>
                    ) : (
                      <ul className="space-y-2">
                        {admins.map((admin) => (
                          <li key={admin.id} className="flex justify-between items-center text-sm">
                            <span>{admin.profiles.full_name || admin.profiles.email}</span>
                            <button
                              onClick={() => removeSectorAdmin(admin.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remover
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link 
                      href={`/admin/sectors/${sector.id}`}
                      className="text-primary hover:text-primary-dark text-sm font-medium inline-block mr-4"
                    >
                      Gerenciar conteúdo do setor →
                    </Link>
                    <Link 
                      href={`/admin/sectors/${sector.id}/systems`}
                      className="text-primary hover:text-primary-dark text-sm font-medium inline-block"
                    >
                      Gerenciar sistemas →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Adicionar Setor */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Adicionar Novo Setor</h3>
            
            <form onSubmit={handleAddSector}>
              <div className="mb-4">
                <label htmlFor="name" className="form-label">Nome do Setor</label>
                <input
                  id="name"
                  type="text"
                  value={newSector.name}
                  onChange={(e) => setNewSector({...newSector, name: e.target.value})}
                  className="input"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="form-label">Descrição</label>
                <textarea
                  id="description"
                  value={newSector.description}
                  onChange={(e) => setNewSector({...newSector, description: e.target.value})}
                  className="input"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Setor */}
      {isEditModalOpen && editingSector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Editar Setor</h3>
            
            <form onSubmit={handleEditSector}>
              <div className="mb-4">
                <label htmlFor="edit-name" className="form-label">Nome do Setor</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editingSector.name}
                  onChange={(e) => setEditingSector({...editingSector, name: e.target.value})}
                  className="input"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="edit-description" className="form-label">Descrição</label>
                <textarea
                  id="edit-description"
                  value={editingSector.description}
                  onChange={(e) => setEditingSector({...editingSector, description: e.target.value})}
                  className="input"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 