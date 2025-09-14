import { NextRequest, NextResponse } from 'next/server';
import { FormData } from '@/types/form';
import fs from 'fs';
import path from 'path';
import { salvarProposta, initializeDatabase, type FileUpload } from '@/lib/database';

async function getPuppeteerInstance(): Promise<any> {
  const isDocker = fs.existsSync('/.dockerenv');
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
  
  console.log('🔍 Detectando ambiente:', {
    isDocker,
    isVercel,
    NODE_ENV: process.env.NODE_ENV
  });
  
  // Docker environment (Coolify)
  if (isDocker) {
    console.log('🐳 Ambiente Docker - usando Chromium');
    const puppeteer = await import('puppeteer');
    
    return await puppeteer.default.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process'
      ]
    });
  }
  
  // Vercel serverless environment
  if (isVercel) {
    console.log('🌐 Ambiente serverless - usando puppeteer-core');
    const puppeteerCore = await import('puppeteer-core');
    const chromium = await import('@sparticuz/chromium');
    
    return await puppeteerCore.default.launch({
      args: chromium.default.args,
      executablePath: await chromium.default.executablePath(),
      headless: true
    });
  }
  
  // Ambiente local - configuração simples
  console.log('🏠 Ambiente local - usando Puppeteer padrão');
  const puppeteer = await import('puppeteer');
  
  return await puppeteer.default.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
}


export async function POST(request: NextRequest) {
  console.log('🚀 Iniciando processamento da proposta...');
  
  try {
    // Inicializar banco se necessário
    await initializeDatabase();
    
    const body = await request.json();
    const formData: FormData = body;
    const uploadedFiles: FileUpload[] = body.documentos || [];
    
    console.log('📄 Processando proposta...', { 
      nome: formData.nome, 
      documentos: uploadedFiles.length 
    });

    // Gerar PDF com Puppeteer
    const pdfBuffer = await generatePDFWithPuppeteer(formData, uploadedFiles);
    
    // Salvar PDF para download
    const filename = `proposta-lotus-${formData.nome?.replace(/\s+/g, '-').toLowerCase() || 'cliente'}-${Date.now()}.pdf`;
    const filepath = await savePDF(pdfBuffer, filename);
    
    console.log('✅ PDF gerado, salvando no banco...');
    
    // Salvar dados no PostgreSQL
    const propostaId = await salvarProposta(formData, uploadedFiles, filename);
    
    console.log(`✅ Proposta processada: PDF gerado e dados salvos (ID: ${propostaId})`);
    
    return NextResponse.json({
      success: true,
      message: 'Proposta processada com sucesso',
      filename,
      downloadUrl: `/api/download-pdf/${filename}`,
      propostaId
    });

  } catch (error) {
    console.error('❌ Erro na API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao gerar PDF',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

interface UploadedFile {
  name: string;
  type: string;
  base64?: string;
  category?: string;
  pdfImages?: string[];
}

async function generatePDFWithPuppeteer(formData: FormData, uploadedFiles: UploadedFile[] = []): Promise<Buffer> {
  console.log('🔄 Iniciando Puppeteer...');
  
  let browser;
  try {
    browser = await getPuppeteerInstance();
    const page = await browser.newPage();
    
    // Configurações simples e confiáveis
    await page.setViewport({ width: 800, height: 1200 });
    
    console.log('📄 Gerando HTML...');
    const html = generatePropostaHTML(formData, uploadedFiles);
    console.log('📏 HTML tamanho:', html.length, 'caracteres');
    
    console.log('🌐 Carregando HTML no navegador...');
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    console.log('📄 Gerando PDF...');
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

    console.log('✅ PDF gerado, tamanho:', pdfBuffer.length, 'bytes');
    return Buffer.from(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Erro no Puppeteer:', error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.warn('⚠️ Erro ao fechar browser:', closeError);
      }
    }
  }
}



function generatePropostaHTML(formData: FormData, uploadedFiles: UploadedFile[] = []): string {
  const currentDate = new Date();
  const numeroProsposta = `LP${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}${String(currentDate.getHours()).padStart(2, '0')}${String(currentDate.getMinutes()).padStart(2, '0')}`;
  
  const enderecoCompleto = `${formData.logradouro || ''} ${formData.numero || ''} ${formData.complemento || ''}`.trim();
  const isMarriedOrUnion = formData.estadoCivil === 'casado' || formData.estadoCivil === 'uniao-estavel';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body { 
      font-family: Arial, sans-serif; 
      font-size: 11px; 
      line-height: 1.4;
      color: #000;
      background: #fff;
    }
    
    .container {
      width: 100%;
      max-width: 100%;
    }
    
    .header {
      background: #FFC629;
      padding: 25px;
      text-align: center;
      border: 2px solid #E6B324;
      margin-bottom: 20px;
    }
    
    .header h1 { 
      font-size: 22px; 
      font-weight: bold; 
      text-transform: uppercase;
      color: #000;
      margin-bottom: 10px;
    }
    
    .header .number {
      background: #000;
      color: #FFC629;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 12px;
      display: inline-block;
    }
    
    .content { 
      padding: 0; 
    }
    
    .section { 
      margin-bottom: 25px; 
      border: 1px solid #ddd;
      padding: 15px;
      background: #fafafa;
    }
    
    .section-title { 
      background: #FFC629;
      font-weight: bold; 
      font-size: 13px;
      padding: 8px 16px; 
      text-align: center;
      text-transform: uppercase;
      color: #000;
      margin-bottom: 15px;
      border: 1px solid #E6B324;
    }
    
    .form-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .form-table td {
      padding: 6px 8px;
      vertical-align: top;
      border-bottom: 1px solid #eee;
    }
    
    .form-label { 
      font-weight: bold; 
      color: #333;
      text-transform: uppercase;
      font-size: 9px;
      width: 120px;
      white-space: nowrap;
    }
    
    .form-value { 
      border-bottom: 1px solid #FFC629;
      padding: 2px 0;
      color: #000;
      font-weight: normal;
      font-size: 11px;
      min-height: 16px;
    }
    
    .values-section {
      background: #f8f9fa;
      border: 2px solid #10B981;
      padding: 15px;
      margin: 20px 0;
    }
    
    .values-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .values-table td {
      padding: 8px;
      border-bottom: 1px solid #ddd;
    }
    
    .values-table tr:last-child td {
      border-bottom: 2px solid #10B981;
      font-weight: bold;
      font-size: 12px;
      background: #e8f5e8;
    }
    
    .value-label { 
      font-weight: bold; 
      color: #333; 
      width: 60%;
    }
    
    .value-amount { 
      font-weight: bold; 
      color: #10B981; 
      text-align: right;
      font-size: 12px;
    }
    
    .document-section {
      margin-top: 30px;
      page-break-before: always;
    }
    
    .document-item {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .document-item:not(:first-child) {
      page-break-before: always;
    }
    
    .document-content {
      text-align: center;
    }
    
    .document-image {
      width: 100%;
      max-width: 100%;
      height: auto;
      border: none;
      margin: 0;
      display: block;
    }
    
    .document-page {
      margin-bottom: 15px;
      page-break-inside: avoid;
    }
    
    .page-number {
      font-size: 11px;
      color: #666;
      margin-bottom: 8px;
      font-weight: bold;
    }
    
    .pdf-placeholder {
      padding: 30px;
      background: #f8f9fa;
      border: 1px dashed #ccc;
      text-align: center;
    }
    
    .signatures {
      margin-top: 50px;
      display: table;
      width: 100%;
    }
    
    .signature-row {
      display: table-row;
    }
    
    .signature-cell {
      display: table-cell;
      text-align: center;
      width: 50%;
      padding: 0 20px;
    }
    
    .signature-line {
      border-top: 2px solid #000;
      height: 60px;
      margin-bottom: 8px;
    }
    
    .signature-label {
      font-weight: bold;
      font-size: 10px;
      text-transform: uppercase;
    }
    
    .date-footer {
      text-align: center;
      margin: 30px 0;
      font-weight: bold;
      font-size: 12px;
      padding: 10px;
      background: #f8f9fa;
      border: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Proposta de Compra</h1>
      <div class="number">Nº ${numeroProsposta}</div>
    </div>
    
    <div class="content">
      <!-- Dados Pessoais -->
      <div class="section">
        <div class="section-title">DADOS DO CLIENTE</div>
        <table class="form-table">
          <tr>
            <td class="form-label">NOME/1º PROPONENTE:</td>
            <td class="form-value">${formData.nome || ''}</td>
          </tr>
          <tr>
            <td class="form-label">CPF/CNPJ:</td>
            <td class="form-value">${formData.cpfCnpj || ''}</td>
          </tr>
          <tr>
            <td class="form-label">RG/INS. EST.:</td>
            <td class="form-value">${formData.rgInsEst || ''}</td>
          </tr>
          <tr>
            <td class="form-label">ÓRGÃO EXPEDIDOR:</td>
            <td class="form-value">${formData.orgaoExpedidor || ''}</td>
          </tr>
          <tr>
            <td class="form-label">SEXO:</td>
            <td class="form-value">${formData.sexo === 'masculino' ? 'Masculino' : formData.sexo === 'feminino' ? 'Feminino' : ''}</td>
          </tr>
          <tr>
            <td class="form-label">DATA NASCIMENTO:</td>
            <td class="form-value">${formData.dataNascimento ? new Date(formData.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR') : ''}</td>
          </tr>
          <tr>
            <td class="form-label">NATURALIDADE:</td>
            <td class="form-value">${formData.naturalidade || ''}</td>
          </tr>
          <tr>
            <td class="form-label">NACIONALIDADE:</td>
            <td class="form-value">${formData.nacionalidade || ''}</td>
          </tr>
          <tr>
            <td class="form-label">TELEFONE:</td>
            <td class="form-value">${formData.telefoneCelular || ''}</td>
          </tr>
          <tr>
            <td class="form-label">EMAIL:</td>
            <td class="form-value">${formData.email || ''}</td>
          </tr>
          <tr>
            <td class="form-label">PROFISSÃO:</td>
            <td class="form-value">${formData.profissao || ''}</td>
          </tr>
          <tr>
            <td class="form-label">ENDEREÇO:</td>
            <td class="form-value">${enderecoCompleto}, ${formData.bairro || ''}, ${formData.cidade || ''} - ${formData.uf || ''}</td>
          </tr>
          <tr>
            <td class="form-label">ESTADO CIVIL:</td>
            <td class="form-value">${formData.estadoCivil || ''}</td>
          </tr>
        </table>
      </div>

      ${isMarriedOrUnion ? `
      <!-- Cônjuge -->
      <div class="section">
        <div class="section-title">CÔNJUGE/2º PROPONENTE</div>
        <table class="form-table">
          <tr>
            <td class="form-label">NOME CÔNJUGE:</td>
            <td class="form-value">${formData.nomeConjuge || ''}</td>
          </tr>
          <tr>
            <td class="form-label">CPF CÔNJUGE:</td>
            <td class="form-value">${formData.cpfConjuge || ''}</td>
          </tr>
          <tr>
            <td class="form-label">RG CÔNJUGE:</td>
            <td class="form-value">${formData.rgConjuge || ''}</td>
          </tr>
          <tr>
            <td class="form-label">ÓRGÃO EXPEDIDOR:</td>
            <td class="form-value">${formData.orgaoExpedidorConjuge || ''}</td>
          </tr>
          <tr>
            <td class="form-label">SEXO:</td>
            <td class="form-value">${formData.sexoConjuge === 'masculino' ? 'Masculino' : formData.sexoConjuge === 'feminino' ? 'Feminino' : ''}</td>
          </tr>
          <tr>
            <td class="form-label">DATA NASCIMENTO:</td>
            <td class="form-value">${formData.dataNascimentoConjuge ? new Date(formData.dataNascimentoConjuge + 'T00:00:00').toLocaleDateString('pt-BR') : ''}</td>
          </tr>
          <tr>
            <td class="form-label">NATURALIDADE:</td>
            <td class="form-value">${formData.naturalidadeConjuge || ''}</td>
          </tr>
          <tr>
            <td class="form-label">NACIONALIDADE:</td>
            <td class="form-value">${formData.nacionalidadeConjuge || ''}</td>
          </tr>
          <tr>
            <td class="form-label">TELEFONE:</td>
            <td class="form-value">${formData.telefoneCelularConjuge || ''}</td>
          </tr>
          <tr>
            <td class="form-label">PROFISSÃO:</td>
            <td class="form-value">${formData.profissaoConjuge || ''}</td>
          </tr>
        </table>
      </div>
      ` : ''}

      <!-- Dados do Imóvel -->
      <div class="section">
        <div class="section-title">DADOS DO IMÓVEL</div>
        <table class="form-table">
          <tr>
            <td class="form-label">EMPREENDIMENTO:</td>
            <td class="form-value">${formData.empreendimento || ''}</td>
          </tr>
          <tr>
            <td class="form-label">INCORPORADORA:</td>
            <td class="form-value">LOTUS CIDADE</td>
          </tr>
          <tr>
            <td class="form-label">UNIDADE Nº:</td>
            <td class="form-value">${formData.unidadeNumero || ''}</td>
          </tr>
          <tr>
            <td class="form-label">CIDADE:</td>
            <td class="form-value">Brasília-DF</td>
          </tr>
        </table>
      </div>

      <!-- Valores -->
      <div class="section">
        <div class="section-title">VALORES DA PROPOSTA</div>
        <div class="values-section">
          <table class="values-table">
            <tr>
              <td class="value-label">(A) VALOR DA PROPOSTA:</td>
              <td class="value-amount">R$ ${formData.valorImovel || '0,00'}</td>
            </tr>
            <tr>
              <td class="value-label">(B) VALOR DE ENTRADA:</td>
              <td class="value-amount">R$ ${formData.valorEntrada || '0,00'}</td>
            </tr>
            <tr>
              <td class="value-label">(C) VALOR A FINANCIAR:</td>
              <td class="value-amount">R$ ${formData.valorFinanciar || '0,00'}</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="date-footer">
        Brasília-DF, ${currentDate.toLocaleDateString('pt-BR')}
      </div>

      <div class="signatures">
        <div class="signature-row">
          <div class="signature-cell">
            <div class="signature-line"></div>
            <div class="signature-label">Proponente(s) Comprador(es)</div>
          </div>
          <div class="signature-cell">
            <div class="signature-line"></div>
            <div class="signature-label">CORRETOR RESPONSÁVEL</div>
          </div>
        </div>
      </div>

      ${uploadedFiles && uploadedFiles.length > 0 ? `
      <!-- Documentos Anexados -->
      <div class="document-section">
        ${uploadedFiles.map((doc: UploadedFile) => `
          <div class="document-item">
            <div class="document-content">
              ${(() => {
                // Se for imagem, mostrar imagem em tamanho grande
                if (doc.base64 && doc.type && (doc.type.includes('image') || doc.type.includes('jpeg') || doc.type.includes('jpg') || doc.type.includes('png'))) {
                  return `<img src="${doc.base64}" alt="${doc.name}" class="document-image">`;
                }
                
                // Se for PDF e tiver imagens convertidas, mostrar as imagens
                if (doc.type && doc.type.includes('pdf') && doc.pdfImages && doc.pdfImages.length > 0) {
                  return doc.pdfImages.map((pageImage: string, pageIndex: number) => `
                    <div class="document-page">
                      <div class="page-number">Página ${pageIndex + 1} de ${doc.pdfImages?.length || 0}</div>
                      <img src="${pageImage}" alt="${doc.name} - Página ${pageIndex + 1}" class="document-image">
                    </div>
                  `).join('');
                }
                
                // Fallback mínimo para PDFs sem conversão
                if (doc.type && doc.type.includes('pdf')) {
                  return `
                    <div style="text-align: center; padding: 40px; background: #f8f9fa;">
                      <div style="font-size: 64px; margin-bottom: 15px;">📄</div>
                      <div style="font-weight: bold; font-size: 14px;">${doc.name}</div>
                      <div style="color: #666; font-size: 11px; margin-top: 8px;">Documento PDF anexado</div>
                    </div>
                  `;
                }
                
                return '';
              })()}
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>`;
}

async function savePDF(pdfBuffer: Buffer, filename: string): Promise<string> {
  const proposalsDir = path.join(process.cwd(), 'propostas');
  
  // Criar diretório se não existir
  if (!fs.existsSync(proposalsDir)) {
    fs.mkdirSync(proposalsDir, { recursive: true });
  }
  
  const filepath = path.join(proposalsDir, filename);
  fs.writeFileSync(filepath, pdfBuffer);
  
  console.log(`📄 PDF salvo: ${filepath}`);
  return filepath;
}

