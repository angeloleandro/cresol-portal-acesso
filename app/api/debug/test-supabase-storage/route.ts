import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const tests = {
      supabaseConnection: false,
      storageAccess: false,
      bucketExists: false,
      imageUrlTest: null as string | null,
      errors: [] as string[]
    };

    // Teste 1: Conexão básica com Supabase
    try {
      const { data, error } = await supabase.from('banners').select('count(*)').limit(1);
      if (error) {
        tests.errors.push(`Conexão Supabase: ${error.message}`);
      } else {
        tests.supabaseConnection = true;
      }
    } catch (err) {
      tests.errors.push(`Erro de conexão: ${err}`);
    }

    // Teste 2: Verificar se bucket images existe
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        tests.errors.push(`Lista buckets: ${error.message}`);
      } else {
        const imagesBucket = buckets?.find(bucket => bucket.name === 'images');
        if (imagesBucket) {
          tests.bucketExists = true;
          
          // Teste 3: Listar arquivos no bucket
          const { data: files, error: filesError } = await supabase.storage
            .from('images')
            .list('', { limit: 1 });
            
          if (filesError) {
            tests.errors.push(`Lista arquivos: ${filesError.message}`);
          } else {
            tests.storageAccess = true;
            
            if (files && files.length > 0) {
              // Teste 4: Gerar URL pública de um arquivo
              const { data } = supabase.storage
                .from('images')
                .getPublicUrl(files[0].name);
                
              tests.imageUrlTest = data.publicUrl;
            }
          }
        } else {
          tests.errors.push('Bucket "images" não encontrado');
        }
      }
    } catch (err) {
      tests.errors.push(`Erro no storage: ${err}`);
    }

    // Informações do ambiente
    const environment = {
      nodeEnv: process.env.NODE_ENV,
      isVercel: process.env.VERCEL === '1',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    };

    return NextResponse.json({
      tests,
      environment,
      timestamp: new Date().toISOString(),
      recommendations: [
        tests.supabaseConnection ? '✅ Conexão Supabase OK' : '❌ Verificar environment variables',
        tests.bucketExists ? '✅ Bucket images existe' : '❌ Criar bucket images no Supabase',
        tests.storageAccess ? '✅ Acesso ao storage OK' : '❌ Verificar políticas RLS',
        tests.imageUrlTest ? '✅ URLs públicas funcionando' : '❌ Verificar configuração do bucket'
      ]
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
