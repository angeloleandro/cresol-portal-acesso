/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração balanceada - remove complexidades problemáticas mas mantém essenciais
  
  // Otimizações básicas essenciais
  swcMinify: true,  // SWC é necessário para hidratação correta
  compress: true,   // Compressão básica
  poweredByHeader: false,
  
  // Configuração de imagens completa
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
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  
  // Experimental - apenas otimizações seguras
  experimental: {
    scrollRestoration: true,
    optimizePackageImports: [
      '@chakra-ui/react',
      '@supabase/supabase-js'
    ]
  },
  
  // Headers para Google Fonts
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