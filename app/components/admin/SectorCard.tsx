'use client';

import Link from 'next/link';
import { Icon, IconName } from '../icons/Icon';
import { Button } from "../ui/Button";
import { ChakraCard } from '../ui/ChakraCard';
import { Badge, Box, HStack, Stack, Text } from "@chakra-ui/react";

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
    <ChakraCard.Root 
      variant="outline" 
      size="md" 
      colorPalette="gray"
      className={`${className} hover:border-gray-300 transition-colors duration-150`}
    >
      {/* Header com ícone, título e ações */}
      <ChakraCard.Header className="p-6 pb-0">
        <HStack justify="space-between" align="flex-start">
          <ChakraCard.Title>
            {sector.name}
          </ChakraCard.Title>

          <HStack gap="1">
            <Button
              onClick={onEdit}
              variant="ghost"
              size="sm"
              colorPalette="gray"
              title="Editar setor"
            >
              <Icon name="pencil" className="h-4 w-4" />
            </Button>
            <Button
              onClick={onDelete}
              variant="ghost"
              size="sm"
              colorPalette="red"
              title="Excluir setor"
            >
              <Icon name="trash" className="h-4 w-4" />
            </Button>
          </HStack>
        </HStack>
      </ChakraCard.Header>

      {/* Body com descrição e métricas */}
      <ChakraCard.Body className="p-6 space-y-5">
        {/* Descrição */}
        {sector.description && (
          <ChakraCard.Description>
            {sector.description}
          </ChakraCard.Description>
        )}

        {/* Métricas principais */}
        <Stack gap="3">
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Sub-setores:</Text>
            <Badge colorPalette="orange" variant="subtle">
              {subsectorsCount}
            </Badge>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Administradores:</Text>
            <Badge colorPalette="gray" variant="subtle">
              {adminsCount}
            </Badge>
          </HStack>
        </Stack>

        {/* Informação discreta de sub-setores */}
        <Text fontSize="xs" color="gray.500">
          Sub-setores criados: {subsectorsCount}/50
        </Text>

        {/* Lista de sub-setores */}
        {limitedSubsectors.length > 0 && (
          <Box pt="4" borderTop="1px" borderColor="gray.100">
            <Text fontSize="xs" color="gray.600" mb="2">Sub-setores:</Text>
            <Stack gap="1" direction="row" wrap="wrap">
              {limitedSubsectors.map(subsector => (
                <Badge 
                  key={subsector.id}
                  colorPalette="orange"
                  variant="subtle"
                  fontSize="xs"
                >
                  {subsector.name}
                </Badge>
              ))}
              {remainingCount > 0 && (
                <Badge 
                  colorPalette="gray"
                  variant="subtle"
                  fontSize="xs"
                >
                  +{remainingCount} mais
                </Badge>
              )}
            </Stack>
          </Box>
        )}
      </ChakraCard.Body>

      {/* Footer com ações */}
      <ChakraCard.Footer className="p-6 flex gap-2 justify-start">
        <Link href={`/admin/sectors/${sector.id}`}>
          <Button
            variant="solid"
            colorPalette="orange"
            size="sm"
            className="rounded-sm"
          >
            Gerenciar
          </Button>
        </Link>
        <Link href={`/admin/sectors/${sector.id}/systems`}>
          <Button
            variant="outline"
            colorPalette="gray"
            size="sm"
            className="rounded-sm"
          >
            Sistemas
          </Button>
        </Link>
      </ChakraCard.Footer>
    </ChakraCard.Root>
  );
}
