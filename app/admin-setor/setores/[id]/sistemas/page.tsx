'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import AuthGuard from '@/app/components/AuthGuard';
import { useAuth } from '@/app/providers/AuthProvider';
import OptimizedImage from '@/app/components/OptimizedImage';
import DeleteModal from '@/app/components/ui/DeleteModal';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import { useAlert } from '@/app/components/alerts';
import { 
  ADMIN_ICONS,
  ADMIN_STATES,
  ADMIN_COLORS,
  ADMIN_BUTTONS,
  ADMIN_FORMS,
  ADMIN_LAYOUT,
  ADMIN_MEDIA,
  ADMIN_TYPOGRAPHY,
  ADMIN_NAVIGATION,
  ADMIN_DIMENSIONS,
  ADMIN_CARDS,
  ADMIN_MODALS
} from '@/lib/constants/admin-config';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

interface Sector {
  id: string;
  name: string;
  description: string;
}

interface System {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  sector_id: string;
  created_at: string;
  [key: string]: unknown;
}

function SectorSystemsManagementContent() {
  const router = useRouter();
  const params = useParams();
  const sectorId = params.id as string;
  const { user, profile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState<Sector | null>(null);
  const [systems, setSystems] = useState<System[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Estados para o formulário de sistemas
  const [showSystemForm, setShowSystemForm] = useState(false);
  const [systemForm, setSystemForm] = useState({
    id: '',
    name: '',
    description: '',
    url: '',
    icon: ADMIN_ICONS.system.default as string
  });
  
  // Lista de ícones disponíveis
  const availableIcons = ADMIN_ICONS.system.available;
  
  // Modal de exclusão
  const deleteModal = useDeleteModal<System>('sistema');
  const { showAlert } = useAlert();

  const fetchSector = useCallback(async () => {
    const { data, error } = await supabase
      .from('sectors')
      .select('id, name, description')
      .eq('id', sectorId)
      .single();
    
    if (error) {
      // Debug log removed
      return;
    }
    
    setSector(data);
  }, [sectorId]);

  const fetchSystems = useCallback(async () => {
    const { data, error } = await supabase
      .from('systems')
      .select('*')
      .eq('sector_id', sectorId)
      .order('name', { ascending: true });
    
    if (error) {
      // Debug log removed
      return;
    }
    
    setSystems(data || []);
  }, [sectorId]);

  useEffect(() => {
    const checkAuthorizationAndFetch = async () => {
      if (!user || !profile) return;

      // Verificar se o usuário é admin ou admin do setor
      if (profile.role === 'admin') {
        setIsAuthorized(true);
      } else if (profile.role === 'sector_admin') {
        // Verificar se é admin deste setor específico
        const { data: sectorAdmin } = await supabase
          .from('sector_admins')
          .select('*')
          .eq('user_id', user.id)
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

      await Promise.all([
        fetchSector(),
        fetchSystems()
      ]);
      
      setLoading(false);
    };

    if (user && profile) {
      checkAuthorizationAndFetch();
    }
  }, [sectorId, user, profile, router, fetchSector, fetchSystems]);

  const handleSystemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const systemData = {
        sector_id: sectorId,
        name: systemForm.name,
        description: systemForm.description,
        url: systemForm.url,
        icon: systemForm.icon
      };
      
      if (systemForm.id) {
        // Atualizar sistema existente
        const { error } = await supabase
          .from('systems')
          .update(systemData)
          .eq('id', systemForm.id);
        
        if (error) throw error;
      } else {
        // Criar novo sistema
        const { error } = await supabase
          .from('systems')
          .insert([systemData]);
        
        if (error) throw error;
      }
      
      // Limpar formulário e atualizar lista
      setSystemForm({ id: '', name: '', description: '', url: '', icon: ADMIN_ICONS.system.default as string });
      setShowSystemForm(false);
      fetchSystems();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar sistema';
      showAlert({
        status: 'error',
        title: 'Erro ao Salvar Sistema',
        description: errorMessage
      });
    }
  };

  const editSystem = (system: System) => {
    setSystemForm({
      id: system.id,
      name: system.name,
      description: system.description || '',
      url: system.url,
      icon: system.icon || (ADMIN_ICONS.system.default as string)
    });
    
    setShowSystemForm(true);
  };

  const handleDeleteClick = (system: System) => {
    deleteModal.openDeleteModal(system, system.name);
  };

  const deleteSystem = async (system: System) => {
    try {
      const { error } = await supabase
        .from('systems')
        .delete()
        .eq('id', system.id);
      
      if (error) throw error;
      
      fetchSystems();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir sistema';
      showAlert({
        status: 'error',
        title: 'Erro ao Excluir Sistema',
        description: errorMessage
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className={ADMIN_STATES.loading.container}>
        <div className={ADMIN_STATES.loading.content}>
<UnifiedLoadingSpinner 
        fullScreen
        size="large" 
        message={LOADING_MESSAGES.systems}
      />
        </div>
      </div>
    );
  }

  if (!sector) {
    return (
      <div className={ADMIN_STATES.error.container}>
        <div className={ADMIN_STATES.error.content}>
          <p className={ADMIN_STATES.error.message}>Setor não encontrado.</p>
          <Link href="/admin-setor" className={`mt-4 ${ADMIN_BUTTONS.link} block`}>
            Voltar para o Painel
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className={ADMIN_STATES.error.container}>
        <div className={ADMIN_STATES.error.content}>
          <p className={ADMIN_STATES.error.message}>Você não tem autorização para acessar esta página.</p>
          <Link href="/admin-setor" className={`mt-4 ${ADMIN_BUTTONS.link} block`}>
            Voltar para o Painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${ADMIN_LAYOUT.container.fullHeight} ${ADMIN_COLORS.backgrounds.page}`}>
      {/* Header */}
      <header className={`${ADMIN_COLORS.backgrounds.card} ${ADMIN_COLORS.borders.default}`}>
        <div className={`${ADMIN_LAYOUT.container.maxWidth} ${ADMIN_LAYOUT.container.margin} ${ADMIN_LAYOUT.header.padding.container} flex items-center justify-between`}>
          <div className="flex items-center">
            <div className={`relative ${ADMIN_LAYOUT.header.logoHeight} ${ADMIN_LAYOUT.header.logoWidth} ${ADMIN_LAYOUT.header.margin}`}>
              <OptimizedImage 
                src={ADMIN_MEDIA.logo.src}
                alt={ADMIN_MEDIA.logo.alt}
                fill
                className="object-contain"
              />
            </div>
            <h1 className={`${ADMIN_TYPOGRAPHY.headings.section} text-gray-800`}>Painel Admin Setorial</h1>
          </div>
          
          <div className="flex items-center">
            <Link href="/admin-setor" className={ADMIN_NAVIGATION.links.header}>
              Painel
            </Link>
            <Link href={`/admin-setor/setores/${sectorId}`} className={ADMIN_NAVIGATION.links.header}>
              Conteúdo
            </Link>
            <Link href="/dashboard" className={ADMIN_NAVIGATION.links.header}>
              Dashboard
            </Link>
            <span className={`${ADMIN_TYPOGRAPHY.sizes.small} text-gray-600 mr-4`}>
              Olá, {user?.user_metadata?.full_name || user?.email}
            </span>
            <button 
              onClick={handleLogout}
              className={`${ADMIN_TYPOGRAPHY.sizes.small} ${ADMIN_COLORS.primary.main} ${ADMIN_COLORS.primary.hover}`}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className={`${ADMIN_LAYOUT.container.maxWidth} ${ADMIN_LAYOUT.container.margin} ${ADMIN_LAYOUT.header.padding.content}`}>
        <div className={ADMIN_LAYOUT.spacing.subsection}>
          <Link 
            href="/admin-setor" 
            className={ADMIN_NAVIGATION.links.back}
          >
            <svg className={`${ADMIN_DIMENSIONS.icon.medium} mr-1`} fill="none" stroke="currentColor" viewBox={ADMIN_ICONS.svg.back.viewBox}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ADMIN_ICONS.svg.back.path} />
            </svg>
            Voltar para o Painel
          </Link>
          
          <h2 className={ADMIN_TYPOGRAPHY.headings.page}>{sector.name}</h2>
          <p className={ADMIN_TYPOGRAPHY.text.body}>Gerenciar sistemas do setor</p>
        </div>

        <div className={`${ADMIN_LAYOUT.spacing.subsection} flex justify-between items-center`}>
          <div>
            <h3 className={`${ADMIN_TYPOGRAPHY.headings.subsection} text-gray-800`}>Sistemas</h3>
            <p className={`${ADMIN_TYPOGRAPHY.text.help} text-gray-600`}>Gerencie os sistemas associados a este setor</p>
          </div>
          <button
            onClick={() => setShowSystemForm(true)}
            className={ADMIN_BUTTONS.primary}
          >
            Adicionar Sistema
          </button>
        </div>

        {/* Lista de sistemas */}
        <div className={`${ADMIN_LAYOUT.grid.responsive} ${ADMIN_LAYOUT.spacing.section}`}>
          {systems.map((system) => (
            <div key={system.id} className={`${ADMIN_CARDS.base} ${ADMIN_LAYOUT.header.padding.card}`}>
              <div className={`flex items-center ${ADMIN_LAYOUT.spacing.item}`}>
                <div className={`${ADMIN_DIMENSIONS.icon.xlarge} mr-4`}>
                  <OptimizedImage 
                    src={system.icon} 
                    alt={system.name}
                    width={48}
                    height={48}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <h4 className={`font-semibold text-gray-800`}>{system.name}</h4>
                  <p className={`${ADMIN_TYPOGRAPHY.sizes.small} text-gray-600`}>{system.description}</p>
                </div>
              </div>
              
              <div className={ADMIN_CARDS.actions}>
                <button
                  onClick={() => editSystem(system)}
                  className={`flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md ${ADMIN_TYPOGRAPHY.sizes.small} hover:bg-blue-100`}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(system)}
                  className={`flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-md ${ADMIN_TYPOGRAPHY.sizes.small} hover:bg-red-100`}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        {systems.length === 0 && (
          <div className={ADMIN_STATES.empty.container}>
            <p className={ADMIN_STATES.empty.message}>Nenhum sistema cadastrado para este setor.</p>
          </div>
        )}

        {/* Modal do formulário de sistema */}
        {showSystemForm && (
          <div className={ADMIN_MODALS.overlay}>
            <div className={`${ADMIN_MODALS.container} ${ADMIN_MODALS.content}`}>
              <h3 className={ADMIN_MODALS.header}>
                {systemForm.id ? 'Editar Sistema' : 'Adicionar Sistema'}
              </h3>
              
              <form onSubmit={handleSystemSubmit} className={ADMIN_FORMS.fieldset}>
                <div>
                  <label className={ADMIN_FORMS.label.base}>
                    Nome
                  </label>
                  <input
                    type="text"
                    value={systemForm.name}
                    onChange={(e) => setSystemForm({ ...systemForm, name: e.target.value })}
                    className={ADMIN_FORMS.input.base}
                    required
                  />
                </div>
                
                <div>
                  <label className={ADMIN_FORMS.label.base}>
                    Descrição
                  </label>
                  <textarea
                    value={systemForm.description}
                    onChange={(e) => setSystemForm({ ...systemForm, description: e.target.value })}
                    className={ADMIN_FORMS.input.textarea.small}
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className={ADMIN_FORMS.label.base}>
                    URL
                  </label>
                  <input
                    type="url"
                    value={systemForm.url}
                    onChange={(e) => setSystemForm({ ...systemForm, url: e.target.value })}
                    className={ADMIN_FORMS.input.base}
                    required
                  />
                </div>
                
                <div>
                  <label className={ADMIN_FORMS.label.base}>
                    Ícone
                  </label>
                  <div className={ADMIN_LAYOUT.grid.iconGrid}>
                    {availableIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSystemForm({ ...systemForm, icon: icon as string })}
                        className={`p-2 border rounded-md ${
                          systemForm.icon === icon 
                            ? `${ADMIN_COLORS.borders.focused} ${ADMIN_COLORS.primary.bg} bg-opacity-10` 
                            : ADMIN_COLORS.borders.light
                        }`}
                      >
                        <OptimizedImage src={icon} alt="Ícone" width={24} height={24} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className={ADMIN_MODALS.footer}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSystemForm(false);
                      setSystemForm({ id: '', name: '', description: '', url: '', icon: ADMIN_ICONS.system.default });
                    }}
                    className={`flex-1 ${ADMIN_BUTTONS.secondary}`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 ${ADMIN_BUTTONS.primary}`}
                  >
                    {systemForm.id ? 'Atualizar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Exclusão */}
        <DeleteModal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.closeDeleteModal}
          onConfirm={() => deleteModal.confirmDelete(deleteSystem)}
          itemName={deleteModal.itemName}
          itemType={deleteModal.itemType}
          isLoading={deleteModal.isDeleting}
        />
      </main>
    </div>
  );
}

export default function SectorSystemsManagement() {
  return (
    <AuthGuard requireRole="sector_admin" loadingMessage={LOADING_MESSAGES.systems}>
      <SectorSystemsManagementContent />
    </AuthGuard>
  );
} 