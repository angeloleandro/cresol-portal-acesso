'use client';

import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Link as ChakraLink,
  Text,
  VStack,
  Separator,
  SimpleGrid,
  Center,
  Group,
  DrawerRoot,
  DrawerContent,
  DrawerBody,
  DrawerHeader,
  DrawerCloseTrigger,
  DrawerBackdrop,
  DrawerTitle,
} from '@chakra-ui/react';
// Removed Collapsible import - will use conditional rendering instead
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from '@chakra-ui/react/menu';
import { useDisclosure } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useCallback, memo, useRef, useEffect } from 'react';

import { 
  useOptimizedUser, 
  useOptimizedSectors, 
  useOptimizedAgencies,
  useOptimizedDropdown 
} from '@/hooks/useOptimizedNavbar';

import GlobalSearch from './GlobalSearch';
import { Icon } from './icons/Icon';
import type { IconName } from './icons/Icon';

// Types
interface Subsector {
  id: string;
  name: string;
  description?: string;
  sector_id: string;
}

interface Sector {
  id: string;
  name: string;
  description?: string;
  subsectors?: Subsector[];
}

interface SectorItemProps {
  sector: Sector;
  onClose: () => void;
}

// Skeleton loading component
const NavbarSkeleton = memo(() => (
  <Box as="header" bg="orange.500" borderBottom="1px" borderColor="orange.600" zIndex={30} position="relative">
    <Flex maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={4} justify="space-between" align="center">
      <Flex align="center">
        <Box h={8} w={24} bg="whiteAlpha.300" borderRadius="sm" className="animate-pulse" />
      </Flex>
      <HStack gap={4} display={{ base: 'none', md: 'flex' }}>
        <Box h={4} w={32} bg="whiteAlpha.300" borderRadius="sm" className="animate-pulse" />
        <Box h={4} w={24} bg="whiteAlpha.300" borderRadius="sm" className="animate-pulse" />
      </HStack>
    </Flex>
  </Box>
));
NavbarSkeleton.displayName = 'NavbarSkeleton';

// Custom Card Dropdown Component with Mobile Support
const CardDropdown = memo(({ 
  trigger, 
  children, 
  isOpen, 
  onClose, 
  width = "600px",
  showFooter = false,
  footerContent,
  title = ""
}: { 
  trigger: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  width?: string;
  showFooter?: boolean;
  footerContent?: React.ReactNode;
  title?: string;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, isMobile]);

  // Mobile version - Drawer
  if (isMobile) {
    return (
      <>
        <Box ref={triggerRef}>
          {trigger}
        </Box>
        <DrawerRoot 
          open={isOpen} 
          onOpenChange={(e) => !e.open && onClose()}
          placement="bottom"
        >
          <DrawerBackdrop />
          <DrawerContent maxH="85vh" borderTopRadius="lg">
            <DrawerHeader borderBottom="1px" borderColor="gray.200">
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerCloseTrigger />
            </DrawerHeader>
            <DrawerBody p={0} overflowY="auto">
              <Box pb={showFooter && footerContent ? 20 : 0}>
                {children}
              </Box>
              {showFooter && footerContent && (
                <Box
                  bg="gray.50"
                  borderTop="1px solid"
                  borderColor="gray.200"
                  px={6}
                  py={5}
                  pb={6}
                  position="fixed"
                  bottom={0}
                  left={0}
                  right={0}
                  zIndex={10}
                >
                  {footerContent}
                </Box>
              )}
            </DrawerBody>
          </DrawerContent>
        </DrawerRoot>
      </>
    );
  }

  // Desktop version - Dropdown
  return (
    <Box position="relative" ref={triggerRef}>
      {trigger}
      {isOpen && (
        <Box
          ref={dropdownRef}
          position="absolute"
          top="100%"
          left="50%"
          transform="translateX(-50%)"
          mt={2}
          width={width}
          bg="white"
          borderRadius="md"
          boxShadow="0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2)"
          border="1px solid"
          borderColor="gray.200"
          overflow="hidden"
          zIndex={1000}
        >
          <Box p={0}>
            {children}
          </Box>
          {showFooter && footerContent && (
            <Box
              bg="gray.50"
              borderTop="1px solid"
              borderColor="gray.200"
              px={8}
              py={5}
              pb={6}
            >
              {footerContent}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
});
CardDropdown.displayName = 'CardDropdown';

// Gallery Dropdown with Card Style
const GalleryDropdown = memo(({ pathname }: { pathname: string }) => {
  const isActive = pathname.startsWith('/galeria') || pathname.startsWith('/videos');
  const { open: isOpen, onToggle, onClose } = useDisclosure();
  
  const galleryItems: { icon: IconName; title: string; description: string; href: string }[] = [
    {
      icon: 'image',
      title: 'Galeria de Imagens',
      description: 'Fotos e imagens institucionais',
      href: '/galeria'
    },
    {
      icon: 'play',
      title: 'Galeria de Vídeos',
      description: 'Vídeos e conteúdo multimídia',
      href: '/videos'
    }
  ];

  return (
    <CardDropdown
      isOpen={isOpen}
      onClose={onClose}
      width="500px"
      title="Galeria"
      trigger={
        <Button
          variant="ghost"
          size="sm"
          color={isActive ? 'white' : 'whiteAlpha.800'}
          _hover={{ color: 'white', bg: 'transparent' }}
          _active={{ bg: 'transparent' }}
          fontWeight="medium"
          fontSize="sm"
          onClick={onToggle}
        >
          Galeria
          <Icon name="chevron-down" className={`h-4 w-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      }
      showFooter={true}
      footerContent={
        <Flex justify="space-between" align="center" flexDir={{ base: 'column', md: 'row' }} gap={{ base: 4, md: 0 }}>
          <Box textAlign={{ base: 'center', md: 'left' }}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
              Explorar galerias
            </Text>
            <Text fontSize="xs" color="gray.600" mt={0.5}>
              Acesse fotos e vídeos institucionais
            </Text>
          </Box>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.href = '/galeria'}
            borderColor="orange.500"
            borderWidth="2px"
            color="orange.500"
            px={6}
            w={{ base: 'full', md: 'auto' }}
            _hover={{ bg: 'orange.50', borderColor: 'orange.600', color: 'orange.600' }}
          >
            Ver todas
          </Button>
        </Flex>
      }
    >
      <Box p={5}>
        <Text fontWeight="semibold" fontSize="sm" color="gray.900" mb={4}>
          Galeria
        </Text>
        
        <Separator mb={4} borderColor="gray.200" />
        
        <VStack align="stretch" gap={0}>
          {galleryItems.map((item, index) => (
            <ChakraLink
              key={item.href}
              as={Link}
              href={item.href}
              display="block"
              px={4}
              py={3}
              mx={2}
              borderRadius="md"
              _hover={{ bg: 'gray.50', textDecoration: 'none' }}
              transition="all 0.2s"
              onClick={onClose}
            >
              <HStack align="flex-start" gap={3}>
                <Box
                  p={2}
                  bg="orange.50"
                  borderRadius="md"
                  color="orange.500"
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                </Box>
                <VStack align="stretch" gap={0.5} flex={1}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.900">
                    {item.title}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {item.description}
                  </Text>
                </VStack>
              </HStack>
            </ChakraLink>
          ))}
        </VStack>
      </Box>
    </CardDropdown>
  );
});
GalleryDropdown.displayName = 'GalleryDropdown';

// Quick Links Dropdown with Card Style
const QuickLinksDropdown = memo(() => {
  const { open: isOpen, onToggle, onClose } = useDisclosure();
  
  const menuItems: { key: string; href: string; label: string; icon: IconName; description: string }[] = [
    { 
      key: 'dashboard', 
      href: '/dashboard', 
      label: 'Dashboard',
      icon: 'chart-bar-vertical',
      description: 'Visão geral e estatísticas'
    },
    { 
      key: 'calendar', 
      href: '/eventos?view=calendar', 
      label: 'Calendário de Eventos',
      icon: 'calendar',
      description: 'Eventos e compromissos'
    },
    { 
      key: 'systems', 
      href: '/sistemas', 
      label: 'Sistemas',
      icon: 'monitor',
      description: 'Acesso aos sistemas internos'
    },
    { 
      key: 'news', 
      href: '/noticias', 
      label: 'Notícias',
      icon: 'list',
      description: 'Últimas notícias e comunicados'
    },
    { 
      key: 'messages', 
      href: '/mensagens', 
      label: 'Mensagens',
      icon: 'mail',
      description: 'Central de mensagens'
    },
  ];

  return (
    <CardDropdown
      isOpen={isOpen}
      onClose={onClose}
      width="600px"
      title="Acesso Rápido"
      trigger={
        <Button
          variant="ghost"
          size="sm"
          color="whiteAlpha.800"
          _hover={{ color: 'white', bg: 'transparent' }}
          _active={{ bg: 'transparent' }}
          fontWeight="medium"
          fontSize="sm"
          onClick={onToggle}
        >
          Acesso Rápido
          <Icon name="chevron-down" className={`h-4 w-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      }
      showFooter={true}
      footerContent={
        <Flex justify="space-between" align="center" flexDir={{ base: 'column', md: 'row' }} gap={{ base: 4, md: 0 }}>
          <Box textAlign={{ base: 'center', md: 'left' }}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
              Começar agora
            </Text>
            <Text fontSize="xs" color="gray.600" mt={0.5}>
              Acesse seus sistemas e ferramentas favoritas
            </Text>
          </Box>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
            borderColor="orange.500"
            borderWidth="2px"
            color="orange.500"
            px={6}
            w={{ base: 'full', md: 'auto' }}
            _hover={{ bg: 'orange.50', borderColor: 'orange.600', color: 'orange.600' }}
          >
            Acessar dashboard
          </Button>
        </Flex>
      }
    >
      <Box p={5}>
        <Text fontWeight="semibold" fontSize="sm" color="gray.900" mb={4}>
          Acesso Rápido
        </Text>
        
        <Separator mb={4} borderColor="gray.200" />
        
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
          {menuItems.map((item) => (
            <ChakraLink
              key={item.key}
              as={Link}
              href={item.href}
              display="block"
              px={4}
              py={3}
              mx={2}
              borderRadius="md"
              _hover={{ bg: 'gray.50', textDecoration: 'none' }}
              transition="all 0.2s"
              onClick={onClose}
            >
              <HStack align="flex-start" gap={3}>
                <Box
                  p={2}
                  bg="orange.50"
                  borderRadius="md"
                  color="orange.500"
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                </Box>
                <VStack align="stretch" gap={0.5} flex={1}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.900">
                    {item.label}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {item.description}
                  </Text>
                </VStack>
              </HStack>
            </ChakraLink>
          ))}
        </SimpleGrid>
      </Box>
    </CardDropdown>
  );
});
QuickLinksDropdown.displayName = 'QuickLinksDropdown';

// Sector Item with Expandable Subsectors
const SectorItem = memo(({ sector, onClose }: SectorItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubsectors = sector.subsectors && sector.subsectors.length > 0;

  return (
    <Box 
      borderRadius="md"
      border="1px solid"
      borderColor="gray.100"
      _hover={{ borderColor: 'gray.200', bg: 'gray.50' }}
      transition="all 0.2s"
      overflow="hidden"
    >
      <Flex
        px={3}
        py={2.5}
        align="center"
        gap={2}
      >
        <ChakraLink
          as={Link}
          href={`/setores/${sector.id}`}
          display="flex"
          flex={1}
          gap={2.5}
          alignItems="center"
          _hover={{ textDecoration: 'none' }}
          onClick={onClose}
        >
          <Box
            p={1.5}
            bg="orange.50"
            borderRadius="md"
            color="orange.500"
            flexShrink={0}
          >
            <Icon name="folder" className="h-4 w-4" />
          </Box>
          <VStack align="stretch" gap={0} flex={1} minW={0}>
            <Text 
              fontSize="sm" 
              fontWeight="medium" 
              color="gray.900" 
              lineClamp={1}
              _groupHover={{ color: 'orange.600' }}
              transition="color 0.2s"
            >
              {sector.name}
            </Text>
            {sector.description && (
              <Text fontSize="xs" color="gray.600" lineClamp={1}>
                {sector.description}
              </Text>
            )}
          </VStack>
        </ChakraLink>
        {hasSubsectors && (
          <IconButton
            size="xs"
            variant="ghost"
            aria-label={isExpanded ? "Recolher subsetores" : "Expandir subsetores"}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            _hover={{ bg: 'gray.200' }}
            color="gray.500"
            borderRadius="md"
          >
            <Icon 
              name="chevron-down" 
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
            />
          </IconButton>
        )}
      </Flex>
      
      {isExpanded && hasSubsectors && (
        <Box borderTop="1px solid" borderColor="gray.100" bg="gray.50">
          <VStack align="stretch" gap={0.5} p={2}>
            {sector.subsectors!.map(subsector => (
              <ChakraLink
                key={subsector.id}
                as={Link}
                href={`/subsetores/${subsector.id}`}
                display="block"
                px={2.5}
                py={1.5}
                borderRadius="md"
                fontSize="xs"
                color="gray.700"
                _hover={{ bg: 'white', textDecoration: 'none', color: 'orange.600' }}
                transition="all 0.2s"
                onClick={onClose}
              >
                <HStack gap={2}>
                  <Box w={1} h={1} bg="orange.400" borderRadius="full" flexShrink={0} />
                  <Text lineClamp={1}>{subsector.name}</Text>
                </HStack>
              </ChakraLink>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
});
SectorItem.displayName = 'SectorItem';

// Sectors Dropdown with Card Style
const SectorsDropdown = memo(({ pathname, sectors }: { pathname: string; sectors: Sector[] }) => {
  const isActive = pathname.startsWith('/setores');
  const { open: isOpen, onToggle, onClose } = useDisclosure();
  
  if (!sectors || sectors.length === 0) {
    return (
      <ChakraLink
        as={Link}
        href="/setores"
        fontSize="sm"
        fontWeight="medium"
        color={isActive ? 'white' : 'whiteAlpha.800'}
        _hover={{ color: 'white', textDecoration: 'none' }}
      >
        Setores
      </ChakraLink>
    );
  }

  return (
    <CardDropdown
      isOpen={isOpen}
      onClose={onClose}
      width="750px"
      title="Setores"
      trigger={
        <Button
          variant="ghost"
          size="sm"
          color={isActive ? 'white' : 'whiteAlpha.800'}
          _hover={{ color: 'white', bg: 'transparent' }}
          _active={{ bg: 'transparent' }}
          fontWeight="medium"
          fontSize="sm"
          onClick={onToggle}
        >
          Setores
          <Icon name="chevron-down" className={`h-4 w-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      }
      showFooter={true}
      footerContent={
        <Flex justify="space-between" align="center" flexDir={{ base: 'column', md: 'row' }} gap={{ base: 4, md: 0 }}>
          <Box textAlign={{ base: 'center', md: 'left' }}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
              Explorar setores
            </Text>
            <Text fontSize="xs" color="gray.600" mt={0.5}>
              Navegue pelos setores e suas áreas de atuação
            </Text>
          </Box>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.href = '/setores'}
            borderColor="orange.500"
            borderWidth="2px"
            color="orange.500"
            px={6}
            w={{ base: 'full', md: 'auto' }}
            _hover={{ bg: 'orange.50', borderColor: 'orange.600', color: 'orange.600' }}
          >
            Ver todos
          </Button>
        </Flex>
      }
    >
      <Box p={5}>
        <Text fontWeight="semibold" fontSize="sm" color="gray.900" mb={4}>
          Setores
        </Text>
        
        <Separator mb={4} borderColor="gray.200" />
        
        <Box maxH="400px" overflowY="auto">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
            {sectors.map(sector => (
              <SectorItem key={sector.id} sector={sector} onClose={onClose} />
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    </CardDropdown>
  );
});
SectorsDropdown.displayName = 'SectorsDropdown';

// Agencies Dropdown with Card Style
const AgenciesDropdown = memo(({ pathname, agencies }: { pathname: string; agencies: any[] }) => {
  const isActive = pathname.includes('5463d1ba-c290-428e-b39e-d7ad9c66eb71');
  const { open: isOpen, onToggle, onClose } = useDisclosure();
  
  if (!agencies || agencies.length === 0) {
    return (
      <ChakraLink
        as={Link}
        href="/setores/5463d1ba-c290-428e-b39e-d7ad9c66eb71"
        fontSize="sm"
        fontWeight="medium"
        color={isActive ? 'white' : 'whiteAlpha.800'}
        _hover={{ color: 'white', textDecoration: 'none' }}
      >
        Agências
      </ChakraLink>
    );
  }

  return (
    <CardDropdown
      isOpen={isOpen}
      onClose={onClose}
      width="700px"
      title="Agências"
      trigger={
        <Button
          variant="ghost"
          size="sm"
          color={isActive ? 'white' : 'whiteAlpha.800'}
          _hover={{ color: 'white', bg: 'transparent' }}
          _active={{ bg: 'transparent' }}
          fontWeight="medium"
          fontSize="sm"
          onClick={onToggle}
        >
          Agências
          <Icon name="chevron-down" className={`h-4 w-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      }
      showFooter={true}
      footerContent={
        <Flex justify="space-between" align="center" flexDir={{ base: 'column', md: 'row' }} gap={{ base: 4, md: 0 }}>
          <Box textAlign={{ base: 'center', md: 'left' }}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
              Encontre sua agência
            </Text>
            <Text fontSize="xs" color="gray.600" mt={0.5}>
              Localize e acesse informações das nossas unidades
            </Text>
          </Box>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.href = '/setores/5463d1ba-c290-428e-b39e-d7ad9c66eb71'}
            borderColor="orange.500"
            borderWidth="2px"
            color="orange.500"
            px={6}
            w={{ base: 'full', md: 'auto' }}
            _hover={{ bg: 'orange.50', borderColor: 'orange.600', color: 'orange.600' }}
          >
            Ver todas
          </Button>
        </Flex>
      }
    >
      <Box p={5}>
        <Text fontWeight="semibold" fontSize="sm" color="gray.900" mb={4}>
          Agências
        </Text>
        
        <Separator mb={4} borderColor="gray.200" />
        
        <Box maxH="320px" overflowY="auto">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
            {agencies.map(agency => (
              <ChakraLink
                key={agency.id}
                as={Link}
                href={`/subsetores/${agency.id}`}
                display="block"
                px={3}
                py={2.5}
                mx={2}
                borderRadius="md"
                _hover={{ bg: 'gray.50', textDecoration: 'none' }}
                transition="all 0.2s"
                onClick={onClose}
              >
                <HStack align="flex-start" gap={3}>
                  <Box
                    p={1.5}
                    bg="orange.50"
                    borderRadius="md"
                    color="orange.500"
                  >
                    <Icon name="building-1" className="h-4 w-4" />
                  </Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.900" lineClamp={1}>
                    {agency.name}
                  </Text>
                </HStack>
              </ChakraLink>
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    </CardDropdown>
  );
});
AgenciesDropdown.displayName = 'AgenciesDropdown';

// Admin Sector Dropdown with Card Style
const AdminSectorDropdown = memo(({ sectors }: { sectors: Sector[] }) => {
  const { open: isOpen, onToggle, onClose } = useDisclosure();
  
  return (
    <CardDropdown
      isOpen={isOpen}
      onClose={onClose}
      width="550px"
      title="Administração de Setores"
      trigger={
        <Button
          variant="ghost"
          size="sm"
          color="whiteAlpha.800"
          _hover={{ color: 'white', bg: 'transparent' }}
          _active={{ bg: 'transparent' }}
          fontWeight="medium"
          fontSize="sm"
          onClick={onToggle}
        >
          Painel Admin Setor
          <Icon name="chevron-down" className={`h-4 w-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      }
      showFooter={true}
      footerContent={
        <Flex justify="space-between" align="center" flexDir={{ base: 'column', md: 'row' }} gap={{ base: 4, md: 0 }}>
          <Box textAlign={{ base: 'center', md: 'left' }}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
              Gerenciar setores
            </Text>
            <Text fontSize="xs" color="gray.600" mt={0.5}>
              Administre conteúdo e configurações dos setores
            </Text>
          </Box>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.href = '/admin-setor'}
            borderColor="orange.500"
            borderWidth="2px"
            color="orange.500"
            px={6}
            w={{ base: 'full', md: 'auto' }}
            _hover={{ bg: 'orange.50', borderColor: 'orange.600', color: 'orange.600' }}
          >
            Ir para painel
          </Button>
        </Flex>
      }
    >
      <Box p={5}>
        <Text fontWeight="semibold" fontSize="sm" color="gray.900" mb={4}>
          Administração de Setores
        </Text>
        
        <Separator mb={4} borderColor="gray.200" />
        
        {sectors.length > 0 ? (
          <VStack align="stretch" gap={0}>
            <Box px={2} pb={2}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                Setores Disponíveis
              </Text>
            </Box>
            
            {sectors.map(sector => (
              <ChakraLink
                key={sector.id}
                as={Link}
                href={`/admin-setor/setores/${sector.id}`}
                display="block"
                px={4}
                py={3}
                mx={2}
                borderRadius="md"
                _hover={{ bg: 'gray.50', textDecoration: 'none' }}
                transition="all 0.2s"
                onClick={onClose}
              >
                <HStack align="flex-start" gap={3}>
                  <Box
                    p={2}
                    bg="orange.50"
                    borderRadius="md"
                    color="orange.500"
                  >
                    <Icon name="settings" className="h-5 w-5" />
                  </Box>
                  <VStack align="stretch" gap={0.5} flex={1}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.900">
                      {sector.name}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Gerenciar conteúdo do setor
                    </Text>
                  </VStack>
                </HStack>
              </ChakraLink>
            ))}
          </VStack>
        ) : (
          <Box px={4} py={8} textAlign="center">
            <Text fontSize="sm" color="gray.500">
              Nenhum setor disponível para administração
            </Text>
          </Box>
        )}
      </Box>
    </CardDropdown>
  );
});
AdminSectorDropdown.displayName = 'AdminSectorDropdown';

// Search Button Component
const SearchButton = memo(({ user }: { user: any }) => {
  const { open: isOpen, onToggle, onClose } = useDisclosure();
  
  if (!user) return null;
  
  return (
    <Box position="relative">
      <IconButton
        aria-label="Buscar"
        variant="ghost"
        size="sm"
        color="whiteAlpha.800"
        _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
        onClick={onToggle}
      >
        <Icon name="search" className="h-5 w-5" />
      </IconButton>
      
      {isOpen && (
        <>
          <Box
            position="fixed"
            inset={0}
            zIndex={40}
            onClick={onClose}
          />
          
          <Box
            position="absolute"
            right={0}
            mt={2}
            w={{ base: 'calc(100vw - 2rem)', md: 96 }}
            maxW="384px"
            bg="white"
            borderRadius="lg"
            borderWidth={1}
            borderColor="gray.200"
            zIndex={50}
            p={4}
          >
            <Text fontSize="sm" fontWeight="medium" color="gray.900" mb={3}>
              Buscar no Portal
            </Text>
            <GlobalSearch 
              className="w-full"
              placeholder="Buscar sistemas, eventos, notícias..."
              showAdvancedButton={true}
              autoFocus={true}
            />
          </Box>
        </>
      )}
    </Box>
  );
});
SearchButton.displayName = 'SearchButton';

// User Menu Component
const UserMenu = memo(({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <MenuRoot positioning={{ placement: "bottom-end" }}>
    <MenuTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        color="whiteAlpha.800"
        _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
        _active={{ bg: 'whiteAlpha.100' }}
        fontSize="sm"
      >
        {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'}
        <Icon name="user-circle" className="h-5 w-5 ml-1" />
      </Button>
    </MenuTrigger>
    <MenuContent bg="white" borderColor="gray.200" borderRadius="md" py={1} minW="192px">
      <MenuItem value="profile" asChild>
        <Link href="/profile">Perfil</Link>
      </MenuItem>
      <MenuItem value="logout" onClick={onLogout}>
        Sair
      </MenuItem>
    </MenuContent>
  </MenuRoot>
));
UserMenu.displayName = 'UserMenu';

// Main Navbar Component
function ChakraNavbar() {
  const pathname = usePathname();
  
  // Hooks otimizados
  const { user, profile, loading, handleLogout } = useOptimizedUser();
  const { sectors: navigationSectors } = useOptimizedSectors(undefined, undefined, true, true);
  const { sectors: adminSectors } = useOptimizedSectors(profile?.role, user?.id, true, false);
  const { agencies } = useOptimizedAgencies();
  
  // Mobile menu state
  const { open: isMobileMenuOpen, onToggle: toggleMobileMenu, onClose: closeMobileMenu } = useDisclosure();
  const { open: isMobileSectorsOpen, onToggle: toggleMobileSectors } = useDisclosure();
  
  // Mobile dropdown states
  const { open: isMobileGalleryOpen, onToggle: toggleMobileGallery, onClose: closeMobileGallery } = useDisclosure();
  const { open: isMobileQuickLinksOpen, onToggle: toggleMobileQuickLinks, onClose: closeMobileQuickLinks } = useDisclosure();
  
  // Early return if loading
  if (loading) {
    return <NavbarSkeleton />;
  }

  return (
    <Box as="header" bg="orange.500" borderBottom="1px" borderColor="orange.600" zIndex={30} position="relative">
      <Flex maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={4} justify="space-between" align="center">
        {/* Logo */}
        <Flex align="center">
          <ChakraLink as={Link} href="/home" display="flex" alignItems="center">
            <Box position="relative" h={10} w={32} display="flex" alignItems="center" justifyContent="center">
              <svg 
                className="h-10 w-auto text-white"
                viewBox="0 0 151.02 29.93"
                fill="currentColor"
              >
                <path d="M27.49,14.96c0,6.91-5.62,12.53-12.53,12.53S2.43,21.87,2.43,14.96,8.06,2.43,14.96,2.43s12.53,5.62,12.53,12.53M29.93,14.96C29.93,6.71,23.22,0,14.96,0S0,6.71,0,14.96s6.71,14.96,14.96,14.96,14.96-6.71,14.96-14.96"/>
                <path d="M22.25,15.72l-3.52,3.46-2.12-2.09.83-.82c1.36-1.49-.38-2.8-.38-2.8-.01,0-.02,0-.03-.01l-2.99,2.96-.18.18-2.62,2.58-3.52-3.46c-.48-.48-.49-1.25,0-1.73l3.52-3.47,2.12,2.09-.83.82c-1.36,1.49.38,2.8.38,2.8.01,0,.02,0,.03.01l5.79-5.73,3.52,3.46c.48.48.48,1.26,0,1.73M23.87,12.39l-4.94-4.87c-.1-.1-.31-.1-.41,0l-3.54,3.5-3.54-3.49c-.1-.1-.3-.1-.41,0l-4.94,4.87c-.67.66-1.04,1.54-1.04,2.47s.37,1.81,1.04,2.47l4.94,4.87c.1.1.3.11.41,0l3.54-3.5,3.54,3.49c.12.12.29.12.41,0l4.94-4.87c.67-.66,1.04-1.54,1.04-2.47s-.37-1.81-1.04-2.47"/>
                <path d="M124.56,21.47c-3.2,0-5.2-2.51-5.2-6.56s1.94-6.5,5.2-6.5,5.16,2.43,5.16,6.5-1.98,6.56-5.16,6.56M124.56,4.89c-6.01,0-9.75,3.84-9.75,10.03s3.74,10.05,9.75,10.05,9.72-3.85,9.72-10.05-3.72-10.03-9.72-10.03"/>
                <path d="M94.6,21.37h-10.75v-4.89h6.64c.7-.09,1.51-.38,1.51-1.24l.02-2.17h-8.18v-4.3h8.54c.89-.07,1.42-.76,1.64-1.23.27-.58.74-2.46.74-2.46,0,0-13.63,0-13.65,0-1,0-1.82.72-1.82,1.6v16.51c0,.88.82,1.6,1.82,1.6h11.8c.94-.07,1.68-.76,1.68-1.59,0-.03,0-1.82,0-1.82"/>
                <path d="M149.36,24.8c.93-.07,1.64-.74,1.66-1.56v-1.85h-9.6V5.06h-4.56v19.73h12.5Z"/>
                <path d="M98.77,24.05c2.65.77,4.32.92,6.17.92,3.67,0,8.05-.98,8.05-5.65,0-2.89-1.41-4.28-5.79-5.75l-2.66-.88c-1.75-.57-2.99-1.08-2.99-2.3s1.31-1.98,3.27-1.98c1.4,0,2.68.29,3.85.6l.61.17c.9.13,1.58-.25,2.01-1.14l.73-1.78-2.21-.66c-1.61-.48-3.29-.72-4.99-.72-4.92,0-7.86,2.06-7.86,5.51,0,2.85,1.39,4.22,5.73,5.66l2.66.9c1.42.48,3.05,1.19,3.05,2.36,0,2.15-2.6,2.15-3.46,2.15-1.5,0-2.95-.21-4.7-.69l-.85-.23c-.14-.03-.29-.04-.44-.04-.94,0-1.44.66-1.7,1.22l-.68,1.69,2.2.63h0Z"/>
                <path d="M70.6,21.63l.7,1.52c.62,1.22,1.51,1.62,2.49,1.62h3.18s-2.29-4.65-2.35-4.8c-.63-1.22-1.78-2.94-2.63-3.28-.09-.04-.59-.23-.59-.23,0,0,.53-.22.64-.27,1.65-.65,3.57-2.44,3.57-5.03,0-3.71-2.81-6.06-7.7-6.06,0,0-7.13,0-7.17,0-.89,0-1.8.99-1.8,1.75v17.93h4.56V8.74h4.41c1.86,0,3.11,1.1,3.11,2.74,0,1.85-1.28,2.74-3.78,2.74-.79,0-1.18.15-1.47.47-.63.67-.69,1.96-.62,2.96,3.42.12,4.39,1.65,5.46,3.96"/>
                <path d="M54.02,21.04s-2.16.44-3.61.44c-3.37,0-5.39-2.43-5.39-6.5v-.1c0-4.07,2.01-6.5,5.39-6.5,1.44,0,3.61.44,3.61.44.76.09,1.51-.24,1.91-1.08.21-.44.66-1.85.66-1.85l-1.54-.46c-1.47-.42-2.77-.58-4.64-.58-6.15,0-9.98,3.84-9.98,10.02v.1c0,6.18,3.82,10.02,9.98,10.02,1.87,0,3.17-.16,4.64-.58l1.54-.46s-.45-1.4-.66-1.85c-.4-.84-1.16-1.18-1.91-1.08"/>
              </svg>
            </Box>
          </ChakraLink>
          
          {/* Divisória vertical */}
          <Box h={6} w="1px" bg="whiteAlpha.300" mx={4} />
          
          {/* Texto HUB */}
          <Flex align="baseline" display={{ base: 'none', sm: 'flex' }}>
            <Text color="white" fontWeight="bold" fontSize="lg" letterSpacing="wide">HUB</Text>
            <Text color="whiteAlpha.600" fontWeight="light" fontSize="sm" ml={1}>2.0</Text>
          </Flex>
        </Flex>
        
        {/* Desktop Menu */}
        <HStack gap={4} display={{ base: 'none', md: 'flex' }}>
          <HStack as="nav" gap={4} mr={4}>
            <ChakraLink
              as={Link}
              href="/home"
              fontSize="sm"
              fontWeight="medium"
              color={pathname === '/home' ? 'white' : 'whiteAlpha.800'}
              _hover={{ color: 'white', textDecoration: 'none' }}
            >
              Home
            </ChakraLink>
            
            <QuickLinksDropdown />
            
            <SectorsDropdown 
              pathname={pathname}
              sectors={navigationSectors}
            />
            
            <AgenciesDropdown 
              pathname={pathname}
              agencies={agencies}
            />
            
            <GalleryDropdown 
              pathname={pathname}
            />
          </HStack>
          
          <HStack gap={3} borderLeft="1px" borderColor="whiteAlpha.300" pl={4}>
            {/* Admin Panel Links */}
            {profile?.isAdmin && (
              <ChakraLink
                as={Link}
                href="/admin"
                fontSize="sm"
                color="whiteAlpha.800"
                _hover={{ color: 'white', textDecoration: 'none' }}
              >
                Painel Admin
              </ChakraLink>
            )}
            
            {profile?.isSectorAdmin && (
              <AdminSectorDropdown sectors={adminSectors} />
            )}
            
            {/* Search Button */}
            <SearchButton user={user} />
            
            {/* User Menu */}
            <UserMenu user={user} onLogout={handleLogout} />
          </HStack>
        </HStack>
        
        {/* Mobile Menu Button */}
        <HStack gap={4} display={{ base: 'flex', md: 'none' }}>
          {profile?.isAdmin && (
            <ChakraLink
              as={Link}
              href="/admin"
              fontSize="sm"
              color="whiteAlpha.800"
              _hover={{ color: 'white', textDecoration: 'none' }}
            >
              Admin
            </ChakraLink>
          )}
          
          {profile?.isSectorAdmin && (
            <ChakraLink
              as={Link}
              href="/admin-setor"
              fontSize="sm"
              color="whiteAlpha.800"
              _hover={{ color: 'white', textDecoration: 'none' }}
            >
              Admin Setor
            </ChakraLink>
          )}
          
          <IconButton
            aria-label="Menu"
            variant="ghost"
            color="whiteAlpha.800"
            _hover={{ color: 'white' }}
            onClick={toggleMobileMenu}
          >
            <Icon name={isMobileMenuOpen ? "close" : "menu"} className="h-6 w-6" />
          </IconButton>
        </HStack>
      </Flex>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <VStack
          display={{ base: 'flex', md: 'none' }}
          px={4}
          py={2}
          pb={4}
          bg="orange.500"
          borderTop="1px"
          borderColor="orange.600"
          align="stretch"
          gap={2}
        >
          <ChakraLink
            as={Link}
            href="/home"
            py={2}
            fontSize="sm"
            fontWeight="medium"
            color={pathname === '/home' ? 'white' : 'whiteAlpha.800'}
            _hover={{ color: 'white', textDecoration: 'none' }}
            onClick={() => closeMobileMenu()}
          >
            Home
          </ChakraLink>
          
          {/* Quick Links Mobile Dropdown */}
          <Box display={{ base: 'block', md: 'none' }}>
            <QuickLinksDropdown />
          </Box>
          
          {/* Gallery Mobile Dropdown */}
          <Box display={{ base: 'block', md: 'none' }}>
            <GalleryDropdown pathname={pathname} />
          </Box>
          
          {/* Sectors Mobile Dropdown */}
          <Box display={{ base: 'block', md: 'none' }}>
            <SectorsDropdown pathname={pathname} sectors={navigationSectors} />
          </Box>
          
          {/* Agencies Mobile Dropdown */}
          <Box display={{ base: 'block', md: 'none' }}>
            <AgenciesDropdown pathname={pathname} agencies={agencies} />
          </Box>
          
          {/* Admin Panels for Mobile */}
          {profile?.isSectorAdmin && (
            <Box display={{ base: 'block', md: 'none' }}>
              <AdminSectorDropdown sectors={adminSectors} />
            </Box>
          )}
          
          <Separator my={4} borderColor="whiteAlpha.300" />
          
          <Flex justify="space-between" align="center" fontSize="sm" color="whiteAlpha.800" mb={2}>
            <Text>{user?.user_metadata?.full_name || user?.email || 'Usuário'}</Text>
          </Flex>
          
          <ChakraLink
            as={Link}
            href="/profile"
            py={2}
            fontSize="sm"
            color="whiteAlpha.800"
            _hover={{ color: 'white', textDecoration: 'none' }}
          >
            Perfil
          </ChakraLink>
          
          <Button
            variant="ghost"
            size="sm"
            color="red.200"
            _hover={{ color: 'red.100', bg: 'transparent' }}
            justifyContent="flex-start"
            onClick={handleLogout}
            px={0}
          >
            Sair
          </Button>
        </VStack>
      )}
    </Box>
  );
}

// Export with memo
export default memo(ChakraNavbar);