// Collection Detail/Edit Page
// Página individual de coleção com opções de edição - Portal Cresol

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import AdminHeader from '@/app/components/AdminHeader';
import { supabase } from '@/lib/supabase';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import CollectionDetailEditPage from './components/CollectionDetailEditPage';

interface PageProps {
  params: {
    id: string;
  };
}

export default function CollectionDetailPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }
      setUser(userData.user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();
      if (profile?.role === "admin") {
        setIsAdmin(true);
      } else {
        router.replace("/dashboard");
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  // Loading state
  if (loading) {
    return <UnifiedLoadingSpinner size="large" message={LOADING_MESSAGES.loading} />;
  }

  // Access control
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="text-neutral-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminHeader user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CollectionDetailEditPage collectionId={id} />
      </main>
    </div>
  );
}