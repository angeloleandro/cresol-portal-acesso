/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Configuração de padrões remotos (recomendado pela Vercel)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cresol.com.br',
      },
      {
        protocol: 'https',
        hostname: 'taodkzafqgoparihaljx.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
    // Configuração específica para Vercel
    loader: 'default',
    // Tamanhos otimizados para dispositivos comuns
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Formatos suportados (WebP e AVIF automáticos na Vercel)
    formats: ['image/webp'],
    // Cache TTL otimizado (31 dias conforme recomendação Vercel)
    minimumCacheTTL: 2678400, // 31 dias
    // Qualidades permitidas para otimização  
    dangerouslyAllowSVG: true,
    // CORREÇÃO: Remover contentDispositionType e CSP restritivo para SVGs funcionarem
    // contentDispositionType: 'attachment', // Causava download em vez de exibição
    // contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // CSP muito restritivo
    // Manter otimização ativa (recomendado)
    unoptimized: false,
  },
  // Configurações de performance
  swcMinify: true,
  // Configurações experimentais removidas (não necessárias)
};

module.exports = nextConfig;