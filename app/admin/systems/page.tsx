'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Breadcrumb from '@/app/components/Breadcrumb';
import { FormSelect } from '@/app/components/forms/FormSelect';
import { Icon } from '@/app/components/icons/Icon';
import OptimizedImage from '@/app/components/OptimizedImage';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';
import { StandardizedInput, StandardizedTextarea } from '@/app/components/ui/StandardizedInput';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { supabase } from '@/lib/supabase';

interface System {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  sector_id: string | null;
  created_at: string;
  sector?: {
    name: string;
  };
}

export default function SystemsManagement() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [systems, setSystems] = useState<System[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newSystem, setNewSystem] = useState({ 
    name: '',
    description: '',
    url: '',
    icon: '',
    sector_id: '' 
  });
  const [editingSystem, setEditingSystem] = useState<System | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [systemToDelete, setSystemToDelete] = useState<System | null>(null);
  const [sectorFilter, setSectorFilter] = useState('all');

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
        fetchSystems();
        fetchSectors();
      } else {
        // Verificar se é admin de setor
        const { data: sectorAdmin } = await supabase
          .from('sector_admins')
          .select('sector_id')
          .eq('user_id', userData.user.id);
        
        if (sectorAdmin && sectorAdmin.length > 0) {
          setIsAdmin(false); // Não é admin geral, mas é admin de setor
          setSectorFilter(sectorAdmin[0].sector_id);
          fetchSystems(sectorAdmin[0].sector_id);
          fetchSectors();
        } else {
              // Redirecionar usuários regulares para o home
    router.replace('/home');
        }
      }
    };

    checkUser();
  }, [router]);

  const fetchSystems = async (sectorId?: string) => {
    setLoading(true);
    
    let query = supabase
      .from('systems')
      .select('*, sector:sectors(name)')
      .order('name', { ascending: true });
    
    if (sectorId) {
      query = query.eq('sector_id', sectorId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar sistemas:', error);
    } else {
      setSystems(data || []);
    }
    
    setLoading(false);
  };

  const fetchSectors = async () => {
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar setores:', error);
    } else {
      setSectors(data || []);
    }
  };

  const handleAddSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSystem.name || !newSystem.url) return;
    
    try {
      await supabase
        .from('systems')
        .insert([
          { 
            name: newSystem.name,
            description: newSystem.description,
            url: newSystem.url,
            icon: newSystem.icon,
            sector_id: newSystem.sector_id || null
          }
        ]);
      
      setNewSystem({ 
        name: '',
        description: '',
        url: '',
        icon: '',
        sector_id: '' 
      });
      setIsAddModalOpen(false);
      fetchSystems();
    } catch (error) {
      console.error('Erro ao adicionar sistema:', error);
    }
  };

  const handleEditSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSystem || !editingSystem.name || !editingSystem.url) return;
    
    try {
      await supabase
        .from('systems')
        .update({ 
          name: editingSystem.name,
          description: editingSystem.description,
          url: editingSystem.url,
          icon: editingSystem.icon,
          sector_id: editingSystem.sector_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingSystem.id);
      
      setIsEditModalOpen(false);
      fetchSystems();
    } catch (error) {
      console.error('Erro ao editar sistema:', error);
    }
  };

  const openDeleteModal = (system: System) => {
    setSystemToDelete(system);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!systemToDelete) return;

    try {
      // Remover relações de usuários com este sistema
      await supabase
        .from('user_systems')
        .delete()
        .eq('system_id', systemToDelete.id);
      
      // Depois remover o sistema
      await supabase
        .from('systems')
        .delete()
        .eq('id', systemToDelete.id);
      
      fetchSystems();
    } catch (error) {
      console.error('Erro ao excluir sistema:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setSystemToDelete(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  // Filtrar sistemas por setor se um filtro estiver selecionado
  const filteredSystems = sectorFilter === 'all' 
    ? systems 
    : systems.filter(system => system.sector_id === sectorFilter);

  if (loading && systems.length === 0) {
    return <UnifiedLoadingSpinner size="large" message={LOADING_MESSAGES.systems} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
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
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb 
              items={[
                { label: 'Home', href: '/home', icon: 'house' },
                { label: 'Administração', href: '/admin' },
                { label: 'Sistemas' }
              ]} 
            />
          </div>
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Gerenciamento de Sistemas</h2>
              <p className="text-gray-600">Gerencie os sistemas e aplicações disponíveis no portal.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {isAdmin && (
                <FormSelect
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Todos os setores' },
                    ...sectors.map(sector => ({
                      value: sector.id,
                      label: sector.name
                    }))
                  ]}
                  placeholder="Todos os setores"
                />
              )}
              
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary"
              >
                Adicionar Sistema
              </button>
            </div>
          </div>
          
          {filteredSystems.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600">Nenhum sistema cadastrado. Adicione o primeiro sistema clicando no botão acima.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSystems.map((system) => (
                <div key={system.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="relative h-10 w-10 mr-3">
                        <OptimizedImage 
                          src={system.icon || '/icons/default-app.svg'} 
                          alt={system.name}
                          width={40}
                          height={40}
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">{system.name}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setEditingSystem(system);
                          setIsEditModalOpen(true);
                        }}
                        className="text-gray-500 hover:text-primary"
                      >
                        <Icon name="pencil" className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(system)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <Icon name="trash" className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{system.description || 'Sem descrição'}</p>
                  
                  <div className="text-sm text-gray-500 mb-3">
                    <div>
                      <span className="font-medium">URL:</span> 
                      <a href={system.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline">
                        {system.url}
                      </a>
                    </div>
                    <div>
                      <span className="font-medium">Setor:</span> 
                      <span className="ml-1">{system.sector?.name || 'Nenhum'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link 
                      href={`/admin/systems/${system.id}/users`}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      Gerenciar usuários →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Modal Adicionar Sistema */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg border border-gray-300 max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Adicionar Novo Sistema</h3>
              
              <form onSubmit={handleAddSystem}>
                <div className="mb-4">
                  <label htmlFor="name" className="form-label">Nome do Sistema</label>
                  <StandardizedInput
                    id="name"
                    type="text"
                    value={newSystem.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSystem({...newSystem, name: e.target.value})}
                    required
                    startIcon="layers"
                    variant="outline"
                    size="md"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="description" className="form-label">Descrição</label>
                  <StandardizedTextarea
                    id="description"
                    value={newSystem.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewSystem({...newSystem, description: e.target.value})}
                    rows={2}
                    variant="outline"
                    size="md"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="url" className="form-label">URL</label>
                  <StandardizedInput
                    id="url"
                    type="url"
                    value={newSystem.url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSystem({...newSystem, url: e.target.value})}
                    placeholder="https://"
                    required
                    startIcon="link"
                    variant="outline"
                    size="md"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="icon" className="form-label">Ícone (caminho)</label>
                  <StandardizedInput
                    id="icon"
                    type="text"
                    value={newSystem.icon}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSystem({...newSystem, icon: e.target.value})}
                    placeholder="/icons/nome-do-icone.svg"
                    startIcon="image"
                    variant="outline"
                    size="md"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="sector" className="form-label">Setor</label>
                  <FormSelect
                    value={newSystem.sector_id}
                    onChange={(e) => setNewSystem({...newSystem, sector_id: e.target.value})}
                    options={[
                      { value: '', label: 'Nenhum' },
                      ...sectors.map(sector => ({
                        value: sector.id,
                        label: sector.name
                      }))
                    ]}
                    placeholder="Nenhum"
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

        {/* Modal Editar Sistema */}
        {isEditModalOpen && editingSystem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg border border-gray-300 max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Editar Sistema</h3>
              
              <form onSubmit={handleEditSystem}>
                <div className="mb-4">
                  <label htmlFor="edit-name" className="form-label">Nome do Sistema</label>
                  <StandardizedInput
                    id="edit-name"
                    type="text"
                    value={editingSystem.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingSystem({...editingSystem, name: e.target.value})}
                    required
                    startIcon="layers"
                    variant="outline"
                    size="md"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="edit-description" className="form-label">Descrição</label>
                  <StandardizedTextarea
                    id="edit-description"
                    value={editingSystem.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingSystem({...editingSystem, description: e.target.value})}
                    rows={2}
                    variant="outline"
                    size="md"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="edit-url" className="form-label">URL</label>
                  <StandardizedInput
                    id="edit-url"
                    type="url"
                    value={editingSystem.url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingSystem({...editingSystem, url: e.target.value})}
                    placeholder="https://"
                    required
                    startIcon="link"
                    variant="outline"
                    size="md"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="edit-icon" className="form-label">Ícone (caminho)</label>
                  <StandardizedInput
                    id="edit-icon"
                    type="text"
                    value={editingSystem.icon}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingSystem({...editingSystem, icon: e.target.value})}
                    placeholder="/icons/nome-do-icone.svg"
                    startIcon="image"
                    variant="outline"
                    size="md"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="edit-sector" className="form-label">Setor</label>
                  <FormSelect
                    value={editingSystem.sector_id || ''}
                    onChange={(e) => setEditingSystem({...editingSystem, sector_id: e.target.value || null})}
                    options={[
                      { value: '', label: 'Nenhum' },
                      ...sectors.map(sector => ({
                        value: sector.id,
                        label: sector.name
                      }))
                    ]}
                    placeholder="Nenhum"
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
      {systemToDelete && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Confirmar Exclusão de Sistema"
          message={`Tem certeza que deseja excluir o sistema "<strong>${systemToDelete.name}</strong>"? Todos os acessos de usuários a este sistema serão removidos. Esta ação não pode ser desfeita.`}
          isLoading={loading}
          confirmButtonText="Excluir"
          cancelButtonText="Cancelar"
        />
      )}
    </>
  );
} 