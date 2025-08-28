'use client';

import { Badge, Card, HStack, Stack, Text } from "@chakra-ui/react";
import Link from 'next/link';
import { AdminActionMenu, ActionItem } from '@/app/components/ui/AdminActionMenu';
import { Icon } from '@/app/components/icons/Icon';
import { Button } from '@/app/components/ui/Button';

interface SectorCardProps {
  sector: {
    id: string;
    name: string;
    description: string;
    created_at: string;
  };
  subsectorsCount: number;
  adminsCount: number;
  subsectors: Array<{ id: string; name: string }>;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export default function SectorCard({ 
  sector, 
  subsectorsCount, 
  adminsCount, 
  subsectors,
  onEdit, 
  onDelete,
  className = '' 
}: SectorCardProps) {
  const limitedSubsectors = subsectors.slice(0, 3);
  const remainingCount = subsectors.length - 3;

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
      className={`${className} admin-sector-card flex flex-col h-full transition-all duration-200`}
    >
      {/* Header com título e menu de ações */}
      <Card.Header className="pb-2">
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <div className="w-8 h-8 bg-orange-50 rounded-md flex items-center justify-center">
              <Icon name="building-1" className="w-4 h-4 text-primary" />
            </div>
            <Card.Title fontSize="lg" color="gray.800">
              {sector.name}
            </Card.Title>
          </HStack>

          {/* Menu de ações padronizado */}
          <AdminActionMenu 
            items={actionItems}
            triggerLabel=""
          />
        </HStack>
      </Card.Header>

      {/* Body com descrição e métricas */}
      <Card.Body className="space-y-4 flex-grow">
        {/* Descrição */}
        {sector.description && (
          <Card.Description fontSize="sm" lineHeight="relaxed">
            {sector.description}
          </Card.Description>
        )}

        {/* Métricas em grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-md px-3 py-2">
            <Text fontSize="xs" color="gray.500" mb="0.5">
              Subsetores
            </Text>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800">
              {subsectorsCount}
            </Text>
          </div>
          <div className="bg-gray-50 rounded-md px-3 py-2">
            <Text fontSize="xs" color="gray.500" mb="0.5">
              Administradores
            </Text>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800">
              {adminsCount}
            </Text>
          </div>
        </div>

        {/* Lista de Subsetores */}
        {limitedSubsectors.length > 0 && (
          <div>
            <Text fontSize="xs" fontWeight="medium" color="gray.600" mb="2">
              Subsetores vinculados:
            </Text>
            <Stack gap="1.5" direction="row" wrap="wrap">
              {limitedSubsectors.map(subsector => (
                <Badge 
                  key={subsector.id}
                  colorPalette="orange"
                  variant="subtle"
                  size="sm"
                >
                  {subsector.name}
                </Badge>
              ))}
              {remainingCount > 0 && (
                <Badge 
                  colorPalette="gray"
                  variant="subtle"
                  size="sm"
                >
                  +{remainingCount} mais
                </Badge>
              )}
            </Stack>
          </div>
        )}
      </Card.Body>

      {/* Footer com ações principais */}
      <Card.Footer className="flex gap-2">
        <Link href={`/admin/sectors/${sector.id}`} className="flex-1">
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
        <Link href={`/admin/sectors/${sector.id}/systems`} className="flex-1">
          <Button
            variant="outline"
            colorPalette="orange"
            size="sm"
            className="w-full"
            startElement={<Icon name="grid" className="w-3.5 h-3.5" />}
          >
            Sistemas
          </Button>
        </Link>
      </Card.Footer>
    </Card.Root>
  );
}
