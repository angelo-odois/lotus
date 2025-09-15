import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { deletarProposta } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Lista de IDs é obrigatória' },
        { status: 400 }
      );
    }

    // Validar que todos os IDs são strings válidas
    const validIds = ids.filter(id => typeof id === 'string' && id.trim().length > 0);
    
    if (validIds.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum ID válido fornecido' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Iniciando exclusão em lote de ${validIds.length} propostas`);

    const results = {
      success: [],
      failed: []
    };

    // Deletar cada proposta
    for (const id of validIds) {
      try {
        const sucesso = await deletarProposta(id);
        if (sucesso) {
          results.success.push(id);
        } else {
          results.failed.push({ id, error: 'Falha na exclusão' });
        }
      } catch (error) {
        console.error(`❌ Erro ao deletar proposta ${id}:`, error);
        results.failed.push({ id, error: 'Erro interno' });
      }
    }

    console.log(`✅ Exclusão em lote concluída: ${results.success.length} sucesso, ${results.failed.length} falhas`);

    return NextResponse.json({
      message: `Exclusão em lote concluída`,
      total: validIds.length,
      success: results.success.length,
      failed: results.failed.length,
      results
    });

  } catch (error) {
    console.error('❌ Erro na exclusão em lote:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}