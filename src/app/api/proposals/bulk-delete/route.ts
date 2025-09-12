import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { csrfSchema } from '@/lib/validation';
import { audit, getClientIP, getUserAgent } from '@/lib/audit';
import { getDatabase } from '@/lib/database';
import { z } from 'zod';

const bulkDeleteSchema = z.object({
  proposalIds: z.array(z.string().uuid()).min(1).max(50), // Máximo 50 propostas por vez
  csrfToken: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      audit('unauthorized_access', { 
        ip: getClientIP(request), 
        userAgent: getUserAgent(request),
        path: `/api/proposals/bulk-delete`
      });
      return NextResponse.json(
        { error: 'Não autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

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
        proposalIds: body.proposalIds
      });
      return NextResponse.json(
        { error: 'Token CSRF inválido', code: 'CSRF_ERROR' },
        { status: 403 }
      );
    }

    // Validate request body
    const validation = bulkDeleteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const { proposalIds } = validation.data;

    const db = await getDatabase();
    
    // First, get all proposals to check their status
    const placeholders = proposalIds.map(() => '?').join(',');
    const proposals = await db.query(
      `SELECT id, client_name, status FROM proposals WHERE id IN (${placeholders})`,
      proposalIds
    );

    if (proposals.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma proposta encontrada', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if any proposals are approved (cannot be deleted)
    const approvedProposals = proposals.filter((p: any) => p.status === 'approved');
    if (approvedProposals.length > 0) {
      audit('bulk_delete_approved_proposals_attempt', {
        userId: user.id,
        approvedProposalIds: approvedProposals.map((p: any) => p.id),
        approvedClients: approvedProposals.map((p: any) => p.client_name),
        ip: getClientIP(request),
        userAgent: getUserAgent(request)
      });
      return NextResponse.json(
        { 
          error: `${approvedProposals.length} proposta(s) aprovada(s) não podem ser apagadas`, 
          code: 'CANNOT_DELETE_APPROVED',
          approvedProposals: approvedProposals.map((p: any) => ({
            id: p.id,
            clientName: p.client_name
          }))
        },
        { status: 403 }
      );
    }

    // Delete all non-approved proposals
    const deletableProposals = proposals.filter((p: any) => p.status !== 'approved');
    const deletableIds = deletableProposals.map((p: any) => p.id);

    if (deletableIds.length > 0) {
      const deletePlaceholders = deletableIds.map(() => '?').join(',');
      await db.query(
        `DELETE FROM proposals WHERE id IN (${deletePlaceholders})`,
        deletableIds
      );

      audit('bulk_proposals_deleted', {
        userId: user.id,
        proposalIds: deletableIds,
        clientNames: deletableProposals.map((p: any) => p.client_name),
        count: deletableIds.length,
        ip: getClientIP(request),
        userAgent: getUserAgent(request)
      });
    }

    return NextResponse.json({
      success: true,
      message: `${deletableIds.length} proposta(s) apagada(s) com sucesso`,
      deletedCount: deletableIds.length,
      skippedCount: approvedProposals.length
    });

  } catch (error) {
    console.error('Bulk delete proposals error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}