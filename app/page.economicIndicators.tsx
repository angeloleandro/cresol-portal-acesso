'use client';

import EconomicIndicatorsPanel from './components/economic/EconomicIndicatorsPanel';

export default function EconomicIndicatorsPreview() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <EconomicIndicatorsPanel />
      </div>
    </div>
  );
}