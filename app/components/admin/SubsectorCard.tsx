'use client';

import { Box, HStack, Text, Badge } from '@chakra-ui/react';
import Link from 'next/link';

import { Icon } from '../icons/Icon';

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
      className={`${className} admin-subsector-card flex flex-col h-full`}
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
            <button
              title="Opções"
              className="p-2 text-primary hover:bg-orange-50 rounded-md transition-colors"
            >
              <Icon name="more-horizontal" className="h-5 w-5" />
            </button>
            
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

      {/* Body com setor pai, descrição e informações - flex-grow para ocupar espaço disponível */}
      <Box className="p-6 space-y-5 flex-grow">
        {/* Setor pai em destaque */}
        <HStack align="center" gap="2">
          <Text fontSize="sm" color="gray-600">Setor:</Text>
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

      {/* Footer com ações - sempre fixo no final */}
      <Box className="p-6 pt-3 flex gap-2 justify-start border-t border-gray-100">
        <Link href={`/admin-subsetor/subsetores/${subsector.id}`}>
          <button className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark transition-colors">
            Gerenciar
          </button>
        </Link>
        <Link href={`/subsetores/${subsector.id}/equipe`}>
          <button className="px-4 py-2 border border-primary text-primary rounded-md text-sm font-medium hover:bg-orange-50 transition-colors">
            Equipe
          </button>
        </Link>
      </Box>
    </Box>
  );
}
