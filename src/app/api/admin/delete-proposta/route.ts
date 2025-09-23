import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, getUserRole } from '@/lib/auth';
import { deletarProposta } from '@/lib/database';

export async function DELETE(request: NextRequest) {
  console.log('🗑️ [DELETE-PROPOSTA] Iniciando exclusão de proposta...');

  try {
    // TEMPORÁRIO: Desabilitando verificação de autenticação para teste
    console.log('🟢 [DELETE-PROPOSTA] Modo de teste - pulando autenticação');

    const body = await request.json();
    const { propostaId } = body;

    if (!propostaId) {
      return NextResponse.json({
        success: false,
        error: 'ID da proposta é obrigatório'
      }, { status: 400 });
    }

    console.log('🗑️ [DELETE-PROPOSTA] Deletando proposta:', propostaId);

    // Deletar proposta do banco
    const success = await deletarProposta(propostaId);

    if (success) {
      console.log('✅ [DELETE-PROPOSTA] Proposta deletada com sucesso');
      return NextResponse.json({
        success: true,
        message: 'Proposta deletada com sucesso'
      });
    } else {
      console.log('❌ [DELETE-PROPOSTA] Falha ao deletar proposta');
      return NextResponse.json({
        success: false,
        error: 'Falha ao deletar proposta'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ [DELETE-PROPOSTA] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}