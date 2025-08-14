'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import OptimizedImage from '@/app/components/OptimizedImage';
import AuthDebugPanel from '@/app/components/AuthDebugPanel';
import Link from 'next/link';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useAuth } from '@/app/providers/AuthProvider';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

interface Sector {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface SectorNews {
  id: string;
  sector_id: string;
  title: string;
  summary: string;
  content: string;
  created_at: string;
  is_published: boolean;
  image_url?: string;
}

interface SectorEvent {
  id: string;
  sector_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  is_published: boolean;
  location?: string;
}

export default function SectorContentManagement() {
  const router = useRouter();
  const params = useParams();
  const sectorId = params.id as string;
  
  const { user, profile, isAuthenticated, isSectorAdmin, loading: authLoading, signOut: authSignOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState<Sector | null>(null);
  const [news, setNews] = useState<SectorNews[]>([]);
  const [showDebug, setShowDebug] = useState(true); // Debug panel visibility
  const [events, setEvents] = useState<SectorEvent[]>([]);
  const [activeTab, setActiveTab] = useState('news');
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Cliente Supabase autenticado
  const supabase = useSupabaseClient();

  // Estados para o formulário de notícias
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [newsForm, setNewsForm] = useState({
    id: '',
    title: '',
    summary: '',
    content: '',
    is_published: true,
    image_url: ''
  });
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null);
  const [newsImagePreview, setNewsImagePreview] = useState<string | null>(null);
  
  // Estados para o formulário de eventos
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    id: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    is_published: true
  });

  const fetchSector = useCallback(async () => {
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .eq('id', sectorId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar setor:', error);
      return;
    }
    
    setSector(data);
  }, [sectorId]);

  const fetchNews = useCallback(async () => {
    const { data, error } = await supabase
      .from('sector_news')
      .select('*')
      .eq('sector_id', sectorId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar notícias:', error);
      return;
    }
    
    setNews(data || []);
  }, [sectorId]);

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from('sector_events')
      .select('*')
      .eq('sector_id', sectorId)
      .order('start_date', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar eventos:', error);
      return;
    }
    
    setEvents(data || []);
  }, [sectorId]);

  // Verificação de autenticação com novo hook
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      // Aguardar autenticação ser inicializada
      if (authLoading) return;
      
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      // Verificar autorização usando o profile do contexto
      if (profile?.role === 'admin') {
        setIsAuthorized(true);
      } else if (profile?.role === 'sector_admin') {
        // Verificar se é admin deste setor específico
        const { data: sectorAdmin } = await supabase
          .from('sector_admins')
          .select('*')
          .eq('user_id', user!.id)
          .eq('sector_id', sectorId);
        
        if (sectorAdmin && sectorAdmin.length > 0) {
          setIsAuthorized(true);
        } else {
          // Redirecionar usuários não autorizados para o dashboard
          router.replace('/admin-setor');
          return;
        }
      } else {
        // Redirecionar usuários regulares para o dashboard
        router.replace('/dashboard');
        return;
      }

      // Carregar dados se autorizado
      await Promise.all([
        fetchSector(),
        fetchNews(),
        fetchEvents()
      ]);
      
      setLoading(false);
    };

    checkAuthAndLoadData();
  }, [isAuthenticated, authLoading, profile, user, sectorId, router, fetchEvents, fetchNews, fetchSector]);

  const handleNewsImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Verificar o tipo de arquivo - apenas formatos otimizados para web
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Por favor, selecione apenas arquivos PNG, JPG ou WebP.');
        return;
      }
      
      // Verificar o tamanho do arquivo (limite de 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter menos de 2MB.');
        return;
      }
      
      // Verificar dimensões mínimas recomendadas para notícias
      const img = new Image();
      img.onload = () => {
        // Limpar URL anterior se existir
        if (newsImagePreview && newsImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(newsImagePreview);
        }
        
        // Verificar dimensões mínimas (recomendado: pelo menos 300x200)
        if (img.width < 300 || img.height < 200) {
          alert('Para melhor qualidade, recomendamos imagens com pelo menos 300x200 pixels.');
        }
        
        setNewsImageFile(file);
        
        // Criar URL temporária para preview
        const previewUrl = URL.createObjectURL(file);
        setNewsImagePreview(previewUrl);
        
        URL.revokeObjectURL(img.src); // Limpar URL temporária
      };
      
      img.src = URL.createObjectURL(file);
    }
  };

  const uploadNewsImage = async () => {
    if (!newsImageFile || !user) return null;
    
    try {
      // Gerar um nome único e otimizado para o arquivo
      const fileExt = newsImageFile.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileName = `sector-news/${sectorId}/${timestamp}_${randomSuffix}.${fileExt}`;
      
      // Fazer upload para o bucket 'images' no Supabase Storage
      // Configurações otimizadas para Vercel/Next.js
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, newsImageFile, {
          cacheControl: '31536000', // 1 ano para cache (imagens raramente mudam)
          upsert: false, // Não sobrescrever para evitar problemas de cache
          contentType: newsImageFile.type, // Definir tipo MIME correto
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Obter a URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
      
      // Adicionar parâmetros de transformação do Supabase para otimização
      // Isso funciona bem com a otimização de imagens do Vercel
      const optimizedUrl = `${publicUrl}?quality=85&format=webp`;
      
      return optimizedUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [handleNewsSubmit] Iniciando submissão de notícia');
    console.log('📋 [handleNewsSubmit] Dados do formulário:', newsForm);
    console.log('👤 [handleNewsSubmit] Usuário atual:', user);
    console.log('🆔 [handleNewsSubmit] Setor ID:', sectorId);
    
    try {
      let imageUrl = newsForm.image_url;
      
      // Se houver uma nova imagem, fazer o upload
      if (newsImageFile) {
        imageUrl = await uploadNewsImage() || '';
      }
      
      const newsData = {
        sector_id: sectorId,
        title: newsForm.title,
        summary: newsForm.summary,
        content: newsForm.content,
        is_published: newsForm.is_published,
        image_url: imageUrl
      };
      
      console.log('📦 [handleNewsSubmit] Dados preparados para envio:', newsData);
      console.log('🔍 [handleNewsSubmit] Modo:', newsForm.id ? 'UPDATE' : 'CREATE');
      
      if (newsForm.id) {
        // Atualizar notícia existente via API
        const response = await fetch('/api/admin/sector-content', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'sector_news',
            id: newsForm.id,
            data: newsData
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao atualizar notícia');
        }
      } else {
        // Criar nova notícia via API
        console.log('📡 [handleNewsSubmit] Enviando POST para /api/admin/sector-content');
        const requestBody = {
          type: 'sector_news',
          data: newsData
        };
        console.log('📤 [handleNewsSubmit] Body da requisição:', requestBody);
        
        const response = await fetch('/api/admin/sector-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log('📥 [handleNewsSubmit] Resposta recebida:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        
        if (!response.ok) {
          const error = await response.json();
          console.error('❌ [handleNewsSubmit] Erro na resposta:', error);
          console.error('❌ [handleNewsSubmit] Status:', response.status);
          throw new Error(error.error || 'Erro ao criar notícia');
        }
        
        const result = await response.json();
        console.log('✅ [handleNewsSubmit] Notícia criada com sucesso:', result);
      }
      
      // Limpar formulário e atualizar lista
      setNewsForm({ id: '', title: '', summary: '', content: '', is_published: true, image_url: '' });
      setNewsImageFile(null);
      if (newsImagePreview) {
        URL.revokeObjectURL(newsImagePreview);
        setNewsImagePreview(null);
      }
      setShowNewsForm(false);
      fetchNews();
      console.log('🔄 [handleNewsSubmit] Lista de notícias atualizada');
    } catch (error: any) {
      console.error('💥 [handleNewsSubmit] Erro geral ao salvar notícia:', error);
      console.error('💥 [handleNewsSubmit] Stack trace:', error.stack);
      alert(`Erro ao salvar notícia: ${error.message}`);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventData = {
        sector_id: sectorId,
        title: eventForm.title,
        description: eventForm.description,
        start_date: eventForm.start_date,
        end_date: eventForm.end_date || null,
        location: eventForm.location || null,
        is_published: eventForm.is_published
      };
      
      if (eventForm.id) {
        // Atualizar evento existente via API
        const response = await fetch('/api/admin/sector-content', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'sector_events',
            id: eventForm.id,
            data: eventData
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao atualizar evento');
        }
      } else {
        // Criar novo evento via API
        const response = await fetch('/api/admin/sector-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'sector_events',
            data: eventData
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao criar evento');
        }
      }
      
      // Limpar formulário e atualizar lista
      setEventForm({ id: '', title: '', description: '', start_date: '', end_date: '', location: '', is_published: true });
      setShowEventForm(false);
      fetchEvents();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      alert('Erro ao salvar evento. Tente novamente.');
    }
  };

  const editNews = (item: SectorNews) => {
    setNewsForm({
      id: item.id,
      title: item.title,
      summary: item.summary,
      content: item.content,
      is_published: item.is_published,
      image_url: item.image_url || ''
    });
    
    if (item.image_url) {
      setNewsImagePreview(item.image_url);
    } else {
      setNewsImagePreview(null);
    }
    
    setShowNewsForm(true);
    setActiveTab('news');
  };

  const editEvent = (item: SectorEvent) => {
    // Formatando a data para o formato esperado pelo input type="datetime-local"
    const startDate = new Date(item.start_date);
    const formattedStartDate = startDate.toISOString().slice(0, 16);
    const formattedEndDate = item.end_date ? new Date(item.end_date).toISOString().slice(0, 16) : '';
    
    setEventForm({
      id: item.id,
      title: item.title,
      description: item.description,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      location: item.location || '',
      is_published: item.is_published
    });
    
    setShowEventForm(true);
    setActiveTab('events');
  };

  const deleteNews = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return;
    
    try {
      const response = await fetch(`/api/admin/sector-content?type=sector_news&id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir notícia');
      }
      
      fetchNews();
    } catch (error) {
      console.error('Erro ao excluir notícia:', error);
      alert('Erro ao excluir notícia. Tente novamente.');
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    
    try {
      const response = await fetch(`/api/admin/sector-content?type=sector_events&id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir evento');
      }
      
      fetchEvents();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert('Erro ao excluir evento. Tente novamente.');
    }
  };

  const handleLogout = async () => {
    await authSignOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
  <UnifiedLoadingSpinner 
        fullScreen
        size="large" 
        message={LOADING_MESSAGES.sectors}
      />
        </div>
      </div>
    );
  }

  if (!sector) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Setor não encontrado.</p>
          <Link href="/admin-setor" className="mt-4 text-primary hover:underline block">
            Voltar para o Painel
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Você não tem autorização para acessar esta página.</p>
          <Link href="/admin-setor" className="mt-4 text-primary hover:underline block">
            Voltar para o Painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative h-10 w-24 mr-4">
              <OptimizedImage 
                src="/logo-horizontal-laranja.svg" 
                alt="Logo Cresol" 
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Painel Admin Setorial</h1>
          </div>
          
          <div className="flex items-center">
            <Link href="/admin-setor" className="text-sm text-gray-600 mr-4 hover:text-primary">
              Painel
            </Link>
            <Link href="/dashboard" className="text-sm text-gray-600 mr-4 hover:text-primary">
              Dashboard
            </Link>
            <span className="text-sm text-gray-600 mr-4">
              Olá, {user?.user_metadata?.full_name || user?.email}
            </span>
            <button 
              onClick={handleLogout}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link 
            href="/admin-setor" 
            className="inline-flex items-center text-sm text-cresol-gray hover:text-primary mb-4"
          >
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para o Painel
          </Link>
          
          <h2 className="text-2xl font-bold text-primary">Gerenciar Conteúdo do Setor</h2>
          <p className="text-cresol-gray mt-1">Setor: {sector.name}</p>
        </div>
        
        {/* Abas */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('news')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'news' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notícias
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'events' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Eventos
            </button>
          </div>
        </div>
        
        {/* Conteúdo das abas */}
        <div>
          {/* Aba de Notícias */}
          {activeTab === 'news' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Notícias do Setor</h3>
                <button
                  onClick={() => {
                    setNewsForm({ id: '', title: '', summary: '', content: '', is_published: true, image_url: '' });
                    setNewsImageFile(null);
                    setNewsImagePreview(null);
                    setShowNewsForm(true);
                  }}
                  className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark text-sm"
                >
                  Adicionar Notícia
                </button>
              </div>
              
              {showNewsForm && (
                <div className="bg-white p-4 rounded-md border border-gray-200 mb-6">
                  <h4 className="text-lg font-medium mb-3">
                    {newsForm.id ? 'Editar Notícia' : 'Nova Notícia'}
                  </h4>
                  <form onSubmit={handleNewsSubmit}>
                    <div className="mb-4">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={newsForm.title}
                        onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                        Resumo
                      </label>
                      <textarea
                        id="summary"
                        value={newsForm.summary}
                        onChange={(e) => setNewsForm({...newsForm, summary: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md h-20"
                        placeholder="Breve resumo da notícia"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        Conteúdo Completo
                      </label>
                      <textarea
                        id="content"
                        value={newsForm.content}
                        onChange={(e) => setNewsForm({...newsForm, content: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                        placeholder="Conteúdo detalhado da notícia"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagem da Notícia *
                      </label>
                      <div className="space-y-3">
                        {newsImagePreview && (
                          <div className="relative h-32 w-full max-w-sm mx-auto border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <OptimizedImage
                              src={newsImagePreview}
                              alt="Preview da imagem da notícia"
                              fill
                              className="object-cover"
                              context="thumbnail"
                              priority={false}
                              sizes="(max-width: 384px) 100vw, 384px"
                              placeholder="blur"
                              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAhEQACAQIHAQAAAAAAAAAAAAABAgADBBEFITEUIkFRkf/aAAwDAQACEQMRAD8A0XYOBbY5jqTH9W/D2vCfVNKqVMYjV0YKTcL5EkCy/9k="
                            />
                            <div className="absolute top-2 right-2">
                              <button
                                type="button"
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm transition-colors"
                                onClick={() => {
                                  if (newsImagePreview && newsImagePreview.startsWith('blob:')) {
                                    URL.revokeObjectURL(newsImagePreview);
                                  }
                                  setNewsImagePreview(null);
                                  setNewsImageFile(null);
                                  setNewsForm({...newsForm, image_url: ''});
                                }}
                                title="Remover imagem"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                              </svg>
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, WebP até 2MB</p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/png,image/jpeg,image/jpg,image/webp"
                              onChange={handleNewsImageChange}
                            />
                          </label>
                        </div>
                        
                        {newsImagePreview && (
                          <p className="text-xs text-gray-500 text-center">
                            Imagem selecionada. Use o botão ✕ para remover.
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_published"
                          checked={newsForm.is_published}
                          onChange={(e) => setNewsForm({...newsForm, is_published: e.target.checked})}
                          className="h-4 w-4 text-primary border-gray-300 rounded-sm"
                        />
                        <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
                          Publicar imediatamente
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowNewsForm(false)}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                      >
                        Salvar
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {news.length === 0 ? (
                <div className="bg-white p-6 rounded-md border border-gray-200 text-center">
                  <p className="text-gray-500">Nenhuma notícia cadastrada para este setor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {news.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-md border border-gray-200 flex flex-col sm:flex-row">
                      {item.image_url && (
                        <div className="sm:w-1/4 mb-3 sm:mb-0 sm:mr-4">
                          <div className="relative h-40 w-full sm:h-full">
                            <OptimizedImage
                              src={item.image_url}
                              alt={item.title}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        </div>
                      )}
                      <div className={`${item.image_url ? 'sm:w-3/4' : 'w-full'}`}>
                        <div className="flex justify-between mb-2">
                          <h3 className="text-lg font-medium">{item.title}</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => editNews(item)}
                              className="text-primary hover:text-primary-dark"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteNews(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-1 font-medium">{item.summary}</p>
                        <p className="text-gray-600 mb-2">{item.content}</p>
                        <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                          <span>
                            {new Date(item.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.is_published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.is_published ? 'Publicado' : 'Não publicado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Aba de Eventos */}
          {activeTab === 'events' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Eventos do Setor</h3>
                <button
                  onClick={() => {
                    setEventForm({ id: '', title: '', description: '', start_date: '', end_date: '', location: '', is_published: true });
                    setShowEventForm(true);
                  }}
                  className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark text-sm"
                >
                  Adicionar Evento
                </button>
              </div>
              
              {showEventForm && (
                <div className="bg-white p-4 rounded-md border border-gray-200 mb-6">
                  <h4 className="text-lg font-medium mb-3">
                    {eventForm.id ? 'Editar Evento' : 'Novo Evento'}
                  </h4>
                  <form onSubmit={handleEventSubmit}>
                    <div className="mb-4">
                      <label htmlFor="event_title" className="block text-sm font-medium text-gray-700 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        id="event_title"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="event_description" className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        id="event_description"
                        value={eventForm.description}
                        onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                        Data e Hora de Início
                      </label>
                      <input
                        type="datetime-local"
                        id="start_date"
                        value={eventForm.start_date}
                        onChange={(e) => setEventForm({...eventForm, start_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                        Data e Hora de Término (opcional)
                      </label>
                      <input
                        type="datetime-local"
                        id="end_date"
                        value={eventForm.end_date}
                        onChange={(e) => setEventForm({...eventForm, end_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="event_location" className="block text-sm font-medium text-gray-700 mb-1">
                        Local (opcional)
                      </label>
                      <input
                        type="text"
                        id="event_location"
                        value={eventForm.location}
                        onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="event_is_published"
                          checked={eventForm.is_published}
                          onChange={(e) => setEventForm({...eventForm, is_published: e.target.checked})}
                          className="h-4 w-4 text-primary border-gray-300 rounded-sm"
                        />
                        <label htmlFor="event_is_published" className="ml-2 text-sm text-gray-700">
                          Publicar imediatamente
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowEventForm(false)}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                      >
                        Salvar
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {events.length === 0 ? (
                <div className="bg-white p-6 rounded-md border border-gray-200 text-center">
                  <p className="text-gray-500">Nenhum evento cadastrado para este setor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-md border border-gray-200">
                      <div className="flex justify-between mb-2">
                        <h3 className="text-lg font-medium">{item.title}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editEvent(item)}
                            className="text-primary hover:text-primary-dark"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteEvent(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{item.description}</p>
                      
                      <div className="flex flex-wrap items-center mt-3 text-sm text-gray-500">
                        <div className="flex items-center mr-4 mb-2">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {new Date(item.start_date).toLocaleDateString('pt-BR')} às {new Date(item.start_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            {item.end_date && (
                              <>
                                {' até '}
                                {new Date(item.end_date).toLocaleDateString('pt-BR')} às {new Date(item.end_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </>
                            )}
                          </span>
                        </div>
                        
                        {item.location && (
                          <div className="flex items-center mr-4 mb-2">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{item.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.is_published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.is_published ? 'Publicado' : 'Não publicado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Componente de Debug de Autenticação */}
      {showDebug && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowDebug(false)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <AuthDebugPanel />
        </div>
      )}
    </div>
  );
} 