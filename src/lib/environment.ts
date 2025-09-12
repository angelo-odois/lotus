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

  // Coolify com domínio configurado
  if (process.env.COOLIFY_DOMAIN) {
    // Se temos o request, verificar o hostname
    if (request?.nextUrl?.hostname === process.env.COOLIFY_DOMAIN) {
      return true;
    }
    // Se não temos o request mas a variável existe, assumir que é produção com HTTPS
    if (!request) {
      return true;
    }
  }

  // Detectar pelo request se disponível
  if (request?.nextUrl) {
    // HTTPS explícito
    if (request.nextUrl.protocol === 'https:') {
      return true;
    }
    
    // Domínio real (não IP nem localhost)
    const hostname = request.nextUrl.hostname;
    if (hostname !== 'localhost' && 
        hostname !== '127.0.0.1' && 
        !hostname.startsWith('192.168.') &&
        !hostname.startsWith('10.') &&
        !hostname.startsWith('172.')) {
      return true;
    }
  }

  // Default: false para compatibilidade com IP
  return false;
}

export function getCookieName(request?: { nextUrl?: { protocol: string; hostname: string } }): string {
  return detectHTTPSEnvironment(request) ? '__Host-session' : 'session';
}