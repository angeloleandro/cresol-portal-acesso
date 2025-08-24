'use client';

import { Box, HStack, Text, Badge } from '@chakra-ui/react';
import Link from 'next/link';

import { Icon } from '../icons/Icon';
import { Button } from "../ui/Button";

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

  return (
    <Box 
      borderWidth="1px"
      borderRadius="md"
      bg="white"
      transition="border-color 0.15s"
      className={`${className} admin-subsector-card`}
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
            {subsector.name}
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
              <div className="py-1 min-w-[140px]">
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  title="Editar sub-setor"
                >
                  <Icon name="pencil" className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  title="Excluir sub-setor"
                >
                  <Icon name="trash" className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </HStack>
      </Box>

      {/* Body com setor pai, descrição e informações */}
      <Box className="p-6 space-y-5">
        {/* Setor pai em destaque */}
        <HStack align="center" gap="2">
          <Text fontSize="sm" color="gray.600">Setor:</Text>
          <Badge colorScheme="orange" variant="outline">
            {subsector.sector_name}
          </Badge>
        </HStack>

        {/* Descrição */}
        {subsector.description && (
          <Text color="gray.600">
            {subsector.description}
          </Text>
        )}

      </Box>

      {/* Footer com ações */}
      <Box className="p-6 flex gap-2 justify-start">
        <Button
          as={Link}
          href={`/admin-subsetor/subsetores/${subsector.id}`}
          variant="solid"
          colorScheme="orange"
          size="sm"
        >
          Gerenciar
        </Button>
        <Button
          as={Link}
          href={`/subsetores/${subsector.id}/equipe`}
          variant="outline"
          colorScheme="gray"
          size="sm"
        >
          Equipe
        </Button>
      </Box>
    </Box>
  );
}
