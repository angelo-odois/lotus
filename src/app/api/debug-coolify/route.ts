import { NextRequest, NextResponse } from 'next/server';
import { detectHTTPSEnvironment, getCookieName } from '@/lib/environment';

export async function GET(request: NextRequest) {
  try {
    const isHTTPS = detectHTTPSEnvironment(request);
    const cookieName = getCookieName(request);
    
    // Coletar informações do ambiente
    const debugInfo = {
      // Request info
      protocol: request.nextUrl.protocol,
      hostname: request.nextUrl.hostname,
      port: request.nextUrl.port,
      origin: request.nextUrl.origin,
      href: request.nextUrl.href,
      
      // Headers
      headers: {
        host: request.headers.get('host'),
        'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
        'x-forwarded-host': request.headers.get('x-forwarded-host'),
        'x-forwarded-for': request.headers.get('x-forwarded-for'),
        'user-agent': request.headers.get('user-agent'),
        'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
      },
      
      // Environment variables
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        COOLIFY_DOMAIN: process.env.COOLIFY_DOMAIN,
        VERCEL_URL: process.env.VERCEL_URL,
        PORT: process.env.PORT,
        HOSTNAME: process.env.HOSTNAME,
      },
      
      // Computed values
      computed: {
        isHTTPS,
        cookieName,
        shouldUseSecureCookies: isHTTPS,
      },
      
      // Cookies atuais
      currentCookies: {
        session: request.cookies.get('session')?.value ? 'EXISTS' : 'NOT_FOUND',
        '__Host-session': request.cookies.get('__Host-session')?.value ? 'EXISTS' : 'NOT_FOUND',
        'XSRF-TOKEN': request.cookies.get('XSRF-TOKEN')?.value ? 'EXISTS' : 'NOT_FOUND',
      },
      
      // IP detection
      ipDetection: {
        hostname: request.nextUrl.hostname,
        isLocalhost: request.nextUrl.hostname === 'localhost',
        is127: request.nextUrl.hostname === '127.0.0.1',
        isPrivateIP: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(request.nextUrl.hostname),
        matchesCoolifyDomain: request.nextUrl.hostname === process.env.COOLIFY_DOMAIN,
      }
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      debug: debugInfo,
      message: 'Debug info coletada com sucesso'
    });

  } catch (error) {
    console.error('Debug route error:', error);
    return NextResponse.json(
      { error: 'Erro ao coletar informações de debug', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}