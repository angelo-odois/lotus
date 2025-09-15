import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { buscarProposta } from '@/lib/database';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Buscar a proposta no banco
    const proposta = await buscarProposta(id);
    if (!proposta) {
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o PDF foi gerado
    if (!proposta.pdf_gerado || !proposta.documentos?.pdfFilename) {
      return NextResponse.json(
        { error: 'PDF não foi gerado para esta proposta' },
        { status: 404 }
      );
    }

    const pdfFilename = proposta.documentos.pdfFilename;
    const pdfPath = path.join(process.cwd(), 'propostas', pdfFilename);

    // Verificar se o arquivo existe
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        { error: 'Arquivo PDF não encontrado no servidor' },
        { status: 404 }
      );
    }

    // Ler o arquivo PDF
    const pdfBuffer = fs.readFileSync(pdfPath);

    // Retornar o PDF como response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${pdfFilename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('❌ Erro ao servir PDF:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}