import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  try {
    // TEMPORÁRIO: Desabilitando autenticação para teste
    // const auth = getAuthFromRequest(request);
    // if (!auth) {
    //   return NextResponse.json(
    //     { error: 'Não autorizado' },
    //     { status: 401 }
    //   );
    // }

    const { id, filename } = await params;
    
    // Sanitizar nome do arquivo para segurança
    const safeFilename = filename.replace(/\.\./g, '').replace(/[\/\\]/g, '');
    const filePath = path.join(process.cwd(), 'documentos', id, safeFilename);
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o caminho está dentro do diretório de documentos (segurança)
    const documentsDir = path.join(process.cwd(), 'documentos');
    if (!filePath.startsWith(documentsDir)) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Ler o arquivo
    const fileBuffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);
    
    // Determinar tipo MIME baseado na extensão
    const ext = path.extname(safeFilename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
    }

    // Verificar se é para download
    const { searchParams } = new URL(request.url);
    const forceDownload = searchParams.get('download') === '1';
    
    // Retornar arquivo
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': forceDownload 
          ? `attachment; filename="${safeFilename}"` 
          : `inline; filename="${safeFilename}"`,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    });

  } catch (error) {
    console.error('❌ Erro ao servir documento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}