import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/queries';
import { verifyPassword, createJWT, createSecureCookie, generateCSRFToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimiter';
import { loginSchema } from '@/lib/validation';
import { audit, getClientIP, getUserAgent } from '@/lib/audit';
import { getCookieName, detectHTTPSEnvironment } from '@/lib/environment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const clientIP = getClientIP(request);
    const userAgent = getUserAgent(request);
    
    // Validate input
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const { email, password, csrfToken } = parsed.data;

    // CSRF validation
    const csrfCookie = request.cookies.get('XSRF-TOKEN')?.value;
    if (!csrfCookie || csrfCookie !== csrfToken) {
      audit('csrf_violation', { email, ip: clientIP, userAgent });
      return NextResponse.json(
        { error: 'Token CSRF inválido', code: 'CSRF_ERROR' },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateLimitKey = `${clientIP}:${email}`;
    const rateLimit = checkRateLimit(rateLimitKey);
    
    if (!rateLimit.allowed) {
      audit('login_rate_limited', { email, ip: clientIP, userAgent, retryAfter: rateLimit.retryAfter });
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente mais tarde.', code: 'RATE_LIMITED' },
        { 
          status: 429,
          headers: { 'Retry-After': rateLimit.retryAfter?.toString() || '900' }
        }
      );
    }

    // Find user
    const user = await findUserByEmail(email);

    if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) {
      audit('login_failed', { email, ip: clientIP, userAgent });
      return NextResponse.json(
        { error: 'Credenciais inválidas', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    // Success
    const token = createJWT(user.id);
    const newCSRFToken = generateCSRFToken();
    
    audit('login_success', { userId: user.id, email, ip: clientIP, userAgent });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      }
    });

    // Set session cookie using NextResponse cookies API
    const isHTTPS = detectHTTPSEnvironment(request);
    const cookieName = getCookieName(request);
    
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: isHTTPS,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    // Set CSRF token cookie
    response.cookies.set('XSRF-TOKEN', newCSRFToken, {
      httpOnly: false,
      secure: isHTTPS,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const csrfToken = generateCSRFToken();
  const isHTTPS = detectHTTPSEnvironment(request);
  
  const response = NextResponse.json({ csrfToken });
  response.cookies.set('XSRF-TOKEN', csrfToken, {
    httpOnly: false,
    secure: isHTTPS,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60
  });

  return response;
}