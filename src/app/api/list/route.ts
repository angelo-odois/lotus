import { NextRequest, NextResponse } from 'next/server';

// Endpoint de teste super simples
export async function GET(request: NextRequest) {
  console.log('🟢 [LIST] GET request iniciado');
  
  try {
    const { searchParams } = new URL(request.url);
    const dashboard = searchParams.get('dashboard');
    
    console.log('🟢 [LIST] Dashboard:', dashboard);
    
    // Se for dashboard, só retornar dados mockados por enquanto
    if (dashboard === 'true') {
      console.log('🟢 [LIST] Retornando dados mockados para dashboard');
      
      return NextResponse.json({
        success: true,
        endpoint: 'list-v1',
        propostas: [
          {
            id: '123',
            dados_pessoais: { nome: 'Teste Usuario' },
            empreendimento: 'Teste Empreendimento'
          }
        ],
        total: 14,
        version: 'v1.0',
        timestamp: new Date().toISOString(),
        message: 'Endpoint LIST funcionando!'
      });
    }
    
    return NextResponse.json({
      success: true,
      endpoint: 'list-v1',
      message: 'Endpoint funcionando - adicione ?dashboard=true para dados'
    });
    
  } catch (error) {
    console.log('🟢 [LIST] Erro:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      endpoint: 'list-v1'
    }, { status: 500 });
  }
}