import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  console.log('🟢 [LIST] Iniciando requisição');
  
  try {
    // Parse URL parameters
    const { searchParams } = new URL(request.url);
    const dashboard = searchParams.get('dashboard');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const empreendimento = searchParams.get('empreendimento');
    const id = searchParams.get('id'); // Para busca individual
    
    console.log('🟢 [LIST] Parâmetros:', { 
      dashboard, 
      limit, 
      offset, 
      empreendimento,
      id,
      url: request.url 
    });

    // TEMPORÁRIO: Desabilitando verificação de autenticação para teste
    if (dashboard === 'true' || id) {
      console.log('🟢 [LIST] Modo de teste - pulando autenticação');
    }

    // Se for busca por ID individual
    if (id) {
      console.log('🟢 [LIST] Buscando proposta individual:', id);
      
      try {
        const { buscarProposta } = await import('@/lib/database');
        const proposta = await buscarProposta(id);
        
        if (!proposta) {
          return NextResponse.json({
            error: 'Proposta não encontrada',
            endpoint: 'list'
          }, { status: 404 });
        }
        
        return NextResponse.json({
          success: true,
          proposta,
          endpoint: 'list',
          meta: {
            duration: `${Date.now() - startTime}ms`,
            timestamp: new Date().toISOString()
          }
        });
      } catch (dbError) {
        console.log('🟢 [LIST] ❌ Erro no banco (busca individual):', dbError);
        return NextResponse.json({
          success: false,
          error: 'Erro ao buscar proposta',
          endpoint: 'list',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Buscar propostas do banco
    console.log('🟢 [LIST] Buscando propostas do banco...');
    
    try {
      const { listarPropostas, contarPropostas } = await import('@/lib/database');
      
      console.log('🟢 [LIST] Executando listarPropostas...');
      const propostas = await listarPropostas(limit, offset, empreendimento || undefined);
      
      console.log('🟢 [LIST] Propostas obtidas:', propostas.length);
      
      let total = 0;
      if (dashboard === 'true') {
        console.log('🟢 [LIST] Contando total...');
        total = await contarPropostas(empreendimento || undefined);
        console.log('🟢 [LIST] Total contado:', total);
      } else {
        total = propostas.length;
      }

      const duration = Date.now() - startTime;
      
      const response = {
        success: true,
        endpoint: 'list',
        propostas,
        total,
        limit,
        offset,
        filter: empreendimento || null,
        meta: {
          version: 'v1.0',
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
          isDashboard: dashboard === 'true',
          proposalCount: propostas.length
        }
      };
      
      console.log('🟢 [LIST] ✅ Resposta preparada:', {
        propostas: propostas.length,
        total,
        duration: `${duration}ms`
      });
      
      return NextResponse.json(response, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Endpoint': 'list-v1'
        }
      });

    } catch (dbError) {
      console.log('🟢 [LIST] ❌ Erro no banco:', dbError);
      
      return NextResponse.json({
        success: false,
        error: 'Erro ao acessar banco de dados',
        endpoint: 'list',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        meta: {
          duration: `${Date.now() - startTime}ms`,
          timestamp: new Date().toISOString()
        }
      }, { status: 500 });
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.log('🟢 [LIST] ❌ Erro geral:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      endpoint: 'list',
      details: error instanceof Error ? error.message : 'Unknown error',
      meta: {
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}