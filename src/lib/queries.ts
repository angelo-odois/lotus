import { executeQuery, executeQuerySingle } from './postgres';

export interface UserData {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProposalData {
  id: string;
  clientName: string;
  email?: string;
  telefone?: string;
  empreendimento?: string;
  unidadeNumero?: string;
  valorImovel?: string;
  status: string;
  pdfGerado: boolean;
  whatsappEnviado: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function findUserByEmail(email: string): Promise<UserData | null> {
  try {
    const query = `
      SELECT id, email, password_hash as "passwordHash", is_active as "isActive", 
             created_at as "createdAt", updated_at as "updatedAt" 
      FROM users 
      WHERE email = $1 AND is_active = true
    `;
    
    const result = await executeQuerySingle(query, [email]);
    return result as UserData | null;
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    return null;
  }
}

export async function findProposals(
  search?: string, 
  limit: number = 20, 
  offset: number = 0
): Promise<{ proposals: ProposalData[]; total: number }> {
  try {
    let whereClause = '';
    let params: any[] = [];
    let paramIndex = 1;
    
    if (search) {
      whereClause = `WHERE dados_pessoais->>'nomeCompleto' ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Contar total
    const countQuery = `SELECT COUNT(*) as total FROM propostas ${whereClause}`;
    const countResult = await executeQuerySingle(countQuery, params);
    
    // Buscar propostas
    const proposalsQuery = `
      SELECT 
        id,
        dados_pessoais->>'nomeCompleto' as "clientName",
        dados_pessoais->>'email' as email,
        dados_pessoais->>'telefone' as telefone,
        empreendimento->>'nome' as empreendimento,
        unidade->>'numero' as "unidadeNumero",
        unidade->>'valor' as "valorImovel",
        status,
        pdf_gerado as "pdfGerado",
        whatsapp_enviado as "whatsappEnviado",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM propostas 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const proposals = await executeQuery(proposalsQuery, [...params, limit, offset]);
    
    return {
      proposals: proposals as ProposalData[],
      total: parseInt(countResult?.total || '0')
    };
  } catch (error) {
    console.error('❌ Erro ao buscar propostas:', error);
    return { proposals: [], total: 0 };
  }
}

export async function findProposalById(id: string): Promise<ProposalData | null> {
  try {
    const query = `
      SELECT 
        id,
        dados_pessoais->>'nomeCompleto' as "clientName",
        dados_pessoais->>'email' as email,
        dados_pessoais->>'telefone' as telefone,
        empreendimento->>'nome' as empreendimento,
        unidade->>'numero' as "unidadeNumero", 
        unidade->>'valor' as "valorImovel",
        status,
        pdf_gerado as "pdfGerado",
        whatsapp_enviado as "whatsappEnviado",
        created_at as "createdAt",
        updated_at as "updatedAt",
        dados_pessoais,
        endereco,
        dados_conjuge,
        empreendimento as "empreendimentoData",
        unidade as "unidadeData",
        documentos
      FROM propostas 
      WHERE id = $1
    `;
    
    const result = await executeQuerySingle(query, [id]);
    return result as ProposalData | null;
  } catch (error) {
    console.error('❌ Erro ao buscar proposta por ID:', error);
    return null;
  }
}

export async function createProposal(data: {
  dadosPessoais: any;
  endereco?: any;
  dadosConjuge?: any;
  empreendimento?: any;
  unidade?: any;
  documentos?: any;
  status?: string;
}): Promise<string> {
  try {
    const query = `
      INSERT INTO propostas (
        dados_pessoais, 
        endereco, 
        dados_conjuge, 
        empreendimento, 
        unidade, 
        documentos, 
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    
    const result = await executeQuerySingle(query, [
      JSON.stringify(data.dadosPessoais),
      JSON.stringify(data.endereco || {}),
      JSON.stringify(data.dadosConjuge || {}),
      JSON.stringify(data.empreendimento || {}),
      JSON.stringify(data.unidade || {}),
      JSON.stringify(data.documentos || {}),
      data.status || 'enviado'
    ]);
    
    return result?.id || '';
  } catch (error) {
    console.error('❌ Erro ao criar proposta:', error);
    throw error;
  }
}

export async function updateProposalStatus(id: string, status: string): Promise<void> {
  try {
    const query = `
      UPDATE propostas 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    
    await executeQuery(query, [status, id]);
  } catch (error) {
    console.error('❌ Erro ao atualizar status da proposta:', error);
    throw error;
  }
}

export async function deleteProposal(id: string): Promise<void> {
  try {
    const query = `DELETE FROM propostas WHERE id = $1`;
    await executeQuery(query, [id]);
  } catch (error) {
    console.error('❌ Erro ao deletar proposta:', error);
    throw error;
  }
}

export async function updateProposalPdfStatus(id: string, pdfGerado: boolean): Promise<void> {
  try {
    const query = `
      UPDATE propostas 
      SET pdf_gerado = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    
    await executeQuery(query, [pdfGerado, id]);
  } catch (error) {
    console.error('❌ Erro ao atualizar status do PDF:', error);
    throw error;
  }
}

export async function updateProposalWhatsAppStatus(id: string, whatsappEnviado: boolean): Promise<void> {
  try {
    const query = `
      UPDATE propostas 
      SET whatsapp_enviado = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    
    await executeQuery(query, [whatsappEnviado, id]);
  } catch (error) {
    console.error('❌ Erro ao atualizar status do WhatsApp:', error);
    throw error;
  }
}