import { CompactStatsCard } from './shared/CompactStatsCard';

interface StatsCardsProps {
  groupsCount: number;
  usersCount: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ 
  groupsCount, 
  usersCount 
}) => {
  return (
    <div className="space-y-4">
      <CompactStatsCard
        title="Total Grupos"
        value={groupsCount}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
        }
        color="primary"
      />
      
      <CompactStatsCard
        title="Usuários Ativos"
        value={usersCount}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
            />
          </svg>
        }
        color="secondary"
      />

      <CompactStatsCard
        title="Notificações Hoje"
        value="0"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 17h5l-5 5v-5zM5.07 7.07a10 10 0 0014.86 0M5.07 7.07A10 10 0 117.07 5.07M5.07 7.07L12 14l6.93-6.93" 
            />
          </svg>
        }
        color="primary"
      />
    </div>
  );
};