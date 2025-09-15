import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const logs: string[] = [];
  
  function log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}${data ? `: ${JSON.stringify(data, null, 2)}` : ''}`;
    logs.push(logEntry);
    console.log(logEntry);
  }

  try {
    log('=== INÍCIO DEBUG ENDPOINT ===');
    log('Environment', { 
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'CONFIGURADO' : 'NÃO CONFIGURADO'
    });

    // Parse URL parameters
    const { searchParams } = new URL(request.url);
    const testAuth = searchParams.get('testAuth') === 'true';
    const testDatabase = searchParams.get('testDatabase') === 'true';
    
    log('Request Info', {
      url: request.url,
      method: request.method,
      testAuth,
      testDatabase,
      userAgent: request.headers.get('user-agent')
    });

    // Test cookies
    const cookies = request.cookies.getAll();
    const authToken = request.cookies.get('auth_token');
    
    log('Cookies Analysis', {
      totalCookies: cookies.length,
      cookieNames: cookies.map(c => c.name),
      hasAuthToken: !!authToken,
      authTokenValue: authToken?.value ? `${authToken.value.substring(0, 20)}...` : 'AUSENTE'
    });

    // Test authentication if requested
    let authResult = null;
    if (testAuth) {
      try {
        // Dynamic import to avoid compilation issues
        const { getAuthFromRequest } = await import('@/lib/auth');
        authResult = getAuthFromRequest(request);
        log('Authentication Test', {
          success: !!authResult,
          username: authResult?.username || 'N/A'
        });
      } catch (error) {
        log('Authentication Error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
      }
    }

    // Test database connection if requested
    let dbTest = null;
    if (testDatabase) {
      try {
        log('Testing database connection...');
        const { listarPropostas, contarPropostas } = await import('@/lib/database');
        const propostas = await listarPropostas(5, 0);
        const total = await contarPropostas();
        
        dbTest = {
          success: true,
          proposalCount: propostas.length,
          totalProposals: total,
          sampleProposal: propostas[0] ? {
            id: propostas[0].id,
            nome: propostas[0].dados_pessoais?.nome || 'N/A',
            empreendimento: propostas[0].empreendimento
          } : null
        };
        
        log('Database Test Result', dbTest);
      } catch (error) {
        dbTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        };
        log('Database Test Error', dbTest);
      }
    }

    // Test propostas endpoint internally
    let endpointTest = {
      endpointUrl: new URL('/api/propostas?dashboard=true&limit=5', request.url).toString(),
      note: 'Use curl para testar: curl "' + new URL('/api/propostas?dashboard=true&limit=5', request.url).toString() + '"'
    };
    
    log('Endpoint Test', endpointTest);

    const duration = Date.now() - startTime;
    log('=== FIM DEBUG ENDPOINT ===', { duration: `${duration}ms` });

    // Return comprehensive debug info
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      },
      request: {
        url: request.url,
        method: request.method,
        userAgent: request.headers.get('user-agent')
      },
      cookies: {
        total: cookies.length,
        names: cookies.map(c => c.name),
        hasAuthToken: !!authToken,
        authTokenPreview: authToken?.value ? `${authToken.value.substring(0, 20)}...` : 'AUSENTE'
      },
      tests: {
        authentication: authResult ? {
          success: true,
          username: authResult.username
        } : (testAuth ? { success: false } : { skipped: true }),
        database: dbTest || (testDatabase ? { skipped: false } : { skipped: true }),
        endpoint: endpointTest
      },
      duration: `${duration}ms`,
      logs: logs,
      instructions: {
        message: 'Adicione parâmetros para testes específicos',
        authTest: `${request.url}${request.url.includes('?') ? '&' : '?'}testAuth=true`,
        databaseTest: `${request.url}${request.url.includes('?') ? '&' : '?'}testDatabase=true`,
        fullTest: `${request.url}${request.url.includes('?') ? '&' : '?'}testAuth=true&testDatabase=true`
      }
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    log('ERRO CRÍTICO', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`
    });

    return NextResponse.json({
      status: 'error',
      error: 'Erro crítico no debug',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      logs: logs
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}