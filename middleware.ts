import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { isUserAdmin } from '@/lib/auth';

// Guardar nome dos cookies em variáveis
const AUTH_COOKIE_PREFIX = 'sb-';

export async function middleware(request: NextRequest) {
  try {
    // Atualizar a sessão Supabase (refresh tokens se necessário)
    const { supabase, response } = updateSession(request);
    
    // Verificar a sessão do usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Verificar se a solicitação é para uma rota de administração
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isApiAdminRoute = request.nextUrl.pathname.startsWith('/api/admin');
    
    if (!user) {
      if (isAdminRoute || isApiAdminRoute) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
        redirectUrl.searchParams.set('auth', 'failed');
        return NextResponse.redirect(redirectUrl);
      }
    } else {
      // Se estiver tentando acessar a página de login, redirecionar para o dashboard
      if (request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // Verificar se o usuário tem permissões para acesso a áreas administrativas
      if ((isAdminRoute || isApiAdminRoute)) {
        const isAdmin = await isUserAdmin(user.id);
        
        if (!isAdmin) {
          // Redirecionar para o dashboard se tentar acessar área de admin sem permissões
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }
    
    // Retornar a resposta com cookies atualizados
    return response;
  } catch (error) {
    // Em caso de erro, permitir acesso às páginas públicas e redirecionar para login em rotas protegidas
    if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Criar uma resposta padrão em caso de erro
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

// Definir as rotas que o middleware deve processar
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/dashboard/:path*',
    '/login'
  ],
}; 