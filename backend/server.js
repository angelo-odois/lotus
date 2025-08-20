const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(compression());
app.use(morgan('combined'));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Lotus Backend funcionando!'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🏠 Lotus Proposta System Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      proposta: 'POST /proposta',
      upload: 'POST /upload'
    }
  });
});

// Mock proposta endpoint
app.post('/proposta', (req, res) => {
  console.log('📝 Nova proposta recebida:', req.body);
  
  // Simulate processing
  setTimeout(() => {
    res.json({
      success: true,
      proposalId: 'LOTUS-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      message: 'Proposta recebida com sucesso!',
      pdfUrl: '/pdfs/exemplo.pdf'
    });
  }, 1000);
});

// Mock upload endpoint
app.post('/upload', (req, res) => {
  res.json({
    success: true,
    message: 'Upload simulado com sucesso!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Lotus Backend rodando na porta ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
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
