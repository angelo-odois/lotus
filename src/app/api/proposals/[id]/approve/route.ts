import { NextRequest, NextResponse } from 'next/server';
import { findProposalById, updateProposalStatus } from '@/lib/queries';
import { proposalParamsSchema } from '@/lib/validation';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {

    const { id } = await params;
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