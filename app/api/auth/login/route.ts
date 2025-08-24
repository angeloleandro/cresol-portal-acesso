import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';


// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic';

/**
 * POST function
 * @todo Add proper documentation
 */
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({
      error: 'Email e senha são obrigatórios.'
    }, { status: 400 });
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {

      // Mensagem de erro mais amigável
      let errorMessage = 'Falha na autenticação';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'O email ainda não foi confirmado.';
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }
    
    // Buscar informações adicionais do perfil
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single();

    if (profileError) {

    }

    const loginResult = {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profileData?.role || 'user',
        full_name: profileData?.full_name || data.user.user_metadata?.full_name || '',
      }
    };

    return NextResponse.json(loginResult);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({
      error: 'Falha no serviço de autenticação.',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
} 