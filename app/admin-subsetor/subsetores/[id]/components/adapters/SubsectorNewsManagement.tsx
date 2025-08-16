// Adapter for UnifiedNewsManager to work with subsector data
// This component wraps the UnifiedNewsManager component for subsector usage

import { UnifiedNewsManager } from './UnifiedNewsManager';

interface SubsectorNewsManagementProps {
  sectorId: string; // This is actually the subsectorId
}

export function SubsectorNewsManagement({
  sectorId: subsectorId
}: SubsectorNewsManagementProps) {
  const subsectorName = 'Subsetor';
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <UnifiedNewsManager 
        type="subsector" 
        entityId={subsectorId} 
        entityName={subsectorName} 
      />
    </div>
  );
}