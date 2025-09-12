import { NextRequest, NextResponse } from 'next/server';
import { findProposalById } from '@/lib/queries';
import { getUserFromRequest } from '@/lib/auth';
import { proposalParamsSchema, csrfSchema } from '@/lib/validation';
import { audit, getClientIP, getUserAgent } from '@/lib/audit';
import { getDatabase } from '@/lib/database';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      audit('unauthorized_access', { 
        ip: getClientIP(request), 
        userAgent: getUserAgent(request),
        path: `/api/proposals/*/delete`
      });
      return NextResponse.json(
        { error: 'Não autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id } = await params;

    // Validate CSRF token
    const csrfValidation = csrfSchema.safeParse(body);
    if (!csrfValidation.success) {
      return NextResponse.json(
        { error: 'Token CSRF obrigatório', code: 'CSRF_REQUIRED' },
        { status: 400 }
      );
    }

    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || csrfToken !== body.csrfToken) {
      audit('csrf_violation', { 
        ip: getClientIP(request), 
        userAgent: getUserAgent(request),
        proposalId: id
      });
      return NextResponse.json(
        { error: 'Token CSRF inválido', code: 'CSRF_ERROR' },
        { status: 403 }
      );
    }

    // Validate proposal ID
    const paramsValidation = proposalParamsSchema.safeParse({ id });
    if (!paramsValidation.success) {
      return NextResponse.json(
        { error: 'ID inválido', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const proposal = await findProposalById(id);

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposta não encontrada', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Only allow deletion of non-approved proposals
    if (proposal.status === 'approved') {
      audit('delete_approved_proposal_attempt', {
        userId: user.id,
        proposalId: id,
        clientName: proposal.clientName,
        ip: getClientIP(request),
        userAgent: getUserAgent(request)
      });
      return NextResponse.json(
        { error: 'Não é possível apagar propostas aprovadas', code: 'CANNOT_DELETE_APPROVED' },
        { status: 403 }
      );
    }

    // Delete the proposal
    const db = await getDatabase();
    await db.query('DELETE FROM proposals WHERE id = ?', [id]);

    audit('proposal_deleted', {
      userId: user.id,
      proposalId: id,
      clientName: proposal.clientName,
      status: proposal.status,
      ip: getClientIP(request),
      userAgent: getUserAgent(request)
    });

    return NextResponse.json({
      success: true,
      message: 'Proposta apagada com sucesso'
    });

  } catch (error) {
    console.error('Delete proposal error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}