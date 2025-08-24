'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

import OptimizedImage from '@/app/components/OptimizedImage';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';
import { StandardizedInput, StandardizedTextarea } from '@/app/components/ui/StandardizedInput';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { supabase } from '@/lib/supabase';

import type { User } from '@supabase/supabase-js';

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

interface Sector {
  id: string;
  name: string;
  description: string;
}

export default function SectorSystemsManagement() {
  const router = useRouter();
  const params = useParams();
  const sectorId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [systems, setSystems] = useState<System[]>([]);
  const [sector, setSector] = useState<Sector | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSectorAdmin, setIsSectorAdmin] = useState(false);
  
  const [newSystem, setNewSystem] = useState({ 
    name: '',
    description: '',
    url: '',
    icon: '/icons/default-app.svg',
    sector_id: sectorId 
  });
  
  const [editingSystem, setEditingSystem] = useState<System | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [systemToDelete, setSystemToDelete] = useState<System | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSector = useCallback(async () => {
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .eq('id', sectorId)
      .single();
    
    if (error) {

    } else {
      setSector(data);
    }
  }, [sectorId]);

  const fetchSystems = useCallback(async () => {
    const { data, error } = await supabase
      .from('systems')
      .select(`
        *,
        sector:sectors(name)
      `)
      .eq('sector_id', sectorId)
      .order('name', { ascending: true });
    
    if (error) {

    } else {
      // O Supabase retorna 'sector' como um array, precisamos transformar para objeto
      const formattedData = (data || []).map(system => ({
        ...system,
        sector: system.sector && Array.isArray(system.sector) && system.sector.length > 0
          ? { name: String(system.sector[0].name || '') }
          : { name: '' }
      }));
      
      setSystems(formattedData);
    }
  }, [sectorId]);

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
        fetchSector();
        fetchSystems();
      } else {
        // Verificar se é admin deste setor específico
        const { data: sectorAdmin } = await supabase
          .from('sector_admins')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('sector_id', sectorId);
        
        if (sectorAdmin && sectorAdmin.length > 0) {
          setIsSectorAdmin(true);
          fetchSector();
          fetchSystems();
        } else {
          // Redirecionar usuários não autorizados para o dashboard
          router.replace('/dashboard');
          return;
        }
      }
      
      setLoading(false);
    };

    checkUser();
  }, [router, sectorId, fetchSector, fetchSystems]);

  const handleAddSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSystem.name) return;
    
    try {
      await supabase
        .from('systems')
        .insert([newSystem]);
      
      setNewSystem({ 
        name: '',
        description: '',
        url: '',
        icon: '/icons/default-app.svg',
        sector_id: sectorId 
      });
      setIsAddModalOpen(false);
      fetchSystems();
    } catch (error) {

    }
  };

  const handleEditSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSystem || !editingSystem.name) return;
    
    try {
      await supabase
        .from('systems')
        .update({ 
          name: editingSystem.name,
          description: editingSystem.description,
          url: editingSystem.url,
          icon: editingSystem.icon,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingSystem.id);
      
      setIsEditModalOpen(false);
      fetchSystems();
    } catch (error) {

    }
  };

  const handleDeleteClick = (system: System) => {
    setSystemToDelete(system);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!systemToDelete) return;
    
    setIsDeleting(true);
    
    try {
      await supabase
        .from('systems')
        .delete()
        .eq('id', systemToDelete.id);
      
      fetchSystems();
      setShowDeleteModal(false);
      setSystemToDelete(null);
    } catch (error) {

    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSystemToDelete(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <UnifiedLoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isSectorAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Você não tem autorização para acessar esta página.</p>
          <Link href="/dashboard" className="mt-4 text-primary hover:underline block">
            Voltar para o Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
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
            <Link href="/admin/sectors" className="text-sm text-gray-600 mr-4 hover:text-primary">
              Setores
            </Link>
            <Link href={`/admin/sectors/${sectorId}`} className="text-sm text-gray-600 mr-4 hover:text-primary">
              Conteúdo do Setor
            </Link>
            <Link href="/dashboard" className="text-sm text-gray-600 mr-4 hover:text-primary">
              Dashboard
            </Link>
            <span className="text-sm text-gray-600 mr-4">
              Olá, {user?.user_metadata?.full_name || user?.email}
            </span>
            <button 
              type="button"
              onClick={handleLogout}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sistemas do Setor: {sector?.name}</h2>
            <p className="text-gray-600">{sector?.description}</p>
          </div>
          
          <button 
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
          >
            Adicionar Sistema
          </button>
        </div>
        
        {systems.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Nenhum sistema cadastrado para este setor. Adicione o primeiro sistema clicando no botão acima.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systems.map((system) => (
              <div key={system.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 mr-3 relative">
                      <OptimizedImage 
                        src={system.icon || '/icons/default-app.svg'} 
                        alt={system.name} 
                        fill
                        className="rounded-md object-contain"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{system.name}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingSystem(system);
                        setIsEditModalOpen(true);
                      }}
                      className="text-gray-500 hover:text-primary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <title>Editar</title>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDeleteClick(system)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <title>Excluir</title>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{system.description || 'Sem descrição'}</p>
                
                <div className="pt-4 border-t border-gray-200">
                  <a 
                    href={system.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-dark text-sm font-medium"
                  >
                    Acessar sistema →
                  </a>
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
                  rows={3}
                  variant="outline"
                  size="md"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="url" className="form-label">URL do Sistema</label>
                <StandardizedInput
                  id="url"
                  type="text"
                  value={newSystem.url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSystem({...newSystem, url: e.target.value})}
                  placeholder="https://exemplo.com"
                  startIcon="link"
                  variant="outline"
                  size="md"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="icon-select" className="form-label">Ícone</label>
                <div className="grid grid-cols-5 gap-2 mt-2" id="icon-select">
                  {[
                    '/icons/default-app.svg',
                    '/icons/finance-app.svg',
                    '/icons/mail-app.svg',
                    '/icons/chat-app.svg',
                    '/icons/calendar-app.svg'
                  ].map((icon) => (
                    <button 
                      key={icon}
                      type="button"
                      onClick={() => setNewSystem({...newSystem, icon})}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setNewSystem({...newSystem, icon});
                        }
                      }}
                      className={`
                        w-12 h-12 rounded border cursor-pointer flex items-center justify-center
                        ${newSystem.icon === icon ? 'border-primary bg-primary/10' : 'border-gray-300'}
                      `}
                    >
                      <div className="relative w-8 h-8">
                        <OptimizedImage src={icon} alt="Ícone" fill className="object-contain" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-sm-md text-gray-700 hover:bg-gray-50"
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
                  value={editingSystem.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingSystem({...editingSystem, description: e.target.value})}
                  rows={3}
                  variant="outline"
                  size="md"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-url" className="form-label">URL do Sistema</label>
                <StandardizedInput
                  id="edit-url"
                  type="text"
                  value={editingSystem.url || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingSystem({...editingSystem, url: e.target.value})}
                  placeholder="https://exemplo.com"
                  startIcon="link"
                  variant="outline"
                  size="md"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="edit-icon-select" className="form-label">Ícone</label>
                <div className="grid grid-cols-5 gap-2 mt-2" id="edit-icon-select">
                  {[
                    '/icons/default-app.svg',
                    '/icons/finance-app.svg',
                    '/icons/mail-app.svg',
                    '/icons/chat-app.svg',
                    '/icons/calendar-app.svg'
                  ].map((icon) => (
                    <button 
                      key={icon}
                      type="button"
                      onClick={() => setEditingSystem({...editingSystem, icon})}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setEditingSystem({...editingSystem, icon});
                        }
                      }}
                      className={`
                        w-12 h-12 rounded border cursor-pointer flex items-center justify-center
                        ${editingSystem.icon === icon ? 'border-primary bg-primary/10' : 'border-gray-300'}
                      `}
                    >
                      <div className="relative w-8 h-8">
                        <OptimizedImage src={icon} alt="Ícone" fill className="object-contain" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-sm-md text-gray-700 hover:bg-gray-50"
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
      
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o sistema <strong>"${systemToDelete?.name}"</strong>?<br><br>Esta ação não pode ser desfeita e removerá o sistema permanentemente do setor.`}
        isLoading={isDeleting}
        confirmButtonText="Excluir Sistema"
        cancelButtonText="Cancelar"
      />
    </div>
  );
} 