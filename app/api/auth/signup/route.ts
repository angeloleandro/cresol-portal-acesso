import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { email, password, fullName, position, workLocationId } = await request.json();

  // Log para depuração
  console.log('API /api/auth/signup chamada com:', { email, fullName, position, workLocationId });

  if (!email || !fullName || !password) {
    return NextResponse.json({
      error: 'Dados insuficientes. Email, nome completo e senha são obrigatórios.'
    }, { status: 400 });
  }

  // Validar domínio de e-mail da Cresol
  if (!email.endsWith('@cresol.com.br')) {
    return NextResponse.json({
      error: 'Por favor, utilize um e-mail corporativo da Cresol.'
    }, { status: 400 });
  }

  let supabaseAdminClient: SupabaseClient;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      console.error('Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.');
      throw new Error('Configuração do servidor incompleta.');
    }
    
    supabaseAdminClient = createClient(supabaseUrl, serviceKey, { 
      auth: { persistSession: false } 
    });
  } catch (e) {
    console.error('Falha ao inicializar Supabase Admin Client:', e);
    return NextResponse.json({ 
      error: 'Erro na configuração do servidor.' 
    }, { status: 500 });
  }

  try {
    // 1. Verificar se o email já existe
    const { data: existingProfile } = await supabaseAdminClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (existingProfile) {
      return NextResponse.json({ 
        error: 'Este e-mail já está cadastrado no sistema.' 
      }, { status: 409 });
    }

    // 2. Criar um pedido de acesso para aprovação por administrador
    const { data: accessRequestData, error: accessRequestError } = await supabaseAdminClient
      .from('access_requests')
      .insert({
        email: email,
        full_name: fullName,
        position: position || null,
        work_location_id: workLocationId || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (accessRequestError) {
      console.error('Erro ao criar solicitação de acesso:', accessRequestError);
      return NextResponse.json({
        error: `Falha ao registrar solicitação de acesso: ${accessRequestError.message}`
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitação de acesso enviada com sucesso! Um administrador irá analisar seu cadastro.'
    });

  } catch (error: any) {
    console.error('Erro geral na API de signup:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 });
  }
} 