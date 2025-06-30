'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';
import { useRouter } from 'next/navigation';

interface Position {
  id: string;
  name: string;
  description?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export default function PositionsAdmin() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [editing, setEditing] = useState<Position | null>(null);

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
        fetchPositions();
      } else {
        router.replace('/home');
      }
    };
    checkUser();
  }, [router]);

  const fetchPositions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .order('name');
    if (!error && data) setPositions(data);
    setLoading(false);
  };

  const handleCreateOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);
    try {
      if (!newName.trim()) {
        setFormError('O nome do cargo é obrigatório.');
        setFormLoading(false);
        return;
      }
      if (editing) {
        // Editar
        const { error } = await supabase
          .from('positions')
          .update({ 
            name: newName, 
            description: newDescription || null,
            department: newDepartment || null,
            updated_at: new Date().toISOString() 
          })
          .eq('id', editing.id);
        if (error) throw error;
        setFormSuccess('Cargo atualizado com sucesso!');
      } else {
        // Criar
        const { error } = await supabase
          .from('positions')
          .insert({ 
            name: newName,
            description: newDescription || null,
            department: newDepartment || null
          });
        if (error) throw error;
        setFormSuccess('Cargo cadastrado com sucesso!');
      }
      setNewName('');
      setNewDescription('');
      setNewDepartment('');
      setEditing(null);
      fetchPositions();
    } catch (error: any) {
      setFormError('Erro ao salvar cargo: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (position: Position) => {
    setEditing(position);
    setNewName(position.name);
    setNewDescription(position.description || '');
    setNewDepartment(position.department || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cargo?')) return;
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);
    try {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setFormSuccess('Cargo excluído com sucesso!');
      fetchPositions();
    } catch (error: any) {
      setFormError('Erro ao excluir cargo: ' + error.message);
    } finally {
      setFormLoading(false);
    }
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
        <div className="mb-6 border-b border-cresol-gray-light pb-4 flex flex-col md:flex-row md:justify-between md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Cargos</h2>
            <p className="text-cresol-gray mb-4 md:mb-0">Cadastre e gerencie os cargos disponíveis para os usuários.</p>
          </div>
          <button
            onClick={() => { 
              setShowForm(!showForm); 
              setEditing(null); 
              setNewName(''); 
              setNewDescription(''); 
              setNewDepartment(''); 
            }}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
          >
            {showForm ? 'Cancelar' : 'Adicionar Cargo'}
          </button>
        </div>
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-6 mb-6">
            <h3 className="text-lg font-semibold text-primary mb-4">{editing ? 'Editar Cargo' : 'Cadastrar Novo Cargo'}</h3>
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
                    Nome do Cargo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="newName"
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Ex: Analista de Sistemas, Gerente, Coordenador..."
                  />
                </div>
                
                <div>
                  <label htmlFor="newDepartment" className="block text-sm font-medium text-cresol-gray mb-1">
                    Departamento
                  </label>
                  <input
                    id="newDepartment"
                    type="text"
                    value={newDepartment}
                    onChange={e => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Ex: TI, Administração, Crédito..."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="newDescription" className="block text-sm font-medium text-cresol-gray mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="newDescription"
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-cresol-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Breve descrição das responsabilidades do cargo..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition-colors"
                  disabled={formLoading}
                >
                  {formLoading ? 'Salvando...' : (editing ? 'Salvar Alterações' : 'Cadastrar Cargo')}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">Departamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-cresol-gray-light">
                {positions.map(position => (
                  <tr key={position.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {position.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {position.department ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {position.department}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Não informado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      {position.description ? (
                        <div className="truncate" title={position.description}>
                          {position.description}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Não informado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(position)}
                        className="text-primary hover:text-primary-dark mr-4 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(position.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                
                {positions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8m0 0v2a2 2 0 002 2h4a2 2 0 002-2V6m-8 0H8" />
                        </svg>
                        <p className="text-lg font-medium text-gray-400 mb-2">Nenhum cargo cadastrado</p>
                        <p className="text-sm text-gray-400">Clique em &quot;Adicionar Cargo&quot; para começar</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}