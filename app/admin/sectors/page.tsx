'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import { Icon } from '../../components/icons';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';

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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-cresol-gray">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-cresol-gray-light/30">
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
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-primary flex items-center">
                  <Icon name="building-2" className="mr-3 h-8 w-8" />
                  Gerenciamento de Setores
                </h2>
                <p className="text-cresol-gray mt-2">
                  Gerencie os setores da Cresol e seus sub-setores
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSectorModal(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                  <Icon name="plus" className="h-4 w-4" />
                  Novo Setor
                </button>
                <button
                  onClick={() => setShowSubsectorModal(true)}
                  className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark transition-colors flex items-center gap-2"
                >
                  <Icon name="folder-plus" className="h-4 w-4" />
                  Novo Sub-setor
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-cresol-gray-light">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('sectors')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'sectors'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-cresol-gray hover:text-cresol-gray-dark hover:border-cresol-gray'
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
                      : 'border-transparent text-cresol-gray hover:text-cresol-gray-dark hover:border-cresol-gray'
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
                  <div key={sector.id} className="bg-white rounded-xl shadow-sm border border-cresol-gray-light hover:shadow-md transition-all">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-cresol-gray-dark mb-1">
                            {sector.name}
                          </h3>
                          {sector.description && (
                            <p className="text-sm text-cresol-gray line-clamp-2">
                              {sector.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Link
                            href={`/admin/sectors/${sector.id}`}
                            className="p-2 text-cresol-gray hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                            title="Gerenciar conteúdo do setor"
                          >
                            <Icon name="settings" className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => openEditSector(sector)}
                            className="p-2 text-cresol-gray hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Editar setor"
                          >
                            <Icon name="pencil" className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(sector, 'sector')}
                            className="p-2 text-cresol-gray hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir setor"
                          >
                            <Icon name="trash" className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-cresol-gray">Sub-setores:</span>
                          <span className="font-medium text-primary">{sectorSubsectors.length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-cresol-gray">Administradores:</span>
                          <span className="font-medium text-secondary">{admins.length}</span>
                        </div>
                        
                        {sectorSubsectors.length > 0 && (
                          <div className="pt-3 border-t border-cresol-gray-light">
                            <p className="text-xs text-cresol-gray mb-2">Sub-setores:</p>
                            <div className="flex flex-wrap gap-1">
                              {sectorSubsectors.slice(0, 3).map(sub => (
                                <span key={sub.id} className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                  {sub.name}
                                </span>
                              ))}
                              {sectorSubsectors.length > 3 && (
                                <span className="inline-block px-2 py-1 bg-cresol-gray-light text-cresol-gray text-xs rounded-full">
                                  +{sectorSubsectors.length - 3} mais
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Ações do Setor */}
                        <div className="pt-3 border-t border-cresol-gray-light">
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/sectors/${sector.id}`}
                              className="flex-1 text-center px-3 py-2 bg-secondary/10 text-secondary text-xs font-medium rounded-lg hover:bg-secondary/20 transition-colors"
                            >
                              Gerenciar Conteúdo
                            </Link>
                            <Link
                              href={`/admin/sectors/${sector.id}/systems`}
                              className="flex-1 text-center px-3 py-2 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors"
                            >
                              Sistemas
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'subsectors' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {subsectors.map(subsector => (
                <div key={subsector.id} className="bg-white rounded-xl shadow-sm border border-cresol-gray-light hover:shadow-md transition-all">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-cresol-gray-dark mb-1">
                          {subsector.name}
                        </h3>
                        <p className="text-sm text-primary font-medium mb-2">
                          {subsector.sector_name}
                        </p>
                        {subsector.description && (
                          <p className="text-sm text-cresol-gray line-clamp-2">
                            {subsector.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Link
                          href={`/admin-subsetor/subsetores/${subsector.id}`}
                          className="p-2 text-cresol-gray hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                          title="Gerenciar sub-setor"
                        >
                          <Icon name="settings" className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => openEditSubsector(subsector)}
                          className="p-2 text-cresol-gray hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Editar sub-setor"
                        >
                          <Icon name="pencil" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(subsector, 'subsector')}
                          className="p-2 text-cresol-gray hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir sub-setor"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="pt-3 border-t border-cresol-gray-light">
                        <p className="text-xs text-cresol-gray mb-2">
                          Criado em {new Date(subsector.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        
                        {/* Ações do Sub-setor */}
                        <div className="flex gap-2 mt-3">
                          <Link
                            href={`/admin-subsetor/subsetores/${subsector.id}`}
                            className="flex-1 text-center px-3 py-2 bg-secondary/10 text-secondary text-xs font-medium rounded-lg hover:bg-secondary/20 transition-colors"
                          >
                            Gerenciar Conteúdo
                          </Link>
                          <Link
                            href={`/subsetores/${subsector.id}/equipe`}
                            className="flex-1 text-center px-3 py-2 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                          >
                            <Icon name="user-group" className="h-3 w-3" />
                            Equipe
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty States */}
          {activeTab === 'sectors' && sectors.length === 0 && (
            <div className="text-center py-12">
              <Icon name="building-1" className="mx-auto h-12 w-12 text-cresol-gray" />
              <h3 className="mt-4 text-lg font-medium text-cresol-gray-dark">Nenhum setor cadastrado</h3>
              <p className="mt-2 text-cresol-gray">Comece criando o primeiro setor da organização.</p>
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
              <Icon name="folder" className="mx-auto h-12 w-12 text-cresol-gray" />
              <h3 className="mt-4 text-lg font-medium text-cresol-gray-dark">Nenhum sub-setor cadastrado</h3>
              <p className="mt-2 text-cresol-gray">
                {sectors.length === 0 
                  ? 'Primeiro crie um setor, depois adicione sub-setores a ele.'
                  : 'Comece criando o primeiro sub-setor.'}
              </p>
              {sectors.length > 0 && (
                <button
                  onClick={() => setShowSubsectorModal(true)}
                  className="mt-4 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark transition-colors"
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
                <h3 className="text-lg font-semibold text-cresol-gray-dark mb-4">
                  {editingSector ? 'Editar Setor' : 'Novo Setor'}
                </h3>
                
                <form onSubmit={handleSectorSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-cresol-gray-dark mb-2">
                      Nome do Setor *
                    </label>
                    <input
                      type="text"
                      value={sectorForm.name}
                      onChange={(e) => setSectorForm({ ...sectorForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-cresol-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Ex: Tecnologia da Informação"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-cresol-gray-dark mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={sectorForm.description}
                      onChange={(e) => setSectorForm({ ...sectorForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-cresol-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Descrição opcional do setor..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetSectorForm}
                      className="flex-1 px-4 py-2 border border-cresol-gray-light text-cresol-gray hover:bg-cresol-gray-light/50 rounded-lg transition-colors"
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
                <h3 className="text-lg font-semibold text-cresol-gray-dark mb-4">
                  {editingSubsector ? 'Editar Sub-setor' : 'Novo Sub-setor'}
                </h3>
                
                <form onSubmit={handleSubsectorSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-cresol-gray-dark mb-2">
                      Setor *
                    </label>
                    <select
                      value={subsectorForm.sector_id}
                      onChange={(e) => setSubsectorForm({ ...subsectorForm, sector_id: e.target.value })}
                      className="w-full px-3 py-2 border border-cresol-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                    <label className="block text-sm font-medium text-cresol-gray-dark mb-2">
                      Nome do Sub-setor *
                    </label>
                    <input
                      type="text"
                      value={subsectorForm.name}
                      onChange={(e) => setSubsectorForm({ ...subsectorForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-cresol-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Ex: Desenvolvimento de Software"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-cresol-gray-dark mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={subsectorForm.description}
                      onChange={(e) => setSubsectorForm({ ...subsectorForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-cresol-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Descrição opcional do sub-setor..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetSubsectorForm}
                      className="flex-1 px-4 py-2 border border-cresol-gray-light text-cresol-gray hover:bg-cresol-gray-light/50 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-secondary text-white hover:bg-secondary-dark rounded-lg transition-colors"
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