'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

interface Sector {
  id: string;
  name: string;
}

interface Subsector {
  id: string;
  name: string;
  sector_id: string;
}

interface RoleModalProps {
  userId: string;
  currentRole: 'user' | 'sector_admin' | 'subsector_admin' | 'admin';
  sectors: Sector[];
  subsectors: Subsector[];
  userSectors: string[];
  userSubsectors: string[];
  onClose: () => void;
  onSuccess: () => void;
  onRefreshSubsectors: (sectorId?: string) => void;
}

export default function RoleModal({
  userId,
  currentRole,
  sectors,
  subsectors,
  userSectors,
  userSubsectors,
  onClose,
  onSuccess,
  onRefreshSubsectors
}: RoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<'user' | 'sector_admin' | 'subsector_admin' | 'admin'>(currentRole);
  const [selectedSectors, setSelectedSectors] = useState<string[]>(userSectors);
  const [selectedSubsectors, setSelectedSubsectors] = useState<string[]>(userSubsectors);
  const [selectedSectorForSubs, setSelectedSectorForSubs] = useState<string>('');
  const [loadingSubsectors, setLoadingSubsectors] = useState(false);

  useEffect(() => {
    setSelectedSectors(userSectors);
    setSelectedSubsectors(userSubsectors);
  }, [userSectors, userSubsectors]);

  const handleSave = async () => {
    try {
      console.log('Iniciando atualização de role...');
      console.log('User ID:', userId);
      console.log('Nova role:', selectedRole);
      console.log('Setores selecionados:', selectedSectors);
      console.log('Sub-setores selecionados:', selectedSubsectors);

      // Atualizar role no perfil
      const { data: roleData, error: roleError } = await getSupabaseClient()
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', userId)
        .select();

      console.log('Resultado da atualização de role:', { data: roleData, error: roleError });

      if (roleError) {
        console.error('Erro ao atualizar role:', roleError);
        throw roleError;
      }
      
      // Limpar associações existentes
      console.log('Removendo associações anteriores...');
      const { error: deleteSectorError } = await getSupabaseClient().from('sector_admins').delete().eq('user_id', userId);
      const { error: deleteSubsectorError } = await getSupabaseClient().from('subsector_admins').delete().eq('user_id', userId);
      
      if (deleteSectorError) {
        console.error('Erro ao deletar associações de setor:', deleteSectorError);
      }
      if (deleteSubsectorError) {
        console.error('Erro ao deletar associações de sub-setor:', deleteSubsectorError);
      }
      
      // Adicionar novas associações
      if (selectedRole === 'sector_admin' && selectedSectors.length > 0) {
        console.log('Inserindo associações de setor...');
        const sectorInserts = selectedSectors.map(sectorId => ({
          user_id: userId,
          sector_id: sectorId
        }));
        
        const { data: sectorData, error: sectorError } = await getSupabaseClient()
          .from('sector_admins')
          .insert(sectorInserts)
          .select();
          
        console.log('Resultado da inserção de setores:', { data: sectorData, error: sectorError });
        if (sectorError) throw sectorError;
      } else if (selectedRole === 'subsector_admin' && selectedSubsectors.length > 0) {
        console.log('Inserindo associações de sub-setor...');
        const subsectorInserts = selectedSubsectors.map(subsectorId => ({
          user_id: userId,
          subsector_id: subsectorId
        }));
        
        const { data: subsectorData, error: subsectorError } = await getSupabaseClient()
          .from('subsector_admins')
          .insert(subsectorInserts)
          .select();
          
        console.log('Resultado da inserção de sub-setores:', { data: subsectorData, error: subsectorError });
        if (subsectorError) throw subsectorError;
      }
      
      console.log('Role atualizado com sucesso!');
      alert('Role atualizado com sucesso!');
      onSuccess();
      
    } catch (error) {
      console.error('Erro detalhado ao salvar alterações de role:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao salvar alterações: ${errorMessage}`);
    }
  };

  const fetchSubsectors = async (sectorId?: string) => {
    try {
      setLoadingSubsectors(true);
      let query = getSupabaseClient()
        .from('subsectors')
        .select('id, name, sector_id')
        .order('name');
      
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      onRefreshSubsectors(sectorId);
    } catch (error) {
      console.error('Erro ao buscar sub-setores:', error);
    } finally {
      setLoadingSubsectors(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-gray-300 w-full max-w-3xl mx-4 relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-primary">Alterar Role do Usuário</h3>
          <button
            type="button"
            className="text-cresol-gray hover:text-cresol-gray-dark"
            onClick={onClose}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-cresol-gray mb-2">
              Tipo de Conta
            </label>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value as 'user' | 'sector_admin' | 'subsector_admin' | 'admin');
                setSelectedSectors([]);
                setSelectedSubsectors([]);
                setSelectedSectorForSubs('');
              }}
              className="w-full px-3 py-2 border border-cresol-gray-light rounded-sm-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="user">Usuário</option>
              <option value="sector_admin">Administrador de Setor</option>
              <option value="subsector_admin">Administrador de Sub-setor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {selectedRole === 'sector_admin' && (
            <div className="border-t border-cresol-gray-light pt-4">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-cresol-gray">
                  Setores a administrar
                </label>
                <span className="text-xs text-cresol-gray">
                  {selectedSectors.length} selecionado(s)
                </span>
              </div>
              
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                {sectors.length === 0 ? (
                  <p className="text-sm text-cresol-gray">Nenhum setor disponível</p>
                ) : (
                  <div className="space-y-2">
                    {sectors.map(sector => (
                      <div key={sector.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`modal-sector-${sector.id}`}
                          checked={selectedSectors.includes(sector.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSectors(prev => [...prev, sector.id]);
                            } else {
                              setSelectedSectors(prev => prev.filter(id => id !== sector.id));
                            }
                          }}
                          className="h-4 w-4 text-primary border-cresol-gray-light rounded-sm focus:ring-primary"
                        />
                        <label 
                          htmlFor={`modal-sector-${sector.id}`}
                          className="ml-2 text-sm text-cresol-gray"
                        >
                          {sector.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-cresol-gray mt-2">
                Selecione os setores que este administrador setorial irá gerenciar.
              </p>
            </div>
          )}

          {selectedRole === 'subsector_admin' && (
            <div className="border-t border-cresol-gray-light pt-4">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-cresol-gray">
                  Sub-setores a administrar
                </label>
                <span className="text-xs text-cresol-gray">
                  {selectedSubsectors.length} selecionado(s)
                </span>
              </div>
              
              <div className="mb-4">
                <label className="block text-xs font-medium text-cresol-gray mb-1">
                  Filtrar por setor
                </label>
                <select
                  value={selectedSectorForSubs}
                  onChange={(e) => {
                    setSelectedSectorForSubs(e.target.value);
                    if (e.target.value) {
                      fetchSubsectors(e.target.value);
                    } else {
                      fetchSubsectors();
                    }
                  }}
                  className="w-full px-3 py-2 border border-cresol-gray-light rounded-sm-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                >
                  <option value="">Todos os setores</option>
                  {sectors.map(sector => (
                    <option key={sector.id} value={sector.id}>{sector.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                {loadingSubsectors ? (
                  <div className="text-center py-4">
                    <UnifiedLoadingSpinner size="default" message="Carregando sub-setores..." />
                  </div>
                ) : subsectors.length === 0 ? (
                  <p className="text-sm text-cresol-gray">
                    {selectedSectorForSubs 
                      ? 'Nenhum sub-setor encontrado para este setor' 
                      : 'Nenhum sub-setor disponível'
                    }
                  </p>
                ) : (
                  <div className="space-y-2">
                    {subsectors
                      .filter(subsector => 
                        !selectedSectorForSubs || 
                        subsector.sector_id === selectedSectorForSubs
                      )
                      .map(subsector => {
                        const sector = sectors.find(s => s.id === subsector.sector_id);
                        return (
                          <div key={subsector.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`modal-subsector-${subsector.id}`}
                              checked={selectedSubsectors.includes(subsector.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSubsectors(prev => [...prev, subsector.id]);
                                } else {
                                  setSelectedSubsectors(prev => prev.filter(id => id !== subsector.id));
                                }
                              }}
                              className="h-4 w-4 text-primary border-cresol-gray-light rounded-sm focus:ring-primary"
                            />
                            <label 
                              htmlFor={`modal-subsector-${subsector.id}`}
                              className="ml-2 text-sm text-cresol-gray"
                            >
                              {subsector.name}
                              {sector && (
                                <span className="text-xs text-gray-500 ml-1">
                                  ({sector.name})
                                </span>
                              )}
                            </label>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-cresol-gray mt-2">
                Selecione os sub-setores que este administrador de sub-setor irá gerenciar.
              </p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-md border">
            <h4 className="text-sm font-medium text-cresol-gray mb-2">Descrição dos Tipos de Conta:</h4>
            <ul className="text-xs text-cresol-gray space-y-1">
              <li><strong>Usuário:</strong> Acesso básico ao portal, pode visualizar conteúdo público.</li>
              <li><strong>Admin. Setor:</strong> Gerencia setores específicos, seus sub-setores, eventos e notícias.</li>
              <li><strong>Admin. Sub-setor:</strong> Gerencia sub-setores específicos, seus eventos e notícias.</li>
              <li><strong>Administrador:</strong> Acesso completo ao sistema, gerencia usuários e configurações.</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-cresol-gray-light rounded-sm-md text-cresol-gray hover:bg-gray-50"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              onClick={handleSave}
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 