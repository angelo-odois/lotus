import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { buscarProposta } from '@/lib/database';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TEMPORÁRIO: Desabilitando verificação de autenticação para teste
    console.log('🟢 [DOWNLOAD] Modo de teste - pulando autenticação');

    const { id } = await params;
    console.log('📥 [DOWNLOAD] Iniciando download para proposta:', id);

    // Buscar a proposta no banco
    const proposta = await buscarProposta(id);
    if (!proposta) {
      console.log('❌ [DOWNLOAD] Proposta não encontrada:', id);
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      );
    }

    console.log('✅ [DOWNLOAD] Proposta encontrada:', proposta.dados_pessoais?.nome);
    console.log('📄 [DOWNLOAD] PDF gerado:', proposta.pdf_gerado);
    console.log('📁 [DOWNLOAD] Filename:', proposta.documentos?.pdfFilename);

    // Verificar se o PDF foi gerado
    if (!proposta.pdf_gerado) {
      console.log('❌ [DOWNLOAD] PDF não foi gerado para esta proposta');
      return NextResponse.json(
        { error: 'PDF não foi gerado para esta proposta' },
        { status: 404 }
      );
    }

    // Buscar o arquivo mais recente se não tiver filename específico
    let pdfFilename = proposta.documentos?.pdfFilename;
    if (!pdfFilename) {
      console.log('🔍 [DOWNLOAD] Buscando arquivo PDF mais recente...');
      const proposalsDir = path.join(process.cwd(), 'propostas');
      if (fs.existsSync(proposalsDir)) {
        const files = fs.readdirSync(proposalsDir)
          .filter(file => file.includes(proposta.dados_pessoais?.nome?.replace(/\s+/g, '-').toLowerCase() || 'proposta'))
          .filter(file => file.endsWith('.pdf'))
          .sort((a, b) => fs.statSync(path.join(proposalsDir, b)).mtime.getTime() - fs.statSync(path.join(proposalsDir, a)).mtime.getTime());

        if (files.length > 0) {
          pdfFilename = files[0];
          console.log('✅ [DOWNLOAD] Arquivo encontrado:', pdfFilename);
        }
      }
    }

    if (!pdfFilename) {
      console.log('❌ [DOWNLOAD] Nenhum arquivo PDF encontrado');
      return NextResponse.json(
        { error: 'Arquivo PDF não encontrado' },
        { status: 404 }
      );
    }

    const pdfPath = path.join(process.cwd(), 'propostas', pdfFilename);
    console.log('📁 [DOWNLOAD] Caminho do arquivo:', pdfPath);

    // Verificar se o arquivo existe
    if (!fs.existsSync(pdfPath)) {
      console.log('❌ [DOWNLOAD] Arquivo não existe no servidor:', pdfPath);
      return NextResponse.json(
        { error: 'Arquivo PDF não encontrado no servidor' },
        { status: 404 }
      );
    }

    // Ler o arquivo PDF
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log('✅ [DOWNLOAD] Arquivo lido, tamanho:', pdfBuffer.length, 'bytes');

    // Gerar nome amigável para download
    const nomeCliente = proposta.dados_pessoais?.nome || 'proposta';
    const nomeAmigavel = `proposta-${nomeCliente.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${id.slice(0, 8)}.pdf`;

    console.log('📥 [DOWNLOAD] Nome do arquivo para download:', nomeAmigavel);

    // Retornar o PDF para download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${nomeAmigavel}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('❌ Erro ao fazer download do PDF:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}