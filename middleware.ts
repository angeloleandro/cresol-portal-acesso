import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { isUserAdmin } from '@/lib/auth';

// Guardar nome dos cookies em variáveis
const AUTH_COOKIE_PREFIX = 'sb-';

export async function middleware(request: NextRequest) {
  try {
    console.log(`[Middleware] Início - URL: ${request.nextUrl.pathname}`);
    
    // Atualizar a sessão Supabase (refresh tokens se necessário)
    const { supabase, response } = updateSession(request);
    
    // Verificar a sessão do usuário de forma mais robusta
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.log(`[Middleware] Erro ao obter sessão: ${sessionError.message}`);
    }
    
    const session = sessionData?.session;
    const user = session?.user;
    
    console.log(`[Middleware] Usuário: ${user ? user.email : 'não autenticado'}`);
    console.log(`[Middleware] Sessão válida: ${!!session}`);
    
    // Verificar se a solicitação é para uma rota de administração
    // IMPORTANTE: Verificar admin-setor ANTES de admin para evitar conflitos
    const isSectorAdminRoute = request.nextUrl.pathname.startsWith('/admin-setor');
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') && !isSectorAdminRoute;
    const isApiAdminRoute = request.nextUrl.pathname.startsWith('/api/admin');
    
    console.log(`[Middleware] Rota: ${isSectorAdminRoute ? 'admin-setor' : (isAdminRoute ? 'admin' : 'outra')}`);
    
    if (!user) {
      console.log('[Middleware] Usuário não autenticado');
      // Se não estiver autenticado e tentar acessar área restrita
      if (isAdminRoute || isApiAdminRoute || isSectorAdminRoute) {
        console.log('[Middleware] Redirecionando para login (não autenticado)');
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
        redirectUrl.searchParams.set('auth', 'failed');
        return NextResponse.redirect(redirectUrl);
      }
    } else {
      // Se estiver tentando acessar a página de login, redirecionar para o home
      if (request.nextUrl.pathname === '/login') {
        console.log('[Middleware] Redirecionando para home (usuário já autenticado)');
        return NextResponse.redirect(new URL('/home', request.url));
      }
      
      // Se o usuário estiver autenticado, verificar seu papel
      if (isAdminRoute || isApiAdminRoute) {
        // Verificar se o usuário tem permissões para acesso a áreas administrativas
        console.log('[Middleware] Verificando permissões para área administrativa');
        
        // Buscar o perfil diretamente do banco usando o ID do usuário autenticado
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.log(`[Middleware] Erro ao buscar perfil: ${profileError.message}`);
        }
        
        const isAdmin = profileData?.role === 'admin';
        console.log(`[Middleware] É admin geral? ${isAdmin}`);
        
        if (!isAdmin) {
          // Se tentar acessar área de admin sem ser admin, verificar se é admin de setor
          const isSectorAdmin = profileData?.role === 'sector_admin';
          console.log(`[Middleware] É admin de setor? ${isSectorAdmin}`);
          
          if (isSectorAdmin) {
            // Se for admin de setor e tentar acessar o painel admin geral, redirecionar para o painel admin setorial
            console.log('[Middleware] Redirecionando admin de setor para /admin-setor');
            return NextResponse.redirect(new URL('/admin-setor', request.url));
          } else {
                    // Se não for nem admin nem admin de setor, redirecionar para o home
        console.log('[Middleware] Redirecionando para home (usuário sem permissões)');
        return NextResponse.redirect(new URL('/home', request.url));
          }
        } else {
          console.log('[Middleware] Usuário admin acessando área administrativa - permitido');
        }
      } else if (isSectorAdminRoute) {
        // Verificar se o usuário tem permissão para acessar o painel de admin setorial
        console.log('[Middleware] Verificando permissões para área de admin setorial');
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.log(`[Middleware] Erro ao buscar perfil: ${profileError.message}`);
        }
        
        const role = profileData?.role;
        console.log(`[Middleware] Papel do usuário para admin-setor: ${role || 'desconhecido'}`);
        
        // Se não for admin de setor nem admin geral, redirecionar para o home
        if (role !== 'sector_admin' && role !== 'admin') {
          console.log('[Middleware] Redirecionando para home (não é admin de setor nem admin geral)');
          return NextResponse.redirect(new URL('/home', request.url));
        } else {
          console.log('[Middleware] Usuário tem permissão para acessar admin-setor');
        }
      } else {
        console.log('[Middleware] Rota comum, acesso permitido');
      }
    }
    
    console.log('[Middleware] Final - Sem redirecionamento');
    // Retornar a resposta com cookies atualizados
    return response;
  } catch (error) {
    console.error('Erro no middleware:', error);
    
    // Se ocorrer um erro, redirecionar para a página de login com mensagem de erro
    if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin') || request.nextUrl.pathname.startsWith('/admin-setor')) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('error', 'middleware_error');
      return NextResponse.redirect(redirectUrl);
    }
    
    // Para outras rotas, apenas continuar
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 