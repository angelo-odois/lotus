import { obfuscateEmail } from './validation';

export type AuditEvent = 
  | 'login_success'
  | 'login_failed'
  | 'login_rate_limited'
  | 'proposal_approved'
  | 'unauthorized_access'
  | 'csrf_violation';

interface AuditMeta {
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  proposalId?: string;
  [key: string]: unknown;
}

export function audit(event: AuditEvent, meta: AuditMeta = {}) {
  const timestamp = new Date().toISOString();
  const isProduction = process.env.NODE_ENV === 'production';
  
  const logEntry = {
    timestamp,
    event,
    ...meta,
    email: meta.email ? obfuscateEmail(meta.email) : undefined,
  };
  
  if (isProduction) {
    console.log(JSON.stringify(logEntry));
  } else {
    console.log(`[AUDIT] ${event}:`, logEntry);
  }
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (real) {
    return real.trim();
  }
  
  return 'unknown';
}

export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}