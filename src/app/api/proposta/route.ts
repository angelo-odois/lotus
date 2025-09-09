import { NextRequest, NextResponse } from 'next/server';
import { FormData } from '@/types/form';
import { config } from '@/config';
import fs from 'fs';
import path from 'path';
import os from 'os';

const whatsappConfig = {
  url: process.env.WAHA_URL || config.whatsapp.url,
  apiKey: process.env.WAHA_API_KEY || config.whatsapp.apiKey,
  phone: process.env.WHATSAPP_PHONE || config.whatsapp.phone,
  session: process.env.WHATSAPP_SESSION || config.whatsapp.session
};

async function getPuppeteerInstance(): Promise<any> {
  const isDocker = fs.existsSync('/.dockerenv');
  const isVercel = process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  // Docker environment (Coolify)
  if (isDocker) {
    console.log('🐳 Detectado ambiente Docker - usando Chromium do sistema');
    
    const puppeteer = await import('puppeteer');
    
    // Caminhos possíveis do Chromium no Docker
    const possibleChromePaths = [
      process.env.PUPPETEER_EXECUTABLE_PATH,
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser', 
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome'
    ].filter(Boolean);
    
    let chromePath = possibleChromePaths[0];
    
    // Verificar qual caminho existe
    for (const path of possibleChromePaths) {
      if (path && fs.existsSync(path)) {
        chromePath = path;
        console.log(`🔍 Chromium encontrado em: ${chromePath}`);
        break;
      }
    }
    
    return await puppeteer.default.launch({
      executablePath: chromePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=VizDisplayCompositor'
      ]
    });
  }
  
  // Vercel serverless environment
  if (isVercel) {
    console.log('🌐 Detectado ambiente serverless (Vercel/AWS) - usando puppeteer-core + chromium');
    
    try {
      const puppeteerCore = await import('puppeteer-core');
      const chromium = await import('@sparticuz/chromium');
      
      const browser = await puppeteerCore.default.launch({
        args: [
          ...chromium.default.args,
          '--hide-scrollbars',
          '--disable-web-security'
        ],
        executablePath: await chromium.default.executablePath(),
        headless: true,
      });
      
      return browser;
    } catch (error) {
      console.error('❌ Erro ao carregar puppeteer-core + chromium:', error);
      throw new Error(`Falha ao inicializar browser no ambiente serverless: ${error}`);
    }
  }
  
  // Ambiente local - usar puppeteer normal
  console.log('🏠 Ambiente local - usando puppeteer padrão');
  const puppeteer = await import('puppeteer');
  
  return await puppeteer.default.launch(await getBrowserConfigLocal());
}

async function getBrowserConfigLocal(): Promise<any> {
  // Ambiente local - usar Chrome instalado
  const homeDir = os.homedir();
  const possiblePaths = [
    // Puppeteer cache paths
    path.join(homeDir, '.cache/puppeteer/chrome/mac_arm-140.0.7339.80/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'),
    path.join(homeDir, '.cache/puppeteer/chrome/mac_arm-121.0.6167.85/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'),
    // System Chrome paths
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // Linux paths
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium'
  ];

  for (const chromePath of possiblePaths) {
    if (fs.existsSync(chromePath)) {
      console.log(`✅ Chrome encontrado em: ${chromePath}`);
      return {
        executablePath: chromePath,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
        headless: true
      };
    }
  }

  console.log('⚠️ Chrome não encontrado, usando padrão do Puppeteer');
  return {
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  };
}

export async function POST(request: NextRequest) {
  console.log('🚀 Iniciando processamento da proposta...');
  
  try {
    const body = await request.json();
    const formData: FormData = body;
    const uploadedFiles = body.documentos || [];
    
    console.log('📄 Gerando PDF no servidor...', { 
      nome: formData.nome, 
      documentos: uploadedFiles.length 
    });

    // Gerar PDF com Puppeteer (muito mais confiável)
    const pdfBuffer = await generatePDFWithPuppeteer(formData, uploadedFiles);
    
    // Salvar PDF
    const filename = `proposta-lotus-${formData.nome?.replace(/\s+/g, '-').toLowerCase() || 'cliente'}-${Date.now()}.pdf`;
    const filepath = await savePDF(pdfBuffer, filename);
    
    // Enviar via WhatsApp
    await sendWhatsAppNotification(formData, filepath);
    
    console.log('✅ Proposta processada com sucesso');
    
    return NextResponse.json({
      success: true,
      message: 'Proposta gerada e enviada com sucesso',
      filename,
      filepath
    });

  } catch (error) {
    console.error('❌ Erro na API:', error);
    
    // Log mais detalhado do erro
    if (error instanceof Error) {
      console.error('❌ Stack trace:', error.stack);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
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
  
  // Processar PDFs anexados para converter em imagens
  const processedFiles = await Promise.all(
    uploadedFiles.map(async (doc: UploadedFile) => {
      if (doc.type && doc.type.includes('pdf') && doc.base64) {
        console.log(`🔄 Convertendo PDF anexado: ${doc.name}`);
        try {
          const images = await convertPDFToImages(doc.base64);
          return { ...doc, pdfImages: images };
        } catch (error) {
          console.error(`❌ Erro ao converter ${doc.name}:`, error);
          return doc;
        }
      }
      return doc;
    })
  );
  
  const browser = await getPuppeteerInstance();
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 1200 });
    
    console.log('📄 Gerando HTML...');
    console.log('📎 Documentos processados:', processedFiles.map(doc => ({
      name: doc.name,
      type: doc.type,
      category: doc.category,
      hasBase64: !!doc.base64,
      hasPdfImages: !!doc.pdfImages,
      pdfImagesCount: doc.pdfImages?.length || 0
    })));
    
    const html = generatePropostaHTML(formData, processedFiles);
    console.log('📏 HTML tamanho:', html.length, 'caracteres');
    
    // Debug: salvar HTML para verificar
    const htmlPath = path.join(process.cwd(), 'debug-proposta.html');
    fs.writeFileSync(htmlPath, html);
    console.log('🐛 HTML salvo para debug:', htmlPath);
    
    console.log('🌐 Carregando HTML no navegador...');
    await page.setContent(html, { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    console.log('📄 Gerando PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        bottom: '20mm', 
        left: '15mm',
        right: '15mm'
      },
      printBackground: true,
      preferCSSPageSize: false
    });

    console.log('✅ PDF gerado, tamanho:', pdfBuffer.length, 'bytes');
    return Buffer.from(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Erro no Puppeteer:', error);
    throw error;
  } finally {
    await browser.close();
  }
}


async function convertPDFToImages(base64PDF: string): Promise<string[]> {
  let browser: any = null;
  try {
    console.log('🔄 Convertendo PDF para imagens...');
    
    // Remover prefixo data: se existir
    const pdfData = base64PDF.startsWith('data:') ? base64PDF.split(',')[1] : base64PDF;
    
    browser = await getPuppeteerInstance();
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600 });
    
    // Criar um HTML que carrega o PDF
    const pdfHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <style>
          body { 
            margin: 0; 
            padding: 30px; 
            background: white; 
            font-family: Arial, sans-serif;
          }
          .page { 
            margin-bottom: 30px; 
            text-align: center; 
            background: white;
            padding: 20px;
          }
          canvas { 
            border: none; 
            width: 100%;
            max-width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        <div id="pdf-container"></div>
        <script>
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          
          async function renderPDF() {
            try {
              const pdfData = '${pdfData}';
              const binaryString = atob(pdfData);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              
              const pdf = await pdfjsLib.getDocument(bytes).promise;
              const container = document.getElementById('pdf-container');
              
              const maxPages = Math.min(pdf.numPages, 3);
              console.log('PDF Pages:', pdf.numPages, 'Rendering:', maxPages);
              
              for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 3.0 }); // Aumentar escala para melhor qualidade
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({
                  canvasContext: context,
                  viewport: viewport
                }).promise;
                
                const pageDiv = document.createElement('div');
                pageDiv.className = 'page';
                pageDiv.appendChild(canvas);
                container.appendChild(pageDiv);
              }
              
              window.pdfRendered = true;
            } catch (error) {
              console.error('Erro no PDF:', error);
              document.getElementById('pdf-container').innerHTML = '<div>Erro ao processar PDF</div>';
              window.pdfRendered = true;
            }
          }
          
          renderPDF().catch(console.error);
        </script>
      </body>
      </html>
    `;
    
    await page.setContent(pdfHTML);
    await page.waitForFunction(() => (window as unknown as { pdfRendered: boolean }).pdfRendered, { timeout: 30000 });
    
    // Capturar como imagem
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true
    });
    
    if (browser) {
      await browser.close();
    }
    
    // Converter screenshot para base64
    const base64Image = `data:image/png;base64,${Buffer.from(screenshot).toString('base64')}`;
    
    console.log('✅ PDF convertido para imagem');
    return [base64Image];
    
  } catch (error) {
    console.error('❌ Erro ao converter PDF:', error);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('❌ Erro ao fechar browser:', closeError);
      }
    }
    return [];
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
            <td class="form-value">${formData.empreendimento ? config.empreendimentos[formData.empreendimento as keyof typeof config.empreendimentos] : ''}</td>
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

async function sendWhatsAppNotification(formData: FormData, filepath: string) {
  try {
    const cliente = formData.nome || 'Cliente';
    const empreendimento = formData.empreendimento || 'Empreendimento';
    const unidade = formData.unidadeNumero || 'N/A';
    const valorImovel = formData.valorImovel || 'N/A';
    
    const mensagem = `🏠 *NOVA PROPOSTA DE COMPRA - LOTUS*\n\n` +
      `👤 *Cliente:* ${cliente}\n` +
      `🏢 *Empreendimento:* ${empreendimento.toUpperCase()}\n` +
      `🏠 *Unidade:* ${unidade}\n` +
      `💰 *Valor:* R$ ${valorImovel}\n` +
      `📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}\n\n` +
      `📄 *PDF da proposta anexado!*\n` +
      `✅ *Status:* Aguardando análise`;

    console.log('📱 Enviando mensagem WhatsApp...');

    // Enviar mensagem
    const textResponse = await fetch(`${whatsappConfig.url}/api/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': whatsappConfig.apiKey,
      },
      body: JSON.stringify({
        session: whatsappConfig.session,
        chatId: `${whatsappConfig.phone}@c.us`,
        text: mensagem
      })
    });

    if (!textResponse.ok) {
      const errorText = await textResponse.text();
      console.error('❌ Erro texto WhatsApp:', textResponse.status, errorText);
      throw new Error(`Erro ao enviar mensagem: ${textResponse.status}`);
    }

    console.log('✅ Mensagem WhatsApp enviada');

    // Ler o PDF do arquivo salvo para garantir integridade
    console.log('📎 Lendo PDF do arquivo para WhatsApp...');
    const savedPdfBuffer = fs.readFileSync(filepath);
    
    console.log('📊 PDF do arquivo info:', {
      length: savedPdfBuffer.length,
      isBuffer: Buffer.isBuffer(savedPdfBuffer),
      filename: path.basename(filepath)
    });

    // Verificar cabeçalho do PDF salvo
    const pdfHeader = savedPdfBuffer.subarray(0, 4).toString('ascii');
    console.log('📄 PDF Header do arquivo:', pdfHeader);
    
    if (pdfHeader !== '%PDF') {
      console.error('❌ PDF salvo é inválido. Header:', pdfHeader);
      console.log('📊 Primeiros 20 bytes:', Array.from(savedPdfBuffer.subarray(0, 20)));
      throw new Error(`PDF salvo é inválido - cabeçalho: ${pdfHeader}`);
    }

    // Converter para base64
    const base64PDF = savedPdfBuffer.toString('base64');
    console.log('📊 Base64 info:', {
      length: base64PDF.length,
      firstChars: base64PDF.substring(0, 20)
    });

    console.log('📤 Enviando PDF via WhatsApp...');
    
    const fileResponse = await fetch(`${whatsappConfig.url}/api/sendFile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': whatsappConfig.apiKey,
      },
      body: JSON.stringify({
        session: whatsappConfig.session,
        chatId: `${whatsappConfig.phone}@c.us`,
        file: {
          mimetype: 'application/pdf',
          filename: path.basename(filepath),
          data: base64PDF
        },
        caption: `📄 Proposta de compra - ${cliente}`
      })
    });

    if (!fileResponse.ok) {
      const errorText = await fileResponse.text();
      console.error('❌ Erro arquivo WhatsApp:', fileResponse.status, errorText);
      throw new Error(`Erro ao enviar PDF: ${fileResponse.status} - ${errorText}`);
    }

    const fileResult = await fileResponse.json();
    console.log('✅ PDF WhatsApp enviado:', fileResult);
    
  } catch (error) {
    console.error('❌ Erro geral WhatsApp:', error);
    
    // Se falhou, pelo menos enviar mensagem informando
    try {
      console.log('🔄 Tentando enviar apenas mensagem de fallback...');
      const fallbackMessage = `❌ *PROPOSTA LOTUS - ERRO NO PDF*\n\n` +
        `👤 *Cliente:* ${formData.nome || 'Cliente'}\n` +
        `📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}\n\n` +
        `⚠️ *Houve um problema no envio do PDF*\n` +
        `📧 *PDF foi salvo no servidor para envio posterior*`;
      
      await fetch(`${whatsappConfig.url}/api/sendText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': whatsappConfig.apiKey,
        },
        body: JSON.stringify({
          session: whatsappConfig.session,
          chatId: `${whatsappConfig.phone}@c.us`,
          text: fallbackMessage
        })
      });
      
      console.log('📱 Mensagem de fallback enviada');
    } catch (fallbackError) {
      console.error('❌ Erro no fallback também:', fallbackError);
    }
    
    // Não fazer throw para não quebrar o processo todo
    console.log('⚠️ Continuando sem envio de PDF via WhatsApp');
  }
}