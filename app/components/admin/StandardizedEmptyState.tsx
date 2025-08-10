'use client';

import { ReactNode } from 'react';
import { Icon, IconName } from '../icons';
import { StandardizedButton } from './index';
import { CRESOL_UI_CONFIG } from '@/lib/design-tokens';

interface StandardizedEmptyStateProps {
  title: string;
  description: string;
  icon?: IconName;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  className?: string;
}

/**
 * Estado vazio padronizado seguindo o design system da página /admin/users
 * 
 * Features:
 * - Ícone central consistente
 * - Título e descrição bem hierarquizados
 * - Botão de ação opcional
 * - Layout centralizado
 * - Espaçamento vertical consistente
 * - Cores padronizadas (cinza)
 */
export default function StandardizedEmptyState({
  title,
  description,
  icon = 'folder',
  action,
  children,
  className = ''
}: StandardizedEmptyStateProps) {
  return (
    <div className={`text-center ${CRESOL_UI_CONFIG.card.padding.xl} ${className}`}>
      <Icon name={icon} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      {action && (
        <StandardizedButton
          onClick={action.onClick}
          variant="primary"
        >
          {action.label}
        </StandardizedButton>
      )}
      
      {children}
    </div>
  );
}