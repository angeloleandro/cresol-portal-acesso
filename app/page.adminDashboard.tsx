'use client';

import AdminDashboard from './components/admin/AdminDashboard';
import { mockRootProps } from './adminDashboardMockData';

export default function AdminDashboardPreview() {
  return (
    <AdminDashboard 
      initialUser={mockRootProps.user}
      initialStats={mockRootProps.stats}
    />
  );
}