# 🏠 Lotus Proposta System - Coolify

Sistema completo de propostas imobiliárias otimizado para deploy no Coolify.

## 🚀 Deploy no Coolify

### 1. Configurar Repositório
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <seu-repositorio>
git push -u origin main
```

### 2. Criar Aplicação no Coolify
1. Acesse seu painel Coolify
2. Criar nova aplicação
3. Conectar repositório Git
4. Configurar as variáveis de ambiente

### 3. Variáveis de Ambiente
```
NODE_ENV=production
PORT=3001
```

### 4. Build Settings
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Port**: `3001`

## 📋 Funcionalidades

- ✅ Interface moderna e responsiva
- ✅ Formulário em 4 etapas
- ✅ Validação completa de dados
- ✅ Geração automática de PDF
- ✅ Upload de documentos
- ✅ API RESTful completa

## 🛠️ Desenvolvimento Local

```bash
npm install
npm start
```

Acesse: http://localhost:3001

## 📚 API Endpoints

- `GET /` - Interface principal
- `GET /health` - Health check
- `POST /proposta` - Criar proposta
- `POST /upload` - Upload de arquivos
- `GET /pdfs/:filename` - Download PDF

## 🔧 Customização

1. **Frontend**: Edite `frontend/index.html`
2. **Backend**: Modifique `server.js`
3. **Validações**: Ajuste schemas no servidor
4. **Estilos**: Customize CSS no frontend

---

**Lotus Cidade** - Deploy otimizado para Coolify 🚀
