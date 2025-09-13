// Health check robusto com fallback para texto simples
export async function GET() {
  // Retornar resposta mais simples possível
  return new Response('OK', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    }
  });
}