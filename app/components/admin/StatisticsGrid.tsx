'use client';

import StatCard from './StatCard';

interface DashboardStats {
  totalUsers: number;
  pendingRequests: number;
  totalSectors: number;
  totalSubsectors: number;
}

interface StatisticsGridProps {
  stats: DashboardStats;
  className?: string;
}

export default function StatisticsGrid({ stats, className = '' }: StatisticsGridProps) {
  return (
    <div className={`grid-modern-stats ${className}`}>
      <StatCard
        icon="user-group"
        value={stats.totalUsers}
        label="Usuários"
      />
      
      <StatCard
        icon="user-add"
        value={stats.pendingRequests}
        label="Pendentes"
      />
      
      <StatCard
        icon="building-1"
        value={stats.totalSectors}
        label="Setores"
      />
      
      <StatCard
        icon="building-1"
        value={stats.totalSubsectors}
        label="Subsetores"
      />
    </div>
  );
}