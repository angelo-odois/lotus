// Detectar ambiente e configurações de cookies seguros
export function detectHTTPSEnvironment(request?: { nextUrl?: { protocol: string; hostname: string } }): boolean {
  // Em desenvolvimento, sempre use cookies simples
  if (process.env.NODE_ENV !== 'production') {
    return false;
  }

  // Vercel sempre usa HTTPS
  if (process.env.VERCEL_URL) {
    return true;
  }

  // FORÇAR cookies simples se estivermos acessando via IP (mesmo em produção)
  // Isso resolve o problema do Coolify quando acessado via IP
  if (request?.nextUrl?.hostname) {
    const hostname = request.nextUrl.hostname;
    
    // Se é IP (localhost, 127.0.0.1, ou qualquer IP), usar cookies simples
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.') ||
        /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return false;
    }
  }

  // Coolify com domínio configurado - só usar HTTPS para o domínio específico
  if (process.env.COOLIFY_DOMAIN) {
    // Se temos o request, verificar o hostname exato
    if (request?.nextUrl?.hostname === process.env.COOLIFY_DOMAIN) {
      return true;
    }
    // Se não temos request, assumir cookies simples para compatibilidade
    if (!request) {
      return false;
    }
  }

  // Detectar pelo request se disponível
  if (request?.nextUrl) {
    // HTTPS explícito E não é IP
    if (request.nextUrl.protocol === 'https:') {
      const hostname = request.nextUrl.hostname;
      // Verificar se não é IP
      if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
        return true;
      }
    }
  }

  // Default: false para máxima compatibilidade
  return false;
}

export function getCookieName(request?: { nextUrl?: { protocol: string; hostname: string } }): string {
  return detectHTTPSEnvironment(request) ? '__Host-session' : 'session';
}