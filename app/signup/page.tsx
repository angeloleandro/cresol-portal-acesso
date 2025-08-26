'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { FormSelect } from '@/app/components/forms/FormSelect';
import OptimizedImage from '@/app/components/OptimizedImage';
import { Button } from '@/app/components/ui/Button';
import { StandardizedInput } from '@/app/components/ui/StandardizedInput';
import { createClient } from '@/lib/supabase/client';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [positionId, setPositionId] = useState('');
  const [workLocationId, setWorkLocationId] = useState('');
  const [workLocations, setWorkLocations] = useState<{id: string, name: string}[]>([]);
  const [positions, setPositions] = useState<{id: string, name: string, department?: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Só executar no lado do cliente
    if (typeof window === 'undefined') return;
    
    // Buscar locais de atuação e cargos do Supabase
    const fetchData = async () => {
      try {
        const supabase = createClient();
        
        // Buscar locais de trabalho
        const { data: workLocationsData, error: workLocationsError } = await supabase
          .from('work_locations')
          .select('id, name')
          .order('name');
        if (!workLocationsError && workLocationsData) setWorkLocations(workLocationsData);

        // Buscar cargos
        const { data: positionsData, error: positionsError } = await supabase
          .from('positions')
          .select('id, name, department')
          .order('name');
        if (!positionsError && positionsData) setPositions(positionsData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };
    fetchData();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    // Validações básicas
    if (!email.endsWith('@cresol.com.br')) {
      setError('Por favor, utilize um e-mail corporativo da Cresol.');
      setLoading(false);
      return;
    }
    if (!workLocationId) {
      setError('Selecione o local de atuação.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // Verificar se já existe uma solicitação para este e-mail
      const { data: existingRequest, error: checkError } = await supabase
        .from('access_requests')
        .select('id, status')
        .eq('email', email)
        .maybeSingle();

      if (checkError) {
        console.error('Erro ao verificar solicitações existentes:', checkError);
      } else if (existingRequest) {
        if (existingRequest.status === 'pending') {
          setError('Já existe uma solicitação pendente para este e-mail. Por favor, aguarde a aprovação.');
          setLoading(false);
          return;
        }
        
        if (existingRequest.status === 'approved') {
          setError('Este e-mail já foi aprovado. Por favor, faça login.');
          setLoading(false);
          return;
        }
      }

      // Verificar se o usuário já existe no Auth (não deve existir)
      const { data: authData, error: authCheckError } = await supabase.auth.signInWithPassword({
        email,
        password, // Tentativa de login que deve falhar se o usuário não existir
      });

      if (authData?.user) {
        // Se conseguimos fazer login, então o usuário já existe no Auth
        setError('Este e-mail já está registrado no sistema. Por favor, use a opção de login.');
        setLoading(false);
        return;
      }

      // Criar a solicitação de acesso com senha inicial
      const { error: insertError } = await supabase
        .from('access_requests')
        .insert({
          email,
          full_name: fullName,
          position_id: positionId,
          work_location_id: workLocationId,
          password_hash: password,
          status: 'pending',
        });

      if (insertError) {
        console.error('Erro ao criar solicitação de acesso:', insertError);
        throw insertError;
      }

      // Informar ao usuário que a solicitação foi enviada com sucesso
      setSuccess('Solicitação de acesso enviada com sucesso! Aguarde a aprovação do administrador. Você será redirecionado para a página de login.');
      
      // Opcional: redirecionar após alguns segundos
      setTimeout(() => {
        router.push('/login');
      }, 5000);
    } catch (error: unknown) {
      console.error('Erro ao solicitar acesso:', error);
      const errorMessage = error instanceof Error ? `Falha ao solicitar acesso. ${error.message}` : 'Falha ao solicitar acesso.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
            <div className="flex items-center ml-3">
              <div className="h-6 w-px bg-primary/30 mx-2"></div>
              <div className="flex items-baseline">
                <span className="text-primary font-bold text-lg tracking-wide">HUB</span>
                <span className="text-primary/60 font-light text-sm ml-1">2.0</span>
              </div>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Solicitar Acesso</h1>
          <p className="text-gray-600 text-sm mt-1">
            Preencha o formulário para solicitar acesso
          </p>
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm">
            {success}
          </div>
        )}
        <form onSubmit={handleSignUp} className="space-y-4">
          <StandardizedInput
            id="fullName"
            label="Nome Completo"
            type="text"
            variant="outline"
            size="md"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Seu nome completo"
            startIcon="user"
          />
          
          <StandardizedInput
            id="email"
            label="E-mail Corporativo"
            type="email"
            variant="outline"
            size="md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu.email@cresol.com.br"
            startIcon="mail"
            help="Use seu e-mail corporativo @cresol.com.br"
          />
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
              <span className="text-red-500 ml-1">*</span>
            </label>
            <FormSelect
              id="position"
              name="position"
              value={positionId}
              onChange={e => setPositionId(e.target.value)}
              options={[
                { value: '', label: 'Selecione o cargo' },
                ...positions.map(position => ({
                  value: position.id,
                  label: position.name,
                  description: position.department
                }))
              ]}
              placeholder="Selecione o cargo"
              required
            />
          </div>
          <div>
            <label htmlFor="workLocation" className="block text-sm font-medium text-gray-700 mb-1">
              Local de Atuação
              <span className="text-red-500 ml-1">*</span>
            </label>
            <FormSelect
              id="workLocation"
              name="workLocation"
              value={workLocationId}
              onChange={e => setWorkLocationId(e.target.value)}
              options={[
                { value: '', label: 'Selecione o local de atuação' },
                ...workLocations.map(loc => ({
                  value: loc.id,
                  label: loc.name
                }))
              ]}
              placeholder="Selecione o local de atuação"
              required
            />
          </div>
          <StandardizedInput
            id="password"
            label="Senha Inicial"
            type="password"
            variant="outline"
            size="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Define a senha para uso após aprovação"
            minLength={8}
            showPasswordToggle
            help="Esta senha será usada após a aprovação do administrador. Mínimo 8 caracteres."
          />
          <Button
            type="submit"
            variant="solid"
            colorPalette="orange"
            size="md"
            fullWidth
            loading={loading}
            loadingText="Enviando..."
            disabled={loading}
          >
            Solicitar Acesso
          </Button>
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