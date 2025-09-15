import { NextRequest } from 'next/server';

// Credenciais simples (em produção, usar hash e variáveis de ambiente)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'lotus2024';

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function createAuthToken(username: string): string {
  // Token simples - em produção usar JWT
  const payload = {
    username,
    timestamp: Date.now()
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function validateAuthToken(token: string): { username: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    const tokenAge = Date.now() - payload.timestamp;
    
    // Token válido por 24 horas
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return null;
    }
    
    return { username: payload.username };
  } catch {
    return null;
  }
}

export function getAuthFromRequest(request: NextRequest): { username: string } | null {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  return validateAuthToken(token);
}