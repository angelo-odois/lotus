import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const cookieName = process.env.NODE_ENV === 'production' ? '__Host-session' : 'session';
    const token = request.cookies.get(cookieName)?.value;
    
    console.log('🔧 Debug auth:', {
      cookieName,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      allCookies: Object.fromEntries(request.cookies.entries())
    });
    
    const user = await getUserFromRequest(request);
    
    return NextResponse.json({
      hasToken: !!token,
      hasUser: !!user,
      cookieName,
      allCookies: Object.fromEntries(request.cookies.entries())
    });
  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}