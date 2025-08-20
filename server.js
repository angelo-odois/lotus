const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const Joi = require('joi');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(morgan('combined'));

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Create required directories
const uploadsDir = path.join(__dirname, 'uploads');
const pdfsDir = path.join(__dirname, 'pdfs');

[uploadsDir, pdfsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'), false);
    }
  }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));
app.use('/pdfs', express.static(pdfsDir));

// Validation schema
const proposalSchema = Joi.object({
  cliente: Joi.object({
    nome: Joi.string().min(2).max(255).required(),
    cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).required(),
    rg: Joi.string().min(5).max(20).required(),
    dataNascimento: Joi.date().iso().max('now').required(),
    telefone: Joi.string().required(),
    email: Joi.string().email().required(),
    profissao: Joi.string().min(2).required(),
    renda: Joi.number().positive().required(),
    estadoCivil: Joi.string().valid('solteiro', 'casado', 'divorciado', 'viuvo').required()
  }).required(),
  imovel: Joi.object({
    empreendimento: Joi.string().valid('haya', 'kasa', 'vert', 'alma').required(),
    unidade: Joi.string().min(1).required(),
    valorTotal: Joi.number().positive().min(50000).required()
  }).required(),
  financeiro: Joi.object({
    entrada: Joi.number().positive().required(),
    financiamento: Joi.number().min(0).required(),
    prazo: Joi.number().integer().min(1).max(35).required(),
    sistema: Joi.string().valid('sac', 'price').required()
  }).required()
});

// Simple PDF generation (mock)
async function generateSimplePDF(proposalData) {
  const pdfFileName = `proposta-${proposalData.id}.pdf`;
  const pdfPath = path.join(pdfsDir, pdfFileName);
  
  // Create a simple PDF content (in real implementation, use puppeteer)
  const pdfContent = `
LOTUS CIDADE - PROPOSTA DE COMPRA

Proposta: ${proposalData.id}
Data: ${new Date().toLocaleDateString('pt-BR')}

CLIENTE:
Nome: ${proposalData.cliente.nome}
CPF: ${proposalData.cliente.cpf}
Email: ${proposalData.cliente.email}
Telefone: ${proposalData.cliente.telefone}

IMÓVEL:
Empreendimento: ${proposalData.imovel.empreendimento.toUpperCase()}
Unidade: ${proposalData.imovel.unidade}
Valor Total: ${formatCurrency(proposalData.imovel.valorTotal)}

FINANCEIRO:
Entrada: ${formatCurrency(proposalData.financeiro.entrada)}
Financiamento: ${formatCurrency(proposalData.financeiro.financiamento)}
Prazo: ${proposalData.financeiro.prazo} anos
Sistema: ${proposalData.financeiro.sistema.toUpperCase()}

---
Lotus Cidade - www.lotuscidade.com.br
  `;
  
  // Write simple text file (in production, generate actual PDF)
  fs.writeFileSync(pdfPath, pdfContent, 'utf8');
  
  return pdfPath;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    service: 'Lotus Proposta System'
  });
});

app.post('/upload', upload.array('files'), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'Nenhum arquivo foi enviado'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      id: uuidv4(),
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date().toISOString()
    }));

    res.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Erro no upload de arquivos'
    });
  }
});

app.post('/proposta', async (req, res) => {
  try {
    // Validate input
    const { error, value } = proposalSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(d => d.message)
      });
    }

    const proposalId = uuidv4();
    const proposalData = {
      id: proposalId,
      ...value,
      createdAt: new Date().toISOString(),
      status: 'pendente'
    };

    console.log('📝 Nova proposta recebida:', proposalData);

    // Generate PDF
    const pdfPath = await generateSimplePDF(proposalData);
    const pdfFileName = path.basename(pdfPath);

    res.json({
      success: true,
      proposalId: proposalId,
      pdfUrl: `/pdfs/${pdfFileName}`,
      message: 'Proposta criada com sucesso!'
    });

  } catch (error) {
    console.error('Proposal error:', error);
    res.status(500).json({
      error: 'Erro ao processar proposta',
      details: error.message
    });
  }
});

app.get('/proposta/:id', (req, res) => {
  res.json({
    success: true,
    proposal: {
      id: req.params.id,
      status: 'pendente',
      createdAt: new Date().toISOString()
    }
  });
});

// Download PDF endpoint
app.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(pdfsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Arquivo não encontrado'
      });
    }

    res.download(filePath, `proposta-lotus-${filename}`);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Erro no download'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Arquivo muito grande (máximo 5MB)'
      });
    }
  }

  res.status(500).json({
    error: 'Erro interno do servidor'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Lotus Proposta System rodando na porta ${PORT}`);
  console.log(`📁 Uploads: ${uploadsDir}`);
  console.log(`📄 PDFs: ${pdfsDir}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});
