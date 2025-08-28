import { Inter } from 'next/font/google'

import { CRESOL_COLORS as COLORS } from '@/lib/design-tokens'

import { AuthProvider } from './providers/AuthProvider'
import { ChakraUIProvider } from './providers/ChakraProvider'
import { ConditionalProviders } from './providers/ConditionalProviders'
import QueryProvider from '@/lib/react-query/query-provider'

import type { Metadata } from 'next'

import './globals.css'


const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Critical for font optimization
  preload: true,
  fallback: ['system-ui', 'arial'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'HUB - Cresol Fronteiras PR/SC/SP/ES',
  description: 'Portal de acesso para sistema de informação empresarial interna da Cresol',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
      },
      {
        url: '/favicon-simple.svg',
        type: 'image/svg+xml',
        sizes: '32x32',
      },
    ],
    apple: {
      url: '/apple-touch-icon.svg',
      type: 'image/svg+xml',
      sizes: '180x180',
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cresol Portal',
  },
  formatDetection: {
    telephone: false,
  },
}

/**
 * generateViewport function
 * @todo Add proper documentation
 */
export function generateViewport() {
  return {
    themeColor: COLORS.primary.DEFAULT,
    colorScheme: 'light',
    width: 'device-width',
    initialScale: 1,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link 
          rel="preconnect" 
          href="https://fonts.googleapis.com" 
        />
        <link 
          rel="preconnect" 
          href="https://fonts.gstatic.com" 
          crossOrigin="anonymous" 
        />
        <link 
          rel="preload" 
          href="/_next/static/css/app/layout.css" 
          as="style"
        />
      </head>
      <body className={`${inter.className} ${inter.variable}`}>
        <AuthProvider>
          <QueryProvider>
            <ChakraUIProvider>
              <ConditionalProviders>
                <main className="min-h-screen bg-gray-50">
                  {children}
                </main>
              </ConditionalProviders>
            </ChakraUIProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}