/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security Headers para produção
  async headers() {
    return [
      {
        // Aplicar headers de segurança a todas as rotas
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Enable XSS filtering
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // HSTS - Force HTTPS (apenas em produção)
          ...(process.env.NODE_ENV === 'production' 
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]
            : []
          ),
          // Content Security Policy (CSP)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://api.github.com",
              "media-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "frame-src 'self' https://www.youtube.com",
              "worker-src 'self' blob:",
            ].join('; '),
          },
          // Permission Policy
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'interest-cohort=()',
            ].join(', '),
          },
        ],
      },
    ];
  },

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
    // Formatos suportados (AVIF + WebP para máxima compressão na Vercel)
    formats: ['image/avif', 'image/webp'],
    // Cache TTL otimizado (31 dias conforme recomendação Vercel)
    minimumCacheTTL: 2678400, // 31 dias
    // SVG permitido com CSP seguro
    dangerouslyAllowSVG: true,
    // CSP para SVGs específico
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Manter otimização ativa (recomendado)
    unoptimized: false,
  },

  // Configurações de performance
  swcMinify: true,
  compress: true,
  
  // PoweredByHeader removido por segurança
  poweredByHeader: false,

  // Configurações experimentais removidas (não necessárias)
};

module.exports = nextConfig;