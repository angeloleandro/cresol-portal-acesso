'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import SectorCard from '@/app/components/admin/SectorCard';
import SubsectorCard from '@/app/components/admin/SubsectorCard';
import { Icon } from '../../components/icons';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';
import { AdminSpinner } from '@/app/components/ui/StandardizedSpinner';

interface Sector {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Subsector {
  id: string;
  name: string;
  description: string;
  sector_id: string;
  sector_name?: string;
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
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [sectorAdmins, setSectorAdmins] = useState<SectorAdmin[]>([]);
  const [activeTab, setActiveTab] = useState<'sectors' | 'subsectors'>('sectors');
  
  // Estados para formulários
  const [sectorForm, setSectorForm] = useState({ name: '', description: '' });
  const [subsectorForm, setSubsectorForm] = useState({ name: '', description: '', sector_id: '' });
  
  // Estados para modals
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [showSubsectorModal, setShowSubsectorModal] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [editingSubsector, setEditingSubsector] = useState<Subsector | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'sector' | 'subsector', data: Sector | Subsector } | null>(null);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.replace('/home');
        return;
      }

      setUser(userData.user);
      await Promise.all([
        fetchSectors(),
        fetchSubsectors(),
        fetchSectorAdmins()
      ]);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const fetchSectors = async () => {
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar setores:', error);
    } else {
      setSectors(data || []);
    }
  };

  const fetchSubsectors = async () => {
    const { data, error } = await supabase
      .from('subsectors')
      .select(`
        *,
        sectors(name)
      `)
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar sub-setores:', error);
    } else {
      const formattedData = (data || []).map(subsector => ({
        ...subsector,
        sector_name: subsector.sectors?.name || 'Setor não encontrado'
      }));
      setSubsectors(formattedData);
    }
  };

  const fetchSectorAdmins = async () => {
    const { data, error } = await supabase
      .from('sector_admins')
      .select(`
        id,
        user_id,
        sector_id,
        profiles(full_name, email)
      `);
    
    if (error) {
      console.error('Erro ao buscar administradores de setor:', error);
    } else {
      const formattedData = (data || []).map(admin => ({
        ...admin,
        profiles: admin.profiles && Array.isArray(admin.profiles) && admin.profiles.length > 0
          ? {
              full_name: String(admin.profiles[0].full_name || ''),
              email: String(admin.profiles[0].email || '')
            }
          : { full_name: '', email: '' }
      }));
      setSectorAdmins(formattedData as SectorAdmin[]);
    }
  };

  const handleSectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sectorForm.name.trim()) {
      alert('Nome do setor é obrigatório');
      return;
    }
    
    try {
      if (editingSector) {
        // Editar setor
        const { error } = await supabase
          .from('sectors')
          .update({
            name: sectorForm.name.trim(),
            description: sectorForm.description.trim()
          })
          .eq('id', editingSector.id);
        
        if (error) throw error;
        alert('Setor atualizado com sucesso!');
      } else {
        // Criar setor
        const { error } = await supabase
          .from('sectors')
          .insert([{
            name: sectorForm.name.trim(),
            description: sectorForm.description.trim()
          }]);
        
        if (error) throw error;
        alert('Setor criado com sucesso!');
      }
      
      resetSectorForm();
      fetchSectors();
    } catch (error) {
      console.error('Erro ao salvar setor:', error);
      alert('Erro ao salvar setor. Tente novamente.');
    }
  };

  const handleSubsectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subsectorForm.name.trim() || !subsectorForm.sector_id) {
      alert('Nome do sub-setor e setor são obrigatórios');
      return;
    }
    
    try {
      if (editingSubsector) {
        // Editar sub-setor
        const { error } = await supabase
          .from('subsectors')
          .update({
            name: subsectorForm.name.trim(),
            description: subsectorForm.description.trim(),
            sector_id: subsectorForm.sector_id
          })
          .eq('id', editingSubsector.id);
        
        if (error) throw error;
        alert('Sub-setor atualizado com sucesso!');
      } else {
        // Criar sub-setor
        const { error } = await supabase
          .from('subsectors')
          .insert([{
            name: subsectorForm.name.trim(),
            description: subsectorForm.description.trim(),
            sector_id: subsectorForm.sector_id
          }]);
        
        if (error) throw error;
        alert('Sub-setor criado com sucesso!');
      }
      
      resetSubsectorForm();
      fetchSubsectors();
    } catch (error) {
      console.error('Erro ao salvar sub-setor:', error);
      alert('Erro ao salvar sub-setor. Tente novamente.');
    }
  };

  const openDeleteModal = (item: Sector | Subsector, type: 'sector' | 'subsector') => {
    const relatedSubsectors = type === 'sector' ? subsectors.filter(s => s.sector_id === item.id) : [];

    if (type === 'sector' && relatedSubsectors.length > 0) {
      setModalContent({
        title: 'Exclusão não permitida',
        message: `Não é possível excluir o setor "<strong>${item.name}</strong>". Há <strong>${relatedSubsectors.length}</strong> sub-setor(es) vinculado(s) a ele.`
      });
    } else {
      setModalContent({
        title: `Confirmar Exclusão de ${type === 'sector' ? 'Setor' : 'Sub-setor'}`,
        message: `Tem certeza que deseja excluir o ${type === 'sector' ? 'setor' : 'sub-setor'} "<strong>${item.name}</strong>"? Esta ação não pode ser desfeita.`
      });
    }

    setItemToDelete({ type, data: item });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const { type, data } = itemToDelete;

    try {
      if (type === 'sector') {
        await supabase.from('sector_admins').delete().eq('sector_id', data.id);
        await supabase.from('sectors').delete().eq('id', data.id);
        alert('Setor excluído com sucesso!');
        fetchSectors();
        fetchSectorAdmins();
      } else {
        await supabase.from('subsector_admins').delete().eq('subsector_id', data.id);
        await supabase.from('subsectors').delete().eq('id', data.id);
        alert('Sub-setor excluído com sucesso!');
        fetchSubsectors();
      }
    } catch (error) {
      console.error(`Erro ao excluir ${type}:`, error);
      alert(`Erro ao excluir ${type}. Tente novamente.`);
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const resetSectorForm = () => {
    setSectorForm({ name: '', description: '' });
    setEditingSector(null);
    setShowSectorModal(false);
  };

  const resetSubsectorForm = () => {
    setSubsectorForm({ name: '', description: '', sector_id: '' });
    setEditingSubsector(null);
    setShowSubsectorModal(false);
  };

  const openEditSector = (sector: Sector) => {
    setSectorForm({ name: sector.name, description: sector.description });
    setEditingSector(sector);
    setShowSectorModal(true);
  };

  const openEditSubsector = (subsector: Subsector) => {
    setSubsectorForm({ 
      name: subsector.name, 
      description: subsector.description, 
      sector_id: subsector.sector_id 
    });
    setEditingSubsector(subsector);
    setShowSubsectorModal(true);
  };

  if (loading) {
    return <AdminSpinner fullScreen message="Carregando..." size="lg" />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader user={user} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb 
              items={[
                { label: 'Home', href: '/home', icon: 'house' },
                { label: 'Administração', href: '/admin' },
                { label: 'Setores' }
              ]} 
            />
          </div>

          {/* Header */}
          <div className="mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-1">
                    Gerenciamento de Setores
                  </h1>
                  <p className="text-sm text-gray-600">
                    Gerencie os setores da Cresol e seus sub-setores
                  </p>
                </div>
                
                <div className="flex gap-3 mt-3 md:mt-0">
                  <button
                    onClick={() => setShowSectorModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                  >
                    <Icon name="plus" className="h-4 w-4" />
                    Novo Setor
                  </button>
                  <button
                    onClick={() => setShowSubsectorModal(true)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Icon name="folder-plus" className="h-4 w-4" />
                    Novo Sub-setor
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('sectors')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'sectors'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon name="building-1" className="inline mr-2 h-4 w-4" />
                  Setores ({sectors.length})
                </button>
                <button
                  onClick={() => setActiveTab('subsectors')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'subsectors'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon name="folder" className="inline mr-2 h-4 w-4" />
                  Sub-setores ({subsectors.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'sectors' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sectors.map(sector => {
                const sectorSubsectors = subsectors.filter(s => s.sector_id === sector.id);
                const admins = sectorAdmins.filter(admin => admin.sector_id === sector.id);
                
                return (
                  <SectorCard
                    key={sector.id}
                    sector={sector}
                    subsectorsCount={sectorSubsectors.length}
                    adminsCount={admins.length}
                    subsectors={sectorSubsectors}
                    onEdit={() => openEditSector(sector)}
                    onDelete={() => openDeleteModal(sector, 'sector')}
                  />
                );
              })}
            </div>
          )}

          {activeTab === 'subsectors' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {subsectors.map(subsector => (
                <SubsectorCard
                  key={subsector.id}
                  subsector={subsector}
                  onEdit={() => openEditSubsector(subsector)}
                  onDelete={() => openDeleteModal(subsector, 'subsector')}
                />
              ))}
            </div>
          )}

          {/* Empty States */}
          {activeTab === 'sectors' && sectors.length === 0 && (
            <div className="text-center py-12">
              <Icon name="building-1" className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum setor cadastrado</h3>
              <p className="mt-2 text-gray-500">Comece criando o primeiro setor da organização.</p>
              <button
                onClick={() => setShowSectorModal(true)}
                className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Criar Primeiro Setor
              </button>
            </div>
          )}

          {activeTab === 'subsectors' && subsectors.length === 0 && (
            <div className="text-center py-12">
              <Icon name="folder" className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum sub-setor cadastrado</h3>
              <p className="mt-2 text-gray-500">
                {sectors.length === 0 
                  ? 'Primeiro crie um setor, depois adicione sub-setores a ele.'
                  : 'Comece criando o primeiro sub-setor.'}
              </p>
              {sectors.length > 0 && (
                <button
                  onClick={() => setShowSubsectorModal(true)}
                  className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Criar Primeiro Sub-setor
                </button>
              )}
            </div>
          )}
        </main>

        {/* Modal Setor */}
        {showSectorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingSector ? 'Editar Setor' : 'Novo Setor'}
                </h3>
                
                <form onSubmit={handleSectorSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Setor *
                    </label>
                    <input
                      type="text"
                      value={sectorForm.name}
                      onChange={(e) => setSectorForm({ ...sectorForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Ex: Tecnologia da Informação"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={sectorForm.description}
                      onChange={(e) => setSectorForm({ ...sectorForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Descrição opcional do setor..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetSectorForm}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-lg transition-colors"
                    >
                      {editingSector ? 'Atualizar' : 'Criar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Sub-setor */}
        {showSubsectorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingSubsector ? 'Editar Sub-setor' : 'Novo Sub-setor'}
                </h3>
                
                <form onSubmit={handleSubsectorSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Setor *
                    </label>
                    <select
                      value={subsectorForm.sector_id}
                      onChange={(e) => setSubsectorForm({ ...subsectorForm, sector_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    >
                      <option value="">Selecione um setor</option>
                      {sectors.map(sector => (
                        <option key={sector.id} value={sector.id}>
                          {sector.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Sub-setor *
                    </label>
                    <input
                      type="text"
                      value={subsectorForm.name}
                      onChange={(e) => setSubsectorForm({ ...subsectorForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Ex: Desenvolvimento de Software"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={subsectorForm.description}
                      onChange={(e) => setSubsectorForm({ ...subsectorForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Descrição opcional do sub-setor..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetSubsectorForm}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {editingSubsector ? 'Atualizar' : 'Criar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      {itemToDelete && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title={modalContent.title}
          message={modalContent.message}
          isLoading={loading}
          confirmButtonText="Excluir"
          cancelButtonText="Cancelar"
        />
      )}
    </>
  );
} 