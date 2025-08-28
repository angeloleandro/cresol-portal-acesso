'use client';

import AdminModuleCard from './AdminModuleCard';

interface AdminModule {
  title: string;
  description: string;
  icon: string;
  link: string;
}

interface AdminModulesGridProps {
  className?: string;
}

const ADMIN_MODULES: AdminModule[] = [
  {
    title: 'Solicitações de Acesso',
    description: 'Aprovar ou rejeitar solicitações de acesso ao portal',
    icon: 'user-add',
    link: '/admin/access-requests',
  },
  {
    title: 'Usuários',
    description: 'Gerenciar usuários e suas permissões',
    icon: 'user-group',
    link: '/admin/users',
  },
  {
    title: 'Setores & Subsetores',
    description: 'Gerenciar estrutura organizacional e hierarquia',
    icon: 'building-1',
    link: '/admin/sectors',
  },
  {
    title: 'Sistemas',
    description: 'Configurar sistemas e aplicações disponíveis',
    icon: 'settings',
    link: '/admin/systems',
  },
  {
    title: 'Locais de Trabalho',
    description: 'Gerenciar locais de atuação disponíveis',
    icon: 'map',
    link: '/admin/work-locations',
  },
  {
    title: 'Cargos',
    description: 'Gerenciar cargos disponíveis para os usuários',
    icon: 'suitcase',
    link: '/admin/positions',
  },
  {
    title: 'Banners',
    description: 'Gerencie os banners iniciais do portal',
    icon: 'image',
    link: '/admin/banners',
  },
  {
    title: 'Vídeos',
    description: 'Gerencie os vídeos exibidos no dashboard',
    icon: 'monitor-play',
    link: '/admin/videos',
  },
  {
    title: 'Galeria de Imagens',
    description: 'Gerencie as imagens exibidas na galeria do portal',
    icon: 'image',
    link: '/admin/gallery',
  },
  {
    title: 'Coleções',
    description: 'Organize e gerencie coleções de imagens e vídeos',
    icon: 'folder',
    link: '/admin/collections',
  },
  {
    title: 'Analytics',
    description: 'Visualizar métricas e relatórios do sistema',
    icon: 'chart-bar-vertical',
    link: '/admin/analytics',
  },
  {
    title: 'Indicadores Econômicos',
    description: 'Gerenciar indicadores econômicos da página inicial',
    icon: 'work-economi-indicator',
    link: '/admin/economic-indicators',
  },
  {
    title: 'Mensagens',
    description: 'Gerenciar mensagens de setores e subsetores centralizadamente',
    icon: 'message-square',
    link: '/admin/messages',
  },
  {
    title: 'Notícias',
    description: 'Gerenciar notícias de setores e subsetores centralizadamente',
    icon: 'document-text',
    link: '/admin/news',
  },
  {
    title: 'Documentos',
    description: 'Gerenciar documentos de setores e subsetores centralizadamente',
    icon: 'file',
    link: '/admin/documents',
  },
  {
    title: 'Eventos',
    description: 'Gerenciar eventos de setores e subsetores centralizadamente',
    icon: 'calendar',
    link: '/admin/events',
  },
];

export default function AdminModulesGrid({ className = '' }: AdminModulesGridProps) {
  return (
    <div className={`grid-modern-modules ${className}`}>
      {ADMIN_MODULES.map((module) => (
        <AdminModuleCard
          key={module.title}
          title={module.title}
          description={module.description}
          icon={module.icon as any}
          link={module.link}
        />
      ))}
    </div>
  );
}