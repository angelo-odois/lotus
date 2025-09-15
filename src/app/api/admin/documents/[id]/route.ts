import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Verificar se a pasta da proposta existe
    const documentsDir = path.join(process.cwd(), 'documentos', id);
    if (!fs.existsSync(documentsDir)) {
      return NextResponse.json(
        { error: 'Pasta de documentos não encontrada' },
        { status: 404 }
      );
    }

    // Listar arquivos na pasta
    const files = fs.readdirSync(documentsDir);
    const documentsList = files.map(filename => {
      const filePath = path.join(documentsDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        downloadUrl: `/api/admin/documents/${id}/${filename}`
      };
    });

    return NextResponse.json({
      propostaId: id,
      documents: documentsList,
      total: documentsList.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar documentos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}