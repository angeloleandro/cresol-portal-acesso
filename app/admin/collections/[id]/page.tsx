// Collection Detail/Edit Page
// Página individual de coleção com opções de edição - Portal Cresol

'use client';

import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';

import AdminHeader from '@/app/components/AdminHeader';
import AuthGuard from '@/app/components/AuthGuard';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { useAuth } from '@/app/providers/AuthProvider';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

import CollectionDetailEditPage from './components/CollectionDetailEditPage';

interface PageProps {
  params: {
    id: string;
  };
}

function CollectionDetailPageContent({ params }: PageProps) {
  const { id } = params;
  const { user } = useAuth();

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
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

export default function CollectionDetailPage({ params }: PageProps) {
  return (
    <AuthGuard requireRole="admin">
      <CollectionDetailPageContent params={params} />
    </AuthGuard>
  );
}