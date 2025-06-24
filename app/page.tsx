'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data } = await supabase.auth.getUser();
      
      if (data.user) {
        // Se estiver logado, redireciona para home
        router.replace('/home');
      } else {
        // Se não estiver logado, redireciona para login
        router.replace('/login');
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-cresol-gray">Redirecionando...</p>
      </div>
    </div>
  );
}

