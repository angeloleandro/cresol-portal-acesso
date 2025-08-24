'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

import OptimizedImage from '@/app/components/OptimizedImage';
import { Button } from '@/app/components/ui/Button';
import { StandardizedInput } from '@/app/components/ui/StandardizedInput';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { useAuth } from '@/app/providers/AuthProvider';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { TIMINGS } from '@/lib/constants/timing';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirectedFrom') || '/home';
  const { user, signIn, loading: authLoading, initialized } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Verificar se o usuário já está autenticado
  useEffect(() => {
    if (initialized && user) {
      router.push('/home');
    }
  }, [initialized, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

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

      // Sucesso - o useAuth hook já gerencia o estado
      
      // Aguardar um pouco mais para garantir que a sessão seja estabelecida
      await new Promise(resolve => setTimeout(resolve, TIMINGS.animationNormal));
      
      // Redirecionar (será interceptado pelo useEffect se user estiver definido)
      router.push(redirectPath);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Falha na autenticação: ${errorMessage}`);
      setLoading(false);
    }
  };

  // Mostrar loading durante inicialização da autenticação
  if (!initialized || authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        <div className="card max-w-md w-full">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-48 h-16">
                <OptimizedImage 
                  src="/logo-horizontal-laranja.svg" 
                  alt="Logo Cresol" 
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 192px"
                  className="object-contain"
                />
              </div>
              <div className="flex items-center ml-2">
                <div className="h-8 w-px bg-primary/30 mx-3"></div>
                <div className="flex items-baseline">
                  <span className="text-primary font-bold text-xl tracking-wide">HUB</span>
                  <span className="text-primary/60 font-light text-base ml-1">2.0</span>
                </div>
              </div>
            </div>
            <UnifiedLoadingSpinner 
              size="default" 
              message={LOADING_MESSAGES.checkingSession}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="card max-w-md w-full">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-48 h-16">
              <OptimizedImage 
                src="/logo-horizontal-laranja.svg" 
                alt="Logo Cresol" 
                fill
                priority
                sizes="(max-width: 768px) 100vw, 192px"
                className="object-contain"
              />
            </div>
            <div className="flex items-center ml-2">
              <div className="h-8 w-px bg-primary/30 mx-3"></div>
              <div className="flex items-baseline">
                <span className="text-primary font-bold text-xl tracking-wide">HUB</span>
                <span className="text-primary/60 font-light text-base ml-1">2.0</span>
              </div>
            </div>
          </div>
          <h1 className="heading-4 text-title">Login</h1>
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
          <StandardizedInput
            id="email"
            label="E-mail"
            type="email"
            variant="outline"
            size="md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu.email@cresol.com.br"
            startIcon="mail"
          />
          
          <StandardizedInput
            id="password"
            label="Senha"
            type="password"
            variant="outline"
            size="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Sua senha"
            showPasswordToggle
          />
          
          <div className="text-right">
            <Link href="/reset-password" className="text-sm text-primary hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          
          <Button
            type="submit"
            variant="solid"
            colorPalette="orange"
            size="md"
            fullWidth
            loading={loading}
            loadingText="Entrando..."
            disabled={loading}
          >
            Entrar
          </Button>
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
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-48 h-16">
                <OptimizedImage 
                  src="/logo-horizontal-laranja.svg" 
                  alt="Logo Cresol" 
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 192px"
                  className="object-contain"
                />
              </div>
              <div className="flex items-center ml-2">
                <div className="h-8 w-px bg-primary/30 mx-3"></div>
                <div className="flex items-baseline">
                  <span className="text-primary font-bold text-xl tracking-wide">HUB</span>
                  <span className="text-primary/60 font-light text-base ml-1">2.0</span>
                </div>
              </div>
            </div>
            <UnifiedLoadingSpinner 
              size="default" 
              message={LOADING_MESSAGES.authenticating}
            />
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}