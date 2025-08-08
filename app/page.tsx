'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { HomeSpinner } from '@/app/components/ui/StandardizedSpinner';

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

  return <HomeSpinner fullScreen message="Redirecionando..." size="lg" />;
}

