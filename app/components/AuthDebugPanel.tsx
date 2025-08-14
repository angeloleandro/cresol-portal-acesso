'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthDebugPanel() {
  const [authState, setAuthState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('🔍 [AuthDebugPanel] Verificando autenticação...');
    
    const supabase = createClient();
    
    // Verificar sessão
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔐 [AuthDebugPanel] Sessão:', session);
    console.log('🔐 [AuthDebugPanel] Erro sessão:', sessionError);
    
    // Verificar usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('👤 [AuthDebugPanel] Usuário:', user);
    console.log('👤 [AuthDebugPanel] Erro usuário:', userError);
    
    // Verificar perfil
    let profile = null;
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = data;
      console.log('📋 [AuthDebugPanel] Perfil:', profile);
      console.log('📋 [AuthDebugPanel] Erro perfil:', error);
    }
    
    setAuthState({
      session: session ? {
        access_token: session.access_token?.substring(0, 20) + '...',
        refresh_token: session.refresh_token?.substring(0, 20) + '...',
        expires_at: session.expires_at,
        user: session.user
      } : null,
      user,
      profile,
      sessionError,
      userError
    });
    
    setLoading(false);
  };

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded">Carregando estado de autenticação...</div>;
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">🔍 Debug de Autenticação</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Sessão:</strong> {authState.session ? '✅ Ativa' : '❌ Inativa'}
          {authState.sessionError && (
            <span className="text-red-600 ml-2">Erro: {authState.sessionError.message}</span>
          )}
        </div>
        
        {authState.session && (
          <div className="pl-4 text-xs text-gray-600">
            <div>Token: {authState.session.access_token}</div>
            <div>Expira: {new Date(authState.session.expires_at * 1000).toLocaleString('pt-BR')}</div>
          </div>
        )}
        
        <div>
          <strong>Usuário:</strong> {authState.user ? `✅ ${authState.user.email}` : '❌ Não autenticado'}
          {authState.userError && (
            <span className="text-red-600 ml-2">Erro: {authState.userError.message}</span>
          )}
        </div>
        
        {authState.user && (
          <div className="pl-4 text-xs text-gray-600">
            <div>ID: {authState.user.id}</div>
            <div>Role: {authState.user.role}</div>
          </div>
        )}
        
        <div>
          <strong>Perfil:</strong> {authState.profile ? `✅ ${authState.profile.role}` : '❌ Não encontrado'}
        </div>
        
        {authState.profile && (
          <div className="pl-4 text-xs text-gray-600">
            <div>Nome: {authState.profile.full_name}</div>
            <div>Role: {authState.profile.role}</div>
            <div>Setor: {authState.profile.sector_id || 'N/A'}</div>
          </div>
        )}
      </div>
      
      <button
        onClick={checkAuth}
        className="mt-3 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
      >
        Recarregar
      </button>
      
      <div className="mt-3 p-2 bg-white rounded text-xs">
        <strong>Console:</strong> Abra o console do navegador (F12) para ver logs detalhados
      </div>
    </div>
  );
}
