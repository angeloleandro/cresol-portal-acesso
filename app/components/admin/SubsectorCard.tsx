'use client';

import Link from 'next/link';
import { Icon } from '../icons/Icon';
import { Button } from "../ui/Button";
import { ChakraCard } from '../ui/ChakraCard';
import { Badge, Box, HStack, Stack, Text } from "@chakra-ui/react";

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
  const createdDate = new Date(subsector.created_at);
  const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

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
          <Stack gap="1">
            <ChakraCard.Title>
              {subsector.name}
            </ChakraCard.Title>
            <Badge colorPalette="gray" variant="subtle" fontSize="xs">
              {daysAgo === 0 ? 'Hoje' : `${daysAgo} dias atrás`}
            </Badge>
          </Stack>

          <HStack gap="1">
            <Button
              onClick={onEdit}
              variant="ghost"
              size="sm"
              colorPalette="gray"
              title="Editar sub-setor"
            >
              <Icon name="pencil" className="h-4 w-4" />
            </Button>
            <Button
              onClick={onDelete}
              variant="ghost"
              size="sm"
              colorPalette="red"
              title="Excluir sub-setor"
            >
              <Icon name="trash" className="h-4 w-4" />
            </Button>
          </HStack>
        </HStack>
      </ChakraCard.Header>

      {/* Body com setor pai, descrição e informações */}
      <ChakraCard.Body className="p-6 space-y-5">
        {/* Setor pai em destaque */}
        <HStack align="center" gap="2">
          <Text fontSize="sm" color="gray.600">Setor:</Text>
          <Badge colorPalette="orange" variant="outline">
            {subsector.sector_name}
          </Badge>
        </HStack>

        {/* Descrição */}
        {subsector.description && (
          <ChakraCard.Description>
            <Text>
              {subsector.description}
            </Text>
          </ChakraCard.Description>
        )}

        {/* Informações do sub-setor */}
        <Box pt="4" borderTop="1px" borderColor="gray.100">
          <Text fontSize="xs" color="gray.600">
            Criado em {createdDate.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </Box>
      </ChakraCard.Body>

      {/* Footer com ações */}
      <ChakraCard.Footer className="p-6 flex gap-2 justify-start">
        <Button
          as={Link}
          href={`/admin-subsetor/subsetores/${subsector.id}`}
          variant="solid"
          colorPalette="orange"
          size="sm"
          borderRadius="sm"
        >
          Gerenciar
        </Button>
        <Button
          as={Link}
          href={`/subsetores/${subsector.id}/equipe`}
          variant="outline"
          colorPalette="gray"
          size="sm"
          borderRadius="sm"
        >
          Equipe
        </Button>
      </ChakraCard.Footer>
    </ChakraCard.Root>
  );
}
