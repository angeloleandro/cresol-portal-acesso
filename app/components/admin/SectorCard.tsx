'use client';

import { Badge, Box, HStack, Stack, Text } from "@chakra-ui/react";
import Link from 'next/link';

import { Icon } from '@/app/components/icons/Icon';

import { Button } from "../ui/Button";

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

  return (
    <Box 
      borderWidth="1px"
      borderRadius="md"
      bg="white"
      transition="border-color 0.15s"
      className={`${className} admin-sector-card`}
      css={{
        borderColor: 'rgba(210, 210, 206, 0.6)',
        '&:hover': {
          borderColor: 'rgba(210, 210, 206, 1)'
        }
      }}
    >
      {/* Header com ícone, título e ações */}
      <Box className="p-6 pb-0">
        <HStack justify="space-between" align="flex-start">
          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
            {sector.name}
          </Text>

          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              colorPalette="gray"
              title="Opções"
            >
              <Icon name="more-horizontal" className="h-4 w-4" />
            </Button>
            
            {/* Menu dropdown que aparece no hover */}
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200/60 hover:border-gray-200 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1 min-w-[120px]">
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  title="Editar setor"
                >
                  <Icon name="pencil" className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  title="Excluir setor"
                >
                  <Icon name="trash" className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </HStack>
      </Box>

      {/* Body com descrição e métricas */}
      <Box className="p-6 space-y-5">
        {/* Descrição */}
        {sector.description && (
          <Text color="gray.600">
            {sector.description}
          </Text>
        )}

        {/* Métricas principais */}
        <Stack gap="3">
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Sub-setores:</Text>
            <Badge colorScheme="orange" variant="subtle">
              {subsectorsCount}
            </Badge>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Administradores:</Text>
            <Badge colorScheme="gray" variant="subtle">
              {adminsCount}
            </Badge>
          </HStack>
        </Stack>

        {/* Lista de sub-setores */}
        {limitedSubsectors.length > 0 && (
          <Box pt="4" borderTop="1px" borderColor="gray.100">
            <Text fontSize="xs" color="gray.600" mb="2">Sub-setores:</Text>
            <Stack gap="1" direction="row" wrap="wrap">
              {limitedSubsectors.map(subsector => (
                <Badge 
                  key={subsector.id}
                  colorScheme="orange"
                  variant="subtle"
                  fontSize="xs"
                >
                  {subsector.name}
                </Badge>
              ))}
              {remainingCount > 0 && (
                <Badge 
                  colorScheme="gray"
                  variant="subtle"
                  fontSize="xs"
                >
                  +{remainingCount} mais
                </Badge>
              )}
            </Stack>
          </Box>
        )}
      </Box>

      {/* Footer com ações */}
      <Box className="p-6 flex gap-2 justify-start">
        <Link href={`/admin/sectors/${sector.id}`}>
          <Button
            variant="solid"
            colorScheme="orange"
            size="sm"
          >
            Gerenciar
          </Button>
        </Link>
        <Link href={`/admin/sectors/${sector.id}/systems`}>
          <Button
            variant="outline"
            colorScheme="gray"
            size="sm"
          >
            Sistemas
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
