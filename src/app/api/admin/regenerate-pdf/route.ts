import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/postgres';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

// Importar funções necessárias do route.ts principal
async function getPuppeteerInstance(): Promise<any> {
  const isDocker = fs.existsSync('/.dockerenv');
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

  console.log('🔍 Detectando ambiente:', {
    isDocker,
    isVercel,
    NODE_ENV: process.env.NODE_ENV
  });

  // Docker environment (Coolify) - Configuração ultra robusta
  if (isDocker) {
    console.log('🐳 Ambiente Docker - configuração ultra robusta para Coolify');
    const puppeteer = await import('puppeteer');

    return await puppeteer.default.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      headless: true,
      devtools: false,
      ignoreDefaultArgs: ['--disable-extensions', '--enable-automation'],
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor,TranslateUI,BlinkGenPropertyTrees',
        '--run-all-compositor-stages-before-draw',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-ipc-flooding-protection',
        '--disable-client-side-phishing-detection',
        '--disable-default-apps',
        '--disable-hang-monitor',
        '--disable-prompt-on-repost',
        '--disable-sync',
        '--disable-background-networking',
        '--disable-breakpad',
        '--disable-component-update',
        '--disable-domain-reliability',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-default-apps',
        '--disable-software-rasterizer',
        '--disable-background-timer-throttling',
        '--metrics-recording-only',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--password-store=basic',
        '--use-mock-keychain',
        '--disable-field-trial-config',
        '--disable-back-forward-cache',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=ScriptStreaming',
        '--aggressive-cache-discard',
        '--memory-pressure-off',
        '--max_old_space_size=4096'
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

  // Ambiente local - configuração ultra-estável
  console.log('🏠 Ambiente local - configuração ultra-estável');
  const puppeteer = await import('puppeteer');

  return await puppeteer.default.launch({
    headless: true,
    devtools: false,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--run-all-compositor-stages-before-draw',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--disable-ipc-flooding-protection',
      '--disable-client-side-phishing-detection',
      '--disable-default-apps',
      '--disable-hang-monitor',
      '--disable-prompt-on-repost',
      '--disable-sync',
      '--metrics-recording-only',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--password-store=basic',
      '--use-mock-keychain',
      '--disable-background-networking',
      '--disable-breakpad',
      '--disable-component-update',
      '--disable-domain-reliability',
      '--disable-features=TranslateUI',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--disable-ipc-flooding-protection'
    ]
  });
}

function generatePropostaHTML(formData: any, uploadedFiles: any[] = []): string {
  const currentDate = new Date();
  const numeroProsposta = `LP${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}${String(currentDate.getHours()).padStart(2, '0')}${String(currentDate.getMinutes()).padStart(2, '0')}`;

  const enderecoCompleto = `${formData.logradouro || ''} ${formData.numero || ''} ${formData.complemento || ''}`.trim();
  const isMarriedOrUnion = formData.estadoCivil === 'casado' || formData.estadoCivil === 'uniao-estavel';
  const isVert = formData.empreendimento === 'vert';

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
            <td class="form-value">${formData.dataNascimento || ''}</td>
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
            <td class="form-value">${formData.dataNascimentoConjuge || ''}</td>
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
            <td class="form-value">${(typeof formData.empreendimento === 'string' ? formData.empreendimento : formData.empreendimento || '').toString().toUpperCase()}</td>
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
        <div class="section-title">${isVert ? 'COMPOSIÇÃO DE VALORES - VERT' : 'VALORES DA PROPOSTA'}</div>
        <div class="values-section">
          <table class="values-table">
            ${isVert ? `
            <tr>
              <td class="value-label">(A) VALOR DO SINAL:</td>
              <td class="value-amount">R$ ${formData.valorSinal || '0,00'}</td>
            </tr>
            <tr>
              <td class="value-label">(B) VALOR DAS MENSAIS:</td>
              <td class="value-amount">R$ ${formData.valorMensais || '0,00'} ${formData.parcelasMensais ? `(${formData.parcelasMensais}x)` : ''}</td>
            </tr>
            <tr>
              <td class="value-label">(C) VALOR DO SEMESTRAL:</td>
              <td class="value-amount">R$ ${formData.valorSemestral || '0,00'} ${formData.parcelasSemestrais ? `(${formData.parcelasSemestrais}x)` : ''}</td>
            </tr>
            <tr>
              <td class="value-label">(D) VALOR DAS CHAVES:</td>
              <td class="value-amount">R$ ${formData.valorChaves || '0,00'}</td>
            </tr>
            ` : `
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
            `}
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
    </div>
  </div>
</body>
</html>`;
}

async function generatePDFWithPuppeteer(formData: any, uploadedFiles: any[] = []): Promise<Buffer> {
  console.log('🔄 Iniciando Puppeteer para regeneração...');

  const isDocker = fs.existsSync('/.dockerenv');
  const maxRetries = isDocker ? 5 : 3;
  const baseDelay = isDocker ? 2000 : 1000;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let browser;
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries}...`);
      browser = await getPuppeteerInstance();
      const page = await browser.newPage();

      await page.setViewport({ width: 800, height: 1200 });

      console.log('📄 Gerando HTML...');
      const html = generatePropostaHTML(formData, uploadedFiles);

      console.log('🌐 Carregando HTML no navegador...');
      const contentTimeout = isDocker ? 30000 : 15000;
      const pdfTimeout = isDocker ? 60000 : 30000;

      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
        timeout: contentTimeout
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
        timeout: pdfTimeout
      });

      console.log('✅ PDF regenerado com sucesso, tamanho:', pdfBuffer.length, 'bytes');
      return Buffer.from(pdfBuffer);

    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Erro na tentativa ${attempt}:`, error);

      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.warn('⚠️ Erro ao fechar browser na tentativa', attempt, ':', closeError);
        }
      }

      if (attempt === maxRetries) {
        break;
      }

      const delay = baseDelay * attempt;
      console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error(`❌ Falha em todas as ${maxRetries} tentativas. Último erro:`, lastError);
  throw lastError || new Error('Falha na regeneração do PDF após múltiplas tentativas');
}

async function savePDF(pdfBuffer: Buffer, filename: string): Promise<string> {
  const proposalsDir = path.join(process.cwd(), 'propostas');

  if (!fs.existsSync(proposalsDir)) {
    fs.mkdirSync(proposalsDir, { recursive: true });
  }

  const filepath = path.join(proposalsDir, filename);
  fs.writeFileSync(filepath, pdfBuffer);

  console.log(`📄 PDF regenerado salvo: ${filepath}`);
  return filepath;
}

export async function POST(request: NextRequest) {
  console.log('🔄 Iniciando regeneração de PDF...');

  try {
    const body = await request.json();
    const { propostaId } = body;

    if (!propostaId) {
      return NextResponse.json(
        { success: false, error: 'ID da proposta é obrigatório' },
        { status: 400 }
      );
    }

    console.log('📋 Buscando proposta no banco:', propostaId);

    // Buscar proposta no banco
    const result = await pool.query('SELECT * FROM propostas WHERE id = $1', [propostaId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Proposta não encontrada' },
        { status: 404 }
      );
    }

    const proposta = result.rows[0];
    console.log('✅ Proposta encontrada:', proposta.dados_pessoais?.nome);

    // Reconstituir FormData a partir dos dados do banco
    const formData = {
      ...proposta.dados_pessoais,
      ...proposta.endereco,
      ...proposta.dados_conjuge,
      ...(typeof proposta.empreendimento === 'string'
        ? { empreendimento: proposta.empreendimento }
        : proposta.empreendimento),
      ...proposta.unidade
    };

    // Usar documentos vazios para regeneração (documentos originais podem não estar mais disponíveis)
    const uploadedFiles = proposta.documentos?.arquivos || [];

    console.log('📄 Gerando novo PDF...');
    const pdfBuffer = await generatePDFWithPuppeteer(formData, uploadedFiles);

    // Criar novo nome do arquivo
    const clientName = formData.nome?.replace(/\s+/g, '-').toLowerCase() || 'cliente';
    const timestamp = Date.now();
    const filename = `proposta-lotus-${clientName}-regenerada-${timestamp}.pdf`;

    // Salvar PDF
    await savePDF(pdfBuffer, filename);

    console.log('📝 Atualizando banco de dados...');

    // Atualizar registro no banco
    await pool.query(
      `UPDATE propostas
       SET pdf_gerado = true,
           documentos = jsonb_set(
             COALESCE(documentos, '{}'),
             '{pdfFilename}',
             $2::jsonb
           ),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [propostaId, JSON.stringify(filename)]
    );

    console.log('✅ PDF regenerado com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'PDF regenerado com sucesso',
      filename,
      downloadUrl: `/api/download-pdf/${filename}`,
      propostaId
    });

  } catch (error) {
    console.error('❌ Erro na regeneração:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao regenerar PDF',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}