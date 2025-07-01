'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';

interface WorkLocation {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export default function WorkLocationsAdmin() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [createGroup, setCreateGroup] = useState(false);
  const [hasGroup, setHasGroup] = useState(false);
  const [groupAction, setGroupAction] = useState<'keep' | 'create' | 'remove'>('keep');
  const [editing, setEditing] = useState<WorkLocation | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<WorkLocation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace('/login');
        return;
      }
      setUser(userData.user);
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();
      if (profile?.role === 'admin') {
        setIsAdmin(true);
        fetchWorkLocations();
      } else {
        router.replace('/home');
      }
    };
    checkUser();
  }, [router]);

  const fetchWorkLocations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('work_locations')
      .select('*')
      .order('name');
    if (!error && data) setWorkLocations(data);
    setLoading(false);
  };

  const handleCreateOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);
    try {
      if (!newName.trim()) {
        setFormError('O nome do local é obrigatório.');
        setFormLoading(false);
        return;
      }
      if (editing) {
        // Editar
        const { error } = await supabase
          .from('work_locations')
          .update({ 
            name: newName, 
            address: newAddress || null,
            phone: newPhone || null,
            updated_at: new Date().toISOString() 
          })
          .eq('id', editing.id);
        if (error) throw error;
        
        // Gerenciar grupo baseado na ação selecionada
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            if (groupAction === 'create' && !hasGroup) {
              // Criar novo grupo
              const groupData = {
                name: `Local: ${newName}`,
                description: `Grupo automático para colaboradores do local ${newName}${newAddress ? ` - ${newAddress}` : ''}`,
                type: 'work_location',
                is_active: true,
                created_by: user.id,
                work_location_id: editing.id
              };
              
              const { error: groupError } = await supabase
                .from('notification_groups')
                .insert(groupData);
                
              if (groupError) {
                console.error('Erro ao criar grupo:', groupError);
                setFormSuccess('Local atualizado com sucesso! (Erro ao criar grupo)');
              } else {
                setFormSuccess('Local atualizado e grupo criado com sucesso!');
              }
            } else if (groupAction === 'remove' && hasGroup) {
              // Remover grupo existente
              const { error: removeError } = await supabase
                .from('notification_groups')
                .update({ is_active: false })
                .eq('work_location_id', editing.id)
                .eq('is_active', true);
                
              if (removeError) {
                console.error('Erro ao remover grupo:', removeError);
                setFormSuccess('Local atualizado com sucesso! (Erro ao remover grupo)');
              } else {
                setFormSuccess('Local atualizado e grupo removido com sucesso!');
              }
            } else if (groupAction === 'keep' && hasGroup) {
              // Atualizar nome do grupo existente se necessário
              const { error: updateGroupError } = await supabase
                .from('notification_groups')
                .update({
                  name: `Local: ${newName}`,
                  description: `Grupo automático para colaboradores do local ${newName}${newAddress ? ` - ${newAddress}` : ''}`
                })
                .eq('work_location_id', editing.id)
                .eq('is_active', true);
                
              if (updateGroupError) {
                console.error('Erro ao atualizar grupo:', updateGroupError);
              }
              setFormSuccess('Local atualizado com sucesso!');
            } else {
              setFormSuccess('Local atualizado com sucesso!');
            }
          }
        } catch (groupError) {
          console.error('Erro ao gerenciar grupo:', groupError);
          setFormSuccess('Local atualizado com sucesso! (Erro ao gerenciar grupo)');
        }
      } else {
        // Criar
        const { data: newLocation, error } = await supabase
          .from('work_locations')
          .insert({ 
            name: newName,
            address: newAddress || null,
            phone: newPhone || null
          })
          .select()
          .single();
        if (error) throw error;
        
        // Criar grupo se solicitado
        if (createGroup && newLocation) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const groupData = {
                name: `Local: ${newName}`,
                description: `Grupo automático para colaboradores do local ${newName}${newAddress ? ` - ${newAddress}` : ''}`,
                type: 'work_location',
                is_active: true,
                created_by: user.id,
                work_location_id: newLocation.id
              };

              const { error: groupError } = await supabase
                .from('notification_groups')
                .insert(groupData);

              if (groupError) {
                console.error('Erro ao criar grupo:', groupError);
                setFormSuccess('Local cadastrado com sucesso! (Erro ao criar grupo automático)');
              } else {
                setFormSuccess('Local e grupo cadastrados com sucesso!');
              }
            }
          } catch (groupError) {
            console.error('Erro ao criar grupo:', groupError);
            setFormSuccess('Local cadastrado com sucesso! (Erro ao criar grupo automático)');
          }
        } else {
          setFormSuccess('Local cadastrado com sucesso!');
        }
      }
      setNewName('');
      setNewAddress('');
      setNewPhone('');
      setCreateGroup(false);
      setHasGroup(false);
      setGroupAction('keep');
      setEditing(null);
      fetchWorkLocations();
    } catch (error: any) {
      setFormError('Erro ao salvar local: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const checkExistingGroup = async (workLocationId: string) => {
    const { data: existingGroup } = await supabase
      .from('notification_groups')
      .select('id')
      .eq('work_location_id', workLocationId)
      .eq('is_active', true)
      .single();
    
    return !!existingGroup;
  };

  const handleEdit = async (loc: WorkLocation) => {
    setEditing(loc);
    setNewName(loc.name);
    setNewAddress(loc.address || '');
    setNewPhone(loc.phone || '');
    
    // Verificar se já existe grupo para este local
    const groupExists = await checkExistingGroup(loc.id);
    setHasGroup(groupExists);
    setGroupAction('keep');
    
    setShowForm(true);
  };

  const handleDeleteClick = (location: WorkLocation) => {
    setLocationToDelete(location);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;
    
    setFormError(null);
    setFormSuccess(null);
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('work_locations')
        .delete()
        .eq('id', locationToDelete.id);
      
      if (error) throw error;
      
      setFormSuccess('Local excluído com sucesso!');
      fetchWorkLocations();
      setShowDeleteModal(false);
      setLocationToDelete(null);
    } catch (error: any) {
      setFormError('Erro ao excluir local: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setLocationToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-cresol-gray">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração', href: '/admin' },
              { label: 'Locais de Trabalho' }
            ]} 
          />
        </div>
        <div className="mb-6 border-b border-cresol-gray-light pb-4 flex flex-col md:flex-row md:justify-between md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Locais de Atuação</h2>
            <p className="text-cresol-gray mb-4 md:mb-0">Cadastre e gerencie os locais de atuação disponíveis para os usuários.</p>
          </div>
          <button
            onClick={() => { 
              setShowForm(!showForm); 
              setEditing(null); 
              setNewName(''); 
              setNewAddress(''); 
              setNewPhone(''); 
              setCreateGroup(false);
              setHasGroup(false);
              setGroupAction('keep');
            }}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
          >
            {showForm ? 'Cancelar' : 'Adicionar Local'}
          </button>
        </div>
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-6 mb-6">
            <h3 className="text-lg font-semibold text-primary mb-4">{editing ? 'Editar Local' : 'Cadastrar Novo Local'}</h3>
            {formError && (
              <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{formError}</div>
            )}
            {formSuccess && (
              <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">{formSuccess}</div>
            )}
            <form onSubmit={handleCreateOrEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="newName" className="block text-sm font-medium text-cresol-gray mb-1">
                    Nome do Local <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="newName"
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Ex: Matriz, Agência Centro, Home Office..."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="newAddress" className="block text-sm font-medium text-cresol-gray mb-1">
                    Endereço
                  </label>
                  <textarea
                    id="newAddress"
                    value={newAddress}
                    onChange={e => setNewAddress(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Rua, número, bairro, cidade, CEP..."
                  />
                </div>
                
                <div>
                  <label htmlFor="newPhone" className="block text-sm font-medium text-cresol-gray mb-1">
                    Telefone para Contato
                  </label>
                  <input
                    id="newPhone"
                    type="tel"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="(xx) xxxx-xxxx"
                  />
                </div>

                {!editing ? (
                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        id="createGroup"
                        type="checkbox"
                        checked={createGroup}
                        onChange={(e) => setCreateGroup(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="createGroup" className="ml-2 block text-sm text-cresol-gray">
                        Criar grupo automático para este local
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Um grupo de notificações será criado automaticamente. Todos os usuários que receberam este local serão adicionados ao grupo.
                    </p>
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-cresol-gray mb-2">
                      Gerenciamento de Grupo
                    </label>
                    
                    {hasGroup ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="groupAction"
                              value="keep"
                              checked={groupAction === 'keep'}
                              onChange={(e) => setGroupAction(e.target.value as 'keep' | 'create' | 'remove')}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <span className="ml-2 text-sm text-cresol-gray">Manter grupo existente</span>
                          </label>
                          
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="groupAction"
                              value="remove"
                              checked={groupAction === 'remove'}
                              onChange={(e) => setGroupAction(e.target.value as 'keep' | 'create' | 'remove')}
                              className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-red-600">Remover grupo</span>
                          </label>
                        </div>
                        
                        <p className="text-xs text-gray-500">
                          Este local já possui um grupo automático. Escolha se deseja manter ou remover.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="groupAction"
                              value="keep"
                              checked={groupAction === 'keep'}
                              onChange={(e) => setGroupAction(e.target.value as 'keep' | 'create' | 'remove')}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <span className="ml-2 text-sm text-cresol-gray">Não criar grupo</span>
                          </label>
                          
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="groupAction"
                              value="create"
                              checked={groupAction === 'create'}
                              onChange={(e) => setGroupAction(e.target.value as 'keep' | 'create' | 'remove')}
                              className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-green-600">Criar grupo automático</span>
                          </label>
                        </div>
                        
                        <p className="text-xs text-gray-500">
                          Este local não possui grupo automático. Escolha se deseja criar um.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition-colors"
                  disabled={formLoading}
                >
                  {formLoading ? 'Salvando...' : (editing ? 'Salvar Alterações' : 'Cadastrar Local')}
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-cresol-gray-light">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-cresol-gray-light">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">Endereço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-cresol-gray-light">
                {workLocations.map(loc => (
                  <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {loc.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      {loc.address ? (
                        <div className="truncate" title={loc.address}>
                          {loc.address}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Não informado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {loc.phone ? (
                        <a 
                          href={`tel:${loc.phone}`} 
                          className="text-primary hover:text-primary-dark hover:underline"
                        >
                          {loc.phone}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Não informado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(loc)}
                        className="text-primary hover:text-primary-dark mr-4 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(loc)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                
                {workLocations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-lg font-medium text-gray-400 mb-2">Nenhum local cadastrado</p>
                        <p className="text-sm text-gray-400">Clique em &quot;Adicionar Local&quot; para começar</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o local <strong>"${locationToDelete?.name}"</strong>?<br><br>Esta ação não pode ser desfeita e pode afetar usuários que possuem este local de atuação.`}
        isLoading={isDeleting}
        confirmButtonText="Excluir Local"
        cancelButtonText="Cancelar"
      />
    </div>
  );
}