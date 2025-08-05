import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/auth';
import { validateCrescolEmail } from '@/lib/constants';

export async function POST(request: NextRequest) {
  const { email, password, fullName, position, workLocationId } = await request.json();


  if (!email || !fullName || !password) {
    return NextResponse.json({
      error: 'Dados insuficientes. Email, nome completo e senha são obrigatórios.'
    }, { status: 400 });
  }

  // Validar domínio de e-mail da Cresol
  if (!validateCrescolEmail(email)) {
    return NextResponse.json({
      error: 'Por favor, utilize um e-mail corporativo da Cresol.'
    }, { status: 400 });
  }

  let supabaseAdminClient: SupabaseClient;
  try {
    supabaseAdminClient = createAdminSupabaseClient();
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
    // Primeiro tentar com password_hash, se falhar tentar sem (compatibilidade com migração)
    let accessRequestData, accessRequestError;
    
    // Tentar inserir com password_hash (após migração aplicada)
    const resultWithPassword = await supabaseAdminClient
      .from('access_requests')
      .insert({
        email: email,
        full_name: fullName,
        position: position || null,
        work_location_id: workLocationId || null,
        password_hash: password,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    accessRequestData = resultWithPassword.data;
    accessRequestError = resultWithPassword.error;
    
    // Se falhar devido ao campo password_hash não existir, tentar sem ele
    if (accessRequestError && (
      accessRequestError.message?.includes('password_hash') || 
      accessRequestError.message?.includes('schema cache') ||
      accessRequestError.code === '42703'
    )) {
      
      const fallbackResult = await supabaseAdminClient
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
      
      accessRequestData = fallbackResult.data;
      accessRequestError = fallbackResult.error;
    } else if (!accessRequestError) {
    }

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