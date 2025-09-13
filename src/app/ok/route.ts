// Health check de último recurso - o mais simples possível
export async function GET() {
  return new Response('OK');
}