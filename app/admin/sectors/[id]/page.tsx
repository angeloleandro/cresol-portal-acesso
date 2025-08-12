'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import OptimizedImage from '@/app/components/OptimizedImage';
import Breadcrumb from '@/app/components/Breadcrumb';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Cropper from 'react-easy-crop';
import { Button } from '@/app/components/ui/Button';

interface Sector {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Subsector {
  id: string;
  name: string;
  description: string;
  sector_id: string;
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
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [news, setNews] = useState<SectorNews[]>([]);
  const [events, setEvents] = useState<SectorEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'news' | 'events' | 'subsectors' | 'groups' | 'messages'>('news');
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

  const [currentSubsector, setCurrentSubsector] = useState<Partial<Subsector>>({
    name: '',
    description: '',
    sector_id: sectorId
  });

  // Estados de modais
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSubsectorModalOpen, setIsSubsectorModalOpen] = useState(false);
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

  // Estados para grupos
  const [groups, setGroups] = useState<any[]>([]);
  const [automaticGroups, setAutomaticGroups] = useState<any[]>([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState({
    name: '',
    description: '',
    members: [] as string[]
  });

  // Estados para mensagens
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState({
    title: '',
    message: '',
    type: 'general',
    groups: [] as string[],
    users: [] as string[]
  });

  // Estados para seleção de usuários
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [workLocations, setWorkLocations] = useState<any[]>([]);
  
  // Estados para filtros de usuários
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userLocationFilter, setUserLocationFilter] = useState('all');

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

  const fetchSubsectors = useCallback(async () => {
    const { data, error } = await supabase
      .from('subsectors')
      .select('*')
      .eq('sector_id', sectorId)
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar subsetores:', error);
    } else {
      setSubsectors(data || []);
    }
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
      .order('start_date', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar eventos:', error);
      return;
    }
    
    setEvents(data || []);
  }, [sectorId]);

  const fetchGroups = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/groups');
      const result = await response.json();
      
      if (result.groups) {
        // Filtrar grupos do setor específico
        const sectorGroups = result.groups.filter((group: any) => group.sector_id === sectorId);
        setGroups(sectorGroups);
        
        // Filtrar grupos automáticos (cargo/local)
        const autoGroups = result.groups.filter((group: any) => 
          group.type === 'position' || group.type === 'work_location'
        );
        setAutomaticGroups(autoGroups);
      }
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
    }
  }, [sectorId]);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, work_location_id')
        .order('full_name');
        
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return;
      }
      
      setAllUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  }, []);

  const fetchWorkLocations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('work_locations')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Erro ao buscar locais de trabalho:', error);
        return;
      }

      setWorkLocations(data || []);
    } catch (error) {
      console.error('Erro ao buscar locais de trabalho:', error);
    }
  }, []);

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
        fetchSubsectors(),
        fetchNews(),
        fetchEvents()
      ]);
      
      // Buscar grupos, usuários e locais de trabalho
      await fetchGroups();
      await fetchUsers();
      await fetchWorkLocations();
      
      setLoading(false);
    };

    checkUser();
  }, [sectorId, router, fetchSector, fetchSubsectors, fetchNews, fetchEvents, fetchGroups, fetchUsers, fetchWorkLocations]);


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
            <OptimizedImage 
              src={imagePreview} 
              alt="Preview da imagem" 
              fill
              className="object-cover"
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

  // Funções de gerenciamento de subsetores
  const handleOpenSubsectorModal = (subsector?: Subsector) => {
    if (subsector) {
      setCurrentSubsector(subsector);
      setIsEditing(true);
    } else {
      setCurrentSubsector({
        name: '',
        description: '',
        sector_id: sectorId
      });
      setIsEditing(false);
    }
    setIsSubsectorModalOpen(true);
  };

  const handleSaveSubsector = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && currentSubsector.id) {
        const { error } = await supabase
          .from('subsectors')
          .update({
            name: currentSubsector.name,
            description: currentSubsector.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentSubsector.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subsectors')
          .insert([{
            name: currentSubsector.name,
            description: currentSubsector.description,
            sector_id: sectorId
          }]);

        if (error) throw error;
      }

      setIsSubsectorModalOpen(false);
      await fetchSubsectors();
    } catch (error) {
      console.error('Erro ao salvar subsetor:', error);
      alert('Erro ao salvar subsetor. Tente novamente.');
    }
  };

  const handleDeleteSubsector = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este subsetor?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('subsectors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSubsectors();
    } catch (error) {
      console.error('Erro ao excluir subsetor:', error);
      alert('Erro ao excluir subsetor. Tente novamente.');
    }
  };

  // Funções para grupos
  const handleOpenGroupModal = () => {
    setCurrentGroup({
      name: '',
      description: '',
      members: []
    });
    setUserSearchTerm('');
    setUserLocationFilter('all');
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentGroup.name.trim()) {
      alert('Por favor, preencha o nome do grupo.');
      return;
    }
    
    try {
      const response = await fetch('/api/notifications/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: currentGroup.name,
          description: currentGroup.description,
          sectorId: sectorId,
          members: currentGroup.members
        }),
      });

      if (response.ok) {
        setIsGroupModalOpen(false);
        await fetchGroups();
      } else {
        const error = await response.json();
        alert(`Erro ao criar grupo: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao salvar grupo:', error);
      alert('Erro ao salvar grupo. Tente novamente.');
    }
  };

  // Funções para mensagens
  const handleOpenMessageModal = () => {
    setCurrentMessage({
      title: '',
      message: '',
      type: 'general',
      groups: [],
      users: []
    });
    setUserSearchTerm('');
    setUserLocationFilter('all');
    setIsMessageModalOpen(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMessage.title.trim() || !currentMessage.message.trim()) {
      alert('Por favor, preencha o título e a mensagem.');
      return;
    }

    if (currentMessage.groups.length === 0 && currentMessage.users.length === 0) {
      alert('Por favor, selecione pelo menos um grupo ou usuário.');
      return;
    }
    
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: currentMessage.title,
          message: currentMessage.message,
          type: currentMessage.type,
          groups: currentMessage.groups,
          users: currentMessage.users,
          sectorId: sectorId
        }),
      });

      if (response.ok) {
        setIsMessageModalOpen(false);
        alert('Mensagem enviada com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro ao enviar mensagem: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">Você não tem autorização para acessar esta página.</p>
          <Link href="/dashboard" className="text-primary hover:underline">
            Voltar para o Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Minimalista */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <Link 
                href="/admin" 
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{sector?.name}</h1>
                <p className="text-sm text-gray-500 mt-1">{sector?.description}</p>
            </div>
          </div>
            <div className="flex items-center space-x-3">
              <Link 
                href="/admin" 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
              Painel Admin
            </Link>
            <button 
              onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Sair
            </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegação por Abas - Design Minimalista */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex space-x-12">
              <button
                onClick={() => setActiveTab('news')}
              className={`py-4 text-sm font-medium transition-all duration-200 relative ${
                  activeTab === 'news'
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Notícias ({news.length})
              {activeTab === 'news' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
              )}
              </button>
              <button
                onClick={() => setActiveTab('events')}
              className={`py-4 text-sm font-medium transition-all duration-200 relative ${
                  activeTab === 'events'
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Eventos ({events.length})
              {activeTab === 'events' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
              )}
              </button>
            <button
              onClick={() => setActiveTab('subsectors')}
              className={`py-4 text-sm font-medium transition-all duration-200 relative ${
                activeTab === 'subsectors'
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Subsetores ({subsectors.length})
              {activeTab === 'subsectors' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`py-4 text-sm font-medium transition-all duration-200 relative ${
                activeTab === 'groups'
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Grupos
              {activeTab === 'groups' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 text-sm font-medium transition-all duration-200 relative ${
                activeTab === 'messages'
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mensagens
              {activeTab === 'messages' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
              )}
            </button>
          </div>
          </div>
        </div>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração', href: '/admin' },
              { label: 'Setores', href: '/admin/sectors' },
              { label: sector?.name || 'Setor' }
            ]} 
          />
        </div>
        
        {/* Aba de Notícias */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Notícias do Setor</h2>
              <Button
                onClick={() => handleOpenNewsModal()}
                variant="primary"
                size="md"
              >
                + Nova Notícia
              </Button>
            </div>

            {news.length === 0 ? (
              <div className="bg-white rounded-md p-12 text-center border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notícia cadastrada</h3>
                <p className="text-gray-500">Crie a primeira notícia para este setor.</p>
              </div>
            ) : (
              <div className="bg-white rounded-md border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {news.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.summary}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatDate(item.created_at)}</span>
                            <span className={`px-2 py-1 rounded-full ${
                            item.is_published 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.is_published ? 'Publicado' : 'Rascunho'}
                          </span>
                            {item.is_featured && (
                              <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                Destaque
                          </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button 
                            onClick={() => handleOpenNewsModal(item)}
                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteNews(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aba de Eventos */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Eventos do Setor</h2>
              <Button
                onClick={() => handleOpenEventModal()}
                variant="primary"
                size="md"
              >
                + Novo Evento
              </Button>
            </div>

            {events.length === 0 ? (
              <div className="bg-white rounded-md p-12 text-center border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento cadastrado</h3>
                <p className="text-gray-500">Crie o primeiro evento para este setor.</p>
              </div>
            ) : (
              <div className="bg-white rounded-md border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {events.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatDate(item.start_date)}</span>
                            {item.location && <span>📍 {item.location}</span>}
                            <span className={`px-2 py-1 rounded-full ${
                            item.is_published 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.is_published ? 'Publicado' : 'Rascunho'}
                          </span>
                            {item.is_featured && (
                              <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                Destaque
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button 
                            onClick={() => handleOpenEventModal(item)}
                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteEvent(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aba de Subsetores */}
        {activeTab === 'subsectors' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Subsetores</h2>
              <Button 
                onClick={() => handleOpenSubsectorModal()}
                variant="primary"
                size="md"
              >
                + Novo Subsetor
              </Button>
            </div>

            {subsectors.length === 0 ? (
              <div className="bg-white rounded-md p-12 text-center border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum subsetor cadastrado</h3>
                <p className="text-gray-500">Crie o primeiro subsetor para este setor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subsectors.map((subsector) => (
                  <div key={subsector.id} className="bg-white rounded-md p-6 border border-gray-100 hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleOpenSubsectorModal(subsector)}
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteSubsector(subsector.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <Link 
                          href={`/admin-subsetor/subsetores/${subsector.id}`}
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{subsector.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{subsector.description}</p>
                    <div className="text-xs text-gray-500">
                      Criado em {formatDate(subsector.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Aba de Grupos */}
        {activeTab === 'groups' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Grupos de Notificação</h2>
              <Button 
                onClick={handleOpenGroupModal}
                variant="primary"
                size="md"
              >
                + Criar Grupo
              </Button>
            </div>

            {groups.length === 0 && automaticGroups.length === 0 ? (
              <div className="bg-white rounded-md p-12 text-center border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum grupo cadastrado</h3>
                <p className="text-gray-500">Crie o primeiro grupo de notificação para este setor.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Grupos do Setor */}
                {groups.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Grupos do Setor</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groups.map((group) => (
                        <div key={group.id} className="bg-white rounded-md p-6 border border-gray-100 hover:border-primary/30 transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                              </svg>
                            </div>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">{group.name}</h4>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>
                          <div className="text-xs text-gray-500">
                            Criado em {formatDate(group.created_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Grupos Automáticos */}
                {automaticGroups.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Grupos Automáticos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {automaticGroups.map((group) => (
                        <div key={group.id} className="bg-white rounded-md p-6 border border-gray-100 hover:border-primary/30 transition-all relative">
                          <div className="absolute top-2 right-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              group.type === 'position' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {group.type === 'position' ? 'Cargo' : 'Local'}
                            </span>
                          </div>
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              group.type === 'position' 
                                ? 'bg-blue-50'
                                : 'bg-green-50'
                            }`}>
                              {group.type === 'position' ? (
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              ) : (
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">{group.name}</h4>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              {group.member_count} membros
                            </div>
                            <div className="text-xs text-gray-400">
                              Automático
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Aba de Mensagens */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Enviar Mensagem</h2>
              <Button 
                onClick={handleOpenMessageModal}
                variant="primary"
                size="md"
              >
                + Nova Mensagem
              </Button>
            </div>

            <div className="bg-white rounded-md p-12 text-center border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Envio de Notificações</h3>
              <p className="text-gray-500 mb-4">Envie mensagens para grupos ou usuários específicos.</p>
              <Button 
                onClick={handleOpenMessageModal}
                variant="primary"
                size="lg"
              >
                Enviar Nova Mensagem
              </Button>
            </div>
          </div>
        )}


      </main>

      {/* Modal para Subsetores */}
      {isSubsectorModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isEditing ? 'Editar Subsetor' : 'Novo Subsetor'}
            </h3>
            <form onSubmit={handleSaveSubsector} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={currentSubsector.name || ''}
                  onChange={(e) => setCurrentSubsector({...currentSubsector, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={currentSubsector.description || ''}
                  onChange={(e) => setCurrentSubsector({...currentSubsector, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSubsectorModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  {isEditing ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Notícias */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isEditing ? 'Editar Notícia' : 'Nova Notícia'}
            </h3>
            <form onSubmit={handleSaveNews} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={currentNews.title || ''}
                  onChange={(e) => setCurrentNews({...currentNews, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resumo *
                </label>
                <textarea
                  value={currentNews.summary || ''}
                  onChange={(e) => setCurrentNews({...currentNews, summary: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo *
                </label>
                <textarea
                  value={currentNews.content || ''}
                  onChange={(e) => setCurrentNews({...currentNews, content: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  rows={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem da Notícia
                </label>
                <div className="mt-2">
                  <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                      type="file"
                    accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      {uploadingImage ? 'Carregando...' : 'Selecionar Imagem'}
                    </button>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  {renderImagePreview()}
                </div>
              </div>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentNews.is_featured || false}
                    onChange={(e) => setCurrentNews({...currentNews, is_featured: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Destacar</span>
                  </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentNews.is_published || false}
                    onChange={(e) => setCurrentNews({...currentNews, is_published: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Publicar</span>
                  </label>
                </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  {isEditing ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Eventos */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isEditing ? 'Editar Evento' : 'Novo Evento'}
            </h3>
            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={currentEvent.title || ''}
                  onChange={(e) => setCurrentEvent({...currentEvent, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  value={currentEvent.description || ''}
                  onChange={(e) => setCurrentEvent({...currentEvent, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local
                </label>
                <input
                  type="text"
                  value={currentEvent.location || ''}
                  onChange={(e) => setCurrentEvent({...currentEvent, location: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data/Hora de Início *
                  </label>
                  <input
                    type="datetime-local"
                    value={currentEvent.start_date ? new Date(currentEvent.start_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setCurrentEvent({...currentEvent, start_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data/Hora de Fim
                  </label>
                  <input
                    type="datetime-local"
                    value={currentEvent.end_date ? new Date(currentEvent.end_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setCurrentEvent({...currentEvent, end_date: e.target.value || null})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentEvent.is_featured || false}
                    onChange={(e) => setCurrentEvent({...currentEvent, is_featured: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Destacar</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentEvent.is_published || false}
                    onChange={(e) => setCurrentEvent({...currentEvent, is_published: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Publicar</span>
                  </label>
                </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  {isEditing ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Subsetores */}
      {isSubsectorModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isEditing ? 'Editar Subsetor' : 'Novo Subsetor'}
            </h3>
            <form onSubmit={handleSaveSubsector} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                  <input
                  type="text"
                  value={currentSubsector.name || ''}
                  onChange={(e) => setCurrentSubsector({...currentSubsector, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  value={currentSubsector.description || ''}
                  onChange={(e) => setCurrentSubsector({...currentSubsector, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSubsectorModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  {isEditing ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Grupos */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Criar Grupo de Notificação
            </h3>
            <form onSubmit={handleSaveGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Grupo *
                </label>
                <input
                  type="text"
                  value={currentGroup.name}
                  onChange={(e) => setCurrentGroup({...currentGroup, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={currentGroup.description}
                  onChange={(e) => setCurrentGroup({...currentGroup, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  rows={3}
                  placeholder="Descrição opcional do grupo"
                />
              </div>
              {/* Seção de grupos automáticos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incluir Grupos Automáticos
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto mb-4">
                  {automaticGroups.length > 0 ? (
                    automaticGroups.map((group) => {
                      const isGroupSelected = group.members && group.members.some((memberId: string) => 
                        currentGroup.members.includes(memberId)
                      );
                      
                      return (
                        <label key={group.id} className="flex items-center py-1">
                          <input
                            type="checkbox"
                            checked={isGroupSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Adicionar todos os membros do grupo automático
                                const allMembers = [...currentGroup.members, ...(group.members || [])];
                                const uniqueMembers = allMembers.filter((value, index, self) => self.indexOf(value) === index);
                                setCurrentGroup({
                                  ...currentGroup,
                                  members: uniqueMembers
                                });
                              } else {
                                // Remover todos os membros do grupo automático
                                const membersToRemove = group.members || [];
                                setCurrentGroup({
                                  ...currentGroup,
                                  members: currentGroup.members.filter((id: string) => !membersToRemove.includes(id))
                                });
                              }
                            }}
                            className="mr-2"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium">{group.name}</span>
                            <div className="text-xs text-gray-500">
                              {group.type === 'position' ? '👤 Grupo de Cargo' : '🏢 Grupo de Local'}
                              {group.member_count && ` • ${group.member_count} membros`}
                            </div>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">
                      Nenhum grupo automático encontrado
                    </div>
                  )}
                </div>
              </div>
              
              {/* Filtros de usuários */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar Usuários
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      placeholder="Nome ou e-mail"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por Local
                  </label>
                  <select
                    value={userLocationFilter}
                    onChange={(e) => setUserLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="all">Todos os locais</option>
                    {workLocations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecionar Membros
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {allUsers
                    .filter(user => {
                      const matchesSearch = userSearchTerm === '' || 
                        user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
                      const matchesLocation = userLocationFilter === 'all' || user.work_location_id === userLocationFilter;
                      return matchesSearch && matchesLocation;
                    })
                    .map((user) => (
                    <label key={user.id} className="flex items-center py-1">
                      <input
                    type="checkbox"
                        checked={currentGroup.members.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCurrentGroup({
                              ...currentGroup,
                              members: [...currentGroup.members, user.id]
                            });
                          } else {
                            setCurrentGroup({
                              ...currentGroup,
                              members: currentGroup.members.filter(id => id !== user.id)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{user.full_name}</span>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        {user.work_location_id && (
                          <div className="text-xs text-gray-400">
                            {workLocations.find(loc => loc.id === user.work_location_id)?.name}
                          </div>
                        )}
                      </div>
                  </label>
                  ))}
                  {allUsers.filter(user => {
                    const matchesSearch = userSearchTerm === '' || 
                      user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
                    const matchesLocation = userLocationFilter === 'all' || user.work_location_id === userLocationFilter;
                    return matchesSearch && matchesLocation;
                  }).length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">
                      Nenhum usuário encontrado com os filtros aplicados
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Criar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Mensagens */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Enviar Mensagem
            </h3>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título da Mensagem *
                </label>
                <input
                  type="text"
                  value={currentMessage.title}
                  onChange={(e) => setCurrentMessage({...currentMessage, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem *
                </label>
                <textarea
                  value={currentMessage.message}
                  onChange={(e) => setCurrentMessage({...currentMessage, message: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={currentMessage.type}
                  onChange={(e) => setCurrentMessage({...currentMessage, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="general">Geral</option>
                  <option value="important">Importante</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enviar para Grupos
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {/* Grupos do Setor */}
                  {groups.map((group) => (
                    <label key={group.id} className="flex items-center py-1">
                      <input
                        type="checkbox"
                        checked={currentMessage.groups.includes(group.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCurrentMessage({
                              ...currentMessage,
                              groups: [...currentMessage.groups, group.id]
                            });
                          } else {
                            setCurrentMessage({
                              ...currentMessage,
                              groups: currentMessage.groups.filter(id => id !== group.id)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{group.name}</span>
                        <div className="text-xs text-gray-500">Grupo do Setor</div>
                      </div>
                    </label>
                  ))}
                  
                  {/* Separador se houver grupos de ambos os tipos */}
                  {groups.length > 0 && automaticGroups.length > 0 && (
                    <div className="border-t border-gray-200 my-2"></div>
                  )}
                  
                  {/* Grupos Automáticos */}
                  {automaticGroups.map((group) => (
                    <label key={group.id} className="flex items-center py-1">
                      <input
                        type="checkbox"
                        checked={currentMessage.groups.includes(group.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCurrentMessage({
                              ...currentMessage,
                              groups: [...currentMessage.groups, group.id]
                            });
                          } else {
                            setCurrentMessage({
                              ...currentMessage,
                              groups: currentMessage.groups.filter(id => id !== group.id)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{group.name}</span>
                        <div className="text-xs text-gray-500">
                          {group.type === 'position' ? '👤 Grupo de Cargo' : '🏢 Grupo de Local'}
                        </div>
                      </div>
                    </label>
                  ))}
                  
                  {groups.length === 0 && automaticGroups.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">
                      Nenhum grupo disponível
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enviar para Usuários Específicos
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {allUsers
                    .filter(user => {
                      const matchesSearch = userSearchTerm === '' || 
                        user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
                      const matchesLocation = userLocationFilter === 'all' || user.work_location_id === userLocationFilter;
                      return matchesSearch && matchesLocation;
                    })
                    .map((user) => (
                    <label key={user.id} className="flex items-center py-1">
                      <input
                        type="checkbox"
                        checked={currentMessage.users.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCurrentMessage({
                              ...currentMessage,
                              users: [...currentMessage.users, user.id]
                            });
                          } else {
                            setCurrentMessage({
                              ...currentMessage,
                              users: currentMessage.users.filter(id => id !== user.id)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{user.full_name}</span>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        {user.work_location_id && (
                          <div className="text-xs text-gray-400">
                            {workLocations.find(loc => loc.id === user.work_location_id)?.name}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsMessageModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Enviar Mensagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 