import Link from 'next/link';
import OptimizedImage from '@/app/components/OptimizedImage';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header simples */}
      <header className="bg-white border-b" style={{ borderColor: 'var(--color-gray-light)' }}>
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/home" className="flex items-center">
              <div className="relative h-10 w-24 mr-3">
                <OptimizedImage 
                  src="/logo-horizontal-laranja.svg" 
                  alt="Logo Cresol" 
                  fill
                  sizes="(max-width: 768px) 100vw, 96px"
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl font-medium text-title">Portal Cresol</h1>
            </Link>
          </div>
          
          <Link 
            href="/documentos" 
            className="inline-flex items-center text-sm text-muted hover:text-primary transition-colors"
          >
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para Documentos
          </Link>
        </div>
      </header>

      {/* Conteúdo 404 */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          <h1 className="heading-1 mb-4">Documento não encontrado</h1>
          <p className="body-text text-muted mb-8 max-w-md mx-auto">
            O documento que você está procurando não existe ou foi removido.
          </p>
          
          <div className="space-y-3">
            <Link href="/documentos" className="btn-primary block">
              Ver todos os documentos
            </Link>
            <Link href="/home" className="btn-outline block">
              Voltar para o início
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}