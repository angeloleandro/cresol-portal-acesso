'use client';

import { useState, useCallback, memo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GlobalSearch from './GlobalSearch';
import { Icon } from './icons/Icon';
import HeroUISectorsDropdown from './HeroUISectorsDropdown';
import HeroUIAgenciesDropdown from './HeroUIAgenciesDropdown';
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Button 
} from '@nextui-org/react';
import { 
  useOptimizedUser, 
  useOptimizedSectors, 
  useOptimizedAgencies,
  useOptimizedNotifications, 
  useRelativeTime,
  useOptimizedDropdown 
} from '@/hooks/useOptimizedNavbar';

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

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

// Skeleton loading component
const NavbarSkeleton = memo(() => (
  <header className="bg-primary border-b border-primary-dark z-30 relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-24 bg-white/20 rounded-sm animate-pulse" />
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <div className="h-4 w-32 bg-white/20 rounded-sm animate-pulse" />
          <div className="h-4 w-24 bg-white/20 rounded-sm animate-pulse" />
        </div>
      </div>
    </div>
  </header>
));
  NavbarSkeleton.displayName = 'NavbarSkeleton';


// Memoized Gallery Dropdown - Convertido para HeroUI
const GalleryDropdown = memo(({ pathname }: {
  pathname: string;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Limpar timeout quando component é desmontado
  useEffect(() => {
    return () => {
      if (dropdownHoverTimeoutRef.current) {
        clearTimeout(dropdownHoverTimeoutRef.current);
      }
    };
  }, []);

  // Handlers para hover behavior
  const handleDropdownMouseEnter = useCallback(() => {
    if (dropdownHoverTimeoutRef.current) {
      clearTimeout(dropdownHoverTimeoutRef.current);
      dropdownHoverTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  }, []);

  const handleDropdownMouseLeave = useCallback(() => {
    if (dropdownHoverTimeoutRef.current) {
      clearTimeout(dropdownHoverTimeoutRef.current);
    }
    
    dropdownHoverTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300); // 300ms debounce
  }, []);

  // Verificar se está ativo
  const isActive = pathname.startsWith('/galeria') || pathname.startsWith('/videos');

  // Preparar itens do menu
  const menuItems = [
    {
      key: 'galeria-imagens',
      href: '/galeria',
      label: 'Galeria de Imagens'
    },
    {
      key: 'galeria-videos', 
      href: '/videos',
      label: 'Galeria de Vídeos'
    }
  ];

  return (
    <div 
      onMouseEnter={handleDropdownMouseEnter}
      onMouseLeave={handleDropdownMouseLeave}
    >
      <Dropdown 
        placement="bottom-start"
        isOpen={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        classNames={{
          content: "min-w-[200px] max-h-[400px] md:max-h-[60vh] bg-white border border-default-200 shadow-lg overflow-y-auto scrollbar-branded focus:outline-none focus:border-none focus:ring-0",
        }}
      >
        <DropdownTrigger>
          <Button
            variant="light"
            className={`
              h-auto p-0 min-w-0 data-[hover]:bg-transparent
              text-sm font-medium flex items-center gap-1
              focus:outline-none focus:ring-0 focus:border-none
              data-[focus]:outline-none data-[focus]:border-none data-[focus]:ring-0
              data-[focus-visible]:outline-none data-[focus-visible]:border-none data-[focus-visible]:ring-0
              ${isActive ? 'text-white' : 'text-white/80 hover:text-white'}
            `}
            endContent={
              <Icon 
                name="chevron-down" 
                className="h-4 w-4 transition-transform data-[open=true]:rotate-180" 
              />
            }
          >
            Galeria
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Menu da Galeria"
          className="p-1 focus:outline-none"
          itemClasses={{
            base: [
              "rounded-md",
              "text-default-700",
              "transition-colors",
              "data-[hover=true]:bg-primary",
              "data-[hover=true]:text-white",
              "data-[selectable=true]:focus:bg-primary", 
              "data-[selectable=true]:focus:text-white",
              "focus:outline-none",
              "focus:border-none",
              "focus:ring-0",
              "data-[focus]:outline-none",
              "data-[focus]:border-none",
              "data-[focus-visible]:outline-none",
              "data-[focus-visible]:border-none",
            ],
          }}
        >
          {menuItems.map((item) => (
            <DropdownItem
              key={item.key}
              href={item.href}
              as={Link}
            >
              <span className="truncate" title={item.label}>
                {item.label}
              </span>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
});
  GalleryDropdown.displayName = 'GalleryDropdown';


// Memoized Admin Sector Dropdown
const AdminSectorDropdown = memo(({ sectors, dropdown }: {
  sectors: Sector[];
  dropdown: ReturnType<typeof useOptimizedDropdown>;
}) => (
  <div 
    className="relative"
    onMouseEnter={dropdown.handleOpen}
    onMouseLeave={dropdown.handleClose}
  >
    <Link
      href="/admin-setor"
      className="text-sm text-white/80 hover:text-white flex items-center"
    >
      <span>Painel Admin Setor</span>
      <Icon name="chevron-down" className={`ml-1 h-4 w-4 transition-transform ${dropdown.isOpen ? 'rotate-180' : ''}`} />
    </Link>
    
    {dropdown.isOpen && (
      <div 
        className="absolute right-0 mt-0 w-56 max-h-[400px] md:max-h-[60vh] bg-white border border-gray-200 rounded-md py-1 z-10 overflow-y-auto scrollbar-branded"
        onMouseEnter={dropdown.handleOpen}
        onMouseLeave={dropdown.handleClose}
      >
        <div className="absolute h-2 w-full -top-2 left-0" />
        
        <Link 
          href="/admin-setor" 
          className="block px-4 py-2 text-sm text-cresol-gray hover:bg-primary hover:text-white"
        >
          Painel Principal
        </Link>
        
        {sectors.length > 0 && (
          <div className="border-t border-gray-100 mt-1 pt-1">
            {sectors.map((sector) => (
              <Link 
                key={sector.id} 
                href={`/admin-setor/setores/${sector.id}`}
                className="block px-4 py-2 text-sm text-cresol-gray hover:bg-primary hover:text-white truncate"
                title={sector.name}
              >
                {sector.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
));
  AdminSectorDropdown.displayName = 'AdminSectorDropdown';

// Memoized Search Component
const SearchButton = memo(({ isOpen, onToggle, user }: {
  isOpen: boolean;
  onToggle: () => void;
  user: any;
}) => {
  if (!user) return null;
  
  return (
    <div className="relative">
      <button 
        type="button"
        onClick={onToggle}
        className="text-white/80 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10"
        title="Buscar"
      >
        <Icon name="search" className="h-5 w-5" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={onToggle}
          />
          
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg border border-gray-200 z-50">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Buscar no Portal</h3>
              <GlobalSearch 
                className="w-full"
                placeholder="Buscar sistemas, eventos, notícias..."
                showAdvancedButton={true}
                autoFocus={true}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
});
  SearchButton.displayName = 'SearchButton';

// Memoized Notifications Component
const NotificationsButton = memo(({ 
  notifications, 
  unreadCount, 
  isOpen, 
  onToggle,
  onMarkAsRead,
  onMarkAllAsRead,
  formatRelativeTime,
  user 
}: {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  formatRelativeTime: (date: string) => string;
  user: any;
}) => {
  if (!user) return null;
  
  return (
    <div className="relative">
      <button 
        type="button"
        onClick={onToggle}
        className="text-white/80 hover:text-white transition-colors relative p-1.5 rounded-md hover:bg-white/10"
        title="Notificações"
      >
        <Icon name="bell" className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={onToggle}
          />
          
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-primary hover:text-primary-dark"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            
            <div className="max-h-80 overflow-y-auto scrollbar-branded">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'info' ? 'bg-blue-500' :
                        notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-gray-900 ${
                          !notification.read ? 'font-semibold' : ''
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                      
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  <Icon name="bell" className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <Link
                  href="/notifications"
                  className="text-xs text-primary hover:text-primary-dark text-center block"
                  onClick={onToggle}
                >
                  Ver todas as notificações
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
});
  NotificationsButton.displayName = 'NotificationsButton';

// Memoized User Menu
const UserMenu = memo(({ user, dropdown, onLogout }: {
  user: any;
  dropdown: ReturnType<typeof useOptimizedDropdown>;
  onLogout: () => void;
}) => (
  <div 
    className="relative"
    onMouseEnter={dropdown.handleOpen}
    onMouseLeave={dropdown.handleClose}
  >
    <button className="flex items-center text-sm text-white/80 hover:text-white" type="button">
      <span className="mr-2">
        {user?.user_metadata?.full_name || user?.email || 'Usuário'}
      </span>
      <Icon name="user-circle" className="h-5 w-5" />
    </button>
    
    {dropdown.isOpen && (
      <div 
        className="absolute right-0 mt-0 w-48 max-h-[400px] md:max-h-[60vh] bg-white border border-gray-200 rounded-md py-1 z-10 overflow-y-auto scrollbar-branded"
        onMouseEnter={dropdown.handleOpen}
        onMouseLeave={dropdown.handleClose}
      >
        <div className="absolute h-2 w-full -top-2 left-0" />
        
        <Link 
          href="/profile" 
          className="block px-4 py-2 text-sm text-cresol-gray hover:bg-primary hover:text-white"
        >
          Perfil
        </Link>
        <button 
          onClick={onLogout}
          className="block w-full text-left px-4 py-2 text-sm text-cresol-gray hover:bg-primary hover:text-white"
          type="button"
        >
          Sair
        </button>
      </div>
    )}
  </div>
));
  UserMenu.displayName = 'UserMenu';

// Main Navbar Component
function Navbar() {
  const pathname = usePathname();
  
  // Hooks otimizados
  const { user, profile, loading, handleLogout } = useOptimizedUser();
  const { sectors } = useOptimizedSectors(profile?.role, user?.id, true); // excludeAgencies = true
  const { agencies } = useOptimizedAgencies();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useOptimizedNotifications(user?.id);
  const { formatRelativeTime } = useRelativeTime();
  
  // Estados de UI - memoizados para evitar re-renders
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileSectorsOpen, setIsMobileSectorsOpen] = useState(false);
  
  // Dropdowns otimizados
  const adminSectorDropdown = useOptimizedDropdown();
  const userMenuDropdown = useOptimizedDropdown();
  
  // Handlers memoizados
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);
  
  const toggleSearch = useCallback(() => {
    setIsSearchOpen(prev => !prev);
  }, []);
  
  const toggleNotifications = useCallback(() => {
    setIsNotificationsOpen(prev => !prev);
  }, []);
  
  const toggleMobileSectors = useCallback(() => {
    setIsMobileSectorsOpen(prev => !prev);
  }, []);
  
  // Early return se ainda carregando
  if (loading) {
    return <NavbarSkeleton />;
  }

  return (
    <header className="bg-primary border-b border-primary-dark z-30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/home" className="flex items-center justify-center">
            <div className="relative h-10 w-32 flex items-center justify-center">
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
            </div>
          </Link>
          
          {/* Divisória vertical */}
          <div className="h-6 w-px bg-white/30 mx-4"></div>
          
          {/* Texto HUB */}
          <div className="hidden sm:flex items-center">
            <span className="text-white font-bold text-lg tracking-wide">HUB</span>
          </div>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <nav className="flex space-x-4 mr-4">
            <Link 
              href="/home" 
              className={`text-sm font-medium ${
                pathname === '/home' || pathname === '/dashboard' ? 'text-white' : 'text-white/80 hover:text-white'
              }`}
            >
              Home
            </Link>
            
            <HeroUISectorsDropdown 
              pathname={pathname}
              sectors={sectors}
            />
            
            <HeroUIAgenciesDropdown 
              pathname={pathname}
              agencies={agencies}
            />
            
            <GalleryDropdown 
              pathname={pathname}
            />
            
            <Link 
              href="/eventos?view=calendar" 
              className={`text-sm font-medium ${
                pathname === '/eventos' && pathname.includes('view=calendar') ? 'text-white' : 'text-white/80 hover:text-white'
              }`}
            >
              Calendário
            </Link>
            
            <Link 
              href="/sistemas" 
              className={`text-sm font-medium ${
                pathname === '/sistemas' ? 'text-white' : 'text-white/80 hover:text-white'
              }`}
            >
              Sistemas
            </Link>
          </nav>
          
          <div className="flex items-center border-l border-white/30 pl-4 space-x-3">
            {/* Admin Panel Links */}
            {profile?.isAdmin && (
              <Link
                href="/admin"
                className="text-sm text-white/80 hover:text-white"
              >
                Painel Admin
              </Link>
            )}
            
            {profile?.isSectorAdmin && (
              <AdminSectorDropdown 
                sectors={sectors}
                dropdown={adminSectorDropdown}
              />
            )}
            
            {/* Search Button */}
            <SearchButton 
              isOpen={isSearchOpen}
              onToggle={toggleSearch}
              user={user}
            />
            
            {/* Notifications Button */}
            <NotificationsButton 
              notifications={notifications}
              unreadCount={unreadCount}
              isOpen={isNotificationsOpen}
              onToggle={toggleNotifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              formatRelativeTime={formatRelativeTime}
              user={user}
            />
            
            {/* User Menu */}
            <UserMenu 
              user={user}
              dropdown={userMenuDropdown}
              onLogout={handleLogout}
            />
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          {profile?.isAdmin && (
            <Link
              href="/admin"
              className="text-sm text-white/80 hover:text-white"
            >
              Admin
            </Link>
          )}
          
          {profile?.isSectorAdmin && (
            <Link
              href="/admin-setor"
              className="text-sm text-white/80 hover:text-white"
            >
              Admin Setor
            </Link>
          )}
          
          <button 
            onClick={toggleMobileMenu}
            className="text-white/80 hover:text-white"
            type="button"
          >
            <Icon name={isMobileMenuOpen ? "close" : "menu"} className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 py-2 pb-4 bg-primary border-t border-primary-dark">
          <Link 
            href="/home" 
            className={`block py-2 text-sm font-medium ${
              pathname === '/home' || pathname === '/dashboard' ? 'text-white' : 'text-white/80'
            }`}
          >
            Home
          </Link>
          
          <div>
            <div 
              className="flex items-center justify-between py-2"
              onClick={toggleMobileSectors}
            >
              <Link 
                href="/setores" 
                className={`text-sm font-medium ${
                  pathname.startsWith('/setores') ? 'text-white' : 'text-white/80'
                }`}
                onClick={(e) => {
                  if (sectors.length > 0) {
                    e.preventDefault();
                  }
                }}
              >
                Setores
              </Link>
              {sectors.length > 0 && (
                <Icon 
                  name="chevron-down" 
                  className={`h-4 w-4 transition-transform text-white/80 ${
                    isMobileSectorsOpen ? 'rotate-180' : ''
                  }`}
                />
              )}
            </div>
            
            {isMobileSectorsOpen && sectors.length > 0 && (
              <div className="pl-4 border-l border-white/30 ml-2 mt-1 max-h-60 overflow-y-auto scrollbar-thin">
                {sectors.map((sector) => (
                  <Link 
                    key={sector.id} 
                    href={`/setores/${sector.id}`}
                    className="block py-1 text-sm text-white/80"
                  >
                    {sector.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <Link 
            href="/setores/5463d1ba-c290-428e-b39e-d7ad9c66eb71" 
            className={`block py-2 text-sm font-medium ${
              pathname.includes('5463d1ba-c290-428e-b39e-d7ad9c66eb71') ? 'text-white' : 'text-white/80'
            }`}
          >
            Agências
          </Link>
          
          <Link 
            href="/galeria" 
            className={`block py-2 text-sm font-medium ${
              pathname === '/galeria' ? 'text-white' : 'text-white/80'
            }`}
          >
            Galeria
          </Link>
          <Link 
            href="/eventos?view=calendar" 
            className={`block py-2 text-sm font-medium ${
              pathname === '/eventos' && pathname.includes('view=calendar') ? 'text-white' : 'text-white/80'
            }`}
          >
            Calendário
          </Link>
          <Link 
            href="/sistemas" 
            className={`block py-2 text-sm font-medium ${
              pathname === '/sistemas' ? 'text-white' : 'text-white/80'
            }`}
          >
            Sistemas
          </Link>
          
          <div className="mt-4 pt-4 border-t border-white/30">
            <div className="flex items-center justify-between text-sm text-white/80 mb-2">
              <span>{user?.user_metadata?.full_name || user?.email || 'Usuário'}</span>
            </div>
            <Link
              href="/profile"
              className="block w-full text-left py-2 text-sm text-white/80 hover:text-white"
            >
              Perfil
            </Link>
            <button 
              onClick={handleLogout}
              className="block w-full text-left py-2 text-sm text-red-200 hover:text-red-100"
              type="button"
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// Export with memo
export default memo(Navbar);