import { z } from 'zod';

export const proposalQuerySchema = z.object({
  q: z.string().max(80).optional(),
  page: z.coerce.number().min(1).max(1000).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export const proposalParamsSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
});

export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '');
}