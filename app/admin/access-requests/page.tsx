'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import { AdminSpinner } from '@/app/components/ui/StandardizedSpinner';

interface AccessRequest {
  id: string;
  full_name: string;
  email: string;
  position?: string;
  work_location_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface WorkLocation {
  id: string;
  name: string;
}

interface EditableAccessData {
  full_name: string;
  email: string;
  position: string;
  work_location_id: string;
}

export default function AccessRequests() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [editData, setEditData] = useState<Record<string, EditableAccessData>>({});

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    
    let query = supabase
      .from('access_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar solicitações:', error);
    } else {
      setRequests(data || []);
      // Preencher dados editáveis, incluindo o email
      const editObj: Record<string, EditableAccessData> = {};
      (data || []).forEach((req: AccessRequest) => {
        editObj[req.id] = {
          full_name: req.full_name || '',
          email: req.email,
          position: req.position || '',
          work_location_id: req.work_location_id || '',
        };
      });
      setEditData(editObj);
    }
    
    setLoading(false);
  }, [statusFilter]);

  const fetchWorkLocations = async () => {
    const { data, error } = await supabase
      .from('work_locations')
      .select('id, name')
      .order('name');
    if (!error && data) setWorkLocations(data);
  };

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
        fetchRequests();
        fetchWorkLocations();
      } else {
        // Redirecionar usuários não-admin para o dashboard
        router.replace('/dashboard');
      }
    };

    checkUser();
  }, [router, fetchRequests]);

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [statusFilter, isAdmin, fetchRequests]);

  const handleEditChange = (id: string, field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleUpdateRequest = async (id: string) => {
    try {
      const edit = editData[id];
      // Buscar os dados da solicitação de acesso para obter o email e o status atual
      const { data: requestData, error: requestError } = await supabase
        .from('access_requests')
        .select('email, status, position, work_location_id') // Adicionar position e work_location_id originais
        .eq('id', id)
        .single();
      
      if (requestError || !requestData) {
        console.error('Erro ao buscar solicitação para atualização:', requestError)
        throw new Error('Solicitação não encontrada ou erro ao buscar.');
      }
      
      // Atualizar os dados da solicitação de acesso
      const { error: updateAccessRequestError } = await supabase
        .from('access_requests')
        .update({
          full_name: edit.full_name,
          position: edit.position,
          work_location_id: edit.work_location_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateAccessRequestError) {
        console.error('Erro ao atualizar access_request:', updateAccessRequestError);
        throw new Error('Falha ao atualizar dados da solicitação.');
      }
      
      // Se a solicitação já foi aprovada (cenário menos comum para este botão, mas por segurança),
      // atualizar o perfil do usuário também com os dados editados.
      if (requestData.status === 'approved') {
        const { error: profileUpsertError } = await supabase
          .from('profiles')
          .upsert({
            email: requestData.email, // Usar o email original da solicitação como chave
            full_name: edit.full_name,
            position: edit.position, // Adicionado
            work_location_id: edit.work_location_id, // Adicionado
          }, { onConflict: 'email' }); // Usar email como onConflict para profiles

        if (profileUpsertError) {
          console.error('Erro ao fazer upsert no perfil durante a atualização da solicitação:', profileUpsertError);
          // Não lançar erro aqui necessariamente, pois a principal operação (access_requests) pode ter sido bem-sucedida.
          // Apenas logar ou notificar de forma não bloqueante.
          alert('Dados da solicitação atualizados, mas houve um problema ao sincronizar com o perfil do usuário.');
        }
      }
      
      fetchRequests(); // Recarregar a lista para refletir as mudanças
      alert('Solicitação atualizada com sucesso!');

    } catch (error: any) {
      console.error('Erro ao atualizar solicitação:', error);
      alert(`Erro ao atualizar solicitação: ${error.message}`);
    }
  };

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    const currentRequestOriginalData = requests.find(req => req.id === id);
    const editedRequestUIData = editData[id];

    if (!currentRequestOriginalData) {
        console.error('Dados originais da solicitação não encontrados para processamento.');
        alert('Erro interno: não foi possível encontrar os dados originais da solicitação.');
        return;
    }

    // Para a API, usaremos o email original da solicitação e os demais campos editados
    const payloadForApi = {
        ...editedRequestUIData,
        email: currentRequestOriginalData.email,
    };

    if (!payloadForApi.email || !payloadForApi.full_name) {
        alert('Por favor, certifique-se de que o nome completo está preenchido e o e-mail original é válido.');
        return;
    }

    if (status === 'approved') {
      try {
        const response = await fetch('/api/admin/approve-access-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // CORREÇÃO: Incluir cookies de autenticação
          body: JSON.stringify({
            accessRequestId: id,
            adminUserId: user?.id,
            editedUserData: payloadForApi,
            targetStatus: 'approved',
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('Falha ao aprovar solicitação (API):', result.error);
          alert(`Erro ao aprovar: ${result.error || 'Erro desconhecido'}`);
        } else {
          console.log('Solicitação aprovada com sucesso (API):', result.message);
          alert(result.message || 'Aprovado com sucesso!');
        }
      } catch (error) {
        console.error('Erro de rede ou inesperado ao chamar API de aprovação:', error);
        alert('Ocorreu um erro de comunicação ao tentar aprovar a solicitação.');
      }
    } else { // status === 'rejected'
      // Para rejeição, também chamaremos a API para centralizar a lógica de status
      try {
        const response = await fetch('/api/admin/approve-access-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // CORREÇÃO: Incluir cookies de autenticação
          body: JSON.stringify({
            accessRequestId: id,
            adminUserId: user?.id,
            editedUserData: payloadForApi,
            targetStatus: 'rejected',
          }),
        });
        
        const result = await response.json();

        if (!response.ok) {
          console.error('Falha ao rejeitar solicitação (API):', result.error);
          alert(`Erro ao rejeitar: ${result.error || 'Erro desconhecido'}`);
        } else {
          console.log('Solicitação rejeitada com sucesso (API):', result.message);
          alert(result.message || 'Rejeitado com sucesso!');
        }
      } catch (error) {
        console.error('Erro de rede ou inesperado ao chamar API de rejeição:', error);
        alert('Ocorreu um erro de comunicação ao tentar rejeitar a solicitação.');
      }
    }
    fetchRequests();
  };

  if (loading && !requests.length) {
    return <AdminSpinner fullScreen message="Carregando..." size="lg" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração', href: '/admin' },
              { label: 'Solicitações de Acesso' }
            ]} 
          />
        </div>
        <div className="mb-6 border-b border-cresol-gray-light pb-4 flex flex-col md:flex-row md:justify-between md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Solicitações de Acesso</h2>
            <p className="text-cresol-gray mb-4 md:mb-0">Gerencie as solicitações de acesso ao portal.</p>
          </div>
          
          <div className="flex items-center bg-white rounded-lg  border border-cresol-gray-light p-1">
            <label htmlFor="status-filter" className="text-sm font-medium text-cresol-gray ml-2 mr-2">
              Filtrar:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border-0 focus:ring-0 focus:outline-none py-1 pl-1 pr-7 bg-transparent text-gray-800"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovados</option>
              <option value="rejected">Rejeitados</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-12">
            <AdminSpinner message="Carregando mais dados..." size="md" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg  border border-cresol-gray-light p-8 text-center">
            <p className="text-cresol-gray">Nenhuma solicitação encontrada com os filtros atuais.</p>
          </div>
        ) : (
          <div className="bg-white  rounded-lg overflow-hidden border border-cresol-gray-light">
            <table className="min-w-full divide-y divide-cresol-gray-light">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">Local de Atuação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-cresol-gray-light">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        className="w-full border border-cresol-gray-light rounded px-2 py-1 text-sm"
                        value={editData[request.id]?.full_name || ''}
                        onChange={e => handleEditChange(request.id, 'full_name', e.target.value)}
                        disabled={request.status !== 'pending'}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-cresol-gray">{request.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        className="w-full border border-cresol-gray-light rounded px-2 py-1 text-sm min-w-[150px]"
                        value={editData[request.id]?.position || ''}
                        onChange={e => handleEditChange(request.id, 'position', e.target.value)}
                        disabled={request.status !== 'pending'}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="w-full border border-cresol-gray-light rounded px-2 py-1 text-sm min-w-[180px]"
                        value={editData[request.id]?.work_location_id || ''}
                        onChange={e => handleEditChange(request.id, 'work_location_id', e.target.value)}
                        disabled={request.status !== 'pending'}
                      >
                        <option value="">Selecione</option>
                        {workLocations.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-cresol-gray">
                        {new Date(request.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${request.status === 'pending' ? 'bg-cresol-gray-light text-cresol-gray' : 
                          request.status === 'approved' ? 'bg-primary/10 text-primary' : 
                          'bg-cresol-gray text-white'}`}>
                        {request.status === 'pending' ? 'Pendente' : 
                          request.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-3">
                        {request.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleStatusChange(request.id, 'approved')}
                              className="text-primary hover:text-primary-dark transition-colors"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleStatusChange(request.id, 'rejected')}
                              className="text-cresol-gray hover:text-primary transition-colors"
                            >
                              Rejeitar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              // Permitir edição mesmo para solicitações já processadas
                              const currentRequest = requests.find(r => r.id === request.id);
                              if (!currentRequest) return;

                              const updatedEditData = { ...editData };
                              updatedEditData[request.id] = {
                                full_name: currentRequest.full_name || '',
                                email: currentRequest.email,
                                position: currentRequest.position || '',
                                work_location_id: currentRequest.work_location_id || '',
                              };
                              setEditData(updatedEditData);
                              
                              // Habilitar campos para edição temporariamente (visual)
                              // A lógica de submissão usará os dados de 'editData' que inclui o email original
                              const editableRequest = { ...currentRequest, status: 'pending' as 'pending' | 'approved' | 'rejected' };
                              const updatedRequests = requests.map(r => 
                                r.id === request.id ? editableRequest : r
                              );
                              setRequests(updatedRequests);
                            }}
                            className="text-primary hover:text-primary-dark transition-colors"
                          >
                            Editar
                          </button>
                        )}
                        {request.status === 'pending' && editData[request.id] && (
                          <button
                            onClick={() => handleUpdateRequest(request.id)}
                            className="text-green-600 hover:text-green-800 ml-3"
                          >
                            Salvar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
} 