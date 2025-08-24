'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';

import { StandardizedButton } from '@/app/components/admin';
import { useAlert } from '@/app/components/alerts';
import { FormSelect } from '@/app/components/forms';
import { Icon } from '@/app/components/icons/Icon';
import { supabase } from '@/lib/supabase';

interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  type: 'sector' | 'subsector';
  location_name?: string;
  location_id?: string;
  sector_name?: string;
}

interface NewsFormProps {
  news?: News | null;
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
  summary: string;
  content: string;
  type: 'sector' | 'subsector';
  sector_id: string;
  subsector_id: string;
  image_url: string;
  is_featured: boolean;
  is_published: boolean;
}

/**
 * NewsForm function
 * @todo Add proper documentation
 */
export function NewsForm({ news, isOpen, onClose, onSuccess }: NewsFormProps) {
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState<FormData>({
    title: '',
    summary: '',
    content: '',
    type: 'sector',
    sector_id: '',
    subsector_id: '',
    image_url: '',
    is_featured: false,
    is_published: false
  });

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      
      if (news) {
        setFormData({
          title: news.title,
          summary: news.summary,
          content: news.content,
          type: news.type,
          sector_id: news.type === 'sector' ? (news.location_id || '') : '',
          subsector_id: news.type === 'subsector' ? (news.location_id || '') : '',
          image_url: news.image_url || '',
          is_featured: news.is_featured,
          is_published: news.is_published
        });

        if (news.image_url) {
          setImagePreview(news.image_url);
        }
      } else {
        setFormData({
          title: '',
          summary: '',
          content: '',
          type: 'sector',
          sector_id: '',
          subsector_id: '',
          image_url: '',
          is_featured: false,
          is_published: false
        });

        setImagePreview('');
      }
    }
  }, [isOpen, news]);

  const loadInitialData = async () => {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert.showError('Arquivo inválido', 'Por favor, selecione uma imagem');
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert.showError('Arquivo muito grande', 'A imagem deve ter no máximo 5MB');
        return;
      }

      setImageFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, image_url: '' });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image_url || null;

    try {
      const fileName = `news-${Date.now()}-${Math.random().toString(36).substring(7)}.${imageFile.name.split('.').pop()}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, imageFile, {
          upsert: false
        });

      if (error) {

        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {

      throw new Error('Erro ao fazer upload da imagem');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.title.trim()) {
      alert.showError('Campo obrigatório', 'Título é obrigatório');
      return;
    }
    
    if (formData.title.trim().length > 255) {
      alert.showError('Título muito longo', 'Título deve ter no máximo 255 caracteres');
      return;
    }
    
    if (!formData.summary.trim()) {
      alert.showError('Campo obrigatório', 'Resumo é obrigatório');
      return;
    }

    if (formData.summary.trim().length > 500) {
      alert.showError('Resumo muito longo', 'Resumo deve ter no máximo 500 caracteres');
      return;
    }
    
    if (!formData.content.trim()) {
      alert.showError('Campo obrigatório', 'Conteúdo é obrigatório');
      return;
    }

    if (formData.content.trim().length > 10000) {
      alert.showError('Conteúdo muito longo', 'Conteúdo deve ter no máximo 10.000 caracteres');
      return;
    }

    if (formData.type === 'sector' && !formData.sector_id) {
      alert.showError('Campo obrigatório', 'Setor é obrigatório para notícias de setor');
      return;
    }

    if (formData.type === 'subsector' && !formData.subsector_id) {
      alert.showError('Campo obrigatório', 'Subsetor é obrigatório para notícias de subsetor');
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

      // Upload da imagem se houver
      let finalImageUrl: string | null = formData.image_url;
      if (imageFile) {
        finalImageUrl = await uploadImage();
      }

      // Preparar dados para envio
      const requestData: any = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        image_url: finalImageUrl,
        is_featured: formData.is_featured,
        is_published: formData.is_published,
        ...(formData.type === 'sector' 
          ? { sector_id: formData.sector_id }
          : { subsector_id: formData.subsector_id }
        ),
      };

      const url = '/api/admin/news';
      let method = 'POST';
      
      if (news) {
        // Editando notícia existente
        method = 'PUT';
        requestData.id = news.id;
        requestData.type = news.type; // Manter tipo original
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

        throw new Error(errorData.error || 'Erro ao salvar notícia');
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
          news ? 'Notícia atualizada com sucesso' : 'Notícia criada com sucesso'
        );
        onSuccess();
        onClose();
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      alert.showError('Erro', error.message || 'Erro ao salvar notícia');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (newType: 'sector' | 'subsector') => {
    setFormData({
      ...formData,
      type: newType,
      sector_id: '',
      subsector_id: ''
    });
  };

  const handleSectorChange = (sectorId: string) => {
    setFormData({
      ...formData,
      sector_id: sectorId,
      subsector_id: '' // Reset subsetor quando setor muda
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
              {news ? 'Editar Notícia' : 'Nova Notícia'}
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
            {/* Tipo de Notícia */}
            <div>
              <label className="label">Tipo de Notícia</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="sector"
                    checked={formData.type === 'sector'}
                    onChange={(e) => handleTypeChange(e.target.value as 'sector')}
                    disabled={loading || !!news} // Não permitir mudar tipo na edição
                    className="mr-2"
                  />
                  <span>Notícia de Setor</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="subsector"
                    checked={formData.type === 'subsector'}
                    onChange={(e) => handleTypeChange(e.target.value as 'subsector')}
                    disabled={loading || !!news} // Não permitir mudar tipo na edição
                    className="mr-2"
                  />
                  <span>Notícia de Subsetor</span>
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
                placeholder="Digite o título da notícia..."
                required
                maxLength={255}
              />
              {formData.title.length > 255 && (
                <p className="text-xs text-red-600 mt-1">Máximo de 255 caracteres</p>
              )}
            </div>

            {/* Resumo */}
            <div>
              <label className="label">
                Resumo <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">
                  ({formData.summary.length}/500)
                </span>
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                disabled={loading}
                rows={3}
                className={`input resize-y ${
                  formData.summary.length > 500 ? 'border-red-300 focus:border-red-500' : ''
                }`}
                placeholder="Digite um resumo da notícia..."
                required
                maxLength={500}
              />
              {formData.summary.length > 500 && (
                <p className="text-xs text-red-600 mt-1">Máximo de 500 caracteres</p>
              )}
            </div>

            {/* Conteúdo */}
            <div>
              <label className="label">
                Conteúdo <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">
                  ({formData.content.length}/10000)
                </span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                disabled={loading}
                rows={8}
                className={`input resize-y ${
                  formData.content.length > 10000 ? 'border-red-300 focus:border-red-500' : ''
                }`}
                placeholder="Digite o conteúdo completo da notícia..."
                required
                maxLength={10000}
              />
              {formData.content.length > 10000 && (
                <p className="text-xs text-red-600 mt-1">Máximo de 10.000 caracteres</p>
              )}
            </div>

            {/* Imagem */}
            <div>
              <label className="label">Imagem (Opcional)</label>
              
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={128}
                      height={128}
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              )}
            </div>

            <div className="card p-4 space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Opções de Publicação</h3>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => {
                    setFormData({ ...formData, is_featured: e.target.checked });
                  }}
                  disabled={loading}
                  className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900">
                    Destacar notícia
                  </span>
                  <p className="text-xs text-gray-500">
                    A notícia aparecerá na seção de destaques
                  </p>
                </div>
              </label>
              
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
                      ? 'A notícia ficará visível para os usuários imediatamente'
                      : 'A notícia ficará salva como rascunho e pode ser publicada depois'
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
                  : news 
                    ? 'Atualizar Notícia' 
                    : 'Criar Notícia'
                }
              </StandardizedButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}