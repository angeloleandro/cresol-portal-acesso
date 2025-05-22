'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Cropper from 'react-easy-crop';

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
  image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface SectorEvent {
  id: string;
  sector_id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Função para criar uma imagem a partir de um canvas para upload
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    // Verificar se estamos no ambiente do navegador
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined, cannot create image'));
      return;
    }
    
    // Usar o construtor global HTMLImageElement
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error: Event) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

// Função para obter o recorte final da imagem
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<{ file: Blob; url: string }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // Definir as dimensões do canvas para a área de recorte
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Translação para permitir rotação da imagem
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  // Desenhar a imagem recortada no canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Criar um blob do canvas
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Canvas is empty');
      }
      const url = URL.createObjectURL(blob);
      resolve({ file: blob, url });
    }, 'image/jpeg', 0.95);
  });
}

export default function SectorDashboard() {
  const router = useRouter();
  const params = useParams();
  const sectorId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState<Sector | null>(null);
  const [news, setNews] = useState<SectorNews[]>([]);
  const [events, setEvents] = useState<SectorEvent[]>([]);
  const [activeTab, setActiveTab] = useState('news');
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Notícia que está sendo editada/criada
  const [currentNews, setCurrentNews] = useState<Partial<SectorNews>>({
    title: '',
    summary: '',
    content: '',
    image_url: '',
    is_featured: false,
    is_published: false
  });
  
  // Evento que está sendo editado/criado
  const [currentEvent, setCurrentEvent] = useState<Partial<SectorEvent>>({
    title: '',
    description: '',
    location: '',
    start_date: new Date().toISOString(),
    end_date: null,
    is_featured: false,
    is_published: false
  });

  // Estados de modais
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Adicionando novos estados para lidar com upload de imagens
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Adicionando estados para o recorte de imagem
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        router.replace('/login');
        return;
      }

      setUser(userData.user);

      // Verificar se o usuário é admin ou admin do setor
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (profile?.role === 'admin') {
        setIsAuthorized(true);
      } else {
        // Verificar se é admin deste setor específico
        const { data: sectorAdmin } = await supabase
          .from('sector_admins')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('sector_id', sectorId);
        
        if (sectorAdmin && sectorAdmin.length > 0) {
          setIsAuthorized(true);
        } else {
          // Redirecionar usuários não autorizados para o dashboard
          router.replace('/dashboard');
          return;
        }
      }

      await Promise.all([
        fetchSector(),
        fetchNews(),
        fetchEvents()
      ]);
      
      setLoading(false);
    };

    checkUser();
  }, [sectorId, router]);

  const fetchSector = async () => {
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
  };

  const fetchNews = async () => {
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
  };

  const fetchEvents = async () => {
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
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };
  
  // Função para fazer upload de imagem para o Supabase Storage
  const uploadImage = async (file: File) => {
    try {
      setUploadingImage(true);
      
      // Gerar um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `sector-news/${sectorId}/${fileName}`;
      
      // Fazer upload para o bucket 'images' no Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw error;
      }
      
      // Obter a URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      // Atualizar o estado da notícia com a URL da imagem
      setCurrentNews({
        ...currentNews,
        image_url: publicUrl
      });
      
      // Criar uma URL para preview da imagem
      setImagePreview(URL.createObjectURL(file));
      
      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      alert('Falha ao fazer upload da imagem. Por favor, tente novamente.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Função para processar a conclusão do recorte
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  
  // Função para aplicar o recorte à imagem
  const handleCropImage = async () => {
    try {
      if (!originalImage || !croppedAreaPixels) return;
      
      setUploadingImage(true);
      
      const { file, url } = await getCroppedImg(
        originalImage, 
        croppedAreaPixels,
        rotation
      );
      
      // Criar um objeto File a partir do Blob
      const croppedFile = new File([file], 'cropped-image.jpg', { type: 'image/jpeg' });
      
      // Fazer upload da imagem recortada
      await uploadImage(croppedFile);
      
      // Limpar o editor de imagem
      setIsEditing(false);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    } catch (error) {
      console.error('Erro ao recortar imagem:', error);
      alert('Ocorreu um erro ao processar a imagem. Por favor, tente novamente.');
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Função para cancelar o recorte
  const handleCancelCrop = () => {
    setIsEditing(false);
    if (!currentNews.image_url) {
      setImagePreview(null);
    }
  };
  
  // Modificar a função handleFileChange para iniciar o editor de imagem
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Verificar tipo de arquivo (apenas imagens)
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }
    
    // Verificar tamanho do arquivo (limite de 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('O arquivo é muito grande. Por favor, selecione uma imagem com menos de 5MB.');
      return;
    }
    
    // Criar URL para a imagem original
    const fileUrl = URL.createObjectURL(file);
    setOriginalImage(fileUrl);
    setImagePreview(fileUrl);
    setIsEditing(true);
  };
  
  // Funções para notícias
  const handleOpenNewsModal = (news?: SectorNews) => {
    if (news) {
      setCurrentNews(news);
      setIsEditing(true);
      setImagePreview(news.image_url);
    } else {
      setCurrentNews({
        title: '',
        summary: '',
        content: '',
        image_url: '',
        is_featured: false,
        is_published: false
      });
      setIsEditing(false);
      setImagePreview(null);
    }
    setIsNewsModalOpen(true);
  };
  
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentNews.title || !currentNews.summary || !currentNews.content) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    try {
      if (isEditing && currentNews.id) {
        await supabase
          .from('sector_news')
          .update({ 
            ...currentNews,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentNews.id);
      } else {
        await supabase
          .from('sector_news')
          .insert([{ 
            ...currentNews,
            sector_id: sectorId,
            created_by: user.id
          }]);
      }
      
      setIsNewsModalOpen(false);
      fetchNews();
    } catch (error) {
      console.error('Erro ao salvar notícia:', error);
      alert('Ocorreu um erro ao salvar a notícia.');
    }
  };
  
  const handleDeleteNews = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      await supabase
        .from('sector_news')
        .delete()
        .eq('id', id);
      
      fetchNews();
    } catch (error) {
      console.error('Erro ao excluir notícia:', error);
    }
  };
  
  // Funções para eventos
  const handleOpenEventModal = (event?: SectorEvent) => {
    if (event) {
      setCurrentEvent(event);
      setIsEditing(true);
    } else {
      setCurrentEvent({
        title: '',
        description: '',
        location: '',
        start_date: new Date().toISOString(),
        end_date: null,
        is_featured: false,
        is_published: false
      });
      setIsEditing(false);
    }
    setIsEventModalOpen(true);
  };
  
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentEvent.title || !currentEvent.description || !currentEvent.start_date) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    try {
      if (isEditing && currentEvent.id) {
        await supabase
          .from('sector_events')
          .update({ 
            ...currentEvent,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentEvent.id);
      } else {
        await supabase
          .from('sector_events')
          .insert([{ 
            ...currentEvent,
            sector_id: sectorId,
            created_by: user.id
          }]);
      }
      
      setIsEventModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      alert('Ocorreu um erro ao salvar o evento.');
    }
  };
  
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      await supabase
        .from('sector_events')
        .delete()
        .eq('id', id);
      
      fetchEvents();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para remover a imagem
  const handleRemoveImage = () => {
    setCurrentNews({
      ...currentNews,
      image_url: ''
    });
    setImagePreview(null);
    setOriginalImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Modificar o componente de preview da imagem para incluir o editor quando estiver no modo de edição
  const renderImagePreview = () => {
    if (isEditing && originalImage) {
      return (
        <div className="mt-4">
          <div className="relative w-full h-64 border rounded-md overflow-hidden">
            <Cropper
              image={originalImage}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              rotation={rotation}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
            />
          </div>
          
          <div className="mt-4 flex flex-col space-y-4">
            <div className="flex items-center">
              <label className="mr-2 text-sm text-gray-700 w-20">Zoom:</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center">
              <label className="mr-2 text-sm text-gray-700 w-20">Rotação:</label>
              <input
                type="range"
                value={rotation}
                min={0}
                max={360}
                step={1}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-between">
            <div>
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev - 90) % 360)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-2"
                title="Rotacionar para esquerda"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                title="Rotacionar para direita"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleCancelCrop}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              {uploadingImage ? (
                <button
                  type="button"
                  disabled
                  className="px-3 py-1.5 text-sm bg-primary text-white rounded-md opacity-70 flex items-center"
                >
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Processando...
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCropImage}
                  className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Aplicar
                </button>
              )}
            </div>
          </div>
        </div>
      );
    } else if (imagePreview) {
      return (
        <div className="mt-2 relative">
          <div className="relative h-40 w-full md:w-64 border rounded-md overflow-hidden">
            <Image 
              src={imagePreview} 
              alt="Preview da imagem" 
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
            title="Remover imagem"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-10 bg-primary text-white rounded-full p-1 hover:bg-primary-dark"
            title="Editar imagem"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Você não tem autorização para acessar esta página.</p>
          <Link href="/dashboard" className="mt-4 text-primary hover:underline block">
            Voltar para o Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative h-10 w-24 mr-4">
              <Image 
                src="/logo-cresol.png" 
                alt="Logo Cresol" 
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Painel Administrativo</h1>
          </div>
          
          <div className="flex items-center">
            <Link href="/admin" className="text-sm text-gray-600 mr-4 hover:text-primary">
              Painel Admin
            </Link>
            <Link href="/admin/sectors" className="text-sm text-gray-600 mr-4 hover:text-primary">
              Setores
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Setor: {sector?.name}</h2>
              <p className="text-gray-600">{sector?.description}</p>
            </div>
          </div>
          
          {/* Abas */}
          <div className="border-b border-gray-200 mt-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('news')}
                className={`${
                  activeTab === 'news'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Notícias
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`${
                  activeTab === 'events'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Eventos
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo da aba de Notícias */}
        {activeTab === 'news' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-800">Notícias do Setor</h3>
              <button
                onClick={() => handleOpenNewsModal()}
                className="btn-primary"
              >
                Adicionar Notícia
              </button>
            </div>

            {news.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">Nenhuma notícia cadastrada para este setor.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destaque
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {news.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.is_published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.is_published ? 'Publicado' : 'Rascunho'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.is_featured 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.is_featured ? 'Destaque' : 'Normal'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleOpenNewsModal(item)}
                            className="text-primary hover:text-primary-dark mr-4"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDeleteNews(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Conteúdo da aba de Eventos */}
        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-800">Eventos do Setor</h3>
              <button
                onClick={() => handleOpenEventModal()}
                className="btn-primary"
              >
                Adicionar Evento
              </button>
            </div>

            {events.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">Nenhum evento cadastrado para este setor.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data Início
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Local
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {events.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.start_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.location || 'Não definido'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.is_published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.is_published ? 'Publicado' : 'Rascunho'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleOpenEventModal(item)}
                            className="text-primary hover:text-primary-dark mr-4"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDeleteEvent(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal para adicionar/editar notícia */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {isEditing ? 'Editar Notícia' : 'Adicionar Nova Notícia'}
            </h3>
            
            <form onSubmit={handleSaveNews}>
              <div className="mb-4">
                <label htmlFor="title" className="form-label">Título da Notícia*</label>
                <input
                  id="title"
                  type="text"
                  value={currentNews.title}
                  onChange={(e) => setCurrentNews({...currentNews, title: e.target.value})}
                  className="input"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="summary" className="form-label">Resumo*</label>
                <textarea
                  id="summary"
                  value={currentNews.summary}
                  onChange={(e) => setCurrentNews({...currentNews, summary: e.target.value})}
                  className="input"
                  rows={2}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="content" className="form-label">Conteúdo*</label>
                <textarea
                  id="content"
                  value={currentNews.content}
                  onChange={(e) => setCurrentNews({...currentNews, content: e.target.value})}
                  className="input"
                  rows={8}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="image" className="form-label">Imagem</label>
                <div className="mt-1 flex flex-col space-y-2">
                  {/* Campo de upload de imagem */}
                  <input
                    id="image"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary file:text-white
                      hover:file:bg-primary-dark"
                  />
                  
                  {/* Loading indicator */}
                  {uploadingImage && (
                    <div className="flex items-center space-x-2 text-sm text-primary">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                      <span>Enviando imagem...</span>
                    </div>
                  )}
                  
                  {/* Preview de imagem */}
                  {renderImagePreview()}
                  
                  <p className="text-xs text-gray-500">
                    Tamanho máximo: 5MB. Formatos suportados: JPG, PNG, GIF.
                  </p>
                </div>
              </div>
              
              <div className="mb-6 flex space-x-6">
                <div className="flex items-center">
                  <input
                    id="is_published"
                    type="checkbox"
                    checked={currentNews.is_published}
                    onChange={(e) => setCurrentNews({...currentNews, is_published: e.target.checked})}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700">
                    Publicar
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="is_featured"
                    type="checkbox"
                    checked={currentNews.is_featured}
                    onChange={(e) => setCurrentNews({...currentNews, is_featured: e.target.checked})}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                    Destacar no Dashboard
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {isEditing ? 'Salvar Alterações' : 'Adicionar Notícia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para adicionar/editar evento */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {isEditing ? 'Editar Evento' : 'Adicionar Novo Evento'}
            </h3>
            
            <form onSubmit={handleSaveEvent}>
              <div className="mb-4">
                <label htmlFor="event_title" className="form-label">Título do Evento*</label>
                <input
                  id="event_title"
                  type="text"
                  value={currentEvent.title}
                  onChange={(e) => setCurrentEvent({...currentEvent, title: e.target.value})}
                  className="input"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="event_description" className="form-label">Descrição*</label>
                <textarea
                  id="event_description"
                  value={currentEvent.description}
                  onChange={(e) => setCurrentEvent({...currentEvent, description: e.target.value})}
                  className="input"
                  rows={4}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="event_location" className="form-label">Local</label>
                <input
                  id="event_location"
                  type="text"
                  value={currentEvent.location || ''}
                  onChange={(e) => setCurrentEvent({...currentEvent, location: e.target.value})}
                  className="input"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="event_start_date" className="form-label">Data de Início*</label>
                  <input
                    id="event_start_date"
                    type="datetime-local"
                    value={currentEvent.start_date ? new Date(currentEvent.start_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setCurrentEvent({...currentEvent, start_date: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="event_end_date" className="form-label">Data de Término</label>
                  <input
                    id="event_end_date"
                    type="datetime-local"
                    value={currentEvent.end_date ? new Date(currentEvent.end_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setCurrentEvent({...currentEvent, end_date: e.target.value ? new Date(e.target.value).toISOString() : null})}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="mb-6 flex space-x-6">
                <div className="flex items-center">
                  <input
                    id="event_is_published"
                    type="checkbox"
                    checked={currentEvent.is_published}
                    onChange={(e) => setCurrentEvent({...currentEvent, is_published: e.target.checked})}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="event_is_published" className="ml-2 block text-sm text-gray-700">
                    Publicar
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="event_is_featured"
                    type="checkbox"
                    checked={currentEvent.is_featured}
                    onChange={(e) => setCurrentEvent({...currentEvent, is_featured: e.target.checked})}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="event_is_featured" className="ml-2 block text-sm text-gray-700">
                    Destacar no Dashboard
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {isEditing ? 'Salvar Alterações' : 'Adicionar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 