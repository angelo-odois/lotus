import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, shouldRefreshToken, createJWT, createSecureCookie } from '@/lib/auth';
import { findUserByEmail } from '@/lib/queries';

const protectedRoutes = ['/admin', '/proposals'];
const authRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  
  console.log('🚀 Middleware executing for:', pathname);

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // CSP for admin pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/proposals') || pathname.startsWith('/login')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"
    );
  }

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute || isAuthRoute) {
    const user = await getUserFromMiddleware(request);
    
    if (isProtectedRoute && !user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL('/proposals', request.url));
    }

    // Token refresh
    if (user && isProtectedRoute) {
      const token = request.cookies.get(process.env.NODE_ENV === 'production' ? '__Host-session' : 'session')?.value;
      if (token && shouldRefreshToken(token)) {
        const newToken = createJWT(user.id);
        response.headers.set('Set-Cookie', createSecureCookie(newToken));
      }
    }
  }

  return response;
}

async function getUserFromMiddleware(request: NextRequest) {
  try {
    const cookieName = process.env.NODE_ENV === 'production' ? '__Host-session' : 'session';
    const token = request.cookies.get(cookieName)?.value;
    
    console.log('🔍 Middleware debug:', {
      cookieName,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
    });
    
    if (!token) return null;

    const payload = verifyJWT(token);
    console.log('🔍 JWT payload:', payload ? { sub: payload.sub, exp: payload.exp } : 'invalid');
    
    if (!payload) return null;

    return { id: payload.sub };
  } catch (error) {
    console.log('🔍 Middleware error:', error);
    return null;
  }
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|public).*)',
  ],
};