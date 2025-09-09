# Lotus - Sistema de Propostas

Sistema de geração de propostas imobiliárias com integração WhatsApp.

## 🚀 Funcionalidades

- ✅ Formulário multi-step responsivo
- ✅ Geração automática de PDF com Puppeteer  
- ✅ Integração com WhatsApp via WAHA API
- ✅ Upload de documentos com conversão de PDF para imagem
- ✅ Validação de formulários com Zod
- ✅ Compatibilidade total com Safari

## 🛠 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Puppeteer** - Geração de PDF
- **@sparticuz/chromium** - Chrome para ambientes serverless
- **React Hook Form + Zod** - Validação de formulários
- **Lucide React** - Ícones

## 📦 Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd lotus

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute em desenvolvimento
npm run dev
```

## 🌐 Deploy na Vercel

### 1. Configuração das Variáveis de Ambiente

Na Vercel, configure as seguintes variáveis:

```
WAHA_URL=https://waha.nexuso2.com
WAHA_API_KEY=your-api-key-here
WHATSAPP_PHONE=5561999999999  
WHATSAPP_SESSION=lotus
VERCEL_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

### 2. Deploy Automático

```bash
# Via Vercel CLI
npm i -g vercel
vercel --prod

# Ou conecte o repositório no dashboard da Vercel
```

## 🔧 Configuração Local

### Chrome/Chromium para Puppeteer

```bash
# Instalar Chrome para Puppeteer (desenvolvimento local)
npx puppeteer browsers install chrome
```

### WhatsApp API (WAHA)

Configure uma instância do WAHA API e atualize as variáveis no `.env.local`:

```env
WAHA_URL=https://sua-instancia-waha.com
WAHA_API_KEY=sua-api-key
WHATSAPP_PHONE=5561999999999
WHATSAPP_SESSION=lotus
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── proposta/         # API de geração de PDF
│   │   ├── test-pdf/         # Teste de PDF
│   │   └── download-pdf/     # Download de PDFs
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── steps/                # Steps do formulário
│   ├── PropostaForm.tsx      # Formulário principal
│   ├── Navigation.tsx        # Navegação entre steps
│   └── ...
├── hooks/
│   └── usePropostaForm.ts    # Hook do formulário
├── types/
│   └── form.ts               # Tipos TypeScript
└── config/
    └── index.ts              # Configurações
```

## 🐛 Problemas Conhecidos e Soluções

### Safari - Navegação entre Steps

✅ **Resolvido** - Event handlers melhorados com `preventDefault()` e `stopPropagation()`

### Vercel - Puppeteer Chrome

✅ **Resolvido** - Usando `@sparticuz/chromium` para ambientes serverless

### Timeout na Geração de PDF

✅ **Resolvido** - Configurado `waitUntil: 'domcontentloaded'` e timeout de 10s

## 📱 WhatsApp Integration

O sistema envia automaticamente:

1. **Mensagem de confirmação** com detalhes da proposta
2. **PDF da proposta** como anexo
3. **Fallback** em caso de erro no envio do PDF

## 🔄 Fluxo do Sistema

1. **Preenchimento** - Cliente preenche formulário multi-step
2. **Validação** - Campos obrigatórios validados por step  
3. **Geração** - PDF gerado via Puppeteer com dados + documentos
4. **Armazenamento** - PDF salvo na pasta `/propostas/`
5. **Envio** - WhatsApp enviado automaticamente via WAHA API

## 🏗 Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento com Turbopack
npm run build    # Build de produção
npm run start    # Servidor de produção  
npm run lint     # ESLint
```

## 📝 Licença

Projeto privado - Lotus Cidade