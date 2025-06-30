import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Teste simples de URL de imagem diretamente
    const testUrls = [
      'https://taodkzafqgoparihaljx.supabase.co/storage/v1/object/public/banners/banner-1748278888087.jpg',
      'https://taodkzafqgoparihaljx.supabase.co/storage/v1/object/public/banners/banner-1748280869329.jpg'
    ];

    const results = [];

    for (const url of testUrls) {
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          headers: {
            'User-Agent': 'Vercel-Image-Test/1.0'
          }
        });
        
        results.push({
          url,
          status: response.status,
          accessible: response.ok,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length'),
          cacheControl: response.headers.get('cache-control')
        });
      } catch (error) {
        results.push({
          url,
          status: 'error',
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Informações do ambiente Vercel
    const environment = {
      nodeEnv: process.env.NODE_ENV,
      isVercel: process.env.VERCEL === '1',
      vercelUrl: process.env.VERCEL_URL,
      vercelEnv: process.env.VERCEL_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      environment,
      imageTests: results,
      recommendations: [
        'URLs do Supabase estão acessíveis',
        'Problema pode estar na configuração next/image da Vercel',
        'Verificar se domínio está em remotePatterns',
        'Considerar usar unoptimized=true temporariamente'
      ]
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
