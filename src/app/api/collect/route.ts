import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, initializeTables } from '@/lib/postgres';
import { FormData } from '@/types/form';

// API simplificada para coleta de dados do formulário
export async function POST(request: NextRequest) {
  try {
    console.log('📝 Recebendo dados do formulário...');
    
    // Garantir que as tabelas existem
    await initializeTables();
    
    const formData: FormData = await request.json();
    
    // Validar dados básicos
    if (!formData.dadosPessoais?.nomeCompleto) {
      return NextResponse.json(
        { error: 'Nome completo é obrigatório' },
        { status: 400 }
      );
    }

    // Inserir no PostgreSQL
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
      RETURNING id, created_at;
    `;

    const result = await executeQuery(query, [
      JSON.stringify(formData.dadosPessoais),
      JSON.stringify(formData.endereco || {}),
      JSON.stringify(formData.dadosConjuge || {}),
      JSON.stringify(formData.empreendimento || {}),
      JSON.stringify(formData.unidade || {}),
      JSON.stringify(formData.documentos || {}),
      'enviado'
    ]);

    const proposta = result[0];
    
    console.log(`✅ Proposta salva com ID: ${proposta.id}`);
    
    return NextResponse.json({
      success: true,
      proposalId: proposta.id,
      message: 'Proposta enviada com sucesso!',
      timestamp: proposta.created_at
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erro ao salvar proposta:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: 'Não foi possível salvar a proposta'
      },
      { status: 500 }
    );
  }
}