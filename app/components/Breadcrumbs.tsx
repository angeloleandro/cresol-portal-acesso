'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    if (items) {
      setBreadcrumbs(items);
      return;
    }

    // Gerar breadcrumbs automaticamente baseado na URL
    const pathSegments = pathname.split('/').filter(segment => segment);
    const generatedBreadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/home' }
    ];

    let currentPath = '';
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;
      
      const label = formatSegmentLabel(segment);
      
      // Se for o último segmento, marcar como atual
      const isLast = i === pathSegments.length - 1;
      
      generatedBreadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        current: isLast
      });
    }

    setBreadcrumbs(generatedBreadcrumbs);
  }, [pathname, items]);

  const formatSegmentLabel = (segment: string): string => {
    // Mapear segmentos específicos para labels mais amigáveis
    const segmentMap: Record<string, string> = {
      'admin': 'Administração',
      'admin-setor': 'Admin Setor',
      'admin-subsetor': 'Admin Subsetor',
      'setores': 'Setores',
      'subsetores': 'Subsetores',
      'eventos': 'Eventos',
      'noticias': 'Notícias',
      'documentos': 'Documentos',
      'sistemas': 'Sistemas',
      'galeria': 'Galeria',
      'users': 'Usuários',
      'access-requests': 'Solicitações de Acesso',
      'work-locations': 'Locais de Trabalho',
      'banners': 'Banners',
      'videos': 'Vídeos',
      'notifications': 'Notificações',
      'profile': 'Perfil'
    };

    // Se for um UUID (ID), retornar um label genérico
    if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return 'Detalhes';
    }

    // Se for um número, pode ser um ID
    if (/^\d+$/.test(segment)) {
      return 'Item';
    }

    return segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
              </svg>
            )}
            {item.href && !item.current ? (
              <Link 
                href={item.href}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary"
              >
                {index === 0 && (
                  <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                  </svg>
                )}
                {item.label}
              </Link>
            ) : (
              <span className="inline-flex items-center text-sm font-medium text-gray-500">
                {index === 0 && (
                  <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                  </svg>
                )}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
} 