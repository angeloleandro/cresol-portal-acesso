import { createHash } from 'crypto';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações de Performance
  swcMinify: true, // Minificação mais rápida com SWC
  compress: true, // Compressão gzip automática
  poweredByHeader: false, // Remove header desnecessário
  
  // Otimizações de Build
  productionBrowserSourceMaps: false, // Desativa source maps em produção
  optimizeFonts: true, // Otimização automática de fontes
  
  // Configuração de Imagens
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
      },
      {
        protocol: 'https',
        hostname: 'www.youtube.com',
        port: '',
        pathname: '/img/**',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias de cache
  },
  
  // Headers de Segurança e Cache
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      {
        // Cache para assets estáticos
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        // Cache para imagens
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
  
  // Configuração Experimental para Performance
  experimental: {
    optimizeCss: false, // Desabilitado temporariamente até resolver critters
    scrollRestoration: true, // Restauração de scroll
    optimizePackageImports: [
      '@chakra-ui/react',
      '@nextui-org/react',
      '@supabase/supabase-js',
      'framer-motion',
      'date-fns'
    ]
  },
  
  // Configuração de Compilação
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // Configuração de Webpack
  webpack: (config, { isServer }) => {
    // Otimizações de bundle
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true
            },
            lib: {
              test(module) {
                return module.size() > 160000 &&
                  /node_modules[/\\]/.test(module.identifier());
              },
              name() {
                const hash = createHash('sha1');
                hash.update(Math.random().toString());
                return hash.digest('hex').substring(0, 8);
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20
            },
            shared: {
              name(_module, chunks) {
                return createHash('sha1')
                  .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
                  .digest('hex') + (isServer ? '-server' : '-client');
              },
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true
            }
          },
          maxAsyncRequests: 25,
          maxInitialRequests: 25
        }
      };
    }
    
    return config;
  }
};

export default nextConfig;