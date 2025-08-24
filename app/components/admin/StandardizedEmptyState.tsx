'use client';

import { ReactNode } from 'react';

import { Button } from '@/app/components/ui/Button';
import { CRESOL_UI_CONFIG } from '@/lib/design-tokens';

import { Icon, IconName } from '../icons';

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
        <Button
          onClick={action.onClick}
          variant="solid"
          colorPalette="orange"
          size="md"
        >
          {action.label}
        </Button>
      )}
      
      {children}
    </div>
  );
}