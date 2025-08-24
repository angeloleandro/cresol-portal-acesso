'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { supabase } from '@/lib/supabase';

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

