'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AdminDashboardSkeleton } from '@/app/components/skeletons/AdminDashboardSkeleton';

// Lazy load do AdminDashboard - carrega apenas quando necessário
const AdminDashboard = dynamic(
  () => import('../components/admin/AdminDashboard'),
  { 
    loading: () => <AdminDashboardSkeleton />,
    ssr: false // Desabilita SSR para componente admin (client-only)
  }
);

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboard />
    </Suspense>
  );
}