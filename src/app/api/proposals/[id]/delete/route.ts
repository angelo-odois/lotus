import { NextRequest, NextResponse } from 'next/server';
import { proposalParamsSchema } from '@/lib/validation';
import { executeQuery } from '@/lib/postgres';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate proposal ID
    const paramsValidation = proposalParamsSchema.safeParse({ id });
    if (!paramsValidation.success) {
      return NextResponse.json(
        { error: 'ID inválido', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if proposal exists
    const existingProposal = await executeQuery(
      'SELECT id, status FROM propostas WHERE id = $1',
      [id]
    );

    if (existingProposal.length === 0) {
      return NextResponse.json(
        { error: 'Proposta não encontrada', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the proposal
    await executeQuery('DELETE FROM propostas WHERE id = $1', [id]);

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