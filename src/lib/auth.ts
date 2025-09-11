import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { findUserByEmail } from './queries';

interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
  jti: string;
}

const JWT_SECRET_CURRENT = process.env.JWT_SECRET_CURRENT;
const JWT_SECRETS_PREVIOUS = process.env.JWT_SECRETS_PREVIOUS 
  ? JSON.parse(process.env.JWT_SECRETS_PREVIOUS) 
  : [];

if (!JWT_SECRET_CURRENT) {
  throw new Error('JWT_SECRET_CURRENT is required');
}

const COOKIE_NAME = process.env.NODE_ENV === 'production' ? '__Host-session' : 'session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function createJWT(userId: string): string {
  const jti = crypto.randomUUID();
  const payload: JWTPayload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    jti,
  };
  
  return jwt.sign(payload, JWT_SECRET_CURRENT);
}

export function verifyJWT(token: string): JWTPayload | null {
  const secrets = [JWT_SECRET_CURRENT, ...JWT_SECRETS_PREVIOUS];
  
  for (const secret of secrets) {
    try {
      const payload = jwt.verify(token, secret) as JWTPayload;
      return payload;
    } catch {
      continue;
    }
  }
  
  return null;
}

export async function getUserFromRequest(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyJWT(token);
    if (!payload) return null;

    // For API calls, we'll do a lightweight check by just validating the JWT
    // The JWT already contains the user ID and we validated the signature
    // For full user data, we could query the DB, but for auth check this is sufficient
    return { id: payload.sub };
  } catch {
    return null;
  }
}

export function shouldRefreshToken(token: string): boolean {
  try {
    const payload = verifyJWT(token);
    if (!payload) return false;
    
    const threeDaysInSeconds = 3 * 24 * 60 * 60;
    const timeToExpiry = payload.exp - Math.floor(Date.now() / 1000);
    
    return timeToExpiry < threeDaysInSeconds;
  } catch {
    return false;
  }
}

export function createSecureCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  
  return [
    `${COOKIE_NAME}=${token}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    isProduction ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}

export function clearSecureCookie(): string {
  return [
    `${COOKIE_NAME}=`,
    'Max-Age=0',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}