'use client';

import { Card, HStack, Text, Badge } from '@chakra-ui/react';
import Link from 'next/link';
import { AdminActionMenu, ActionItem } from '@/app/components/ui/AdminActionMenu';
import { Icon } from '../icons/Icon';
import { Button } from '@/app/components/ui/Button';

interface SubsectorCardProps {
  subsector: {
    id: string;
    name: string;
    description: string;
    sector_id: string;
    sector_name?: string;
    created_at: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export default function SubsectorCard({ 
  subsector, 
  onEdit, 
  onDelete,
  className = '' 
}: SubsectorCardProps) {

  // Menu de ações usando o componente padrão
  const actionItems: ActionItem[] = [
    {
      label: 'Editar',
      icon: 'pencil',
      onClick: onEdit
    },
    {
      label: 'Excluir',
      icon: 'trash',
      onClick: onDelete,
      variant: 'danger',
      showDivider: true
    }
  ];

  return (
    <Card.Root 
      variant="outline"
      colorPalette="gray"
      size="md"
      className={`${className} admin-subsector-card flex flex-col h-full transition-all duration-200`}
    >
      {/* Header com título e menu de ações */}
      <Card.Header className="pb-2">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <div className="w-8 h-8 bg-orange-50 rounded-md flex items-center justify-center">
              <Icon name="folder" className="w-4 h-4 text-primary" />
            </div>
            <Card.Title fontSize="lg" color="gray.800">
              {subsector.name}
            </Card.Title>
          </HStack>

          {/* Menu de ações padronizado */}
          <AdminActionMenu 
            items={actionItems}
            triggerLabel={`Ações para ${subsector.name}`}
          />
        </HStack>
      </Card.Header>

      {/* Body com setor pai e descrição */}
      <Card.Body className="space-y-4 flex-grow">
        {/* Setor pai em destaque */}
        <div className="bg-orange-50 rounded-md px-3 py-2">
          <Text fontSize="xs" color="orange.700" fontWeight="medium" mb="0.5">
            Vinculado ao setor:
          </Text>
          <Text fontSize="sm" fontWeight="semibold" color="orange.800">
            {subsector.sector_name}
          </Text>
        </div>

        {/* Descrição */}
        {subsector.description && (
          <Card.Description fontSize="sm" lineHeight="relaxed">
            {subsector.description}
          </Card.Description>
        )}

        {/* Informação adicional se não tiver descrição */}
        {!subsector.description && (
          <Text fontSize="sm" color="gray.400" fontStyle="italic">
            Nenhuma descrição adicionada para este Subsetor.
          </Text>
        )}
      </Card.Body>

      {/* Footer com ações principais */}
      <Card.Footer className="flex gap-2">
        <Link href={`/admin-subsetor/subsetores/${subsector.id}`} className="flex-1">
          <Button
            variant="solid"
            colorPalette="orange"
            size="sm"
            className="w-full"
            startElement={<Icon name="settings" className="w-3.5 h-3.5" />}
          >
            Gerenciar
          </Button>
        </Link>
        <Link href={`/subsetores/${subsector.id}/equipe`} className="flex-1">
          <Button
            variant="outline"
            colorPalette="orange"
            size="sm"
            className="w-full"
            startElement={<Icon name="user" className="w-3.5 h-3.5" />}
          >
            Equipe
          </Button>
        </Link>
      </Card.Footer>
    </Card.Root>
  );
}