'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';

import { FormatDate } from '@/lib/utils/formatters';
interface MessageItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  sector_id?: string;
  subsector_id?: string;
  sector_name?: string;
  subsector_name?: string;
  type: 'sector' | 'subsector';
}

export default function MensagemDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState<MessageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedMessages, setRelatedMessages] = useState<MessageItem[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }
      setUser(data.user);

      try {
        // Tentar buscar primeiro em sector_messages
        const { data: sectorMessage, error: sectorError } = await supabase
          .from('sector_messages')
          .select(`
            id,
            title,
            content,
            created_at,
            sector_id,
            sectors (name)
          `)
          .eq('id', id)
          .eq('is_published', true)
          .single();

        let currentMessage: MessageItem | null = null;
        let relatedSectorId: string | undefined;
        let relatedSubsectorId: string | undefined;

        if (sectorMessage && !sectorError) {
          // É uma mensagem de setor
          currentMessage = {
            ...sectorMessage,
            sector_name: (sectorMessage as any).sectors?.name,
            type: 'sector' as const
          };
          relatedSectorId = sectorMessage.sector_id;
        } else {
          // Tentar buscar em subsector_messages
          const { data: subsectorMessage, error: subsectorError } = await supabase
            .from('subsector_messages')
            .select(`
              id,
              title,
              content,
              created_at,
              subsector_id,
              subsectors (
                name,
                sector_id
              )
            `)
            .eq('id', id)
            .eq('is_published', true)
            .single();

          if (subsectorMessage && !subsectorError) {
            // É uma mensagem de subsetor
            currentMessage = {
              ...subsectorMessage,
              subsector_name: (subsectorMessage as any).subsectors?.name,
              sector_id: (subsectorMessage as any).subsectors?.sector_id,
              type: 'subsector' as const
            };
            relatedSubsectorId = subsectorMessage.subsector_id;
            relatedSectorId = (subsectorMessage as any).subsectors?.sector_id;
          }
        }

        if (!currentMessage) {
          router.push('/mensagens');
          return;
        }

        setMessage(currentMessage);

        // Buscar mensagens relacionadas
        let relatedList: MessageItem[] = [];

        if (relatedSectorId) {
          // Buscar mensagens do mesmo setor
          const { data: relatedSectorMessages } = await supabase
            .from('sector_messages')
            .select(`
              id,
              title,
              content,
              created_at,
              sector_id,
              sectors (name)
            `)
            .eq('sector_id', relatedSectorId)
            .eq('is_published', true)
            .neq('id', id)
            .order('created_at', { ascending: false })
            .limit(2);

          if (relatedSectorMessages) {
            const formatted = relatedSectorMessages.map((msg: any) => ({
              ...msg,
              sector_name: msg.sectors?.name,
              type: 'sector' as const
            }));
            relatedList = [...relatedList, ...formatted];
          }
        }

        if (relatedSubsectorId) {
          // Buscar mensagens do mesmo subsetor
          const { data: relatedSubsectorMessages } = await supabase
            .from('subsector_messages')
            .select(`
              id,
              title,
              content,
              created_at,
              subsector_id,
              subsectors (name)
            `)
            .eq('subsector_id', relatedSubsectorId)
            .eq('is_published', true)
            .neq('id', id)
            .order('created_at', { ascending: false })
            .limit(2);

          if (relatedSubsectorMessages) {
            const formatted = relatedSubsectorMessages.map((msg: any) => ({
              ...msg,
              subsector_name: (msg as any).subsectors?.name,
              type: 'subsector' as const
            }));
            relatedList = [...relatedList, ...formatted];
          }
        }

        // Limitar e ordenar mensagens relacionadas
        relatedList.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRelatedMessages(relatedList.slice(0, 3));

      } catch (error) {

        router.push('/mensagens');
        return;
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router, id]);

  // Formatador de data

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <UnifiedLoadingSpinner 
          fullScreen={true}
          size="large" 
          message="Carregando mensagem..." 
        />
        <Footer />
      </div>
    );
  }

  if (!message) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-cresol-gray text-xl">Mensagem não encontrada</p>
            <Link href="/mensagens" className="mt-4 inline-block text-primary hover:underline">
              Voltar para todas as mensagens
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cresol-gray-light/30">
      <Navbar />

      {/* Conteúdo principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Mensagens', href: '/mensagens' },
              { label: message.title }
            ]} 
          />
        </div>

        {/* Cabeçalho da mensagem */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Mensagem
            </span>
            {message.type === 'sector' && message.sector_name && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Setor: {message.sector_name}
              </span>
            )}
            {message.type === 'subsector' && message.subsector_name && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Subsetor: {message.subsector_name}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-cresol-gray mb-4">{message.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-cresol-gray">
            <span>
              <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {FormatDate(message.created_at)}
            </span>
            <span>
              <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {message.sector_name || message.subsector_name || 'Administração'}
            </span>
          </div>
        </div>

        {/* Conteúdo da mensagem */}
        <div className="bg-white rounded-lg border border-cresol-gray-light p-6 mb-8">
          <div className="prose max-w-none prose-headings:text-cresol-gray prose-p:text-cresol-gray prose-li:text-cresol-gray prose-a:text-primary">
            <p className="whitespace-pre-line">{message.content}</p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-between items-center mb-8">
          <Link 
            href="/mensagens" 
            className="inline-flex items-center text-sm text-cresol-gray hover:text-primary transition-colors"
          >
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para Mensagens
          </Link>
        </div>

        {/* Mensagens relacionadas */}
        {relatedMessages.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary mb-4">Mensagens relacionadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedMessages.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/mensagens/${item.id}`}
                  className="block bg-white rounded-lg border border-cresol-gray-light overflow-hidden hover:border-primary/30 transition-colors"
                >
                  <div className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                      Mensagem
                    </span>
                    <h3 className="text-base font-semibold text-cresol-gray mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-cresol-gray mb-2 line-clamp-3">{item.content}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-cresol-gray">
                        {FormatDate(item.created_at)}
                      </span>
                      <span className="text-primary font-medium">
                        Ler mais →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}