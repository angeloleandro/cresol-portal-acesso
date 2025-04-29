import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="card max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-40 h-20 mb-4">
            <Image 
              src="/logo-cresol.png" 
              alt="Logo Cresol" 
              fill
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Portal de Acesso</h1>
          <p className="text-gray-600 text-center mt-2">
            Acesse os sistemas de informação empresarial da Cresol
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/login" 
            className="btn-primary w-full flex justify-center"
          >
            Entrar
          </Link>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Novo usuário?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Solicitar acesso
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}