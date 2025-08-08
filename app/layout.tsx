import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ChakraUIProvider } from './providers/ChakraProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Portal de Acesso Cresol',
  description: 'Portal de acesso para sistema de informação empresarial interna da Cresol',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ChakraUIProvider>
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </ChakraUIProvider>
      </body>
    </html>
  )
}