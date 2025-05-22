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
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobileSectorsOpen, setIsMobileSectorsOpen] = useState(false);
  const userMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para abrir o dropdown com um pequeno delay para evitar fechamentos acidentais
  const handleOpenDropdown = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  // Função para fechar o dropdown com um pequeno delay
  const handleCloseDropdown = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300); // 300ms de delay
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
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUser(data.user);
      
      // Verificar se é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      if (profile?.role === 'admin' || profile?.role === 'sector_admin') {
        setIsAdmin(true);
      }
    }
  };

  const fetchSectors = async () => {
    const { data, error } = await supabase
      .from('sectors')
      .select('id, name, description')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar setores:', error);
    } else {
      setSectors(data || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <header className="bg-white border-b border-cresol-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center">
            <div className="relative h-10 w-24 mr-3">
              <Image 
                src="/logo-cresol.png" 
                alt="Logo Cresol" 
                fill
                sizes="(max-width: 768px) 100vw, 96px"
                style={{ objectFit: 'contain' }}
              />
            </div>
            <h1 className="text-xl font-semibold text-cresol-gray">Portal Cresol</h1>
          </Link>
        </div>
        
        {/* Menu para telas maiores */}
        <div className="hidden md:flex items-center space-x-4">
          <nav className="flex space-x-4 mr-4">
            <Link 
              href="/dashboard" 
              className={`text-sm font-medium ${pathname === '/dashboard' ? 'text-primary' : 'text-cresol-gray hover:text-primary'}`}
            >
              Início
            </Link>
            
            {/* Dropdown de Setores */}
            <div 
              className="relative"
              onMouseEnter={handleOpenDropdown}
              onMouseLeave={handleCloseDropdown}
            >
              <Link 
                href="/setores" 
                className={`text-sm font-medium flex items-center ${
                  pathname.startsWith('/setores') ? 'text-primary' : 'text-cresol-gray hover:text-primary'
                }`}
              >
                <span>Setores</span>
                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
<svg 
                  className={`ml-1 h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              
              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div 
                  className="absolute left-0 mt-0 w-56 bg-white rounded-md shadow-lg py-1 z-10"
                  onMouseEnter={handleOpenDropdown}
                  onMouseLeave={handleCloseDropdown}
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
            
            <Link 
              href="/galeria" 
              className={`text-sm font-medium ${pathname === '/galeria' ? 'text-primary' : 'text-cresol-gray hover:text-primary'}`}
            >
              Galeria
            </Link>
            <Link 
              href="/eventos?view=calendar" 
              className={`text-sm font-medium ${pathname === '/eventos' && pathname.includes('view=calendar') ? 'text-primary' : 'text-cresol-gray hover:text-primary'}`}
            >
              Calendário
            </Link>
            <Link 
              href="/sistemas" 
              className={`text-sm font-medium ${pathname === '/sistemas' ? 'text-primary' : 'text-cresol-gray hover:text-primary'}`}
            >
              Sistemas
            </Link>
          </nav>
          
          <div className="flex items-center border-l border-cresol-gray-light pl-4">
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm text-cresol-gray mr-4 hover:text-primary"
              >
                Painel Admin
              </Link>
            )}
            
            {/* Menu de usuário */}
            <div 
              className="relative"
              onMouseEnter={handleOpenUserMenu}
              onMouseLeave={handleCloseUserMenu}
            >
              {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button className="flex items-center text-sm text-cresol-gray hover:text-primary">
                <span className="mr-2">
                  {user?.user_metadata?.full_name || user?.email || 'Usuário'}
                </span>
                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
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
                  {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-cresol-gray hover:bg-primary hover:text-white"
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
              className="text-sm text-cresol-gray hover:text-primary"
            >
              Admin
            </Link>
          )}
          
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-cresol-gray hover:text-primary"
          >
            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
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
        <div className="md:hidden px-4 py-2 pb-4 bg-white border-t border-cresol-gray-light">
          <Link 
            href="/dashboard" 
            className={`block py-2 text-sm font-medium ${pathname === '/dashboard' ? 'text-primary' : 'text-cresol-gray'}`}
          >
            Início
          </Link>
          
          <div>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
<div 
              className="flex items-center justify-between py-2"
              onClick={() => setIsMobileSectorsOpen(!isMobileSectorsOpen)}
            >
              <Link 
                href="/setores" 
                className={`text-sm font-medium ${pathname.startsWith('/setores') ? 'text-primary' : 'text-cresol-gray'}`}
                onClick={(e) => {
                  if (sectors.length > 0) {
                    e.preventDefault(); // Não navegar se houver setores
                  }
                }}
              >
                Setores
              </Link>
              {sectors.length > 0 && (
                // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
<svg 
                  className={`h-4 w-4 transition-transform ${isMobileSectorsOpen ? 'rotate-180' : ''}`} 
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
              <div className="pl-4 border-l border-cresol-gray-light ml-2 mt-1">
                {sectors.map((sector) => (
                  <Link 
                    key={sector.id} 
                    href={`/setores/${sector.id}`}
                    className="block py-1 text-sm text-cresol-gray"
                  >
                    {sector.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <Link 
            href="/galeria" 
            className={`block py-2 text-sm font-medium ${pathname === '/galeria' ? 'text-primary' : 'text-cresol-gray'}`}
          >
            Galeria
          </Link>
          <Link 
            href="/eventos?view=calendar" 
            className={`block py-2 text-sm font-medium ${pathname === '/eventos' && pathname.includes('view=calendar') ? 'text-primary' : 'text-cresol-gray'}`}
          >
            Calendário
          </Link>
          <Link 
            href="/sistemas" 
            className={`block py-2 text-sm font-medium ${pathname === '/sistemas' ? 'text-primary' : 'text-cresol-gray'}`}
          >
            Sistemas
          </Link>
          
          <div className="mt-4 pt-4 border-t border-cresol-gray-light">
            <div className="flex items-center justify-between text-sm text-cresol-gray mb-2">
              <span>{user?.user_metadata?.full_name || user?.email || 'Usuário'}</span>
            </div>
            <Link
              href="/profile"
              className="block w-full text-left py-2 text-sm text-cresol-gray hover:text-primary"
            >
              Perfil
            </Link>
            <button 
              onClick={handleLogout}
              className="block w-full text-left py-2 text-sm text-red-500 hover:text-red-700"
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