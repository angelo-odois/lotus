import { NextRequest, NextResponse } from 'next/server';
import { clearSecureCookie } from '@/lib/auth';
import { getCookieName, detectHTTPSEnvironment } from '@/lib/environment';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    const isHTTPS = detectHTTPSEnvironment(request);
    const cookieName = getCookieName(request);
    
    // Clear session cookie
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      secure: isHTTPS,
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    });

    // Clear CSRF token cookie
    response.cookies.set('XSRF-TOKEN', '', {
      httpOnly: false,
      secure: isHTTPS,
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}