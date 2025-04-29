'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    // Validar domínio de e-mail da Cresol
    if (!email.endsWith('@cresol.com.br')) {
      setError('Por favor, utilize um e-mail corporativo da Cresol.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            department,
          },
        },
      });

      if (error) throw error;

      setSuccess('Solicitação de acesso enviada com sucesso! Aguarde a confirmação do administrador.');
      
      // Em um ambiente real, aqui poderíamos enviar uma notificação para o admin
      setTimeout(() => {
        router.push('/login');
      }, 5000);
    } catch (error: any) {
      console.error('Erro ao registrar:', error);
      setError('Falha ao solicitar acesso. Tente novamente mais tarde.');
    } finally {
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
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Solicitar Acesso</h1>
          <p className="text-gray-600 text-sm mt-1">
            Preencha o formulário para solicitar acesso
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="form-label">
              Nome Completo
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="input"
              placeholder="Seu nome completo"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="form-label">
              E-mail Corporativo
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
            <label htmlFor="department" className="form-label">
              Departamento
            </label>
            <input
              id="department"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              className="input"
              placeholder="Seu departamento na Cresol"
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
              placeholder="Crie uma senha segura"
              minLength={8}
            />
          </div>
          
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Solicitar Acesso'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}