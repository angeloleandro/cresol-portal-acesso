'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';

interface AccessRequest {
  id: string;
  full_name: string;
  email: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function AccessRequests() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
      } else {
        // Redirecionar usuários não-admin para o dashboard
        router.replace('/dashboard');
      }
    };

    checkUser();
  }, [router]);

  const fetchRequests = async () => {
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
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [statusFilter, isAdmin]);

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    try {
      if (status === 'approved') {
        // Buscar os dados do usuário
        const { data: requestData } = await supabase
          .from('access_requests')
          .select('*')
          .eq('id', id)
          .single();
        
        if (!requestData) {
          throw new Error('Solicitação não encontrada');
        }
        
        // Primeiro atualizar o status da solicitação
        await supabase
          .from('access_requests')
          .update({ 
            status, 
            processed_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        
        // Em produção, aqui seria feito o processo de criação do usuário no auth
        // e relacionamento com o perfil, mas como o Supabase já deve ter criado
        // o usuário durante o signup, vamos apenas atualizar o perfil
        await supabase
          .from('profiles')
          .update({ 
            role: 'user',
            department: requestData.department,
            full_name: requestData.full_name
          })
          .eq('email', requestData.email);
          
      } else {
        // Apenas atualizar o status para rejeitado
        await supabase
          .from('access_requests')
          .update({ 
            status, 
            processed_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      }
      
      // Recarregar a lista
      fetchRequests();
    } catch (error) {
      console.error('Erro ao processar solicitação:', error);
    }
  };

  if (loading && !requests.length) {
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
      {/* Header */}
      <AdminHeader user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 border-b border-cresol-gray-light pb-4 flex flex-col md:flex-row md:justify-between md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Solicitações de Acesso</h2>
            <p className="text-cresol-gray mb-4 md:mb-0">Gerencie as solicitações de acesso ao portal.</p>
          </div>
          
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-cresol-gray-light p-1">
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
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-8 text-center">
            <p className="text-cresol-gray">Nenhuma solicitação encontrada com os filtros atuais.</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-cresol-gray-light">
            <table className="min-w-full divide-y divide-cresol-gray-light">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">
                    Departamento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-cresol-gray-light">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">{request.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-cresol-gray">{request.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-cresol-gray">{request.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-cresol-gray">
                        {new Date(request.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${request.status === 'pending' ? 'bg-cresol-gray-light text-cresol-gray' : 
                          request.status === 'approved' ? 'bg-primary/10 text-primary' : 
                          'bg-cresol-gray text-white'}`}>
                        {request.status === 'pending' ? 'Pendente' : 
                          request.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'pending' && (
                        <div className="flex space-x-3">
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
                        </div>
                      )}
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