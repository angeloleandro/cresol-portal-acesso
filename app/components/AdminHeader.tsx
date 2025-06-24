'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface AdminHeaderProps {
  user: any;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };
  
  return (
    <header className="bg-white border-b border-cresol-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/admin" className="flex items-center">
            <div className="relative h-10 w-24 mr-3">
              <Image 
                src="/logo-cresol.png" 
                alt="Logo Cresol" 
                fill
                sizes="(max-width: 768px) 100vw, 96px"
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className="h-6 w-px bg-cresol-gray-light mx-3 hidden md:block"></div>
            <h1 className="text-xl font-semibold text-cresol-gray hidden md:block">Painel Administrativo</h1>
          </Link>
        </div>
        
        <nav className="flex items-center space-x-1 md:space-x-4">
          <Link 
            href="/admin" 
            className="px-3 py-2 text-sm font-medium text-cresol-gray hover:text-primary rounded-md hover:bg-cresol-gray-light transition-colors"
          >
            Painel
          </Link>
          <Link 
            href="/admin/users" 
            className="px-3 py-2 text-sm font-medium text-cresol-gray hover:text-primary rounded-md hover:bg-cresol-gray-light transition-colors"
          >
            Usuários
          </Link>
          <Link 
            href="/admin/access-requests" 
            className="px-3 py-2 text-sm font-medium text-cresol-gray hover:text-primary rounded-md hover:bg-cresol-gray-light transition-colors"
          >
            Solicitações
          </Link>
          <Link 
            href="/admin/work-locations" 
            className="px-3 py-2 text-sm font-medium text-cresol-gray hover:text-primary rounded-md hover:bg-cresol-gray-light transition-colors"
          >
            Locais
          </Link>
          <Link 
            href="/home" 
            className="px-3 py-2 text-sm font-medium text-cresol-gray hover:text-primary rounded-md hover:bg-cresol-gray-light transition-colors"
          >
            Home
          </Link>
          <div className="hidden md:block h-6 w-px bg-cresol-gray-light mx-1"></div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-cresol-gray mr-4 hidden md:block">
              Olá, {user?.user_metadata?.full_name || user?.email}
            </span>
            <button 
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
            >
              Sair
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
} 