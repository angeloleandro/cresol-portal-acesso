'use client';

import { 
  Button,
  Grid,
  Separator,
  Flex,
  Text,
  Center
} from '@chakra-ui/react';
import { MenuContent, MenuItem, MenuPositioner, MenuRoot, MenuTrigger } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { Icon } from './icons/Icon';

// Tipo para os itens do menu
interface QuickLinkItem {
  key: string;
  href: string;
  title: string;
  description: string;
  icon: string;
  iconColor?: string;
}

const QuickLinksDropdown = memo(() => {
  const pathname = usePathname();

  // Verificar se algum dos links está ativo
  const isActive = pathname === '/dashboard' || 
                    pathname === '/sistemas' || 
                    pathname === '/eventos' || 
                    pathname === '/noticias';

  // Definir os itens do menu
  const menuItems: QuickLinkItem[] = [
    {
      key: 'calendario',
      href: '/eventos?view=calendar',
      title: 'Calendário',
      description: 'Eventos e compromissos organizacionais',
      icon: 'calendar',
      iconColor: 'text-primary'
    },
    {
      key: 'sistemas', 
      href: '/sistemas',
      title: 'Sistemas',
      description: 'Acesso aos sistemas corporativos',
      icon: 'monitor',
      iconColor: 'text-primary'
    },
    {
      key: 'dashboard',
      href: '/dashboard',
      title: 'Dashboard',
      description: 'Indicadores e métricas em tempo real',
      icon: 'chart-bar-vertical',
      iconColor: 'text-primary'
    },
    {
      key: 'noticias',
      href: '/noticias',
      title: 'Notícias',
      description: 'Últimas notícias e comunicados',
      icon: 'file-text',
      iconColor: 'text-primary'
    }
  ];

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Button
        variant="ghost"
        size="sm"
        color={isActive ? 'white' : 'whiteAlpha.700'}
        _hover={{ 
          color: 'white',
          bg: 'transparent'
        }}
      >
        Links Rápidos
        <Icon 
          name="chevron-down" 
          className="h-4 w-4 transition-transform ml-1" 
        />
        </Button>
      </MenuTrigger>
      
      <MenuPositioner>
        <MenuContent
        minW="600px"
        p={0}
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        shadow="lg"
      >
        {/* Header */}
        <Flex justify="space-between" align="center" px={4} py={3}>
          <Text fontSize="sm" fontWeight="medium" color="gray.900">
            Links Rápidos
          </Text>
          <Link href="/sistemas">
            <Text 
              fontSize="xs" 
              color="gray.600" 
              _hover={{ color: 'orange.500' }}
              transition="colors"
            >
              Ver todos
            </Text>
          </Link>
        </Flex>

        <Separator />

        {/* Grid de Links */}
        <Grid templateColumns="repeat(2, 1fr)" p={2}>
          {menuItems.map((item) => (
            <div key={item.key}>
              <MenuItem value={item.key}>
                <Link href={item.href} className="flex items-start gap-3 p-3 w-full hover:bg-gray-50 rounded-md transition-colors">
                  <Center
                    w="36px"
                    h="36px"
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    flexShrink={0}
                  >
                    <Icon 
                      name={item.icon as any} 
                      className="h-5 w-5 text-orange-500" 
                    />
                  </Center>
                  <div className="flex-1 min-w-0">
                    <Text fontSize="sm" fontWeight="medium" color="gray.900">
                      {item.title}
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt="1px" lineHeight="relaxed">
                      {item.description}
                    </Text>
                  </div>
                </Link>
              </MenuItem>
            </div>
          ))}
        </Grid>

        <Separator />

        {/* Footer com CTA */}
        <Flex 
          justify="space-between" 
          align="center" 
          bg="gray.50" 
          px={6} 
          py={4}
        >
          <div>
            <Text fontSize="sm" fontWeight="medium" color="gray.900">
              Precisa de ajuda?
            </Text>
            <Text fontSize="xs" color="gray.500" mt="1px">
              Entre em contato com o suporte técnico
            </Text>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            colorScheme="gray"
            fontSize="xs"
            fontWeight="medium"
            px={4}
            h={8}
          >
            Explorar
          </Button>
        </Flex>
        </MenuContent>
      </MenuPositioner>
    </MenuRoot>
  );
});

QuickLinksDropdown.displayName = 'QuickLinksDropdown';

export default QuickLinksDropdown;