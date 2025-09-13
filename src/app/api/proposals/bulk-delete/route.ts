import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/postgres';
import { z } from 'zod';

const bulkDeleteSchema = z.object({
  proposalIds: z.array(z.string().uuid()).min(1).max(50), // Máximo 50 propostas por vez
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = bulkDeleteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const { proposalIds } = validation.data;

    // First, get all proposals to check their status
    const placeholders = proposalIds.map((_, i) => `$${i + 1}`).join(',');
    const proposals = await executeQuery(
      `SELECT id, dados_pessoais->>'nomeCompleto' as client_name, status 
       FROM propostas 
       WHERE id IN (${placeholders})`,
      proposalIds
    );

    if (proposals.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma proposta encontrada', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete all proposals
    if (proposalIds.length > 0) {
      const deletePlaceholders = proposalIds.map((_, i) => `$${i + 1}`).join(',');
      await executeQuery(
        `DELETE FROM propostas WHERE id IN (${deletePlaceholders})`,
        proposalIds
      );
    }

    return NextResponse.json({
      success: true,
      message: `${proposalIds.length} proposta(s) apagada(s) com sucesso`,
      deletedCount: proposalIds.length
    });

  } catch (error) {
    console.error('Bulk delete proposals error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}