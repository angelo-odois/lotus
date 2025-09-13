# 📝 Lotus - Formulário Independente

## 🎯 **Descrição**

Versão independente do formulário Lotus focada **apenas na coleta de dados** sem dependências de dashboard ou autenticação. Os dados são salvos diretamente no PostgreSQL.

## 🏗️ **Arquitetura Simplificada**

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Formulário    │───▶│  API Collect │───▶│   PostgreSQL    │
│   Multi-step    │    │     /api     │    │    Database     │
│   (Frontend)    │    │   /collect   │    │     "lotus"     │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

## 📊 **Estrutura de Dados no PostgreSQL**

### **Tabela: `propostas`**
```sql
CREATE TABLE propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dados_pessoais JSONB NOT NULL,           -- Nome, CPF, email, telefone, etc.
  endereco JSONB,                          -- CEP, rua, número, etc.
  dados_conjuge JSONB,                     -- Dados do cônjuge (se casado)
  empreendimento JSONB,                    -- Nome e endereço do empreendimento
  unidade JSONB,                           -- Número, valor, entrada, financiamento
  documentos JSONB,                        -- Lista de documentos anexados
  status VARCHAR(20) DEFAULT 'rascunho',   -- Status da proposta
  pdf_gerado BOOLEAN DEFAULT FALSE,        -- Se PDF foi gerado
  whatsapp_enviado BOOLEAN DEFAULT FALSE,  -- Se foi enviado via WhatsApp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 **Configuração**

### **1. Variáveis de Ambiente**
```env
# Database - PostgreSQL
DATABASE_URL=postgres://postgres:vcClbZixT5W8M6wiBf6oocvrnsGrEPG0EGlvcSnKZ7sGhIQMkrGNxWAsgoH87cfC@212.85.13.91:5432/lotus

# JWT (opcional para compatibilidade)
JWT_SECRET_CURRENT=local-dev-secret-32-chars-minimum

# Ambiente
NODE_ENV=development
```

### **2. Instalação**
```bash
npm install
npm run dev
```

### **3. Configuração do Database**
```bash
# 1. Criar database
curl -X POST http://localhost:3000/api/setup-db

# 2. Testar conexão
curl http://localhost:3000/api/test-db
```

## 🔧 **APIs Disponíveis**

### **📝 Coleta de Dados**
```bash
POST /api/collect
Content-Type: application/json

{
  "dadosPessoais": {
    "nomeCompleto": "João Silva",
    "email": "joao@example.com",
    "telefone": "(61) 99999-9999",
    "cpf": "123.456.789-00",
    "rg": "1234567-DF",
    "estadoCivil": "casado",
    "nacionalidade": "Brasileira",
    "profissao": "Engenheiro",
    "rendaMensal": "8500"
  },
  "endereco": {
    "cep": "70000-000",
    "rua": "Rua Teste",
    "numero": "123",
    "complemento": "Apt 101",
    "bairro": "Centro",
    "cidade": "Brasília",
    "estado": "DF"
  },
  "dadosConjuge": { /* ... */ },
  "empreendimento": { /* ... */ },
  "unidade": { /* ... */ },
  "documentos": [ /* ... */ ]
}
```

**Resposta:**
```json
{
  "success": true,
  "proposalId": "505071fc-cb35-48d6-831d-d0209ca10fbd",
  "message": "Proposta enviada com sucesso!",
  "timestamp": "2025-09-13T22:01:35.388Z"
}
```

### **🔍 Utilitários**
```bash
# Testar database
GET /api/test-db

# Health check
GET /api/health
```

## 🎨 **Interface**

- **Formulário Multi-step**: Coleta dados em 7 etapas
- **Validação em Tempo Real**: Campos obrigatórios por etapa
- **Upload de Documentos**: Suporte a múltiplos arquivos
- **Página de Sucesso**: Confirmação com ID da proposta
- **Responsivo**: Funciona em desktop e mobile

## 📋 **Etapas do Formulário**

1. **Dados Pessoais**: Nome, CPF, telefone, email, etc.
2. **Endereço**: CEP, rua, número, cidade, estado
3. **Dados do Cônjuge**: Se casado (opcional)
4. **Empreendimento**: Nome e localização
5. **Unidade**: Número, valores, financiamento
6. **Documentos**: Upload de arquivos (opcional)
7. **Finalização**: Revisão e envio

## 🧪 **Teste**

```bash
# Testar envio de proposta
node test-form.js
```

## 🗂️ **Arquivos Principais**

### **Frontend**
- `src/app/page.tsx` - Página principal do formulário
- `src/components/PropostaForm.tsx` - Componente principal
- `src/hooks/usePropostaForm.ts` - Lógica do formulário
- `src/components/SuccessPage.tsx` - Página de sucesso

### **Backend**
- `src/app/api/collect/route.ts` - API de coleta
- `src/lib/postgres.ts` - Conexão PostgreSQL
- `src/app/api/test-db/route.ts` - Testes de database

## 🔗 **URLs**

- **Formulário**: http://localhost:3000/
- **Test Database**: http://localhost:3000/api/test-db
- **Health Check**: http://localhost:3000/api/health

## ✅ **Funcionalidades**

- ✅ **Coleta de dados** completa e estruturada
- ✅ **PostgreSQL** como banco principal
- ✅ **API RESTful** para integração
- ✅ **Validação** robusta de formulários
- ✅ **Interface responsiva** para todos os dispositivos
- ✅ **Upload de documentos** com preview
- ✅ **Página de sucesso** com ID da proposta

## 🚫 **Removidas**

- ❌ Dashboard administrativo
- ❌ Sistema de autenticação
- ❌ Geração de PDF
- ❌ Integração WhatsApp
- ❌ SQLite (substituído por PostgreSQL)

## 📊 **Status**

- **Versão**: Independente (Coleta apenas)
- **Database**: PostgreSQL configurado
- **Testes**: ✅ Funcionando
- **Proposta de exemplo**: ID `505071fc-cb35-48d6-831d-d0209ca10fbd`

---

**💡 Esta versão é perfeita para:**
- Coleta independente de dados
- Integração com outros sistemas
- Formulários embed em sites
- APIs de terceiros