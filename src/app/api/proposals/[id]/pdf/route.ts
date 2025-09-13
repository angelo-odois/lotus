import { NextRequest, NextResponse } from 'next/server';
import { findProposalById } from '@/lib/queries';
import { proposalParamsSchema } from '@/lib/validation';
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {

    const { id } = await params;
    const paramsValidation = proposalParamsSchema.safeParse({ id });
    if (!paramsValidation.success) {
      return NextResponse.json(
        { error: 'ID inválido', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const proposal = await findProposalById(id);

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposta não encontrada', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Generate HTML content for PDF
    const htmlContent = generateProposalHTML(proposal);

    // Configure Puppeteer for different environments
    const isVercel = process.env.VERCEL === '1';
    const isDev = process.env.NODE_ENV === 'development';
    const chromiumPath = process.env.PUPPETEER_EXECUTABLE_PATH;

    let browser;
    try {
      if (isVercel) {
        // Vercel configuration with @sparticuz/chromium
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        });
      } else if (chromiumPath && chromiumPath !== 'undefined') {
        // Production with specified Chrome path (Docker/Coolify)
        browser = await puppeteer.launch({
          headless: true,
          executablePath: chromiumPath,
          args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--no-first-run'
          ]
        });
      } else {
        // Local development - try system Chrome first
        const systemChromePaths = [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
          '/usr/bin/google-chrome-stable', // Linux
          '/usr/bin/google-chrome', // Linux alt
          '/usr/bin/chromium-browser', // Linux Chromium
          '/usr/bin/chromium', // Linux Chromium alt
        ];

        let chromePath = null;
        
        // Try to find system Chrome
        for (const path of systemChromePaths) {
          try {
            const fs = require('fs');
            if (fs.existsSync(path)) {
              chromePath = path;
              break;
            }
          } catch (e) {
            continue;
          }
        }

        if (chromePath) {
          browser = await puppeteer.launch({
            headless: true,
            executablePath: chromePath,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
          });
        } else {
          // Fallback to default Puppeteer Chrome
          browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
          });
        }
      }
    } catch (error) {
      console.error('Error launching browser:', error);
      throw new Error(`Erro ao inicializar o navegador: ${error.message}`);
    }

    const page = await browser.newPage();
    
    // Set content and generate PDF
    await page.setContent(htmlContent, { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });

    const pdf = await page.pdf({
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

    const filename = `proposta-${proposal.clientName.replace(/[^a-zA-Z0-9]/g, '-')}-${id.substring(0, 8)}.pdf`;

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache',
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar PDF', code: 'PDF_ERROR' },
      { status: 500 }
    );
  }
}

function generateProposalHTML(proposal: any): string {
  const formData = proposal.formData ? JSON.parse(proposal.formData) : {};
  
  // Generate proposal number
  const proposalNumber = `LP${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${proposal.id.substring(0, 4)}`;
  
  // Format address
  const enderecoCompleto = [
    formData.logradouro,
    formData.numero,
    formData.complemento,
    formData.bairro,
    formData.cidade,
    formData.uf
  ].filter(Boolean).join(', ');
  
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
    
    .date-footer {
      text-align: center;
      margin: 30px 0;
      font-weight: bold;
      font-size: 12px;
      padding: 10px;
      background: #f8f9fa;
      border: 1px solid #ddd;
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
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 15px;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 10px;
      margin-top: 10px;
    }
    
    .status-badge.draft { background: #f8f9fa; color: #6c757d; border: 1px solid #6c757d; }
    .status-badge.sent { background: #e3f2fd; color: #1976d2; border: 1px solid #1976d2; }
    .status-badge.approved { background: #e8f5e8; color: #2e7d2e; border: 1px solid #2e7d2e; }
    .status-badge.rejected { background: #ffebee; color: #c62828; border: 1px solid #c62828; }
    .status-badge.expired { background: #fff3e0; color: #f57c00; border: 1px solid #f57c00; }
    
    .page-break {
      page-break-before: always;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Proposta de Compra</h1>
      <div class="number">Nº ${proposalNumber}</div>
      <div class="status-badge ${proposal.status}">${getStatusLabel(proposal.status)}</div>
    </div>
    
    <div class="content">
      <!-- Dados Pessoais -->
      <div class="section">
        <div class="section-title">DADOS DO CLIENTE</div>
        <table class="form-table">
          <tr>
            <td class="form-label">NOME/1º PROPONENTE:</td>
            <td class="form-value">${formData.nome || proposal.clientName || ''}</td>
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
            <td class="form-value">${formData.sexo ? (formData.sexo === 'masculino' ? 'Masculino' : 'Feminino') : ''}</td>
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
            <td class="form-value">${enderecoCompleto || ''}</td>
          </tr>
          <tr>
            <td class="form-label">ESTADO CIVIL:</td>
            <td class="form-value">${getEstadoCivilLabel(formData.estadoCivil) || ''}</td>
          </tr>
        </table>
      </div>

      ${(formData.estadoCivil === 'casado' || formData.estadoCivil === 'uniao-estavel') && formData.nomeConjuge ? `
      <!-- Dados do Cônjuge -->
      <div class="section">
        <div class="section-title">DADOS DO CÔNJUGE/2º PROPONENTE</div>
        <table class="form-table">
          <tr>
            <td class="form-label">NOME:</td>
            <td class="form-value">${formData.nomeConjuge || ''}</td>
          </tr>
          <tr>
            <td class="form-label">CPF:</td>
            <td class="form-value">${formData.cpfConjuge || ''}</td>
          </tr>
          <tr>
            <td class="form-label">RG:</td>
            <td class="form-value">${formData.rgConjuge || ''}</td>
          </tr>
          <tr>
            <td class="form-label">ÓRGÃO EXPEDIDOR:</td>
            <td class="form-value">${formData.orgaoExpedidorConjuge || ''}</td>
          </tr>
          <tr>
            <td class="form-label">SEXO:</td>
            <td class="form-value">${formData.sexoConjuge ? (formData.sexoConjuge === 'masculino' ? 'Masculino' : 'Feminino') : ''}</td>
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
            <td class="form-label">EMAIL:</td>
            <td class="form-value">${formData.emailConjuge || ''}</td>
          </tr>
          <tr>
            <td class="form-label">PROFISSÃO:</td>
            <td class="form-value">${formData.profissaoConjuge || ''}</td>
          </tr>
        </table>
      </div>` : ''}

      <!-- Dados do Imóvel -->
      <div class="section">
        <div class="section-title">DADOS DO IMÓVEL</div>
        <table class="form-table">
          <tr>
            <td class="form-label">EMPREENDIMENTO:</td>
            <td class="form-value">${getEmpreendimentoLabel(formData.empreendimento) || ''}</td>
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
              <td class="value-amount">${formData.valorImovel ? `R$ ${formData.valorImovel}` : ''}</td>
            </tr>
            <tr>
              <td class="value-label">(B) VALOR DE ENTRADA:</td>
              <td class="value-amount">${formData.valorEntrada ? `R$ ${formData.valorEntrada}` : ''}</td>
            </tr>
            <tr>
              <td class="value-label">(C) VALOR A FINANCIAR:</td>
              <td class="value-amount">${formData.valorFinanciar ? `R$ ${formData.valorFinanciar}` : ''}</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="date-footer">
        Brasília-DF, ${formatDate(new Date())}
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

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Rascunho',
    sent: 'Enviada',
    approved: 'Aprovada',
    rejected: 'Rejeitada',
    expired: 'Expirada'
  };
  return labels[status] || status;
}

function getEstadoCivilLabel(estadoCivil: string): string {
  const labels: Record<string, string> = {
    solteiro: 'Solteiro(a)',
    casado: 'Casado(a)',
    separado: 'Separado(a)',
    divorciado: 'Divorciado(a)',
    viuvo: 'Viúvo(a)',
    'uniao-estavel': 'União Estável'
  };
  return labels[estadoCivil] || estadoCivil;
}

function getEmpreendimentoLabel(empreendimento: string): string {
  const labels: Record<string, string> = {
    haya: 'HAYA',
    kasa: 'KASA',
    vert: 'VERT',
    alma: 'ALMA'
  };
  return labels[empreendimento] || empreendimento;
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}