import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

// Guardar nome dos cookies em variáveis
const AUTH_COOKIE_PREFIX = 'sb-';

export async function middleware(request: NextRequest) {
  try {
    // Atualizar a sessão Supabase (refresh tokens se necessário)
    const { supabase, response } = updateSession(request);
    
    // Verificar a sessão do usuário de forma mais robusta
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    const session = sessionData?.session;
    const user = session?.user;
    
    // Verificar se a solicitação é para uma rota de administração
    const isSectorAdminRoute = request.nextUrl.pathname.startsWith('/admin-setor');
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') && !isSectorAdminRoute;
    const isApiAdminRoute = request.nextUrl.pathname.startsWith('/api/admin');
    
    // APIs públicas para usuários autenticados (apenas GET)
    const publicApiRoutes = [
      '/api/admin/economic-indicators',
      '/api/admin/system-links'
    ];
    const isPublicApiGetRequest = publicApiRoutes.some(route => 
      request.nextUrl.pathname === route && request.method === 'GET'
    );
    
    if (!user) {
      // Se não estiver autenticado e tentar acessar área restrita
      if (isAdminRoute || (isApiAdminRoute && !isPublicApiGetRequest) || isSectorAdminRoute) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
        redirectUrl.searchParams.set('auth', 'failed');
        return NextResponse.redirect(redirectUrl);
      }
    } else {
      // Se estiver tentando acessar a página de login, redirecionar para o home
      if (request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/home', request.url));
      }
      
      // Se o usuário estiver autenticado, verificar seu papel
      if (isAdminRoute || (isApiAdminRoute && !isPublicApiGetRequest)) {
        // Buscar o perfil diretamente do banco usando o ID do usuário autenticado
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        const isAdmin = profileData?.role === 'admin';
        
        if (!isAdmin) {
          // Se tentar acessar área de admin sem ser admin, verificar se é admin de setor
          const isSectorAdmin = profileData?.role === 'sector_admin';
          
          if (isSectorAdmin && isAdminRoute) {
            // Se for admin de setor e tentar acessar o painel admin geral, redirecionar para o painel admin setorial
            return NextResponse.redirect(new URL('/admin-setor', request.url));
          } else if (!isSectorAdmin) {
            // Se não for nem admin nem admin de setor, redirecionar para o home
            return NextResponse.redirect(new URL('/home', request.url));
          }
        }
      } else if (isSectorAdminRoute) {
        // Verificar se o usuário tem permissão para acessar o painel de admin setorial
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        const role = profileData?.role;
        
        // Se não for admin de setor nem admin geral, redirecionar para o home
        if (role !== 'sector_admin' && role !== 'admin') {
          return NextResponse.redirect(new URL('/home', request.url));
        }
      }
    }
    
    // Retornar a resposta com cookies atualizados
    return response;
  } catch (error) {
    // Log apenas erros críticos em produção
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro no middleware:', error);
    }
    
    // Se ocorrer um erro, redirecionar para a página de login com mensagem de erro
    if (request.nextUrl.pathname.startsWith('/admin') || 
        (request.nextUrl.pathname.startsWith('/api/admin') && !request.nextUrl.pathname.match(/\/(economic-indicators|system-links)$/)) || 
        request.nextUrl.pathname.startsWith('/admin-setor')) {
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