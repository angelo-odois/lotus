import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(255),
  csrfToken: z.string().min(1, 'Token CSRF obrigatório'),
});

export const proposalQuerySchema = z.object({
  q: z.string().max(80).optional(),
  page: z.coerce.number().min(1).max(1000).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export const proposalParamsSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
});

export const csrfSchema = z.object({
  csrfToken: z.string().min(1, 'Token CSRF obrigatório'),
});

export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '');
}

export function obfuscateEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return 'email_inválido';
  
  const obfuscatedLocal = local.length > 1 
    ? local[0] + '*'.repeat(Math.max(1, local.length - 2)) + local[local.length - 1]
    : local;
  
  const [domainName, ext] = domain.split('.');
  const obfuscatedDomain = domainName.length > 1
    ? domainName[0] + '*'.repeat(Math.max(1, domainName.length - 2)) + domainName[domainName.length - 1]
    : domainName;
  
  return `${obfuscatedLocal}@${obfuscatedDomain}.${ext}`;
}