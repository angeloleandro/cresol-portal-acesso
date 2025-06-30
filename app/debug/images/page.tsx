'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import OptimizedImage from '@/app/components/OptimizedImage';
import { processSupabaseImageUrl, isValidImageUrl, checkImageAccessibility } from '@/lib/imageUtils';

interface DebugData {
  table: string;
  items: Array<{
    id: string;
    title?: string;
    originalUrl: string;
    processedUrl: string | null;
    isValid: boolean;
    isAccessible?: boolean;
  }>;
}

export default function ImageDebugPage() {
  const [debugData, setDebugData] = useState<DebugData[]>([]);
  const [loading, setLoading] = useState(true);
  const [testUrls, setTestUrls] = useState<string[]>([]);

  useEffect(() => {
    const debugImages = async () => {
      const results: DebugData[] = [];

      // Debug banners
      const { data: banners } = await supabase
        .from('banners')
        .select('id, title, image_url')
        .eq('is_active', true);

      if (banners) {
        const bannerData: DebugData = {
          table: 'banners',
          items: await Promise.all(banners.map(async (banner) => {
            const processedUrl = processSupabaseImageUrl(banner.image_url);
            const isAccessible = processedUrl ? await checkImageAccessibility(processedUrl) : false;
            
            return {
              id: banner.id,
              title: banner.title || 'Sem título',
              originalUrl: banner.image_url,
              processedUrl,
              isValid: isValidImageUrl(banner.image_url),
              isAccessible
            };
          }))
        };
        results.push(bannerData);
      }

      // Debug gallery images
      const { data: gallery } = await supabase
        .from('gallery_images')
        .select('id, title, image_url')
        .eq('is_active', true);

      if (gallery) {
        const galleryData: DebugData = {
          table: 'gallery_images',
          items: await Promise.all(gallery.map(async (img) => {
            const processedUrl = processSupabaseImageUrl(img.image_url);
            const isAccessible = processedUrl ? await checkImageAccessibility(processedUrl) : false;
            
            return {
              id: img.id,
              title: img.title || 'Sem título',
              originalUrl: img.image_url,
              processedUrl,
              isValid: isValidImageUrl(img.image_url),
              isAccessible
            };
          }))
        };
        results.push(galleryData);
      }

      // Debug avatars
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .not('avatar_url', 'is', null);

      if (profiles) {
        const avatarData: DebugData = {
          table: 'profiles (avatars)',
          items: await Promise.all(profiles.map(async (profile) => {
            const processedUrl = processSupabaseImageUrl(profile.avatar_url);
            const isAccessible = processedUrl ? await checkImageAccessibility(processedUrl) : false;
            
            return {
              id: profile.id,
              title: profile.full_name,
              originalUrl: profile.avatar_url,
              processedUrl,
              isValid: isValidImageUrl(profile.avatar_url),
              isAccessible
            };
          }))
        };
        results.push(avatarData);
      }

      setDebugData(results);
      
      // Coletar URLs para teste manual
      const allUrls = results.flatMap(data => 
        data.items.map(item => item.processedUrl).filter(Boolean)
      ) as string[];
      const uniqueUrls = Array.from(new Set(allUrls));
      setTestUrls(uniqueUrls);
      
      setLoading(false);
    };

    debugImages();
  }, []);

  const testUrl = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        url,
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      return {
        url,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Debug de Imagens - Carregando...</h1>
          <div className="animate-pulse bg-white rounded-lg p-8">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug de Imagens do Supabase</h1>
        
        {/* Informações do Environment */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Configurações do Environment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong><br />
              <span className="text-blue-600">{process.env.NEXT_PUBLIC_SUPABASE_URL}</span>
            </div>
            <div>
              <strong>NODE_ENV:</strong><br />
              <span className="text-green-600">{process.env.NODE_ENV}</span>
            </div>
            <div>
              <strong>VERCEL_URL:</strong><br />
              <span className="text-purple-600">{process.env.VERCEL_URL || 'Não configurado'}</span>
            </div>
            <div>
              <strong>Timestamp:</strong><br />
              <span className="text-gray-600">{new Date().toISOString()}</span>
            </div>
          </div>
        </div>

        {/* Debug por tabela */}
        {debugData.map((data) => (
          <div key={data.table} className="bg-white rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Tabela: {data.table} ({data.items.length} itens)
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Título</th>
                    <th className="text-left p-2">URL Original</th>
                    <th className="text-left p-2">URL Processada</th>
                    <th className="text-left p-2">Válida</th>
                    <th className="text-left p-2">Acessível</th>
                    <th className="text-left p-2">Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2 font-medium">{item.title}</td>
                      <td className="p-2">
                        <div className="max-w-xs truncate text-blue-600">
                          {item.originalUrl}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="max-w-xs truncate text-green-600">
                          {item.processedUrl}
                        </div>
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isValid ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.isAccessible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isAccessible === undefined ? 'Testando...' : item.isAccessible ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td className="p-2">
                        {item.processedUrl && (
                          <div className="w-16 h-16 relative">
                            <OptimizedImage
                              src={item.processedUrl}
                              alt={item.title || 'Preview'}
                              fill
                              className="object-cover rounded"
                              fallbackText="X"
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Teste manual de URLs */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Teste Manual de URLs</h2>
          <div className="space-y-2">
            {testUrls.slice(0, 5).map((url, index) => (
              <div key={index} className="flex items-center space-x-4">
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex-1 truncate"
                >
                  {url}
                </a>
                <button
                  onClick={async () => {
                    const result = await testUrl(url);
                    console.log('Teste da URL:', result);
                    alert(JSON.stringify(result, null, 2));
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                >
                  Testar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}