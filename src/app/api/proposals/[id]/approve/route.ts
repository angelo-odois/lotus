import { NextRequest, NextResponse } from 'next/server';
import { findProposalById, updateProposalStatus } from '@/lib/queries';
import { getUserFromRequest } from '@/lib/auth';
import { proposalParamsSchema, csrfSchema } from '@/lib/validation';
import { audit, getClientIP, getUserAgent } from '@/lib/audit';

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
        path: `/api/proposals/*/approve`
      });
      return NextResponse.json(
        { error: 'Não autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const paramsValidation = proposalParamsSchema.safeParse({ id });
    if (!paramsValidation.success) {
      return NextResponse.json(
        { error: 'ID inválido', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const csrfValidation = csrfSchema.safeParse(body);
    if (!csrfValidation.success) {
      return NextResponse.json(
        { error: 'Token CSRF obrigatório', code: 'CSRF_REQUIRED' },
        { status: 400 }
      );
    }

    // CSRF validation
    const csrfToken = csrfValidation.data.csrfToken;
    const csrfCookie = request.cookies.get('XSRF-TOKEN')?.value;
    if (!csrfCookie || csrfCookie !== csrfToken) {
      audit('csrf_violation', { 
        userId: user.id, 
        ip: getClientIP(request), 
        userAgent: getUserAgent(request),
        proposalId: id
      });
      return NextResponse.json(
        { error: 'Token CSRF inválido', code: 'CSRF_ERROR' },
        { status: 403 }
      );
    }

    const proposal = await findProposalById(id);

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposta não encontrada', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Idempotent - if already approved, return success
    if (proposal.status === 'approved') {
      return NextResponse.json({
        ok: true,
        status: 'approved',
        proposal: {
          id: proposal.id,
          clientName: proposal.clientName,
          status: proposal.status
        }
      });
    }

    // Update status to approved
    await updateProposalStatus(id, 'approved');

    audit('proposal_approved', {
      userId: user.id,
      proposalId: id,
      clientName: proposal.clientName,
      ip: getClientIP(request),
      userAgent: getUserAgent(request)
    });

    return NextResponse.json({
      ok: true,
      status: 'approved',
      proposal: {
        id: proposal.id,
        clientName: proposal.clientName,
        status: 'approved'
      }
    });

  } catch (error) {
    console.error('Approve proposal error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}