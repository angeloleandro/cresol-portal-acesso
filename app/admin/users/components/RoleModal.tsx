'use client';

import { useState, useEffect } from 'react';

import { useAlert } from '@/app/components/alerts';
import { FormSelect } from '@/app/components/forms/FormSelect';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { createClient } from '@/lib/supabase/client';

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
  const alert = useAlert();
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
      const supabase = createClient();
                              
      // Atualizar role no perfil
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', userId)
        .select();

      if (roleError) {
        throw roleError;
      }
      
      // Limpar associações existentes
            const { error: deleteSectorError } = await supabase.from('sector_admins').delete().eq('user_id', userId);
      const { error: deleteSubsectorError } = await supabase.from('subsector_admins').delete().eq('user_id', userId);
      
      if (deleteSectorError) {

      }
      if (deleteSubsectorError) {

      }
      
      // Adicionar novas associações
      if (selectedRole === 'sector_admin' && selectedSectors.length > 0) {
                const sectorInserts = selectedSectors.map(sectorId => ({
          user_id: userId,
          sector_id: sectorId
        }));
        
        const { error: sectorError } = await supabase
          .from('sector_admins')
          .insert(sectorInserts)
          .select();
          
                if (sectorError) throw sectorError;
      } else if (selectedRole === 'subsector_admin' && selectedSubsectors.length > 0) {
                const subsectorInserts = selectedSubsectors.map(subsectorId => ({
          user_id: userId,
          subsector_id: subsectorId
        }));
        
        const { error: subsectorError } = await supabase
          .from('subsector_admins')
          .insert(subsectorInserts)
          .select();
          
                if (subsectorError) throw subsectorError;
      }
      
            alert.users.roleChanged(selectedRole);
      onSuccess();
      
    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert.showError('Erro ao salvar alterações', errorMessage);
    }
  };

  const fetchSubsectors = async (sectorId?: string) => {
    try {
      setLoadingSubsectors(true);
      const supabase = createClient();
      let query = supabase
        .from('subsectors')
        .select('id, name, sector_id')
        .order('name');
      
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }
      
      const { error } = await query;
      
      if (error) throw error;
      onRefreshSubsectors(sectorId);
    } catch (error) {

      alert.showError('Erro ao carregar subsetores');
    } finally {
      setLoadingSubsectors(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Alterar Role do Usuário</h3>
            <p className="mt-1 text-sm text-gray-500">Configure o tipo de acesso e permissões</p>
          </div>
          <button
            type="button"
            className="ml-4 p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-cresol-gray mb-2">
              Tipo de Conta
            </label>
            <FormSelect
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value as 'user' | 'sector_admin' | 'subsector_admin' | 'admin');
                setSelectedSectors([]);
                setSelectedSubsectors([]);
                setSelectedSectorForSubs('');
              }}
              options={[
                { value: 'user', label: 'Usuário' },
                { value: 'sector_admin', label: 'Administrador de Setor' },
                { value: 'subsector_admin', label: 'Administrador de Sub-setor' },
                { value: 'admin', label: 'Administrador' }
              ]}
              placeholder="Selecione o tipo de conta"
            />
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
                <FormSelect
                  value={selectedSectorForSubs}
                  onChange={(e) => {
                    setSelectedSectorForSubs(e.target.value);
                    if (e.target.value) {
                      fetchSubsectors(e.target.value);
                    } else {
                      fetchSubsectors();
                    }
                  }}
                  options={[
                    { value: '', label: 'Todos os setores' },
                    ...sectors.map(sector => ({
                      value: sector.id,
                      label: sector.name
                    }))
                  ]}
                  placeholder="Filtrar por setor"
                  size="sm"
                />
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
        
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-lg">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 transition-colors"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary transition-colors"
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