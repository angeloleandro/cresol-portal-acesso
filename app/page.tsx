'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

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

  return <UnifiedLoadingSpinner size="large" message={LOADING_MESSAGES.checkingSession} fullScreen />;
}

