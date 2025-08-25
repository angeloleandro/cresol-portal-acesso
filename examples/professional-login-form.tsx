'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import OptimizedImage from '@/app/components/OptimizedImage';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
import { FormField, FormInput } from '@/app/components/forms';

function ProfessionalLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirectedFrom') || '/home';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{email?: string; password?: string}>({});
  
  // Check if user is already authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/home');
      }
    };
    checkUser();
  }, [router]);

  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    
    if (!email.trim()) {
      errors.email = 'E-mail é obrigatório';
    } else if (!email.includes('@')) {
      errors.email = 'E-mail deve ter formato válido';
    }
    
    if (!password.trim()) {
      errors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      errors.password = 'Senha deve ter no mínimo 6 caracteres';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
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
      
      // Redirect immediately after successful login
      router.push(redirectPath);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Falha na autenticação: ${errorMessage}`);
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="card max-w-md w-full">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-baseline justify-center mb-4">
            <div className="relative w-48 h-24">
              <OptimizedImage 
                src="/logo-horizontal-laranja.svg" 
                alt="Logo Cresol" 
                fill
                priority
                sizes="(max-width: 768px) 100vw, 192px"
                className="object-contain"
              />
            </div>
            <div className="flex items-baseline ml-3">
              <div className="h-6 w-px bg-primary/30 mx-2"></div>
              <span className="text-primary font-bold text-lg tracking-wide">HUB</span>
              <span className="text-primary/60 font-light text-sm ml-1">2.0</span>
            </div>
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
        
        <form onSubmit={handleLogin} className="space-y-6">
          {}
          
          <FormField 
            label="E-mail" 
            error={validationErrors.email}
            helpText="Digite seu e-mail corporativo"
            required
          >
            <FormInput
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="seu@cresol.com.br"
              startIcon="Mail"
              clearable
              onClear={() => setEmail('')}
              disabled={loading}
              autoComplete="email"
            />
          </FormField>

          <FormField 
            label="Senha" 
            error={validationErrors.password}
            helpText="Digite sua senha de acesso"
            required
          >
            <FormInput
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Digite sua senha..."
              showPasswordToggle
              disabled={loading}
              autoComplete="current-password"
            />
          </FormField>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded-sm"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Lembrar-me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-primary hover:text-primary-dark"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Não tem conta?{' '}
              <Link
                href="/signup"
                className="font-medium text-primary hover:text-primary-dark"
              >
                Solicite acesso
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfessionalLoginForm;

