'use client';

import { useRouter } from 'next/navigation';
import OptimizedImage from './OptimizedImage';
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
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/admin" className="flex items-center">
            <div className="relative h-8 w-20 mr-3">
              <OptimizedImage 
                src="/logo-cresol.png" 
                alt="Logo Cresol" 
                fill
                sizes="(max-width: 768px) 100vw, 80px"
                className="object-contain"
              />
            </div>
            <div className="h-5 w-px bg-gray-300 mx-3 hidden md:block"></div>
            <span className="text-lg font-medium text-gray-900 hidden md:block">Admin</span>
          </Link>
        </div>
        
        <nav className="flex items-center space-x-1">
          <Link 
            href="/admin" 
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            Painel
          </Link>
          <Link 
            href="/admin/users" 
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            Usuários
          </Link>
          <Link 
            href="/admin/notifications" 
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            Notificações
          </Link>
          <Link 
            href="/admin/analytics" 
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            Analytics
          </Link>
          <Link 
            href="/home" 
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            Home
          </Link>
          
          <div className="h-5 w-px bg-gray-300 mx-2"></div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-3 hidden md:block">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </span>
            <button 
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Sair
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
} 