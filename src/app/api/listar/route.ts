import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  console.log('🆕 [NOVO ENDPOINT] Iniciando /api/listar');
  
  try {
    // Parse URL parameters
    const { searchParams } = new URL(request.url);
    const dashboard = searchParams.get('dashboard');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const empreendimento = searchParams.get('empreendimento');
    
    console.log('🆕 [NOVO ENDPOINT] Parâmetros:', { 
      dashboard, 
      limit, 
      offset, 
      empreendimento,
      url: request.url 
    });

    // Verificar autenticação para dashboard
    if (dashboard === 'true') {
      console.log('🆕 [NOVO ENDPOINT] Verificando autenticação...');
      
      const cookies = request.cookies.getAll();
      const authToken = request.cookies.get('auth_token');
      
      console.log('🆕 [NOVO ENDPOINT] Cookies:', { 
        total: cookies.length,
        names: cookies.map(c => c.name),
        hasAuth: !!authToken
      });
      
      // Importação dinâmica para evitar problemas de build
      try {
        const { getAuthFromRequest } = await import('@/lib/auth');
        const auth = getAuthFromRequest(request);
        
        if (!auth) {
          console.log('🆕 [NOVO ENDPOINT] ❌ Autenticação falhou');
          return NextResponse.json({
            error: 'Não autorizado',
            endpoint: 'novo-listar',
            debug: {
              timestamp: new Date().toISOString(),
              cookies: cookies.length
            }
          }, { status: 401 });
        }
        
        console.log('🆕 [NOVO ENDPOINT] ✅ Autenticação OK:', auth.username);
      } catch (authError) {
        console.log('🆕 [NOVO ENDPOINT] ❌ Erro de autenticação:', authError);
        return NextResponse.json({
          error: 'Erro de autenticação',
          endpoint: 'novo-listar',
          details: authError instanceof Error ? authError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Buscar propostas do banco
    console.log('🆕 [NOVO ENDPOINT] Buscando propostas do banco...');
    
    try {
      const { listarPropostas, contarPropostas } = await import('@/lib/database');
      
      console.log('🆕 [NOVO ENDPOINT] Executando listarPropostas...');
      const propostas = await listarPropostas(limit, offset, empreendimento || undefined);
      
      console.log('🆕 [NOVO ENDPOINT] Propostas obtidas:', propostas.length);
      
      let total = 0;
      if (dashboard === 'true') {
        console.log('🆕 [NOVO ENDPOINT] Contando total...');
        total = await contarPropostas(empreendimento || undefined);
        console.log('🆕 [NOVO ENDPOINT] Total contado:', total);
      } else {
        total = propostas.length;
      }

      const duration = Date.now() - startTime;
      
      const response = {
        success: true,
        endpoint: 'novo-listar',
        propostas,
        total,
        limit,
        offset,
        filter: empreendimento || null,
        meta: {
          version: 'v2.0',
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
          isDashboard: dashboard === 'true',
          proposalCount: propostas.length
        }
      };
      
      console.log('🆕 [NOVO ENDPOINT] ✅ Resposta preparada:', {
        propostas: propostas.length,
        total,
        duration: `${duration}ms`
      });
      
      return NextResponse.json(response, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Endpoint': 'novo-listar-v2'
        }
      });

    } catch (dbError) {
      console.log('🆕 [NOVO ENDPOINT] ❌ Erro no banco:', dbError);
      
      return NextResponse.json({
        success: false,
        error: 'Erro ao acessar banco de dados',
        endpoint: 'novo-listar',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        meta: {
          duration: `${Date.now() - startTime}ms`,
          timestamp: new Date().toISOString()
        }
      }, { status: 500 });
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.log('🆕 [NOVO ENDPOINT] ❌ Erro geral:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      endpoint: 'novo-listar',
      details: error instanceof Error ? error.message : 'Unknown error',
      meta: {
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

// Endpoint de teste simples
export async function POST(request: NextRequest) {
  console.log('🆕 [NOVO ENDPOINT] POST /api/listar - Endpoint de teste');
  
  return NextResponse.json({
    message: 'Novo endpoint funcionando!',
    endpoint: 'novo-listar',
    method: 'POST',
    timestamp: new Date().toISOString(),
    version: 'v2.0'
  });
}