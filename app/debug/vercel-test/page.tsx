'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import VercelImageTest from '@/app/components/VercelImageTest';

interface TestImage {
  id: string;
  table: string;
  title: string;
  url: string;
}

export default function VercelTestPage() {
  const [testImages, setTestImages] = useState<TestImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [environmentInfo, setEnvironmentInfo] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadTestImages = async () => {
      const images: TestImage[] = [];

      // Teste 1: Banners
      const { data: banners } = await supabase
        .from('banners')
        .select('id, title, image_url')
        .eq('is_active', true)
        .limit(3);

      if (banners) {
        banners.forEach(banner => {
          if (banner.image_url) {
            images.push({
              id: `banner-${banner.id}`,
              table: 'banners',
              title: `Banner: ${banner.title || 'Sem título'}`,
              url: banner.image_url
            });
          }
        });
      }

      // Teste 2: Galeria
      const { data: gallery } = await supabase
        .from('gallery_images')
        .select('id, title, image_url')
        .eq('is_active', true)
        .limit(3);

      if (gallery) {
        gallery.forEach(img => {
          if (img.image_url) {
            images.push({
              id: `gallery-${img.id}`,
              table: 'gallery_images',
              title: `Galeria: ${img.title || 'Sem título'}`,
              url: img.image_url
            });
          }
        });
      }

      // Teste 3: URL manual de teste
      const manualTestUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/test-image.jpg`;
      images.push({
        id: 'manual-test',
        table: 'teste',
        title: 'Teste Manual - URL Construída',
        url: manualTestUrl
      });

      setTestImages(images);
      setLoading(false);
    };

    // Coletar informações do ambiente
    setEnvironmentInfo({
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side'
    });

    loadTestImages();
  }, []);

  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('count(*)')
        .limit(1);

      if (error) {
        alert(`Erro de conexão: ${error.message}`);
      } else {
        alert('Conexão com Supabase funcionando!');
      }
    } catch (err) {
      alert(`Erro: ${err}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando testes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🔧 Teste de Imagens - Vercel Image Optimization
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">🌍 Informações do Ambiente</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Ambiente:</span>
                  <span className={`font-medium ${
                    environmentInfo.nodeEnv === 'production' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {environmentInfo.nodeEnv}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Vercel:</span>
                  <span className={`font-medium ${
                    environmentInfo.vercel === '1' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {environmentInfo.vercel === '1' ? 'Sim' : 'Não'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Supabase URL:</span>
                  <span className={`font-medium ${
                    environmentInfo.supabaseUrl ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {environmentInfo.supabaseUrl ? 'Configurada' : 'Não configurada'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Anon Key:</span>
                  <span className={`font-medium ${
                    environmentInfo.hasAnonKey ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {environmentInfo.hasAnonKey ? 'Configurada' : 'Não configurada'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">🔗 URLs Teste</h3>
              <div className="text-xs space-y-1 text-gray-600">
                <div>Base URL: {environmentInfo.supabaseUrl}</div>
                <div>Storage Path: /storage/v1/object/public/images/</div>
                <div>Total imagens encontradas: {testImages.length}</div>
              </div>
              <button
                onClick={testConnection}
                className="mt-3 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
              >
                Testar Conexão Supabase
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🖼️ Teste de Carregamento de Imagens
          </h2>
          
          {testImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma imagem encontrada para teste.</p>
              <p className="text-sm mt-2">
                Verifique se existem banners ou imagens de galeria ativas no banco de dados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {testImages.map((img) => (
                <VercelImageTest 
                  key={img.id}
                  testUrl={img.url}
                  title={img.title}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-medium text-yellow-800 mb-2">📋 Checklist de Troubleshooting</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <div className="flex items-center gap-2">
              <span className={environmentInfo.supabaseUrl ? '✅' : '❌'}></span>
              <span>NEXT_PUBLIC_SUPABASE_URL configurada</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={environmentInfo.hasAnonKey ? '✅' : '❌'}></span>
              <span>NEXT_PUBLIC_SUPABASE_ANON_KEY configurada</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={environmentInfo.vercel === '1' ? '✅' : '⚠️'}></span>
              <span>Rodando na Vercel</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📝</span>
              <span>Verificar remotePatterns no next.config.js</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🗄️</span>
              <span>Verificar políticas RLS do Supabase Storage</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Timestamp: {environmentInfo.timestamp}
          </p>
        </div>
      </div>
    </div>
  );
}
