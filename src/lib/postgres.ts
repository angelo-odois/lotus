import { Pool } from 'pg';

// Configuração PostgreSQL para formulário Lotus
const getDatabaseConfig = () => {
  const databaseUrl = process.env.DATABASE_URL || '';
  
  // Se for o servidor específico (212.85.13.91), desabilitar SSL
  if (databaseUrl.includes('212.85.13.91')) {
    return {
      connectionString: databaseUrl,
      ssl: false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }
  
  // Para outros servidores (produção/Coolify), usar SSL
  return {
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
};

const pool = new Pool(getDatabaseConfig());

// Função para executar queries
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    console.log('🔍 Executing query:', query.substring(0, 100) + (query.length > 100 ? '...' : ''));
    const result = await client.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Função para executar query única
export async function executeQuerySingle<T = any>(query: string, params: any[] = []): Promise<T | null> {
  const results = await executeQuery<T>(query, params);
  return results.length > 0 ? results[0] : null;
}

// Função para testar conexão
export async function testConnection(): Promise<boolean> {
  try {
    await executeQuery('SELECT NOW() as current_time');
    console.log('✅ PostgreSQL connection successful');
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    return false;
  }
}

// Função para inicializar as tabelas
export async function initializeTables(): Promise<void> {
  try {
    // Tabela de propostas simplificada
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS propostas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dados_pessoais JSONB NOT NULL,
        endereco JSONB,
        dados_conjuge JSONB,
        empreendimento JSONB,
        unidade JSONB,
        documentos JSONB,
        status VARCHAR(20) DEFAULT 'rascunho',
        pdf_gerado BOOLEAN DEFAULT FALSE,
        whatsapp_enviado BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Índices para performance
    await executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_propostas_created_at ON propostas(created_at DESC);
    `);
    
    await executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_propostas_status ON propostas(status);
    `);

    console.log('✅ Tabelas PostgreSQL inicializadas');
  } catch (error) {
    console.error('❌ Erro ao inicializar tabelas:', error);
    throw error;
  }
}

export default pool;