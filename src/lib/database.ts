import { FormData } from '@/types/form';
import { executeQuery, executeQuerySingle, initializeTables } from './postgres';

export interface PropostaDB {
  id: string;
  dados_pessoais: any;
  endereco: any;
  dados_conjuge: any;
  empreendimento: any;
  unidade: any;
  documentos: any;
  status: string;
  pdf_gerado: boolean;
  whatsapp_enviado: boolean;
  created_at: string;
  updated_at: string;
}

export interface FileUpload {
  name: string;
  type: string;
  base64?: string;
  category?: string;
  size?: number;
}

export async function initializeDatabase(): Promise<void> {
  try {
    await initializeTables();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export async function salvarProposta(
  formData: FormData, 
  uploadedFiles: FileUpload[] = [],
  pdfFilename?: string
): Promise<string> {
  try {
    console.log('💾 Salvando proposta no banco...');

    // Organizar dados por seções
    const dadosPessoais = {
      nome: formData.nome,
      cpfCnpj: formData.cpfCnpj,
      rgInsEst: formData.rgInsEst,
      orgaoExpedidor: formData.orgaoExpedidor,
      sexo: formData.sexo,
      dataNascimento: formData.dataNascimento,
      naturalidade: formData.naturalidade,
      nacionalidade: formData.nacionalidade,
      telefoneCelular: formData.telefoneCelular,
      telefoneComercial: formData.telefoneComercial,
      email: formData.email,
      profissao: formData.profissao,
      estadoCivil: formData.estadoCivil
    };

    const endereco = {
      cep: formData.cep,
      logradouro: formData.logradouro,
      numero: formData.numero,
      complemento: formData.complemento,
      bairro: formData.bairro,
      cidade: formData.cidade,
      uf: formData.uf
    };

    const dadosConjuge = formData.estadoCivil === 'casado' || formData.estadoCivil === 'uniao-estavel' ? {
      nomeConjuge: formData.nomeConjuge,
      cpfConjuge: formData.cpfConjuge,
      rgConjuge: formData.rgConjuge,
      orgaoExpedidorConjuge: formData.orgaoExpedidorConjuge,
      sexoConjuge: formData.sexoConjuge,
      dataNascimentoConjuge: formData.dataNascimentoConjuge,
      naturalidadeConjuge: formData.naturalidadeConjuge,
      nacionalidadeConjuge: formData.nacionalidadeConjuge,
      telefoneCelularConjuge: formData.telefoneCelularConjuge,
      emailConjuge: formData.emailConjuge,
      profissaoConjuge: formData.profissaoConjuge
    } : null;

    const empreendimento = {
      empreendimento: formData.empreendimento
    };

    const unidade = {
      unidadeNumero: formData.unidadeNumero,
      valorImovel: formData.valorImovel,
      valorEntrada: formData.valorEntrada,
      valorFinanciar: formData.valorFinanciar
    };

    const documentos = {
      arquivos: uploadedFiles.map(file => ({
        name: file.name,
        type: file.type,
        category: file.category,
        size: file.size,
        hasBase64: !!file.base64
      })),
      pdfFilename,
      dataEnvio: new Date().toISOString()
    };

    // Query para inserir a proposta
    const query = `
      INSERT INTO propostas (
        dados_pessoais, endereco, dados_conjuge, empreendimento, 
        unidade, documentos, status, pdf_gerado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, created_at;
    `;

    const params = [
      JSON.stringify(dadosPessoais),
      JSON.stringify(endereco),
      dadosConjuge ? JSON.stringify(dadosConjuge) : null,
      JSON.stringify(empreendimento),
      JSON.stringify(unidade),
      JSON.stringify(documentos),
      'concluida',
      !!pdfFilename
    ];

    const result = await executeQuerySingle<{ id: string; created_at: string }>(query, params);
    
    if (!result) {
      throw new Error('Falha ao salvar proposta');
    }

    console.log(`✅ Proposta salva com ID: ${result.id}`);
    return result.id;

  } catch (error) {
    console.error('❌ Erro ao salvar proposta:', error);
    throw error;
  }
}

export async function buscarProposta(id: string): Promise<PropostaDB | null> {
  try {
    const query = 'SELECT * FROM propostas WHERE id = $1';
    const result = await executeQuerySingle<PropostaDB>(query, [id]);
    return result;
  } catch (error) {
    console.error('❌ Erro ao buscar proposta:', error);
    return null;
  }
}

export async function listarPropostas(limit: number = 10, offset: number = 0): Promise<PropostaDB[]> {
  try {
    const query = `
      SELECT * FROM propostas 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const results = await executeQuery<PropostaDB>(query, [limit, offset]);
    return results;
  } catch (error) {
    console.error('❌ Erro ao listar propostas:', error);
    return [];
  }
}

export async function deletarProposta(id: string): Promise<boolean> {
  try {
    const query = 'DELETE FROM propostas WHERE id = $1';
    await executeQuery(query, [id]);
    console.log(`✅ Proposta deletada: ${id}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar proposta:', error);
    return false;
  }
}

export async function contarPropostas(): Promise<number> {
  try {
    const query = 'SELECT COUNT(*) as total FROM propostas';
    const result = await executeQuerySingle<{ total: string }>(query);
    return parseInt(result?.total || '0');
  } catch (error) {
    console.error('❌ Erro ao contar propostas:', error);
    return 0;
  }
}