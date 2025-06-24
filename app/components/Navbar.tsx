'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Sector {
  id: string;
  name: string;
  description?: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSectorAdmin, setIsSectorAdmin] = useState(false);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isSectorsDropdownOpen, setIsSectorsDropdownOpen] = useState(false);
  const [isGalleryDropdownOpen, setIsGalleryDropdownOpen] = useState(false);
  const [isAdminSectorDropdownOpen, setIsAdminSectorDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const adminSectorDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobileSectorsOpen, setIsMobileSectorsOpen] = useState(false);
  const userMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para abrir o dropdown com um pequeno delay para evitar fechamentos acidentais
  const handleOpenDropdown = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setIsSectorsDropdownOpen(true);
  };

  // Função para fechar o dropdown com um pequeno delay
  const handleCloseDropdown = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsSectorsDropdownOpen(false);
    }, 300); // 300ms de delay
  };

  // Funções para controlar o dropdown de admin setor
  const handleOpenAdminSectorDropdown = () => {
    if (adminSectorDropdownTimeoutRef.current) {
      clearTimeout(adminSectorDropdownTimeoutRef.current);
      adminSectorDropdownTimeoutRef.current = null;
    }
    setIsAdminSectorDropdownOpen(true);
  };

  const handleCloseAdminSectorDropdown = () => {
    if (adminSectorDropdownTimeoutRef.current) {
      clearTimeout(adminSectorDropdownTimeoutRef.current);
    }
    
    adminSectorDropdownTimeoutRef.current = setTimeout(() => {
      setIsAdminSectorDropdownOpen(false);
    }, 300);
  };

  // Função para abrir o menu de usuário
  const handleOpenUserMenu = () => {
    if (userMenuTimeoutRef.current) {
      clearTimeout(userMenuTimeoutRef.current);
      userMenuTimeoutRef.current = null;
    }
    setIsUserMenuOpen(true);
  };

  // Função para fechar o menu de usuário
  const handleCloseUserMenu = () => {
    if (userMenuTimeoutRef.current) {
      clearTimeout(userMenuTimeoutRef.current);
    }
    
    userMenuTimeoutRef.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 300); // 300ms de delay
  };

  useEffect(() => {
    // Limpar timeout quando o componente for desmontado
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
      if (adminSectorDropdownTimeoutRef.current) {
        clearTimeout(adminSectorDropdownTimeoutRef.current);
      }
      if (userMenuTimeoutRef.current) {
        clearTimeout(userMenuTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Buscar usuário e setores na inicialização do componente
    checkUser();
    fetchSectors();
  }, []);

  const checkUser = async () => {
    console.log("Navbar: Verificando usuário...");
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUser(data.user);
      console.log("Navbar: Usuário encontrado:", data.user.email);
      
      // Verificar se é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      console.log("Navbar: Perfil do usuário:", profile);
      
      if (profile?.role === 'admin') {
        console.log("Navbar: Usuário é admin");
        setIsAdmin(true);
      } else if (profile?.role === 'sector_admin') {
        console.log("Navbar: Usuário é admin de setor");
        setIsSectorAdmin(true);
        
        // Se for admin de setor, buscar os setores que ele administra
        const { data: sectorAdmins } = await supabase
          .from('sector_admins')
          .select('sector_id')
          .eq('user_id', data.user.id);
        
        console.log("Navbar: Setores administrados:", sectorAdmins);
        
        if (sectorAdmins && sectorAdmins.length > 0) {
          const sectorIds = sectorAdmins.map(admin => admin.sector_id);
          
          // Filtrar apenas os setores que o usuário administra
          const { data: userSectors } = await supabase
            .from('sectors')
            .select('id, name, description')
            .in('id', sectorIds)
            .order('name');
            
          console.log("Navbar: Lista de setores do usuário:", userSectors);
          
          if (userSectors) {
            setSectors(userSectors);
          }
        }
      }
    } else {
      console.log("Navbar: Nenhum usuário autenticado");
    }
  };

  const fetchSectors = async () => {
    const { data, error } = await supabase
      .from('sectors')
      .select('id, name, description')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar setores:', error);
    } else if (!isSectorAdmin) { // Se não for admin de setor, carrega todos os setores 
      setSectors(data || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  // Handlers para setores
  const handleOpenSectorsDropdown = () => setIsSectorsDropdownOpen(true);
  const handleCloseSectorsDropdown = () => setIsSectorsDropdownOpen(false);

  // Handlers para galeria
  const handleOpenGalleryDropdown = () => setIsGalleryDropdownOpen(true);
  const handleCloseGalleryDropdown = () => setIsGalleryDropdownOpen(false);

  return (
    <header className="bg-primary border-b border-primary-dark z-30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/home" className="flex items-center">
            <div className="relative h-10 w-24 mr-3">
              <svg 
                className="h-8 w-auto text-white"
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
        </div>
        
        {/* Menu para telas maiores */}
        <div className="hidden md:flex items-center space-x-4">
          <nav className="flex space-x-4 mr-4">
            <Link 
              href="/home" 
              className={`text-sm font-medium ${pathname === '/home' || pathname === '/dashboard' ? 'text-white' : 'text-white/80 hover:text-white'}`}
            >
              Home
            </Link>
            
            {/* Dropdown de Setores */}
            <div 
              className="relative"
              onMouseEnter={handleOpenSectorsDropdown}
              onMouseLeave={handleCloseSectorsDropdown}
            >
              <Link 
                href="/setores" 
                className={`text-sm font-medium flex items-center ${
                  pathname.startsWith('/setores') ? 'text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                <span>Setores</span>
                <svg 
                  className={`ml-1 h-4 w-4 transition-transform ${isSectorsDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              
              {/* Dropdown menu */}
              {isSectorsDropdownOpen && (
                <div 
                  className="absolute left-0 mt-0 w-56 bg-white rounded-md shadow-lg py-1 z-10"
                  onMouseEnter={handleOpenSectorsDropdown}
                  onMouseLeave={handleCloseSectorsDropdown}
                >
                  {/* Área "ponte" para evitar que o dropdown feche ao mover o mouse */}
                  <div className="absolute h-2 w-full -top-2 left-0" />
                  
                  <Link 
                    href="/setores" 
                    className="block px-4 py-2 text-sm text-cresol-gray hover:bg-primary hover:text-white"
                  >
                    Todos os Setores
                  </Link>
                  
                  {sectors.length > 0 && (
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      {sectors.map((sector) => (
                        <Link 
                          key={sector.id} 
                          href={`/setores/${sector.id}`}
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
            
            <div 
              className="relative"
              onMouseEnter={handleOpenGalleryDropdown}
              onMouseLeave={handleCloseGalleryDropdown}
            >
              <button
                className={`text-sm font-medium flex items-center ${pathname.startsWith('/galeria') || pathname.startsWith('/videos') ? 'text-white' : 'text-white/80 hover:text-white'}`}
                type="button"
              >
                <span>Galeria</span>
                <svg 
                  className={`ml-1 h-4 w-4 transition-transform ${isGalleryDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isGalleryDropdownOpen && (
                <div 
                  className="absolute left-0 mt-0 w-56 bg-white rounded-md shadow-lg py-1 z-10"
                  onMouseEnter={handleOpenGalleryDropdown}
                  onMouseLeave={handleCloseGalleryDropdown}
                >
                  <a 
                    href="/galeria" 
                    className="block px-4 py-2 text-sm text-cresol-gray hover:bg-primary hover:text-white"
                  >
                    Galeria de Imagens
                  </a>
                  <a 
                    href="/videos" 
                    className="block px-4 py-2 text-sm text-cresol-gray hover:bg-primary hover:text-white"
                  >
                    Galeria de Vídeos
                  </a>
                </div>
              )}
            </div>
            
            <Link 
              href="/eventos?view=calendar" 
              className={`text-sm font-medium ${pathname === '/eventos' && pathname.includes('view=calendar') ? 'text-white' : 'text-white/80 hover:text-white'}`}
            >
              Calendário
            </Link>
            <Link 
              href="/sistemas" 
              className={`text-sm font-medium ${pathname === '/sistemas' ? 'text-white' : 'text-white/80 hover:text-white'}`}
            >
              Sistemas
            </Link>
          </nav>
          
          <div className="flex items-center border-l border-white/30 pl-4">
            {/* Opção de Admin ou Admin Setor */}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm text-white/80 mr-4 hover:text-white"
              >
                Painel Admin
              </Link>
            )}
            
            {isSectorAdmin && (
              <div 
                className="relative mr-4"
                onMouseEnter={handleOpenAdminSectorDropdown}
                onMouseLeave={handleCloseAdminSectorDropdown}
              >
                <Link
                  href="/admin-setor"
                  className="text-sm text-white/80 hover:text-white flex items-center"
                >
                  <span>Painel Admin Setor</span>
                  <svg 
                    className={`ml-1 h-4 w-4 transition-transform ${isAdminSectorDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                
                {/* Admin Setor Dropdown menu */}
                {isAdminSectorDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-0 w-56 bg-white rounded-md shadow-lg py-1 z-10"
                    onMouseEnter={handleOpenAdminSectorDropdown}
                    onMouseLeave={handleCloseAdminSectorDropdown}
                  >
                    {/* Área "ponte" para evitar que o dropdown feche ao mover o mouse */}
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
            )}
            
            {/* Menu de usuário */}
            <div 
              className="relative"
              onMouseEnter={handleOpenUserMenu}
              onMouseLeave={handleCloseUserMenu}
            >
              <button className="flex items-center text-sm text-white/80 hover:text-white" type="button">
                <span className="mr-2">
                  {user?.user_metadata?.full_name || user?.email || 'Usuário'}
                </span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-0 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                  onMouseEnter={handleOpenUserMenu}
                  onMouseLeave={handleCloseUserMenu}
                >
                  {/* Área "ponte" para evitar que o dropdown feche ao mover o mouse */}
                  <div className="absolute h-2 w-full -top-2 left-0" />
                  
                  <Link 
                    href="/profile" 
                    className="block px-4 py-2 text-sm text-cresol-gray hover:bg-primary hover:text-white"
                  >
                    Perfil
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-cresol-gray hover:bg-primary hover:text-white"
                    type="button"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Menu mobile (hambúrguer) */}
        <div className="md:hidden flex items-center space-x-4">
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm text-white/80 hover:text-white"
            >
              Admin
            </Link>
          )}
          
          {isSectorAdmin && (
            <Link
              href="/admin-setor"
              className="text-sm text-white/80 hover:text-white"
            >
              Admin Setor
            </Link>
          )}
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white/80 hover:text-white"
            type="button"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMobileMenuOpen 
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>
      
      {/* Menu mobile expandido */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 py-2 pb-4 bg-primary border-t border-primary-dark">
          <Link 
            href="/home" 
            className={`block py-2 text-sm font-medium ${pathname === '/home' || pathname === '/dashboard' ? 'text-white' : 'text-white/80'}`}
          >
            Home
          </Link>
          
          <div>
            <div 
              className="flex items-center justify-between py-2"
              onClick={() => setIsMobileSectorsOpen(!isMobileSectorsOpen)}
            >
              <Link 
                href="/setores" 
                className={`text-sm font-medium ${pathname.startsWith('/setores') ? 'text-white' : 'text-white/80'}`}
                onClick={(e) => {
                  if (sectors.length > 0) {
                    e.preventDefault(); // Não navegar se houver setores
                  }
                }}
              >
                Setores
              </Link>
              {sectors.length > 0 && (
                <svg 
                  className={`h-4 w-4 transition-transform text-white/80 ${isMobileSectorsOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
            
            {isMobileSectorsOpen && sectors.length > 0 && (
              <div className="pl-4 border-l border-white/30 ml-2 mt-1">
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
            href="/galeria" 
            className={`block py-2 text-sm font-medium ${pathname === '/galeria' ? 'text-white' : 'text-white/80'}`}
          >
            Galeria
          </Link>
          <Link 
            href="/eventos?view=calendar" 
            className={`block py-2 text-sm font-medium ${pathname === '/eventos' && pathname.includes('view=calendar') ? 'text-white' : 'text-white/80'}`}
          >
            Calendário
          </Link>
          <Link 
            href="/sistemas" 
            className={`block py-2 text-sm font-medium ${pathname === '/sistemas' ? 'text-white' : 'text-white/80'}`}
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