'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface VercelImageTestProps {
  testUrl: string;
  title: string;
}

export default function VercelImageTest({ testUrl, title }: VercelImageTestProps) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleImageLoad = () => {
    setImageStatus('success');
  };

  const handleImageError = (error: any) => {
    setImageStatus('error');
    setErrorMessage(error?.message || 'Falha ao carregar imagem');
  };

  // Detectar se está rodando na Vercel
  const isVercel = process.env.VERCEL === '1';
  const environment = process.env.NODE_ENV;

  useEffect(() => {
    // Resetar status quando URL muda
    setImageStatus('loading');
    setErrorMessage('');
  }, [testUrl]);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-sm">{title}</h3>
        <div className="flex gap-2">
          <span className={`px-2 py-1 text-xs rounded ${
            isVercel ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {isVercel ? 'Vercel' : 'Local'}
          </span>
          <span className={`px-2 py-1 text-xs rounded ${
            environment === 'production' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {environment}
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-600 break-all bg-gray-50 p-2 rounded">
        {testUrl}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-24 h-16 bg-gray-100 rounded overflow-hidden">
          {testUrl && (
            <Image
              src={testUrl}
              alt={title}
              fill
              className="object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes="96px"
              quality={75}
            />
          )}
        </div>

        <div className="flex-1">
          <div className={`flex items-center gap-2 ${
            imageStatus === 'success' ? 'text-green-600' : 
            imageStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {imageStatus === 'loading' && (
              <>
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Carregando...</span>
              </>
            )}
            {imageStatus === 'success' && (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Carregada com sucesso</span>
              </>
            )}
            {imageStatus === 'error' && (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Erro ao carregar</span>
              </>
            )}
          </div>
          {errorMessage && (
            <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
          )}
        </div>
      </div>

      {/* Informações técnicas */}
      <details className="text-xs">
        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
          Informações técnicas
        </summary>
        <div className="mt-2 space-y-1 text-gray-500">
          <div>Environment: {environment}</div>
          <div>Vercel: {isVercel ? 'Sim' : 'Não'}</div>
          <div>URL Supabase: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não configurada'}</div>
          <div>Status da imagem: {imageStatus}</div>
        </div>
      </details>
    </div>
  );
}
