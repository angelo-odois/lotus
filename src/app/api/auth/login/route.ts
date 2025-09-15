import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, createAuthToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!validateCredentials(username, password)) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }
    
    const token = createAuthToken(username);
    
    const response = NextResponse.json({ 
      success: true, 
      message: 'Login realizado com sucesso' 
    });
    
    // Definir cookie com token
    response.cookies.set('auth_token', token, {
      httpOnly: false, // Permitir acesso via JavaScript para debugging
      secure: false, // Desabilitar em desenvolvimento
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/' // Garantir que o cookie é válido para todo o site
    });
    
    return response;
  } catch (error) {
    console.error('❌ Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}