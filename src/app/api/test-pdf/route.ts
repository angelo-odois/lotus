import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  try {
    console.log('🧪 Testando geração de PDF...');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 1200 });
    
    // HTML simples para teste
    const simpleHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            color: #333; 
          }
          .header { 
            background: #FFC629; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px; 
            margin-bottom: 20px;
          }
          .section { 
            margin: 20px 0; 
            padding: 15px; 
            border: 1px solid #ddd; 
            border-radius: 8px; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>TESTE PROPOSTA LOTUS</h1>
          <p>Documento de teste para verificar PDF</p>
        </div>
        
        <div class="section">
          <h2>Dados do Cliente</h2>
          <p><strong>Nome:</strong> Angelo Pimentel (Teste)</p>
          <p><strong>CPF:</strong> 123.456.789-00</p>
          <p><strong>Email:</strong> teste@lotus.com</p>
        </div>
        
        <div class="section">
          <h2>Dados do Imóvel</h2>
          <p><strong>Empreendimento:</strong> HAYA</p>
          <p><strong>Unidade:</strong> 1502</p>
          <p><strong>Valor:</strong> R$ 450.000,00</p>
        </div>
        
        <div class="section">
          <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          <p><strong>Horário:</strong> ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </body>
      </html>
    `;
    
    console.log('📄 HTML de teste criado');
    
    await page.setContent(simpleHTML, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        bottom: '20mm', 
        left: '15mm',
        right: '15mm'
      },
      printBackground: true
    });

    await browser.close();
    
    console.log('✅ PDF teste gerado, tamanho:', pdfBuffer.length, 'bytes');
    
    // Retornar PDF para download direto
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="teste-pdf-${Date.now()}.pdf"`
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no teste PDF:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar PDF de teste', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}