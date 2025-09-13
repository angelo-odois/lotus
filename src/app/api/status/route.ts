// Health check ultra simples para Coolify
export async function GET() {
  return new Response('OK', { 
    status: 200,
    headers: { 
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache' 
    }
  });
}