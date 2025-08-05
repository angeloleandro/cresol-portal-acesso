'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import OptimizedImage from '@/app/components/OptimizedImage';
import { supabase } from '@/lib/supabase';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirectedFrom') || '/home';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Verificar se o usuário já está autenticado ao carregar a página
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/home');
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Email não confirmado. Por favor, verifique sua caixa de entrada ou entre em contato com o administrador.');
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos.');
        } else {
          setError(`Falha ao fazer login: ${error.message}`);
        }
        setLoading(false);
        return;
      }
      
      // Redirecionar imediatamente após login bem-sucedido
      router.push(redirectPath);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Falha na autenticação: ${errorMessage}`);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="card max-w-md w-full">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-48 h-24 mb-4">
            <OptimizedImage 
              src="/logo-horizontal-laranja.svg" 
              alt="Logo Cresol" 
              fill
              priority
              sizes="(max-width: 768px) 100vw, 192px"
              className="object-contain"
            />
          </div>
          <h1 className="heading-2 text-title">Login</h1>
          <p className="body-text-small text-muted mt-1">
            Entre com suas credenciais
          </p>
        </div>

        {error && (
          <div className="alert-error body-text-small">
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
          <p className="body-text-small text-muted">
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

export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        <div className="card max-w-md w-full">
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-48 h-24 mb-4">
              <OptimizedImage 
                src="/logo-horizontal-laranja.svg" 
                alt="Logo Cresol" 
                fill
                priority
                sizes="(max-width: 768px) 100vw, 192px"
                className="object-contain"
              />
            </div>
            <div className="loading-spinner mb-4"></div>
            <p className="body-text-small text-muted">Carregando...</p>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}