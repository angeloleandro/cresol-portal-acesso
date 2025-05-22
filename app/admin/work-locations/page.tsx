'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';
import { useRouter } from 'next/navigation';

interface WorkLocation {
  id: string;
  name: string;
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
  const [editing, setEditing] = useState<WorkLocation | null>(null);

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
        router.replace('/dashboard');
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
          .update({ name: newName, updated_at: new Date().toISOString() })
          .eq('id', editing.id);
        if (error) throw error;
        setFormSuccess('Local atualizado com sucesso!');
      } else {
        // Criar
        const { error } = await supabase
          .from('work_locations')
          .insert({ name: newName });
        if (error) throw error;
        setFormSuccess('Local cadastrado com sucesso!');
      }
      setNewName('');
      setEditing(null);
      fetchWorkLocations();
    } catch (error: any) {
      setFormError('Erro ao salvar local: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (loc: WorkLocation) => {
    setEditing(loc);
    setNewName(loc.name);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este local?')) return;
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);
    try {
      const { error } = await supabase
        .from('work_locations')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setFormSuccess('Local excluído com sucesso!');
      fetchWorkLocations();
    } catch (error: any) {
      setFormError('Erro ao excluir local: ' + error.message);
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 border-b border-cresol-gray-light pb-4 flex flex-col md:flex-row md:justify-between md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Locais de Atuação</h2>
            <p className="text-cresol-gray mb-4 md:mb-0">Cadastre e gerencie os locais de atuação disponíveis para os usuários.</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditing(null); setNewName(''); }}
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
              <div>
                <label htmlFor="newName" className="block text-sm font-medium text-cresol-gray mb-1">Nome do Local</label>
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
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
                  disabled={formLoading}
                >
                  {formLoading ? 'Salvando...' : (editing ? 'Salvar Alterações' : 'Cadastrar Local')}
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-cresol-gray-light">
          <table className="min-w-full divide-y divide-cresol-gray-light">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-cresol-gray uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-cresol-gray-light">
              {workLocations.map(loc => (
                <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{loc.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(loc)}
                      className="text-primary hover:text-primary-dark mr-4"
                    >Editar</button>
                    <button
                      onClick={() => handleDelete(loc.id)}
                      className="text-red-600 hover:text-red-800"
                    >Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
} 