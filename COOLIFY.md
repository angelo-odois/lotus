# 🚀 Deploy Lotus no Coolify

## 📋 Pré-requisitos

- Coolify instalado e configurado
- Conta no GitHub com acesso ao repositório
- Instância do WAHA API funcionando

## 🐳 Deploy via Docker Compose

### 1. **Configurar Projeto no Coolify**

1. Acesse o Coolify Dashboard
2. Crie um novo projeto: **"Lotus Propostas"**
3. Selecione **"Docker Compose"**
4. Conecte o repositório: `https://github.com/seu-usuario/lotus`

### 2. **Variáveis de Ambiente**

Configure as seguintes variáveis no Coolify:

```env
# WhatsApp API (WAHA)
WAHA_URL=https://waha.nexuso2.com
WAHA_API_KEY=D2EFC7EDF3E4425F917DBAE37D3D0B74
WHATSAPP_PHONE=556199911676
WHATSAPP_SESSION=lotus

# Node Environment
NODE_ENV=production

# Puppeteer (já configurado no Dockerfile)
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### 3. **Configuração de Volume**

No Coolify, configure o volume:
- **Host Path**: `/opt/coolify/lotus/propostas`
- **Container Path**: `/app/propostas`
- **Descrição**: PDFs gerados pelas propostas

### 4. **Configuração de Domínio**

1. Configure o domínio personalizado: `lotus.seudominio.com`
2. Ative HTTPS automático via Let's Encrypt
3. Configure proxy reverso para porta `3000`

### 5. **Deploy**

1. Faça push do código para o repositório
2. No Coolify, clique em **"Deploy"**
3. Aguarde o build e deploy (5-10 minutos)

## 📊 Monitoramento

### **Health Check**
O container possui health check automático:
- **URL**: `http://localhost:3000`
- **Intervalo**: 30 segundos
- **Timeout**: 10 segundos

### **Logs**
Monitore os logs no Coolify para ver:
```
🐳 Detectado ambiente Docker - usando Chromium do sistema
✅ PDF gerado, tamanho: 158118 bytes
✅ PDF WhatsApp enviado
```

### **Recursos**
- **Memória**: 512MB (reservado) / 1GB (limite)
- **CPU**: 0.25 (reservado) / 0.5 (limite)

## 🔧 Troubleshooting

### **Problema**: PDF não gera
```bash
# Verificar se Chromium está instalado
docker exec -it lotus-propostas chromium-browser --version

# Verificar logs do Puppeteer
docker logs lotus-propostas | grep -i puppeteer
```

### **Problema**: WhatsApp não envia
```bash
# Testar conectividade com WAHA
docker exec -it lotus-propostas wget -qO- $WAHA_URL/api/sessions

# Verificar variáveis de ambiente
docker exec -it lotus-propostas env | grep WAHA
```

### **Problema**: Falta de memória
- Aumente os limites de memória no Coolify
- Configure swap no host se necessário

## 🔄 Atualizações

Para atualizar a aplicação:

1. Push do novo código para o repositório
2. No Coolify: **Actions** → **Redeploy**
3. Aguardar novo build e deploy

## 📁 Estrutura de Arquivos

```
/opt/coolify/lotus/
├── propostas/          # PDFs gerados (persistente)
├── docker-compose.yml  # Configuração do container
└── logs/              # Logs da aplicação
```

## 🎯 URLs Importantes

- **Aplicação**: `https://lotus.seudominio.com`
- **Health Check**: `https://lotus.seudominio.com/api/test-pdf`
- **Coolify Dashboard**: `https://coolify.seudominio.com`

## ⚡ Performance

### **Otimizações Aplicadas**
- ✅ Chromium Alpine (menor footprint)
- ✅ Multi-stage build otimizado
- ✅ Volume persistente para PDFs
- ✅ Health check automático
- ✅ Resource limits configurados

### **Métricas Esperadas**
- **Tempo de boot**: ~30 segundos
- **Geração de PDF**: ~5-8 segundos
- **Memória em uso**: ~200-400MB
- **CPU em uso**: ~10-30% durante geração

## 🔒 Segurança

- ✅ Container rootless
- ✅ No-sandbox mode (necessário para Chromium)
- ✅ Variáveis sensíveis via env vars
- ✅ Volumes isolados
- ✅ Network bridge isolada

## 📞 Suporte

Em caso de problemas:

1. Verificar logs no Coolify Dashboard
2. Testar endpoints via curl/Postman
3. Verificar recursos do sistema (RAM/CPU)
4. Consultar documentação do WAHA API