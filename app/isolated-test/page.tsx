'use client';

import { useEffect, useState } from 'react';

// TESTE ISOLADO - SEM USAR AuthProvider
export default function IsolatedTestPage() {
  const [hydrated, setHydrated] = useState(false);
  
  
  useEffect(() => {
    setHydrated(true);
  }, []);
  
  const handleClick = () => {
    alert('CLIENT FUNCIONANDO! ✅');
  };
  
  return (
    // Usando apenas HTML/CSS inline - SEM Chakra, SEM AuthProvider
    <html>
      <head><title>Teste Isolado</title></head>
      <body style={{ fontFamily: 'monospace', padding: '2rem', background: '#f9f9f9' }}>
        <h1>🚀 TESTE ISOLADO DE HIDRATAÇÃO</h1>
        
        <div style={{ background: 'white', padding: '1rem', border: '2px solid #ccc', margin: '1rem 0' }}>
          <p><strong>Window exists:</strong> {typeof window !== 'undefined' ? '✅ SIM' : '❌ NÃO (Server)'}</p>
          <p><strong>Hydrated:</strong> {hydrated ? '✅ CLIENTE HIDRATOU' : '❌ NÃO HIDRATOU'}</p>
          <p><strong>Time:</strong> {Date.now()}</p>
        </div>
        
        <button 
          onClick={handleClick}
          style={{
            background: '#28a745',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          🎯 TESTAR JAVASCRIPT CLIENT
        </button>
        
        <div style={{ background: '#ffeaa7', padding: '1rem', margin: '1rem 0', border: '2px solid #fdcb6e' }}>
          <strong>ESTE TESTE BYPASSA TOTALMENTE O AuthProvider!</strong>
        </div>
      </body>
    </html>
  );
}