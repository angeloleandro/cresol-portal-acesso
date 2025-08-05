'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import CresolLogo from './CresolLogo';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Icon } from './icons/Icon';

interface AdminHeaderProps {
  user: any;
}

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Painel', href: '/admin' },
  { label: 'Usuários', href: '/admin/users' },
  { label: 'Notificações', href: '/admin/notifications' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Home', href: '/home' },
];

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <CresolLogo width={80} height={32} />
            <div className="admin-brand-divider"></div>
            <span className="admin-brand-text">Admin</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="admin-nav">
          <div className="admin-nav-desktop">
            {NAV_ITEMS.map((item) => (
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