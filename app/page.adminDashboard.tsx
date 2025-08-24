'use client';

import { mockRootProps } from './adminDashboardMockData';
import AdminDashboard from './components/admin/AdminDashboard';

export default function AdminDashboardPreview() {
  return (
    <AdminDashboard 
      initialUser={mockRootProps.user}
      initialStats={mockRootProps.stats}
    />
  );
}