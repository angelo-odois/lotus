import { NextResponse } from 'next/server';
import { testConnection, initializeTables, executeQuery } from '@/lib/postgres';

// Endpoint para testar conexão PostgreSQL
export async function GET() {
  try {
    console.log('🔍 Testando conexão PostgreSQL...');
    
    // Testar conexão
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Falha na conexão com PostgreSQL');
    }
    
    // Inicializar tabelas
    await initializeTables();
    
    // Contar registros existentes
    const countResult = await executeQuery('SELECT COUNT(*) as total FROM propostas');
    const total = parseInt(countResult[0].total);
    
    return NextResponse.json({
      status: 'ok',
      database: 'PostgreSQL',
      connected: true,
      tables: 'inicializadas',
      totalPropostas: total,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro no teste de database:', error);
    return NextResponse.json({
      status: 'error',
      database: 'PostgreSQL',
      connected: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}