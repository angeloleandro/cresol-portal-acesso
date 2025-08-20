'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAlert } from '@/app/components/alerts';
import { Icon } from '@/app/components/icons/Icon';
import { StandardizedButton } from '@/app/components/admin';
import { FormSelect } from '@/app/components/forms/FormSelect';

interface Message {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  type: 'sector' | 'subsector';
  location_name?: string;
  location_id?: string;
  sector_name?: string;
  author_name?: string;
  group_name?: string;
  group_color?: string;
}

interface MessageFormProps {
  message?: Message | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Sector {
  id: string;
  name: string;
}

interface Subsector {
  id: string;
  name: string;
  sector_id: string;
  sectors: { name: string } | null;
}

interface MessageGroup {
  id: string;
  name: string;
  color_theme: string;
  sector_id?: string;
  subsector_id?: string;
}

interface FormData {
  title: string;
  content: string;
  type: 'sector' | 'subsector';
  sector_id: string;
  subsector_id: string;
  group_id: string;
  is_published: boolean;
}

export function MessageForm({ message, isOpen, onClose, onSuccess }: MessageFormProps) {
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [messageGroups, setMessageGroups] = useState<MessageGroup[]>([]);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    type: 'sector',
    sector_id: '',
    subsector_id: '',
    group_id: '',
    is_published: false
  });

  const loadInitialData = useCallback(async () => {
    try {
      // Carregar setores
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('id, name')
        .order('name');
      
      if (sectorsError) {
        throw sectorsError;
      }
      
      setSectors(sectorsData || []);

      // Carregar subsetores
      const { data: subsectorsData, error: subsectorsError } = await supabase
        .from('subsectors')
        .select('id, name, sector_id, sectors(name)')
        .order('name');
      
      if (subsectorsError) {
        throw subsectorsError;
      }
      
      setSubsectors((subsectorsData || []) as unknown as Subsector[]);
      
    } catch (error: any) {
      console.error('Erro ao carregar dados iniciais:', error);
      alert.showError('Erro', 'Erro ao carregar dados iniciais');
    }
  }, [alert]);

  const loadMessageGroups = useCallback(async () => {
    const filterValue = formData.type === 'sector' ? formData.sector_id : formData.subsector_id;
    const filterColumn = formData.type === 'sector' ? 'sector_id' : 'subsector_id';

    try {
      const { data: groupsData, error: groupsError } = await supabase
        .from('message_groups')
        .select('id, name, color_theme, sector_id, subsector_id')
        .eq('is_active', true)
        .or(
          formData.type === 'sector' 
            ? `sector_id.eq.${formData.sector_id}`
            : `subsector_id.eq.${formData.subsector_id}`
        )
        .order('name');
      
      if (groupsError) {
        setMessageGroups([]);
        return;
      }
      
      setMessageGroups(groupsData || []);
    } catch (error: any) {
      setMessageGroups([]);
    }
  }, [formData.type, formData.sector_id, formData.subsector_id]);

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      
      if (message) {
        setFormData({
          title: message.title,
          content: message.content,
          type: message.type,
          sector_id: message.type === 'sector' ? (message.location_id || '') : '',
          subsector_id: message.type === 'subsector' ? (message.location_id || '') : '',
          group_id: '',
          is_published: message.is_published
        });
      } else {
        setFormData({
          title: '',
          content: '',
          type: 'sector',
          sector_id: '',
          subsector_id: '',
          group_id: '',
          is_published: false
        });
      }
    }
  }, [isOpen, message, loadInitialData]);

  // Carregar grupos quando setor/subsetor muda
  useEffect(() => {
    if (formData.sector_id || formData.subsector_id) {
      loadMessageGroups();
    } else {
      setMessageGroups([]);
    }
  }, [formData.sector_id, formData.subsector_id, loadMessageGroups]);

  const getFilteredSubsectors = () => {
    if (!formData.sector_id) return subsectors;
    return subsectors.filter(sub => sub.sector_id === formData.sector_id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.title.trim()) {
      alert.showError('Campo obrigatório', 'Título é obrigatório');
      return;
    }
    
    if (!formData.content.trim()) {
      alert.showError('Campo obrigatório', 'Conteúdo é obrigatório');
      return;
    }

    if (formData.type === 'sector' && !formData.sector_id) {
      alert.showError('Campo obrigatório', 'Setor é obrigatório para mensagens de setor');
      return;
    }

    if (formData.type === 'subsector' && !formData.subsector_id) {
      alert.showError('Campo obrigatório', 'Subsetor é obrigatório para mensagens de subsetor');
      return;
    }

    setLoading(true);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        alert.showError('Erro de autenticação', 'Erro ao verificar sessão');
        return;
      }
      
      if (!session) {
        alert.showError('Sessão expirada', 'Faça login novamente');
        return;
      }

      // Preparar dados para envio
      const requestData: any = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        is_published: formData.is_published,
        ...(formData.type === 'sector' 
          ? { sector_id: formData.sector_id }
          : { subsector_id: formData.subsector_id }
        ),
        ...(formData.group_id && { group_id: formData.group_id }),
      };

      let url = '/api/admin/messages';
      let method = 'POST';
      
      if (message) {
        // Editando mensagem existente
        method = 'PUT';
        requestData.id = message.id;
        requestData.type = message.type; // Manter tipo original
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { error: 'Erro desconhecido na API' };
        }

        throw new Error(errorData.error || 'Erro ao salvar mensagem');
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error('Erro ao processar resposta da API');
      }

      if (result.success) {
        alert.showSuccess(
          'Sucesso',
          message ? 'Mensagem atualizada com sucesso' : 'Mensagem criada com sucesso'
        );
        onSuccess();
        onClose();
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      alert.showError('Erro', error.message || 'Erro ao salvar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (newType: 'sector' | 'subsector') => {
    setFormData({
      ...formData,
      type: newType,
      sector_id: '',
      subsector_id: '',
      group_id: '',
    });
  };

  const handleSectorChange = (sectorId: string) => {
    const selectedSector = sectors.find(s => s.id === sectorId);

    setFormData({
      ...formData,
      sector_id: sectorId,
      subsector_id: '', // Reset subsetor quando setor muda
      group_id: '', // Reset grupo quando setor muda
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-2">
              {message ? 'Editar Mensagem' : 'Nova Mensagem'}
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Mensagem */}
            <div>
              <label className="label">Tipo de Mensagem</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="sector"
                    checked={formData.type === 'sector'}
                    onChange={(e) => handleTypeChange(e.target.value as 'sector')}
                    disabled={loading || !!message} // Não permitir mudar tipo na edição
                    className="mr-2"
                  />
                  <span>Mensagem de Setor</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="subsector"
                    checked={formData.type === 'subsector'}
                    onChange={(e) => handleTypeChange(e.target.value as 'subsector')}
                    disabled={loading || !!message} // Não permitir mudar tipo na edição
                    className="mr-2"
                  />
                  <span>Mensagem de Subsetor</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Setor */}
              <div>
                <label className="label">
                  Setor <span className="text-red-500">*</span>
                </label>
                <FormSelect
                  value={formData.sector_id}
                  onChange={(e) => handleSectorChange(e.target.value)}
                  disabled={loading}
                  required={formData.type === 'sector'}
                  options={[
                    { value: '', label: 'Selecione um setor' },
                    ...sectors.map(sector => ({
                      value: sector.id,
                      label: sector.name
                    }))
                  ]}
                  placeholder="Selecione um setor"
                />
              </div>

              {/* Subsetor */}
              {formData.type === 'subsector' && (
                <div>
                  <label className="label">
                    Subsetor <span className="text-red-500">*</span>
                  </label>
                  <FormSelect
                    value={formData.subsector_id}
                    onChange={(e) => {
                      const selectedSubsector = subsectors.find(s => s.id === e.target.value);
                      setFormData({ ...formData, subsector_id: e.target.value, group_id: '' });
                    }}
                    disabled={loading || !formData.sector_id}
                    required={formData.type === 'subsector'}
                    options={[
                      { value: '', label: 'Selecione um subsetor' },
                      ...getFilteredSubsectors().map(subsector => ({
                        value: subsector.id,
                        label: subsector.name
                      }))
                    ]}
                    placeholder="Selecione um subsetor"
                  />
                </div>
              )}

              {/* Grupo de Mensagem */}
              {(formData.sector_id || formData.subsector_id) && (
                <div className={formData.type === 'sector' ? 'md:col-span-1' : 'md:col-span-2'}>
                  <label className="label">Grupo da Mensagem (Opcional)</label>
                  <FormSelect
                    value={formData.group_id}
                    onChange={(e) => {
                      const selectedGroup = messageGroups.find(g => g.id === e.target.value);
                      setFormData({ ...formData, group_id: e.target.value });
                    }}
                    disabled={loading}
                    options={[
                      { value: '', label: 'Sem grupo específico' },
                      ...messageGroups.map(group => ({
                        value: group.id,
                        label: group.name
                      }))
                    ]}
                    placeholder="Sem grupo específico"
                  />
                  {messageGroups.length === 0 && (formData.sector_id || formData.subsector_id) && (
                    <p className="text-sm text-gray-500 mt-1">
                      Nenhum grupo disponível para este {formData.type === 'sector' ? 'setor' : 'subsetor'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Título */}
            <div>
              <label className="label">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
                className="input"
                placeholder="Digite o título da mensagem..."
                required
                maxLength={500}
              />
            </div>

            {/* Conteúdo */}
            <div>
              <label className="label">
                Conteúdo <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                disabled={loading}
                rows={6}
                className="input resize-y"
                placeholder="Digite o conteúdo da mensagem..."
                required
              />
            </div>

            {/* Status de Publicação */}
            <div className="card p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => {
                    setFormData({ ...formData, is_published: e.target.checked });
                  }}
                  disabled={loading}
                  className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900">
                    {formData.is_published ? 'Publicar imediatamente' : 'Salvar como rascunho'}
                  </span>
                  <p className="text-xs text-gray-500">
                    {formData.is_published 
                      ? 'A mensagem ficará visível para os usuários imediatamente'
                      : 'A mensagem ficará salva como rascunho e pode ser publicada depois'
                    }
                  </p>
                </div>
              </label>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <StandardizedButton
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </StandardizedButton>
              
              <StandardizedButton
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                {loading 
                  ? 'Salvando...' 
                  : message 
                    ? 'Atualizar Mensagem' 
                    : 'Criar Mensagem'
                }
              </StandardizedButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}