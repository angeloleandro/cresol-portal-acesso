import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { 
  getOptimizedUserAuth, 
  hasAdminAccess, 
  hasSectorAdminAccess, 
  extractAccessToken,
  getRouteType 
} from './lib/middleware-auth';

export async function middleware(request: NextRequest) {
  try {
    // Atualizar a sessão Supabase (refresh tokens se necessário)
    const { supabase, response } = updateSession(request);
    
    // Determinar tipo de rota para otimizar verificações
    const routeType = getRouteType(request.nextUrl.pathname);
    
    // Se for API admin (não pública), deixar a API lidar com autenticação
    if (routeType.isApiAdmin) {
      return response;
    }
    
    // Se não requer autenticação, prosseguir
    if (!routeType.requiresAuth) {
      return response;
    }
    
    // Para rotas que requerem auth, fazer verificação otimizada
  const accessToken = extractAccessToken(request) || undefined;
  const authResult = await getOptimizedUserAuth(supabase, accessToken);
    
    if (!authResult.user) {
      // Não autenticado - redirecionar para login se acessando área restrita
      if (routeType.isAdmin || routeType.isSectorAdmin) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
        redirectUrl.searchParams.set('auth', 'failed');
        return NextResponse.redirect(redirectUrl);
      }
      return response;
    }
    
    // Usuário autenticado
    const user = authResult.user;
    
    // Se tentando acessar login, redirecionar para home
    if (request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    
    // Verificar permissões para rotas admin
    if (routeType.isAdmin) {
      if (!hasAdminAccess(user.role)) {
        // Se é sector_admin tentando acessar admin geral, redirecionar
        if (hasSectorAdminAccess(user.role)) {
          return NextResponse.redirect(new URL('/admin-setor', request.url));
        }
        // Senão, não tem permissão - redirecionar para home
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }
    
    // Verificar permissões para rotas sector_admin
    if (routeType.isSectorAdmin && !hasSectorAdminAccess(user.role)) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    
    // Log cache hit/miss para debugging em desenvolvimento
    if (process.env.NODE_ENV === 'development' && authResult.fromCache) {
      console.log(`🚀 Middleware cache HIT para usuário ${user.id}`);
    }
    
    return response;
    
  } catch (error) {
    // Log apenas erros críticos em produção
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Erro no middleware:', error);
    }
    
    // Se ocorrer erro em rotas admin, redirecionar para login
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('error', 'middleware_error');
      return NextResponse.redirect(redirectUrl);
    }
    
    // Para outras rotas, continuar
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)'],
}; 