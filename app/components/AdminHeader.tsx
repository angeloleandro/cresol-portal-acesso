'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect, memo } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  VStack,
  Text,
  Link as ChakraLink,
  SimpleGrid,
  Separator,
  IconButton,
  DrawerRoot,
  DrawerContent,
  DrawerBody,
  DrawerHeader,
  DrawerCloseTrigger,
  DrawerBackdrop,
  DrawerTitle,
} from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/react';

import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

import CresolLogo from './CresolLogo';
import { Icon } from './icons/Icon';
import type { IconName } from './icons/Icon';
import { useAuth } from '@/app/providers/AuthProvider';

interface AdminHeaderProps {
  user?: any; // Opcional, usa useAuth se não fornecido
}

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

// Quick access items configuration
interface QuickAccessItem {
  key: string;
  href: string;
  label: string;
  icon: IconName;
  description: string;
  color?: string;
}

const QUICK_ACCESS_ITEMS: QuickAccessItem[] = [
  { 
    key: 'messages', 
    href: '/admin/messages', 
    label: 'Mensagens',
    icon: 'mail',
    description: 'Gerenciar mensagens do sistema',
    color: 'orange'
  },
  { 
    key: 'news', 
    href: '/admin/news', 
    label: 'Notícias',
    icon: 'list',
    description: 'Publicar e editar notícias',
    color: 'gray'
  },
  { 
    key: 'general-news', 
    href: '/admin/general-news', 
    label: 'Notícias Gerais',
    icon: 'newspaper',
    description: 'Notícias gerais da homepage',
    color: 'orange'
  },
  { 
    key: 'events', 
    href: '/admin/events', 
    label: 'Eventos',
    icon: 'calendar',
    description: 'Gerenciar calendário de eventos',
    color: 'gray'
  },
  { 
    key: 'documents', 
    href: '/admin/documents', 
    label: 'Documentos',
    icon: 'file',
    description: 'Administrar documentos e arquivos',
    color: 'orange'
  },
  { 
    key: 'videos', 
    href: '/admin/videos', 
    label: 'Vídeos',
    icon: 'play',
    description: 'Galeria de vídeos institucionais',
    color: 'gray'
  },
  { 
    key: 'gallery', 
    href: '/admin/gallery', 
    label: 'Galeria',
    icon: 'image',
    description: 'Gerenciar imagens e fotos',
    color: 'orange'
  },
];

const NAV_ITEMS: NavItem[] = [
  { label: 'Painel', href: '/admin' },
  { label: 'Usuários', href: '/admin/users' },
  { label: 'Setores', href: '/admin/sectors' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Home', href: '/home' },
];

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

// Quick Access Dropdown Component
const QuickAccessDropdown = memo(({ pathname }: { pathname: string }) => {
  const router = useRouter();
  const { open: isOpen, onToggle, onClose } = useDisclosure();
  const isActive = QUICK_ACCESS_ITEMS.some(item => pathname.startsWith(item.href));
  
  return (
    <CardDropdown
      isOpen={isOpen}
      onClose={onClose}
      width="650px"
      title="Acesso Rápido Admin"
      trigger={
        <button
          onClick={onToggle}
          className={`admin-nav-link flex items-center gap-1 ${isActive ? 'active' : ''}`}
        >
          Acesso Rápido
          <Icon name="chevron-down" className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      }
      showFooter={true}
      footerContent={
        <Flex justify="space-between" align="center" flexDir={{ base: 'column', md: 'row' }} gap={{ base: 4, md: 0 }}>
          <Box textAlign={{ base: 'center', md: 'left' }}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
              Ferramentas administrativas
            </Text>
            <Text fontSize="xs" color="gray.600" mt={0.5}>
              Acesse rapidamente as principais funções do painel
            </Text>
          </Box>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push('/admin')}
            borderColor="orange.600"
            borderWidth="2px"
            color="orange.600"
            px={6}
            w={{ base: 'full', md: 'auto' }}
            _hover={{ bg: 'orange.50', borderColor: 'orange.700', color: 'orange.700' }}
          >
            Ver painel completo
          </Button>
        </Flex>
      }
    >
      <Box p={5}>
        <Text fontWeight="semibold" fontSize="sm" color="gray.900" mb={4}>
          Acesso Rápido
        </Text>
        
        <Separator mb={4} borderColor="gray.200" />
        
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
          {QUICK_ACCESS_ITEMS.map((item) => (
            <ChakraLink
              key={item.key}
              as={Link}
              href={item.href}
              display="block"
              p={3}
              borderRadius="md"
              border="1px solid"
              borderColor="gray.100"
              _hover={{ 
                bg: 'gray.50', 
                borderColor: 'gray.200',
                textDecoration: 'none',
                transform: 'translateY(-2px)',
                boxShadow: 'sm'
              }}
              transition="all 0.2s"
              onClick={onClose}
            >
              <HStack align="flex-start" gap={3}>
                <Box
                  p={2}
                  bg={item.color === 'orange' ? 'orange.50' : 'gray.100'}
                  borderRadius="md"
                  color={item.color === 'orange' ? 'orange.600' : 'gray.600'}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                </Box>
                <VStack align="stretch" gap={0.5} flex={1}>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.900">
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
QuickAccessDropdown.displayName = 'QuickAccessDropdown';

export default function AdminHeader({ user: propUser }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Sempre chamar useAuth (hooks devem ser chamados incondicionalmente)
  const authContext = useAuth();
  
  // Usar propUser se fornecido, senão usar do contexto
  const user = propUser || authContext?.user;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActiveLink = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  };

  return (
    <header className="admin-header">
      <div className="admin-header-container">
        {/* Logo and Brand */}
        <div className="admin-brand">
          <Link href="/admin" className="flex items-center gap-3" onClick={closeMobileMenu}>
            <CresolLogo width={128} height={40} />
            <div className="admin-brand-divider"></div>
            <span className="admin-brand-text">Admin</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="admin-nav">
          <div className="admin-nav-desktop">
            {NAV_ITEMS.slice(0, 2).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link ${isActiveLink(item.href) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
            
            <QuickAccessDropdown pathname={pathname} />
            
            {NAV_ITEMS.slice(2).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link ${isActiveLink(item.href) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="admin-user-divider"></div>
            
            <div className="admin-user-section">
              <span className="admin-user-info">
                {getUserDisplayName()}
              </span>
              <button 
                onClick={handleLogout}
                className="admin-logout-btn"
              >
                Sair
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <span className="admin-user-info text-sm">
              {getUserDisplayName()}
            </span>
            <button 
              onClick={toggleMobileMenu}
              className="mobile-menu-btn"
              aria-label="Toggle menu"
            >
              <Icon 
                name={isMobileMenuOpen ? 'close' : 'menu'} 
                className="h-5 w-5" 
              />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu lg:hidden">
          <div className="mobile-menu-content">
            {/* Main navigation items */}
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-menu-link ${isActiveLink(item.href) ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="border-t border-gray-200 my-2"></div>
            
            {/* Quick Access Section */}
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Acesso Rápido
            </div>
            {QUICK_ACCESS_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-menu-link pl-8 ${isActiveLink(item.href) ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <Icon name={item.icon} className="h-4 w-4 inline mr-2" />
                {item.label}
              </Link>
            ))}
            
            <div className="border-t border-gray-200 my-2"></div>
            
            <button 
              onClick={handleLogout}
              className="mobile-menu-link text-left w-full"
            >
              <Icon name="arrow-left" className="h-4 w-4 inline mr-2 rotate-180" />
              Sair
            </button>
          </div>
        </div>
      )}
    </header>
  );
}