'use client';

import AuthGuard from '@/app/components/AuthGuard';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { AdminDashboardSkeleton } from '@/app/components/skeletons/AdminDashboardSkeleton';
import dynamic from 'next/dynamic';

// Lazy load do AdminDashboard - carrega apenas quando necessário
const AdminDashboard = dynamic(
  () => import('../components/admin/AdminDashboard').then(mod => ({
    default: mod.default
  })),
  { 
    ssr: false, // Desabilita SSR para componente admin (client-only)
    loading: () => <AdminDashboardSkeleton />
  }
);

export default function AdminPage() {
  return (
    <AuthGuard 
      requireRole="admin"
      loadingMessage={LOADING_MESSAGES.dashboard}
    >
      <AdminDashboard />
    </AuthGuard>
  );
}