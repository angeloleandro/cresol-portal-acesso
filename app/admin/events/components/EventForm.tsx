'use client';

import React, { useState, useEffect } from 'react';

import { StandardizedButton } from '@/app/components/admin';
import { useAlert } from '@/app/components/alerts';
import { FormSelect } from '@/app/components/forms';
import { Icon } from '@/app/components/icons/Icon';
import { supabase } from '@/lib/supabase';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  type: 'sector' | 'subsector';
  location_name?: string;
  location_id?: string;
  sector_name?: string;
}

interface EventFormProps {
  event?: Event | null;
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

interface FormData {
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  type: 'sector' | 'subsector';
  sector_id: string;
  subsector_id: string;
  is_featured: boolean;
  is_published: boolean;
}

/**
 * EventForm function
 * @todo Add proper documentation
 */
export function EventForm({ event, isOpen, onClose, onSuccess }: EventFormProps) {
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    type: 'sector',
    sector_id: '',
    subsector_id: '',
    is_featured: false,
    is_published: true,
  });

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      const _timestamp = new Date().toISOString();
      
      loadInitialData();
      
      if (event) {
        setFormData({
          title: event.title,
          description: event.description,
          location: event.location,
          start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
          end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
          type: event.type,
          sector_id: event.type === 'sector' ? event.location_id || '' : '',
          subsector_id: event.type === 'subsector' ? event.location_id || '' : '',
          is_featured: event.is_featured,
          is_published: event.is_published,
        });
      } else {
        
        setFormData({
          title: '',
          description: '',
          location: '',
          start_date: '',
          end_date: '',
          type: 'sector',
          sector_id: '',
          subsector_id: '',
          is_featured: false,
          is_published: true,
        });
      }
    }
  }, [isOpen, event]);

  const loadInitialData = async () => {
    const _timestamp = new Date().toISOString();
        
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

    }
  };

  const getFilteredSubsectors = () => {
    if (!formData.sector_id) return subsectors;
    return subsectors.filter(sub => sub.sector_id === formData.sector_id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const _timestamp = new Date().toISOString();
    
    // Debug form submission logging removed for production
    
    // Validações
    if (!formData.title.trim()) {
      // Erro de validação: título vazio
      alert.showError('Campo obrigatório', 'Título é obrigatório');
      return;
    }
    
    if (formData.title.trim().length > 255) {
      alert.showError('Título muito longo', 'Título deve ter no máximo 255 caracteres');
      return;
    }
    
    if (!formData.description.trim()) {
      // Erro de validação: descrição vazia
      alert.showError('Campo obrigatório', 'Descrição é obrigatória');
      return;
    }

    if (formData.description.trim().length > 2000) {
      alert.showError('Descrição muito longa', 'Descrição deve ter no máximo 2.000 caracteres');
      return;
    }

    if (!formData.location.trim()) {
      // Erro de validação: local vazio
      alert.showError('Campo obrigatório', 'Local é obrigatório');
      return;
    }

    if (formData.location.trim().length > 500) {
      alert.showError('Local muito longo', 'Local deve ter no máximo 500 caracteres');
      return;
    }
    
    if (!formData.start_date) {

      alert.showError('Campo obrigatório', 'Data de início é obrigatória');
      return;
    }

    // Validar data de fim se fornecida
    if (formData.end_date && formData.start_date >= formData.end_date) {
      alert.showError('Erro de data', 'Data de fim deve ser posterior à data de início');
      return;
    }

    if (formData.type === 'sector' && !formData.sector_id) {

      alert.showError('Campo obrigatório', 'Setor é obrigatório para eventos de setor');
      return;
    }

    if (formData.type === 'subsector' && !formData.subsector_id) {

      alert.showError('Campo obrigatório', 'Subsetor é obrigatório para eventos de subsetor');
      return;
    }

    // Debug form validation logging removed for production

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
        description: formData.description.trim(),
        location: formData.location.trim(),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        type: formData.type,
        is_featured: formData.is_featured,
        is_published: formData.is_published,
        ...(formData.type === 'sector' 
          ? { sector_id: formData.sector_id }
          : { subsector_id: formData.subsector_id }
        ),
      };

      const url = '/api/admin/events';
      let method = 'POST';
      
      if (event) {
        // Editando evento existente
        method = 'PUT';
        requestData.id = event.id;
        requestData.type = event.type; // Manter tipo original
      }

      // Debug API request logging removed for production

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
          // Erro ao parsear response de erro
          errorData = { error: 'Erro desconhecido na API' };
        }

        throw new Error(errorData.error || 'Erro ao salvar evento');
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
          event ? 'Evento atualizado com sucesso' : 'Evento criado com sucesso'
        );
        onSuccess();
        onClose();
      } else {

        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      const _errorTimestamp = new Date().toISOString();

      alert.showError('Erro', error.message || 'Erro ao salvar evento');
    } finally {
      const _finalTimestamp = new Date().toISOString();
            setLoading(false);
    }
  };

  const handleTypeChange = (newType: 'sector' | 'subsector') => {
    const _timestamp = new Date().toISOString();
    
    setFormData({
      ...formData,
      type: newType,
      sector_id: '',
      subsector_id: '',
    });

      };

  const handleSectorChange = (sectorId: string) => {
    const _timestamp = new Date().toISOString();
    const _selectedSector = sectors.find(s => s.id === sectorId);

    setFormData({
      ...formData,
      sector_id: sectorId,
      subsector_id: '', // Reset subsetor quando setor muda
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
              {event ? 'Editar Evento' : 'Novo Evento'}
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
            {/* Tipo de Evento */}
            <div>
              <label className="label">Tipo de Evento</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="sector"
                    checked={formData.type === 'sector'}
                    onChange={(e) => handleTypeChange(e.target.value as 'sector')}
                    disabled={loading || !!event} // Não permitir mudar tipo na edição
                    className="mr-2"
                  />
                  <span>Evento de Setor</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="subsector"
                    checked={formData.type === 'subsector'}
                    onChange={(e) => handleTypeChange(e.target.value as 'subsector')}
                    disabled={loading || !!event} // Não permitir mudar tipo na edição
                    className="mr-2"
                  />
                  <span>Evento de Subsetor</span>
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
                  onChange={(e) => handleSectorChange(e.currentTarget.value)}
                  disabled={loading}
                  placeholder="Selecione um setor"
                  options={sectors.map(sector => ({
                    value: sector.id,
                    label: sector.name
                  }))}
                  required={formData.type === 'sector'}
                  fullWidth
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
                      const _timestamp = new Date().toISOString();
                      const _selectedSubsector = subsectors.find(s => s.id === e.currentTarget.value);
                      setFormData({ ...formData, subsector_id: e.currentTarget.value });
                    }}
                    disabled={loading || !formData.sector_id}
                    placeholder="Selecione um subsetor"
                    options={getFilteredSubsectors().map(subsector => ({
                      value: subsector.id,
                      label: subsector.name
                    }))}
                    required={formData.type === 'subsector'}
                    fullWidth
                  />
                </div>
              )}
            </div>

            {/* Título */}
            <div>
              <label className="label">
                Título <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">
                  ({formData.title.length}/255)
                </span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
                className={`input ${
                  formData.title.length > 255 ? 'border-red-300 focus:border-red-500' : ''
                }`}
                placeholder="Digite o título do evento..."
                required
                maxLength={255}
              />
              {formData.title.length > 255 && (
                <p className="text-xs text-red-600 mt-1">Máximo de 255 caracteres</p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="label">
                Descrição <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">
                  ({formData.description.length}/2000)
                </span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
                rows={4}
                className={`input resize-y ${
                  formData.description.length > 2000 ? 'border-red-300 focus:border-red-500' : ''
                }`}
                placeholder="Digite a descrição do evento..."
                required
                maxLength={2000}
              />
              {formData.description.length > 2000 && (
                <p className="text-xs text-red-600 mt-1">Máximo de 2.000 caracteres</p>
              )}
            </div>

            {/* Local */}
            <div>
              <label className="label">
                Local <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">
                  ({formData.location.length}/500)
                </span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={loading}
                className={`input ${
                  formData.location.length > 500 ? 'border-red-300 focus:border-red-500' : ''
                }`}
                placeholder="Digite o local do evento..."
                required
                maxLength={500}
              />
              {formData.location.length > 500 && (
                <p className="text-xs text-red-600 mt-1">Máximo de 500 caracteres</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Data de Início */}
              <div>
                <label className="label">
                  Data de Início <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  disabled={loading}
                  className="input"
                  required
                />
              </div>

              {/* Data de Fim */}
              <div>
                <label className="label">
                  Data de Fim (Opcional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  disabled={loading}
                  className="input"
                  min={formData.start_date}
                />
                {formData.end_date && formData.start_date && formData.start_date >= formData.end_date && (
                  <p className="text-xs text-red-600 mt-1">Data de fim deve ser posterior à data de início</p>
                )}
              </div>
            </div>

            {/* Opções */}
            <div className="card p-4 space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Opções de Publicação</h3>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => {
                    const _timestamp = new Date().toISOString();
                                        setFormData({ ...formData, is_featured: e.target.checked });
                  }}
                  disabled={loading}
                  className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900">
                    Destacar evento
                  </span>
                  <p className="text-xs text-gray-500">
                    O evento aparecerá na seção de destaques
                  </p>
                </div>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => {
                    const _timestamp = new Date().toISOString();
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
                      ? 'O evento ficará visível para os usuários imediatamente'
                      : 'O evento ficará salvo como rascunho e pode ser publicado depois'
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
                  : event 
                    ? 'Atualizar Evento' 
                    : 'Criar Evento'
                }
              </StandardizedButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}