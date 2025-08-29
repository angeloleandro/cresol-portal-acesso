/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração balanceada - remove complexidades problemáticas mas mantém essenciais
  
  // Otimizações básicas essenciais
  swcMinify: true,  // SWC é necessário para hidratação correta
  compress: true,   // Compressão básica
  poweredByHeader: false,
  
  // Configuração de imagens otimizada para Vercel e Supabase
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'taodkzafqgoparihaljx.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/vi/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    // Cache otimizado para reduzir requisições ao Supabase
    minimumCacheTTL: 600, // 10 minutos de cache mínimo (aumentado para reduzir timeouts)
    // Permite SVG para fallbacks e placeholders
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configurações de timeout e qualidade
    unoptimized: false, // Mantém otimização ativa
  },
  
  // Experimental - apenas otimizações seguras
  experimental: {
    scrollRestoration: true,
    optimizePackageImports: [
      '@chakra-ui/react',
      '@supabase/supabase-js'
    ]
  },
  
  // Headers otimizados para performance e conectividade
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Preconnect ao Supabase para reduzir latência
          {
            key: 'Link',
            value: '<https://taodkzafqgoparihaljx.supabase.co>; rel=preconnect; crossorigin'
          }
        ]
      },
      // Cache otimizado para recursos estáticos
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400'
          }
        ]
      },
      // Cache para imagens otimizadas pelo Next.js
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, immutable' // 30 dias para imagens otimizadas
          },
          {
            key: 'Retry-After',
            value: '300' // 5 minutos em caso de falha
          }
        ]
      }
    ]
  },
  
  // Compilação básica sem removeConsole (causa problemas de hidratação)
  compiler: {
    // removeConsole desabilitado - pode interferir na hidratação
  }
};

export default nextConfig;