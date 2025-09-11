import { NextRequest, NextResponse } from 'next/server';
import { findProposals } from '@/lib/queries';
import { getUserFromRequest } from '@/lib/auth';
import { proposalQuerySchema, sanitizeString } from '@/lib/validation';
import { audit, getClientIP, getUserAgent } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      audit('unauthorized_access', { 
        ip: getClientIP(request), 
        userAgent: getUserAgent(request),
        path: '/api/proposals'
      });
      return NextResponse.json(
        { error: 'Não autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = {
      q: searchParams.get('q') || undefined,
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
    };

    const parsed = proposalQuerySchema.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', code: 'INVALID_PARAMS' },
        { status: 400 }
      );
    }

    const { q, page, pageSize } = parsed.data;
    const offset = (page - 1) * pageSize;
    
    const searchQuery = q ? sanitizeString(q) : undefined;
    const result = await findProposals(searchQuery, pageSize, offset);
    
    const totalPages = Math.ceil(result.total / pageSize);

    return NextResponse.json({
      proposals: result.proposals,
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Proposals API error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}