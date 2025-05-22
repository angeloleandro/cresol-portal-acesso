'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

// Função de utilitário para logs detalhados da sessão
const logSessionDetails = async (prefix: string) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  console.log(`[${prefix}] Sessão atual:`, data.session ? {
    id: data.session.user.id,
    email: data.session.user.email,
    expires_at: data.session.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : 'N/A',
    token_length: data.session.access_token.length,
    refresh_token_length: data.session.refresh_token.length
  } : 'null');
  
  if (error) {
    console.error(`[${prefix}] Erro ao obter sessão:`, error.message);
  }
  
  // Log das variáveis de ambiente para debug (valores parciais)
  console.log(`[${prefix}] NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 15)}...`);
  console.log(`[${prefix}] NEXT_PUBLIC_SUPABASE_ANON_KEY set: ${!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
  
  // Log da configuração do cliente
  console.log(`[${prefix}] Supabase client config:`, {
    persistSession: true, // Não podemos acessar diretamente autoRefreshToken
    storageKey: 'sb-cresol-portal-acesso-auth-token'
  });
}

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirectedFrom') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  
  // Verificar se o usuário já está autenticado ao carregar a página
  useEffect(() => {
    const checkSession = async () => {
      console.log('[Login] Verificando sessão existente...');
      await logSessionDetails('Login-Initial');
      
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log('[Login] Usuário já autenticado, redirecionando para dashboard...');
        router.push('/dashboard');
      } else {
        console.log('[Login] Nenhuma sessão encontrada, exibindo formulário de login.');
      }
    };
    checkSession();
  }, [router, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    console.log('[Login] Iniciando processo de login para email:', email);

    try {
      // Tentar login
      console.log('[Login] Enviando credenciais para Supabase...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('[Login] Erro de autenticação:', authError.message, authError);
        if (authError.message.includes('Email not confirmed')) {
          setError('Email não confirmado. Por favor, verifique sua caixa de entrada ou entre em contato com o administrador.');
        } else if (authError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos.');
        } else {
          setError(`Falha ao fazer login: ${authError.message}`);
        }
        setLoading(false);
        return;
      }
      
      console.log('[Login] Login bem-sucedido, redirecionando para:', redirectPath);
      console.log('[Login] Sessão estabelecida:', authData?.session?.user?.id);
      
      // Log detalhado dos dados da sessão
      console.log('[Login] Dados da sessão obtida:', {
        user_id: authData?.session?.user?.id,
        email: authData?.session?.user?.email,
        token_present: !!authData?.session?.access_token,
        token_length: authData?.session?.access_token?.length,
        expires_at: authData?.session?.expires_at ? new Date(authData.session.expires_at * 1000).toISOString() : 'N/A',
      });
      
      // Armazenar explicitamente a sessão após login
      if (authData?.session) {
        console.log('[Login] Armazenando explicitamente a sessão...');
        
        try {
          // Força a sessão a ser armazenada no cliente
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token
          });
          
          if (setSessionError) {
            console.error('[Login] Erro ao definir a sessão:', setSessionError.message);
          } else {
            console.log('[Login] Sessão definida com sucesso!');
          }
        } catch (sessionError) {
          console.error('[Login] Exceção ao definir sessão:', sessionError instanceof Error ? sessionError.message : 'Erro desconhecido');
        }
        
        // Verificar se a sessão foi armazenada corretamente
        await logSessionDetails('Login-AfterSetSession');
      } else {
        console.warn('[Login] Nenhuma sessão retornada após login!');
      }
      
      // Adicionar um pequeno delay para garantir que os cookies sejam definidos
      console.log('[Login] Aguardando cookies serem processados antes de redirecionar...');
      setTimeout(async () => {
        await logSessionDetails('Login-BeforeRedirect');
        console.log('[Login] Redirecionando para:', redirectPath);
        router.push(redirectPath);
      }, 1000); // Aumentado para 1 segundo para garantir mais tempo
    } catch (error) {
      console.error('[Login] Erro geral ao fazer login:', error);
      if (error instanceof Error) {
        setError(`Falha na autenticação: ${error.message}. Tente novamente mais tarde.`);
      } else {
        setError('Falha na autenticação. Tente novamente mais tarde.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="card max-w-md w-full">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-40 h-20 mb-4">
            <Image 
              src="/logo-cresol.png" 
              alt="Logo Cresol" 
              fill
              priority
              sizes="(max-width: 768px) 100vw, 160px"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Login</h1>
          <p className="text-gray-600 text-sm mt-1">
            Entre com suas credenciais
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="form-label">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="seu.email@cresol.com.br"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="form-label">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="Sua senha"
            />
          </div>
          
          <div className="text-right">
            <Link href="/reset-password" className="text-sm text-primary hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Solicitar acesso
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}