// Adapter for UnifiedEventsManager to work with subsector data
// This component wraps the UnifiedEventsManager component for subsector usage

import { UnifiedEventsManager } from './UnifiedEventsManager';

interface SubsectorEventsManagementProps {
  subsectorId: string;
}

export function SubsectorEventsManagement({
  subsectorId
}: SubsectorEventsManagementProps) {
  const subsectorName = 'Subsetor';
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <UnifiedEventsManager 
        type="subsector" 
        entityId={subsectorId} 
        entityName={subsectorName} 
      />
    </div>
  );
}