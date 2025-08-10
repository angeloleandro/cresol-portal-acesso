'use client';

import { ReactNode } from 'react';
import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { IconName } from '@/app/components/icons/Icon';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: IconName;
}

interface StandardizedAdminLayoutProps {
  user: SupabaseUser | null;
  children: ReactNode;
  breadcrumbs: BreadcrumbItem[];
  className?: string;
}

/**
 * Layout padronizado para páginas administrativas seguindo o padrão da página /admin/users
 * 
 * Features:
 * - Header limpo com breadcrumb navigation
 * - Background padronizado (bg-gray-50)
 * - Container responsivo (max-w-7xl mx-auto)
 * - Espaçamento consistente (px-4 sm:px-6 lg:px-8 py-8)
 */
export default function StandardizedAdminLayout({
  user,
  children,
  breadcrumbs,
  className = ''
}: StandardizedAdminLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <AdminHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbs} />
        </div>

        {children}
      </main>
    </div>
  );
}