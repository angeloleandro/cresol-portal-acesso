'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  StandardizedAdminLayout, 
  StandardizedPageHeader, 
  StandardizedButton,
  StandardizedTabsList,
  StandardizedTabContent,
  StandardizedCard,
  StandardizedEmptyState,
  type BreadcrumbItem
} from '@/app/components/admin';
import { Tabs } from "@chakra-ui/react";
import { LuFolder } from "react-icons/lu";
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

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/home', icon: 'house' },
    { label: 'Administração', href: '/admin' },
    { label: 'Setores' }
  ];

  const tabs = [
    {
      value: 'sectors',
      label: 'Setores',
      icon: <LuFolder />
    },
    {
      value: 'subsectors',
      label: 'Sub-setores',
      icon: <LuFolder />
    }
  ];

  return (
    <>
      <StandardizedAdminLayout user={user} breadcrumbs={breadcrumbs}>
        <StandardizedPageHeader
          title="Gerenciamento de Setores"
          subtitle="Gerencie os setores da Cresol e seus sub-setores"
          action={
            <div className="flex gap-3">
              <StandardizedButton
                onClick={() => setShowSectorModal(true)}
                variant="primary"
              >
                <Icon name="plus" className="h-4 w-4" />
                Novo Setor
              </StandardizedButton>
              <StandardizedButton
                onClick={() => setShowSubsectorModal(true)}
                variant="secondary"
              >
                <Icon name="folder-plus" className="h-4 w-4" />
                Novo Sub-setor
              </StandardizedButton>
            </div>
          }
        />

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <Tabs.Root 
              value={activeTab} 
              onValueChange={(details) => setActiveTab(details.value as 'sectors' | 'subsectors')}
              variant="plain"
            >
              <StandardizedTabsList
                tabs={tabs}
                className="mb-6"
              />

              {/* Content das tabs */}
              <div className="mt-6">
                <StandardizedTabContent value="sectors">
                  <div className="space-y-6">
                    {sectors.length > 0 ? (
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
                    ) : (
                      <StandardizedEmptyState
                        title="Nenhum setor cadastrado"
                        description="Comece criando o primeiro setor da organização."
                        icon="building-1"
                        action={{
                          label: 'Criar Primeiro Setor',
                          onClick: () => setShowSectorModal(true)
                        }}
                      />
                    )}
                  </div>
                </StandardizedTabContent>

                <StandardizedTabContent value="subsectors">
                  <div className="space-y-6">
                    {subsectors.length > 0 ? (
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
                    ) : (
                      <StandardizedEmptyState
                        title="Nenhum sub-setor cadastrado"
                        description={
                          sectors.length === 0 
                            ? 'Primeiro crie um setor, depois adicione sub-setores a ele.'
                            : 'Comece criando o primeiro sub-setor.'
                        }
                        icon="folder"
                        action={
                          sectors.length > 0 ? {
                            label: 'Criar Primeiro Sub-setor',
                            onClick: () => setShowSubsectorModal(true)
                          } : undefined
                        }
                      />
                    )}
                  </div>
                </StandardizedTabContent>
              </div>
            </Tabs.Root>
          </div>
        </div>
      </StandardizedAdminLayout>

        {/* Modal Setor */}
        {showSectorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-md max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                    <StandardizedButton
                      type="button"
                      onClick={resetSectorForm}
                      variant="secondary"
                      className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </StandardizedButton>
                    <StandardizedButton
                      type="submit"
                      variant="primary"
                      className="flex-1"
                    >
                      {editingSector ? 'Atualizar' : 'Criar'}
                    </StandardizedButton>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Sub-setor */}
        {showSubsectorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-md max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                    <StandardizedButton
                      type="button"
                      onClick={resetSubsectorForm}
                      variant="secondary"
                      className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </StandardizedButton>
                    <StandardizedButton
                      type="submit"
                      variant="secondary"
                      className="flex-1"
                    >
                      {editingSubsector ? 'Atualizar' : 'Criar'}
                    </StandardizedButton>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

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