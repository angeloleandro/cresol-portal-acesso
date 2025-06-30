'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface TestResult {
  id: string;
  title: string;
  url: string;
  method: string;
  status: 'loading' | 'success' | 'error';
  error?: string;
}

export default function FixImageTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [environment, setEnvironment] = useState<any>({});

  useEffect(() => {
    // Coletar informações do ambiente
    setEnvironment({
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });

    loadTestImages();
  }, []);

  const loadTestImages = async () => {
    const testResults: TestResult[] = [];

    // Buscar banners do banco
    const { data: banners } = await supabase
      .from('banners')
      .select('id, title, image_url')
      .eq('is_active', true)
      .limit(2);

    if (banners) {
      banners.forEach((banner, index) => {
        testResults.push({
          id: `banner-optimized-${banner.id}`,
          title: `${banner.title} (Otimizada)`,
          url: banner.image_url,
          method: 'optimized',
          status: 'loading'
        });

        testResults.push({
          id: `banner-unoptimized-${banner.id}`,
          title: `${banner.title} (Não Otimizada)`,
          url: banner.image_url,
          method: 'unoptimized',
          status: 'loading'
        });
      });
    }

    setResults(testResults);
  };

  const updateResult = (id: string, status: 'success' | 'error', error?: string) => {
    setResults(prev => prev.map(result => 
      result.id === id 
        ? { ...result, status, error }
        : result
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🚨 Teste Corretivo - Erro 402 Vercel
          </h1>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-red-800 mb-2">Problema Identificado:</h3>
            <p className="text-sm text-red-700">
              Erro 402 (Payment Required) na Vercel Image Optimization. 
              Testando com imagens otimizadas vs não otimizadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">🌍 Ambiente</h3>
              <div className="text-sm space-y-1">
                <div>NODE_ENV: {environment.nodeEnv || 'N/A'}</div>
                <div>VERCEL: {environment.vercel || 'N/A'}</div>
                <div>Supabase URL: {environment.supabaseUrl ? 'Configurada' : 'N/A'}</div>
                <div>Anon Key: {environment.hasAnonKey ? 'Configurada' : 'N/A'}</div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">🔧 Solução Testada</h3>
              <div className="text-sm text-yellow-700">
                <div>• Forçar unoptimized=true para Supabase</div>
                <div>• Comparar otimizada vs não otimizada</div>
                <div>• Identificar causa do erro 402</div>
              </div>
            </div>
          </div>

          <button
            onClick={loadTestImages}
            className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            🔄 Recarregar Testes
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📊 Resultados dos Testes
          </h2>
          
          <div className="space-y-6">
            {results.map((result) => (
              <div key={result.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-sm">{result.title}</h3>
                    <p className="text-xs text-gray-500">Método: {result.method}</p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded ${
                    result.status === 'success' ? 'bg-green-100 text-green-800' :
                    result.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.status}
                  </div>
                </div>

                <div className="text-xs text-gray-600 break-all bg-gray-50 p-2 rounded mb-3">
                  {result.url}
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-20 bg-gray-100 rounded overflow-hidden">
                    {result.url && (
                      <Image
                        src={result.url}
                        alt={result.title}
                        fill
                        className="object-cover"
                        unoptimized={result.method === 'unoptimized'}
                        onLoad={() => updateResult(result.id, 'success')}
                        onError={(e) => updateResult(result.id, 'error', 'Falha ao carregar')}
                        sizes="128px"
                        quality={75}
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    {result.status === 'success' && (
                      <div className="text-sm text-green-600">✅ Carregada com sucesso</div>
                    )}
                    {result.status === 'error' && (
                      <div className="text-sm text-red-600">
                        ❌ Erro: {result.error}
                      </div>
                    )}
                    {result.status === 'loading' && (
                      <div className="text-sm text-yellow-600">⏳ Carregando...</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {results.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum teste carregado. Clique em &quot;Recarregar Testes&quot;.</p>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-medium text-yellow-800 mb-2">📋 Análise Esperada</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>• Se apenas &quot;Não Otimizada&quot; funcionar → Problema na Vercel Image Optimization</div>
            <div>• Se ambas falharem → Problema nas Environment Variables</div>
            <div>• Se ambas funcionarem → Problema foi corrigido</div>
          </div>
        </div>
      </div>
    </div>
  );
}
