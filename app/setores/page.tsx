'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';

interface Sector {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export default function SetoresPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }
      setUser(data.user);

      // Buscar setores usando a tabela sectors diretamente
      // As políticas de segurança no Supabase devem permitir que todos os usuários autenticados
      // possam ver os setores, mas apenas administradores podem criar/editar/excluir
      const { data: sectorsData, error } = await supabase
        .from('sectors')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar setores:', error);
      } else {
        setSectors(sectorsData || []);
      }
      
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-cresol-gray">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cresol-gray-light/30">
      <Navbar />

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Setores</h1>
          <p className="text-cresol-gray">Conheça os setores da Cresol e acesse informações específicas de cada área.</p>
        </div>

        {/* Lista de setores */}
        {sectors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-8 text-center">
            <p className="text-cresol-gray">Nenhum setor cadastrado no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sector) => (
              <Link 
                key={sector.id}
                href={`/setores/${sector.id}`}
                className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-6 hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-semibold text-cresol-gray mb-2">{sector.name}</h2>
                <p className="text-cresol-gray mb-4">{sector.description || 'Sem descrição'}</p>
                <div className="mt-2 text-primary text-sm font-medium">
                  Ver detalhes →
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 