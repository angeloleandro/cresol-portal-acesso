import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ChakraUIProvider } from './providers/ChakraProvider'
import { NextUIProviderWrapper } from './providers/NextUIProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Portal de Acesso Cresol',
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

export function generateViewport() {
  return {
    themeColor: '#F58220',
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
      <body className={inter.className}>
        <NextUIProviderWrapper>
          <ChakraUIProvider>
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
          </ChakraUIProvider>
        </NextUIProviderWrapper>
      </body>
    </html>
  )
}