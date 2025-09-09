import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filepath = path.join(process.cwd(), 'propostas', filename);
    
    // Verificar se arquivo existe
    if (!fs.existsSync(filepath)) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      );
    }

    // Ler arquivo
    const pdfBuffer = fs.readFileSync(filepath);
    
    // Retornar PDF para download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('❌ Erro no download:', error);
    return NextResponse.json(
      { error: 'Erro ao baixar arquivo' },
      { status: 500 }
    );
  }
}